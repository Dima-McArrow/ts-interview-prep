/**
 * Lists all lessons with their numbered sections.
 *   npm run lessons        → table of contents in the terminal
 *   npm run lessons list   → short list, one line per lesson (also: -- --short)
 *   npm run toc            → (re)generates LESSONS.md in the project root
 *
 * Works by importing every src/NN-* /lesson.ts with LESSON_TOC=1: in this mode
 * runLesson() only registers the lesson data instead of running it.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { styleText } from 'node:util';
import { collectedLessons, type Lesson } from './lesson';

process.env.LESSON_TOC = '1';

const root = join(import.meta.dirname, '..', '..');
const srcDir = join(root, 'src');
const moduleDirs = readdirSync(srcDir)
  .filter((name) => /^\d\d-/.test(name))
  .sort();

type Entry = { dir: string; lesson: Lesson };
const entries: Entry[] = [];
for (const dir of moduleDirs) {
  const file = join(srcDir, dir, 'lesson.ts');
  const before = collectedLessons.length;
  await import(pathToFileURL(file).href);
  const lesson = collectedLessons[before];
  if (lesson) entries.push({ dir, lesson });
}

const countExamples = (lesson: Lesson) =>
  lesson.sections.reduce((sum, s) => sum + (s.examples?.length ?? 0), 0);
const total = entries.reduce((sum, e) => sum + countExamples(e.lesson), 0);

const args = process.argv.slice(2);
if (args.includes('--md')) {
  writeFileSync(join(root, 'LESSONS.md'), buildMarkdown());
  console.log(`✅ LESSONS.md generated: ${entries.length} lessons, ${total} examples`);
} else if (args.includes('list') || args.includes('--short')) {
  printShort();
} else {
  printTerminal();
}

/** One line per lesson: number, topic, example count and the command to run it. */
function printShort(): void {
  // The number is its own column, so drop the "Урок NN · " prefix from the title.
  const rows = entries.map(({ dir, lesson }) => ({
    num: dir.slice(0, 2),
    topic: lesson.title.replace(/^Урок \d+ · /, ''),
    count: `${countExamples(lesson)} прим.`,
  }));
  const topicWidth = Math.max(...rows.map((r) => r.topic.length));
  const countWidth = Math.max(...rows.map((r) => r.count.length));

  console.log(
    '\n' +
      styleText(['bold', 'magenta'], `  📚 Уроки: ${entries.length} модулей, ${total} примеров`) +
      '\n',
  );
  for (const { num, topic, count } of rows) {
    console.log(
      `  ${styleText(['bold', 'yellow'], num)}  ${topic.padEnd(topicWidth)}  ` +
        styleText('gray', count.padStart(countWidth)) +
        '  ' +
        styleText('cyan', `npm run lesson ${num}`),
    );
  }
  console.log(styleText('gray', '\n  Все секции уроков: npm run lessons\n'));
}

function printTerminal(): void {
  console.log(
    '\n' +
      styleText(['bold', 'magenta'], `  📚 Уроки: ${entries.length} модулей, ${total} примеров`),
  );
  for (const { dir, lesson } of entries) {
    console.log(
      '\n' +
        styleText(['bold', 'yellow'], `  ${lesson.title}`) +
        styleText('gray', `   (${countExamples(lesson)} прим.)`),
    );
    console.log(styleText('cyan', `    npm run lesson ${dir.slice(0, 2)}`));
    for (const [i, section] of lesson.sections.entries()) {
      const count = section.examples?.length ?? 0;
      const label = count ? `${count} прим.` : 'теория';
      console.log(
        `    ${String(i + 1).padStart(2)}. ${section.title}` + styleText('gray', ` (${label})`),
      );
    }
  }
  console.log(
    styleText(
      'gray',
      '\n  Начать с секции: npm run lesson <NN> -- --from <секция> · без пауз: -- --all' +
        '\n  Оглавление одного урока: npm run lesson <NN> -- --toc · файл LESSONS.md: npm run toc' +
        '\n  Коротко, одна строка на урок: npm run lessons list\n',
    ),
  );
}

function buildMarkdown(): string {
  const lines: string[] = [
    '# 📚 Оглавление уроков',
    '',
    `> Сгенерировано командой \`npm run toc\` — ${entries.length} уроков, ${total} интерактивных примеров.`,
    '> В терминале то же самое: `npm run lessons`.',
    '',
    '## Как запускать',
    '',
    '```bash',
    'npm run lesson 01               # весь урок',
    'npm run lesson 01 -- --from 9   # с 9-й секции',
    'npm run lesson 01 -- --all      # без пауз',
    'npm run lesson 01 -- --toc      # только оглавление урока',
    '```',
    '',
    '## Уроки',
    '',
    '| #   | Урок | Секций | Примеров |',
    '| --- | ---- | ------ | -------- |',
    ...entries.map(
      ({ dir, lesson }) =>
        `| ${dir.slice(0, 2)} | [${lesson.title}](#${anchor(lesson.title)}) | ${lesson.sections.length} | ${countExamples(lesson)} |`,
    ),
    '',
  ];

  for (const { dir, lesson } of entries) {
    lines.push(
      `## ${lesson.title}`,
      '',
      '```bash',
      `npm run lesson ${dir.slice(0, 2)}`,
      '```',
      '',
      `Конспект: [README](src/${dir}/README.md) · Домашка: [exercises.ts](src/${dir}/exercises.ts) · ` +
        `Разборы: [solutions/${dir}.ts](solutions/${dir}.ts)`,
      '',
      '| Секция | Тема | Примеров | Запуск с этой секции |',
      '| ------ | ---- | -------- | -------------------- |',
      ...lesson.sections.map((section, i) => {
        const count = section.examples?.length ?? 0;
        const title = section.title.replaceAll('|', '\\|');
        return `| ${i + 1} | ${title} | ${count || 'теория'} | \`-- --from ${i + 1}\` |`;
      }),
      '',
    );
  }
  return lines.join('\n');
}

/** GitHub-style heading anchor (lowercase, spaces → dashes, punctuation dropped). */
function anchor(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
}
