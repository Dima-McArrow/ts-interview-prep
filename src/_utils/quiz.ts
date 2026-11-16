import { inspect, isDeepStrictEqual } from 'node:util';
import { describe, it } from 'vitest';
import { TODO } from './todo';

/**
 * Registers one test per quiz question WITHOUT revealing the correct answer:
 *  - unanswered (still TODO) → shown as "todo" (not a failure)
 *  - wrong answer            → fails, prints only YOUR answer
 *  - correct answer          → passes
 *
 * `expected` values may be functions (sync or async) — they are called lazily,
 * which lets async snippets run inside the test.
 */
export function defineQuiz<K extends string>(
  title: string,
  quiz: Record<K, unknown>,
  expected: Record<K, unknown>,
): void {
  describe(title, () => {
    // Object.keys always returns string[]: TS can't promise an object has no extra keys at
    // runtime. `expected` is written with exactly the quiz keys, so K[] is accurate here.
    for (const key of Object.keys(expected) as K[]) {
      const answer = quiz[key];
      if (answer === TODO) {
        it.todo(`${key} — not answered yet`);
        continue;
      }
      it(key, async () => {
        const source = expected[key];
        const actual = typeof source === 'function' ? await source() : source;
        if (!isDeepStrictEqual(answer, actual)) {
          throw new Error(
            `quiz.${key} is wrong. Your answer: ${inspect(answer, { depth: null })}. ` +
              'Re-read the snippet (or the lesson) and try again.',
          );
        }
      });
    }
  });
}
