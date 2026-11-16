/**
 * Lesson runner: resolves a loose lesson reference to src/NN-* /lesson.ts and runs it.
 *   npm run lesson 03
 *   npm run lesson 3
 *   npm run lesson src/03-spread-rest-destructuring
 *   npm run lesson src/03-spread-rest-destructuring/lesson.ts
 *   npm run lesson 03 -- --from 8     (engine flags are passed through)
 *
 * The lesson is imported into this same process, so stdin/TTY detection and
 * the engine's own flag parsing (--all, --from) keep working unchanged.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = join(import.meta.dirname, '..', '..');
const srcDir = join(root, 'src');
const moduleDirs = readdirSync(srcDir)
  .filter((name) => /^\d\d-/.test(name))
  .sort();

function printUsage(): void {
  console.log('Usage: npm run lesson <NN>   e.g. npm run lesson 03\n');
  console.log('Available lessons:');
  for (const dir of moduleDirs) console.log(`  ${dir.slice(0, 2)}  ${dir}`);
}

function resolveLesson(ref: string): string | undefined {
  // An existing file path keeps working exactly as before.
  const asPath = resolve(ref);
  if (existsSync(asPath) && statSync(asPath).isFile()) return asPath;

  // Otherwise take the leading number of the last path segment: "3", "03",
  // "src/03-foo", "src/03-foo/" and even "src/03-foo.ts" all mean lesson 03.
  const name = basename(ref).replace(/\.ts$/, '');
  const match = /^(\d+)/.exec(name);
  if (!match) return undefined;
  const prefix = `${match[1].padStart(2, '0')}-`;
  const dir = moduleDirs.find((d) => d.startsWith(prefix));
  return dir ? join(srcDir, dir, 'lesson.ts') : undefined;
}

// Engine flags that consume the next argument as their value.
const FLAGS_WITH_VALUE = new Set(['--from']);

// First positional argument is the lesson reference; flags (and their values)
// are left in process.argv for the engine, so their order does not matter.
function findLessonRef(args: string[]): string | undefined {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (FLAGS_WITH_VALUE.has(arg)) {
      // Skip the flag's value, e.g. "8" in "--from 8".
      i++;
    } else if (!arg.startsWith('-')) {
      return arg;
    }
  }
  return undefined;
}

const ref = findLessonRef(process.argv.slice(2));
if (!ref) {
  printUsage();
  process.exit(1);
}

const file = resolveLesson(ref);
if (!file) {
  console.error(`Lesson not found: "${ref}"\n`);
  printUsage();
  process.exit(1);
}

await import(pathToFileURL(file).href);
