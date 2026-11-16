/**
 * Interactive lesson engine.
 *
 * A lesson is plain data: sections with an intro text and examples.
 * Each example's `code` is written ONCE as a string: the engine compiles it with
 * esbuild (TS → JS) and executes it, so what you see on screen is exactly what ran.
 *
 * Snippet rules:
 *  - A snippet is real code: print values with console.log(...).
 *      `const a = [1]; a.push(2); console.log(a);`
 *  - A bare value line (`a`, `a === b`, `({ a: 1 })`) is rejected before the lesson starts:
 *    it compiles but does nothing in a real file. Actions are fine: calls, assignments, await.
 *  - Top-level `await` is allowed.
 *  - If the snippet throws, the error is printed as a result (💥 TypeError: ...).
 *  - Variables from `lesson.scope` are available inside every snippet.
 *
 * CLI flags (after `--` when using npm run):
 *   --all     no pauses (also automatic when stdin is not a terminal)
 *   --from N  start from section N
 */
import { transformSync } from 'esbuild';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { inspect, styleText } from 'node:util';

export type Example = {
  /** What we are doing and why (shown before the code). */
  explain: string;
  /** TypeScript snippet to display and execute. */
  code: string;
  /** Explanation of the result (shown after the result). */
  why?: string;
  /**
   * Show the TypeScript compiler's verdict for this snippet (a TS error is the point here).
   * Errors are shown as `🛑 TS2345: ...` and the code is NOT executed.
   * No errors → `✅ компилируется`, then the code runs as usual
   * (set `typecheck: 'only'` to skip running it).
   * `typecheck: 'and-run'` shows the errors AND still runs the code, the way plain JS
   * would: for JS traps that TS already catches (e.g. `[1, 2] === [1, 2]`).
   * Without this field the snippet must compile: the lesson refuses to start otherwise.
   */
  typecheck?: boolean | 'only' | 'and-run';
  /**
   * The snippet demonstrates a bug that IS a bare value line, e.g. a forgotten return:
   * `arr.map((n) => { n * 2; })`. Skips the bare-value check for this example only.
   */
  bareValueIsTheBug?: true;
};

export type Section = {
  title: string;
  /** The "lecture" part: theory before the examples. */
  intro?: string;
  examples?: Example[];
};

export type Lesson = {
  title: string;
  intro?: string;
  /** Values available as variables inside every snippet. */
  scope?: Record<string, unknown>;
  /**
   * Path of the lesson file: pass `import.meta.filename`. The engine type-checks every
   * snippet with the file's top part (imports, helpers, scope data) so TS knows their types.
   */
  source?: string;
  sections: Section[];
  outro?: string;
};

const WIDTH = 88;

/** First line starts with an emoji instead of the indent. */
function labeled(emoji: string, text: string, color: Parameters<typeof styleText>[0]): string {
  return styleText(color, emoji) + ' ' + wrap(text).slice(3);
}

/** Wraps long paragraphs, keeps explicit line breaks and list indentation. */
function wrap(text: string, indent = '   '): string {
  return text
    .trim()
    .split('\n')
    .map((line) => {
      // Table rows and pre-indented code are printed as is (no wrapping).
      if (line.startsWith('|')) return indent + line;
      const bullet = line.match(/^(\s*(?:[-•*]|\d+\.)\s+|\s+)/)?.[0] ?? '';
      const hanging = ' '.repeat(bullet.length);
      const words = line.slice(bullet.length).split(' ');
      const lines: string[] = [];
      let current = bullet;
      for (const word of words) {
        if ((current + word).length > WIDTH - indent.length && current.trim()) {
          lines.push(current.trimEnd());
          current = hanging;
        }
        current += word + ' ';
      }
      lines.push(current.trimEnd());
      return lines.map((l) => indent + l).join('\n');
    })
    .join('\n');
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return styleText('green', JSON.stringify(value));
  return inspect(value, { depth: null, colors: true, breakLength: 80 });
}

/**
 * Runs the snippet. Every console.log() call is formatted IMMEDIATELY (a snapshot, like a real
 * console) and pushed into `logs`; they are kept even if the snippet throws.
 */
type Compiled = (scope: Record<string, unknown>, logs: string[]) => Promise<void>;

/** Like console.log: strings are printed as is, other values are inspected. */
function formatLogLine(args: unknown[]): string {
  return args
    .map((a) => (a === '' ? styleText('green', "''") : typeof a === 'string' ? a : formatValue(a)))
    .join(' ');
}

/**
 * Compiles a snippet (TS → JS) into a runner. The snippet is plain code: whatever it
 * prints with console.log(...) is the output (bare value lines are rejected up front).
 */
function compile(code: string): Compiled {
  let js: string;
  try {
    js = transformSync(`__run(async () => {\n${code}\n});`, {
      loader: 'ts',
      target: 'es2023',
    }).code;
  } catch (error) {
    // Show esbuild parse errors like a JS engine would: "SyntaxError: <reason>".
    // `as`: esbuild throws an Error with an extra `errors` array (its BuildFailure type),
    // but `catch` gives us `unknown`; optional chaining keeps it safe for any other value.
    const reason = (error as { errors?: { text: string }[] }).errors?.[0]?.text;
    // `cause` keeps the original esbuild error for debugging (shown as "Caused by: ...").
    throw new SyntaxError(reason ?? String(error), { cause: error });
  }

  const run: Compiled = async (scope, logs) => {
    const capture = (...args: unknown[]) => void logs.push(formatLogLine(args));
    // Shadows the real console inside the snippet: output is collected and shown
    // after the "think first" pause instead of being printed immediately.
    const snippetConsole = {
      log: capture,
      info: capture,
      warn: capture,
      error: capture,
      debug: capture,
    };
    let captured!: () => Promise<unknown>;
    const names = ['__run', 'console', ...Object.keys(scope)];
    const values = [
      (fn: () => Promise<unknown>) => (captured = fn),
      snippetConsole,
      ...Object.values(scope),
    ];
    // 'use strict' mirrors ES modules: frozen writes throw, plain-call `this` is undefined.
    new Function(...names, `'use strict';\n${js}`)(...values);
    await captured();
  };
  return run;
}

// ---------------------------------------------------------------------------
// TypeScript compiler: parses snippets for the bare-value check (every lesson)
// and type-checks them (lesson 08). Loaded once, on first use.
// ---------------------------------------------------------------------------
type TS = typeof import('typescript');
let tsModule: TS | null = null;

async function loadTs(): Promise<TS> {
  return (tsModule ??= (await import('typescript')).default as TS);
}

/**
 * Methods that only RETURN a new value and change nothing, so calling one on its own
 * line throws the result away: `arr.map(...)`, `s.trim()`, `Object.keys(o)`.
 * Matched by name only (the receiver's type is unknown here), so names that mutate
 * on some type are NOT listed: sort, reverse, splice, fill, set, delete, clear, assign…
 */
// prettier-ignore
const PURE_METHODS = new Set([
  // Array (non-mutating)
  'map', 'filter', 'slice', 'concat', 'flat', 'flatMap', 'toSorted', 'toReversed',
  'toSpliced', 'with', 'at', 'join', 'indexOf', 'lastIndexOf', 'includes', 'find',
  'findIndex', 'findLast', 'findLastIndex', 'some', 'every', 'reduce', 'reduceRight',
  'keys', 'values', 'entries',
  // String
  'trim', 'trimStart', 'trimEnd', 'toUpperCase', 'toLowerCase', 'padStart', 'padEnd',
  'repeat', 'replace', 'replaceAll', 'split', 'substring', 'startsWith', 'endsWith',
  'charAt', 'localeCompare',
  // Map / Set reads and set algebra
  'get', 'has', 'union', 'intersection', 'difference', 'symmetricDifference',
  'isSubsetOf', 'isSupersetOf', 'isDisjointFrom',
  // Number
  'toFixed', 'toPrecision',
  // Static helpers: Array.from, Object.fromEntries, JSON.stringify, Math.max, ...
  'from', 'of', 'isArray', 'fromEntries', 'groupBy', 'stringify', 'parse',
  'max', 'min', 'abs', 'round', 'floor', 'ceil', 'isInteger', 'isNaN',
]);

/**
 * Finds lines that are a bare value, e.g. `nickname`, `a === b` or `arr.map(f)`, at any
 * depth: top level, if/loop bodies, try/catch, functions, class methods.
 * Such a line compiles but does nothing in a real file, so lesson code must not contain it.
 * Actions are fine on their own line: calls (except PURE_METHODS), assignments, await,
 * ++/--, delete. One exception: a pure call directly inside `try { }` is allowed, because
 * it is made for its exception, e.g. `try { JSON.parse(text); } catch { ... }`.
 * Returns "N.M, строка K: <code>" for every offending line.
 */
async function findBareValues(lesson: Lesson): Promise<string[]> {
  const ts = await loadTs();
  const isAction = (expr: import('typescript').Expression): boolean => {
    while (ts.isParenthesizedExpression(expr)) expr = expr.expression;
    if (ts.isBinaryExpression(expr)) {
      const op = expr.operatorToken.kind;
      return op >= ts.SyntaxKind.FirstAssignment && op <= ts.SyntaxKind.LastAssignment;
    }
    if (ts.isPrefixUnaryExpression(expr) || ts.isPostfixUnaryExpression(expr)) {
      return (
        expr.operator === ts.SyntaxKind.PlusPlusToken ||
        expr.operator === ts.SyntaxKind.MinusMinusToken
      );
    }
    if (ts.isCallExpression(expr)) {
      // `obj.map(...)` / `obj?.map(...)`: a pure method call is a value, not an action.
      const callee = expr.expression;
      return !(ts.isPropertyAccessExpression(callee) && PURE_METHODS.has(callee.name.text));
    }
    return (
      ts.isTaggedTemplateExpression(expr) ||
      ts.isAwaitExpression(expr) ||
      ts.isYieldExpression(expr) ||
      ts.isDeleteExpression(expr)
    );
  };

  /** `try { JSON.parse(text); }`: a call directly in the try block (not catch/finally). */
  const isCallForItsException = (statement: import('typescript').ExpressionStatement) => {
    let expr = statement.expression;
    while (ts.isParenthesizedExpression(expr)) expr = expr.expression;
    const block = statement.parent;
    return (
      ts.isCallExpression(expr) &&
      ts.isBlock(block) &&
      ts.isTryStatement(block.parent) &&
      block.parent.tryBlock === block
    );
  };

  const problems: string[] = [];
  for (const [i, section] of lesson.sections.entries()) {
    for (const [j, example] of (section.examples ?? []).entries()) {
      if (example.bareValueIsTheBug) continue;
      // setParentNodes = true: isCallForItsException walks up to the enclosing try.
      const sf = ts.createSourceFile(
        'snippet.ts',
        example.code.trim(),
        ts.ScriptTarget.Latest,
        true,
      );
      const visit = (node: import('typescript').Node): void => {
        if (
          ts.isExpressionStatement(node) &&
          !isAction(node.expression) &&
          !isCallForItsException(node)
        ) {
          const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
          problems.push(`${i + 1}.${j + 1}, строка ${line}: ${node.getText(sf)}`);
        }
        ts.forEachChild(node, visit);
      };
      visit(sf);
    }
  }
  return problems;
}

/** One TypeScript error inside a snippet. `text` may span several lines. */
type SnippetTypeError = { line: number; code: number; text: string };

/**
 * Type-checks EVERY snippet of the lesson in ONE TypeScript program.
 * Each snippet becomes a virtual file in the lesson's folder:
 *   <lesson file up to `await runLesson(`>   ← imports, helpers, scope data with real types
 *   {                                        ← a block, so the snippet may reuse names
 *   <snippet>
 *   }
 * One program means the libs are parsed once, so the whole lesson takes ~0.1-0.2 s.
 * Browser libs (lib.dom), not Node types: this is frontend interview prep, and e.g.
 * `res.json()` is Promise<any> in browsers but Promise<unknown> in Node's types.
 * Without `lesson.source` the top part is empty and files live in the current folder.
 * Returns the errors of each snippet that has any, keyed "N.M" (section.example).
 */
async function checkTypes(lesson: Lesson): Promise<Map<string, SnippetTypeError[]>> {
  const ts = await loadTs();
  const lessonText = lesson.source ? readFileSync(lesson.source, 'utf8') : '';
  const cut = lessonText.indexOf('await runLesson(');
  const header = cut >= 0 ? lessonText.slice(0, cut) : '';
  // header lines + the "{" line come before the snippet's first line
  const offset = header.split('\n').length;
  const folder = lesson.source ? dirname(lesson.source) : process.cwd();

  const keys = new Map<string, string>(); // virtual file name → "N.M"
  const texts = new Map<string, string>(); // virtual file name → file content
  for (const [i, section] of lesson.sections.entries()) {
    for (const [j, example] of (section.examples ?? []).entries()) {
      const name = join(folder, `__snippet_${i + 1}_${j + 1}.ts`);
      keys.set(name, `${i + 1}.${j + 1}`);
      texts.set(name, `${header}{\n${example.code.trim()}\n}\nexport {};\n`);
    }
  }

  const options: import('typescript').CompilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2023,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.esnext.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    types: [],
    noEmit: true,
    skipLibCheck: true,
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (name, languageVersion, ...rest) => {
    const text = texts.get(name);
    return text !== undefined
      ? ts.createSourceFile(name, text, languageVersion)
      : getSourceFile(name, languageVersion, ...rest);
  };
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (name) => texts.has(name) || fileExists(name);

  const program = ts.createProgram([...keys.keys()], options, host);
  const result = new Map<string, SnippetTypeError[]>();
  for (const [name, key] of keys) {
    const errors: SnippetTypeError[] = [];
    for (const d of ts.getPreEmitDiagnostics(program, program.getSourceFile(name))) {
      const fileLine =
        d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line : 0;
      const line = fileLine + 1 - offset;
      // An error in the lesson's own top part (line < 1) is not this snippet's fault, and
      // `npm run typecheck` already reports it once, at the real line — don't repeat it here.
      if (line < 1) continue;
      errors.push({
        line,
        code: d.code,
        text: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      });
    }
    if (errors.length) result.set(key, errors);
  }
  return result;
}

/**
 * When LESSON_TOC=1 (set by list-lessons.ts), lessons don't run: they register here,
 * so the table of contents can be built by simply importing every lesson file.
 */
export const collectedLessons: Lesson[] = [];

/** Prints the numbered sections of one lesson (used by `--toc`). */
export function printToc(lesson: Lesson): void {
  console.log('\n' + styleText(['bold', 'magenta'], `  📚 ${lesson.title}`));
  for (const [i, section] of lesson.sections.entries()) {
    const count = section.examples?.length ?? 0;
    const label = count ? styleText('gray', ` (${count} прим.)`) : styleText('gray', ' (теория)');
    console.log(`  ${String(i + 1).padStart(3)}. ${section.title}${label}`);
  }
  console.log(
    styleText('gray', '\n  Начать с нужной секции: npm run lesson <NN> -- --from <секция>\n'),
  );
}

export async function runLesson(lesson: Lesson): Promise<void> {
  const args = process.argv.slice(2);
  if (process.env.LESSON_TOC === '1') {
    collectedLessons.push(lesson);
    return;
  }
  if (args.includes('--toc')) {
    printToc(lesson);
    return;
  }

  // Lesson code must be real code: refuse to run if a snippet has a bare value line.
  const bareValues = await findBareValues(lesson);
  if (bareValues.length) {
    console.error(
      styleText('red', `\n  🛑 ${lesson.title}: в примерах есть строки-значения без действия:`) +
        '\n' +
        bareValues.map((p) => `     ${p}`).join('\n') +
        styleText(
          'gray',
          '\n\n  Такая строка компилируется, но в настоящем файле ничего не делает.' +
            '\n  Выведи значение явно: console.log(...).\n',
        ),
    );
    process.exit(1);
  }

  // Lesson code must be valid TypeScript (unless an example shows a TS error on purpose:
  // those are marked with `typecheck` and their errors are shown in place below).
  const typeErrors = await checkTypes(lesson);
  const unexpected: string[] = [];
  for (const [i, section] of lesson.sections.entries()) {
    for (const [j, example] of (section.examples ?? []).entries()) {
      if (example.typecheck) continue;
      for (const e of typeErrors.get(`${i + 1}.${j + 1}`) ?? []) {
        const oneLine = e.text.replace(/\s*\n\s*/g, ' ');
        unexpected.push(`${i + 1}.${j + 1}, строка ${e.line}: TS${e.code} ${oneLine}`);
      }
    }
  }
  if (unexpected.length) {
    console.error(
      styleText('red', `\n  🛑 ${lesson.title}: примеры не компилируются в TypeScript:`) +
        '\n' +
        unexpected.map((p) => `     ${p}`).join('\n') +
        styleText(
          'gray',
          '\n\n  Исправь код примера. Если ошибка TS и есть смысл примера — пометь его' +
            "\n  typecheck: true (показать ошибку) или typecheck: 'and-run' (показать и выполнить).\n",
        ),
    );
    process.exit(1);
  }

  const interactive = process.stdin.isTTY && !args.includes('--all');
  const fromIndex = args.indexOf('--from');
  const from = fromIndex >= 0 ? Number(args[fromIndex + 1]) || 1 : 1;
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  const scope = lesson.scope ?? {};

  // A snippet may intentionally leave a rejected promise unhandled (to demonstrate it).
  // Node would crash the whole lesson by default, so we just report it.
  process.on('unhandledRejection', (reason) => {
    const message = reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
    console.log(styleText('yellow', `   ⚠️  unhandled rejection: ${message}`));
  });

  const pause = async (prompt: string): Promise<string> => {
    if (!rl) return '';
    const answer = (await rl.question(prompt)).trim();
    if (answer === 'q') {
      console.log(styleText('gray', '\n   Пока! Продолжить можно с --from <номер секции>.\n'));
      rl.close();
      process.exit(0);
    }
    return answer;
  };

  console.log('\n' + styleText(['bold', 'magenta'], `  📚 ${lesson.title}`));
  if (interactive) {
    console.log(
      styleText(
        'gray',
        '   Enter — дальше · можно вписать свой прогноз перед Enter · q — выйти · --all — без пауз',
      ),
    );
  }
  if (lesson.intro && from === 1) console.log('\n' + wrap(lesson.intro));

  for (const [i, section] of lesson.sections.entries()) {
    const n = i + 1;
    if (n < from) continue;
    console.log(
      '\n' + styleText(['bold', 'yellow'], `━━━ ${n}. ${section.title} `.padEnd(WIDTH, '━')),
    );
    if (section.intro) console.log('\n' + styleText('white', wrap(section.intro)));

    for (const [j, example] of (section.examples ?? []).entries()) {
      console.log('\n' + styleText('gray', `── ${n}.${j + 1} `.padEnd(30, '─')));
      console.log(labeled('💬', example.explain, 'cyan'));
      console.log(
        '\n' +
          example.code
            .trim()
            .split('\n')
            .map((l) => styleText(['bold', 'blue'], '     ' + l))
            .join('\n') +
          '\n',
      );

      const guess = await pause(styleText('gray', '   🤔 Твой прогноз? '));

      const logs: string[] = [];
      const arrows = (lines: string[]) =>
        lines.map((l) => `   → ${l.replaceAll('\n', '\n     ')}`).join('\n');

      let output: string;
      if (example.typecheck) {
        // Computed up front by checkTypes, in the same environment as all other snippets.
        const errors = (typeErrors.get(`${n}.${j + 1}`) ?? []).map(
          (e) => `TS${e.code} (строка ${e.line}): ${e.text}`,
        );
        if (errors.length) {
          console.log(
            errors
              .map((e) => `   🛑 ${styleText('red', e.replaceAll('\n', '\n      '))}`)
              .join('\n'),
          );
          if (example.typecheck === 'and-run') {
            // Plain JS has no type checker: show what the code does when run anyway.
            console.log(styleText('gray', '   ▶ а в чистом JS (без проверки типов):'));
          } else {
            if (guess) console.log(styleText('gray', `     (твой прогноз: ${guess})`));
            if (example.why) console.log(labeled('💡', example.why, 'green'));
            continue;
          }
        } else {
          console.log(`   ✅ ${styleText('green', 'компилируется без ошибок')}`);
        }
        if (example.typecheck === 'only') {
          if (guess) console.log(styleText('gray', `     (твой прогноз: ${guess})`));
          if (example.why) console.log(labeled('💡', example.why, 'green'));
          continue;
        }
      }
      try {
        const run = compile(example.code);
        await run(scope, logs);
        output = logs.length ? arrows(logs) : styleText('gray', '   → (ничего не выведено)');
      } catch (error) {
        const e = error as Error;
        const before = logs;
        output =
          (before.length ? arrows(before) + '\n' : '') +
          `   💥 ${styleText('red', `${e.name}: ${e.message}`)}`;
      }
      console.log(output);
      if (guess) console.log(styleText('gray', `     (твой прогноз: ${guess})`));
      if (example.why) console.log(labeled('💡', example.why, 'green'));
    }
    if (rl && n < lesson.sections.length) {
      await pause(styleText('gray', `\n   ⏎ Конец секции ${n}. Enter — следующая секция `));
    }
  }

  if (lesson.outro) {
    console.log('\n' + styleText(['bold', 'magenta'], '  🏁 Итоги'));
    console.log(wrap(lesson.outro));
  }
  console.log('');
  rl?.close();
}
