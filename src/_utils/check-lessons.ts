/**
 * Runs the static checks of every lesson without showing the lessons:
 *   npm run check:lessons     (also part of `npm run check`)
 *
 * Imports every src/NN-* /lesson.ts with LESSON_CHECK=1: in this mode runLesson() only
 * checks the snippets (bare value lines, TypeScript errors), prints "✅ <title>" or the
 * problems, and returns. A failing lesson sets process.exitCode = 1 instead of exiting,
 * so the remaining lessons are still checked and all problems are reported at once.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.LESSON_CHECK = '1';

const srcDir = join(import.meta.dirname, '..');
const moduleDirs = readdirSync(srcDir)
  .filter((name) => /^\d\d-/.test(name))
  .sort();

for (const dir of moduleDirs) {
  await import(pathToFileURL(join(srcDir, dir, 'lesson.ts')).href);
}
