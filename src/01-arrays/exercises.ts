/**
 * EXERCISES 01 — ARRAYS
 * Watch mode: npm run test:watch -- 01-arrays
 *
 * PART 1 — QUIZ: replace each TODO with the exact value the snippet produces.
 *   Solve it in your head FIRST. Each question has a "Concept" line that tells
 *   which idea it checks and which lesson section covers it.
 *   Unanswered questions show up as "todo" in the test report (not as failures).
 *   A wrong answer shows only YOUR answer, never the correct one.
 *
 * PART 2 — TASKS: replace `return todo();` with your implementation.
 *   Each task has a "How to think" block: a step-by-step plan WITHOUT the code.
 *   Try first with only the task description; open the hint if you are stuck.
 *   Rule for all tasks: do NOT mutate input arrays.
 *
 * Detailed explanations of every answer: solutions/01-arrays.ts
 */
import { TODO, todo } from '../_utils/todo';

// ===========================================================================
// PART 1 — QUIZ: "What is the result?"
// ===========================================================================
export const quiz = {
  // Q1.  [1, 2, 3].map((n) => n * 2)
  // Concept: map returns a new array of the same length (lesson §2).
  q1: [2, 4, 6],

  // Q2.  ['1', '2', '3'].map(parseInt)
  // Concept: map passes (value, index, array) to the callback (lesson §2).
  q2: [1, NaN, NaN],

  // Q3.  [10, 1, 5, 100].sort()
  // Concept: sort WITHOUT a comparator compares elements as strings (lesson §9).
  q3: [1, 10, 100, 5],

  // Q4.  const arr = [1, 2, 3];
  //      const result = arr.push(4);
  //      result → ?
  // Concept: what push RETURNS (lesson §9).
  q4: 4,

  // Q5.  const arr = [1, 2, 3, 4, 5];
  //      const removed = arr.splice(1, 2);
  //      q5a: removed → ?    q5b: arr → ?
  // Concept: splice mutates AND returns the removed items (lesson §9).
  q5a: [2, 3],
  q5b: [1, 4, 5],

  // Q6.  [].every((x) => x > 100)
  // Concept: every/some on an empty array (lesson §6).
  q6: true,

  // Q7.  q7a: [NaN].includes(NaN)    q7b: [NaN].indexOf(NaN)
  // Concept: includes uses SameValueZero, indexOf uses === (lesson §6).
  q7a: true,
  q7b: -1,

  // Q8.  [1, [2, [3, [4]]]].flat()
  // Concept: default depth of flat (lesson §8).
  q8: [1, 2, [3, [4]]],

  // Q9.  [1, 2, 3].reduce((acc, n) => acc + n, '')
  // Concept: the type of initialValue decides the type of the result (lesson §4).
  q9: '123',

  // Q10. const a = [{ n: 1 }];
  //      const b = a.slice();
  //      b[0].n = 99;
  //      a[0].n → ?
  // Concept: "new array" is a SHALLOW copy (lesson §1).
  q10: 99,

  // Q11. const grid = new Array(2).fill([]);
  //      grid[0].push('x');
  //      grid → ?
  // Concept: fill puts the SAME reference into every slot (lesson §9).
  q11: [['x'], ['x']],

  // Q12. [1, 2, 3].forEach((n) => n * 2)
  // Concept: what forEach returns (lesson §5).
  q12: undefined,

  // Q13. q13a: [1, 2, 3].at(-1)    q13b: [1, 2, 3].slice(-2)
  // Concept: negative indexes (lesson §7).
  q13a: 3,
  q13b: [2, 3],

  // Q14. const nums = [3, 1, 2];
  //      const sorted = nums.toSorted();
  //      q14a: sorted → ?    q14b: nums → ?
  // Concept: ES2023 immutable twins (lesson §10).
  q14a: [1, 2, 3],
  q14b: [3, 1, 2],

  // Q15. q15a: [1, 2, 3].find((n) => n > 10)    q15b: [1, 2, 3].findIndex((n) => n > 10)
  // Concept: "not found" values differ between find and findIndex (lesson §6).
  q15a: undefined,
  q15b: -1,

  // Q16. [1, 2, 3, 4].flatMap((n) => (n % 2 === 0 ? [n, n] : []))
  // Concept: flatMap can remove AND duplicate items (lesson §8).
  q16: [2, 2, 4, 4],

  // Q17. ['a', 'b', 'c'].map((ch, i, arr) => arr.length - i)
  // Concept: the 2nd and 3rd callback arguments (lesson §2).
  q17: [3, 2, 1],

  // Q18. q18a: [1, 2] === [1, 2]
  //      q18b: const a = [1, 2]; const b = a; b.push(3); a → ?
  // Concept: arrays are objects → compared and copied BY REFERENCE (lesson §1).
  q18a: false,
  q18b: [1, 2, 3],
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. Keep only even numbers and double them.
 * doubleEvens([1, 2, 3, 4]) → [4, 8]
 *
 * How to think:
 *  1. Two separate steps: "keep some" and "transform each". Which methods do that?
 *  2. Order matters: filter first, then map (otherwise you check evenness of doubled values,
 *     and every doubled number is even!).
 *  3. "Even" means n % 2 === 0.
 */
export function doubleEvens(nums: number[]): number[] {
  return nums.filter((n) => n % 2 === 0).map((n) => n * 2);
}

/**
 * T2. Sum values extracted from each item.
 * sumBy([{ price: 2 }, { price: 3 }], (x) => x.price) → 5
 * sumBy([], ...) → 0
 *
 * How to think:
 *  1. Many items → ONE number: that's reduce.
 *  2. The accumulator is "the sum so far"; what should it start from?
 *     (Hint: what must sumBy([]) return? That's your initialValue.)
 *  3. On each step: acc + getValue(item).
 */
export function sumBy<T>(items: T[], getValue: (item: T) => number): number {
  return items.reduce((acc, item) => acc + getValue(item), 0);
}

/**
 * T3. Count how many times each word appears.
 * countWords(['a', 'b', 'a']) → { a: 2, b: 1 }
 *
 * How to think:
 *  1. Many items → ONE object: reduce with initialValue {}.
 *  2. For each word: read the current count (may not exist yet → use ?? 0), add 1, write it back.
 *  3. Don't forget `return acc` at the end of the callback.
 *  TS tip: give reduce a type argument: words.reduce<Record<string, number>>(...)
 */
export function countWords(words: string[]): Record<string, number> {
  return todo();
}

/**
 * T4. Remove duplicates, keeping the FIRST occurrence order.
 * uniq([3, 1, 3, 2, 1]) → [3, 1, 2]
 *
 * How to think (two ways, try both):
 *  A. A Set stores only unique values and keeps insertion order. Array → Set → array.
 *  B. filter: keep an element only if it is the FIRST time we see it.
 *     "First time" = its index equals arr.indexOf(element). Note: this is O(n²).
 */
export function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * T5. Split an array into chunks of `size`. The last chunk may be shorter.
 * chunk([1, 2, 3, 4, 5], 2) → [[1, 2], [3, 4], [5]]
 * chunk([], 3) → []
 *
 * How to think:
 *  1. How many chunks will there be? 5 items / 2 per chunk → 2.5 → round UP → 3 (Math.ceil).
 *  2. Chunk number i starts at index i * size and ends (exclusive) at i * size + size.
 *     Which method cuts [start, end) without mutating? (slice — it also handles end > length.)
 *  3. "Create N things from an index" = Array.from({ length: N }, (_, i) => ...).
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  return todo();
}

/**
 * T6. Split into [passed, failed] by predicate.
 * partition([1, 2, 3, 4], (n) => n % 2 === 0) → [[2, 4], [1, 3]]
 *
 * How to think:
 *  1. Simplest: two arrays, a for...of loop, push into one or the other.
 *     (Pushing into YOUR OWN new arrays is fine — we don't mutate the input.)
 *  2. Alternative: two filters (one with predicate, one with !predicate) — simple but 2 passes.
 *  3. Alternative: reduce with initialValue [[], []].
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  let passed = arr.filter((item) => predicate(item));
  let failed = arr.filter((item) => !predicate(item));

  return [passed, failed];
}

export type Person = { name: string; age: number };

/**
 * T7. Sort people by age ascending; for equal ages, by name A→Z.
 * MUST NOT mutate the input (tests check it!).
 *
 * How to think:
 *  1. sort mutates → use toSorted (or copy first: [...people].sort(...)).
 *  2. Comparator for numbers ascending: a.age - b.age.
 *  3. When ages are equal, the difference is 0 (falsy) → `||` falls through to the
 *     second comparison: a.name.localeCompare(b.name).
 */
export function sortPeople(people: Person[]): Person[] {
  return people.toSorted((a, b) => a.age - b.age || a.name.localeCompare(b.name));
}

/**
 * T8. Return the names of the top `n` players by score (highest first).
 * topNames([{name:'a',score:1},{name:'b',score:5},{name:'c',score:3}], 2) → ['b', 'c']
 *
 * How to think — it's a 3-step pipeline:
 *  1. Sort by score DESCENDING without mutation (comparator b - a).
 *  2. Take the first n (slice(0, n) — works even if n > length).
 *  3. Keep only names (map).
 */
export function topNames(players: { name: string; score: number }[], n: number): string[] {
  return players
    .toSorted((a, b) => b.score - a.score)
    .map((n) => n.name)
    .slice(0, n);
}

/**
 * T9. Zip two arrays into pairs, stopping at the shorter one.
 * zip([1, 2, 3], ['a', 'b']) → [[1, 'a'], [2, 'b']]
 *
 * How to think:
 *  1. Result length = Math.min(a.length, b.length).
 *  2. For each index i: the pair [a[i], b[i]].
 *  3. Array.from({ length }, (_, i) => ...) builds it in one expression.
 *  TS tip: with index access TS can't prove the element exists; a[i]! tells it "trust me".
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return todo();
}

/**
 * T10. Create a range [start, end) with a step.
 * range(0, 5) → [0, 1, 2, 3, 4]
 * range(2, 10, 3) → [2, 5, 8]
 *
 * How to think:
 *  1. How many numbers? (end - start) / step, rounded UP. range(2, 10, 3): 8 / 3 = 2.67 → 3.
 *  2. Guard against negative lengths (range(5, 0) → []): Math.max(0, ...).
 *  3. The i-th number is start + i * step.
 */
export function range(start: number, end: number, step = 1): number[] {
  return todo();
}

/**
 * T11. Return a NEW array without the element at `index` (original untouched).
 * removeAt(['a', 'b', 'c'], 1) → ['a', 'c']
 *
 * How to think (3 valid ways):
 *  A. ES2023: toSpliced(index, 1) — immutable splice.
 *  B. Two slices around the index, glued with spread: [...before, ...after].
 *  C. filter by index: keep everything whose index !== index.
 */
export function removeAt<T>(arr: T[], index: number): T[] {
  return todo();
}

/**
 * T12. Check whether numbers are sorted ascending (equal neighbours are OK).
 * isSortedAsc([1, 2, 2, 5]) → true;   isSortedAsc([3, 1]) → false;   isSortedAsc([]) → true
 *
 * How to think:
 *  1. "All pairs of neighbours are in order" → every.
 *  2. every's callback gets (n, i, arr): compare n with the PREVIOUS element arr[i - 1].
 *  3. Index 0 has no previous element → treat it as OK (return true for i === 0).
 *  4. Empty array → every returns true by itself. 🙂
 */
export function isSortedAsc(nums: number[]): boolean {
  return todo();
}

/**
 * T13. Fully flatten any nesting depth WITHOUT using .flat().
 * flattenDeep([1, [2, [3, [4]], 5]]) → [1, 2, 3, 4, 5]
 *
 * How to think — classic recursion:
 *  1. Walk through the array (reduce with initialValue []).
 *  2. If the element is NOT an array → add it to the result.
 *  3. If it IS an array (Array.isArray) → flatten IT with the same function (recursion!)
 *     and add all the resulting items.
 *  4. The recursion stops by itself: eventually all elements are non-arrays.
 */
export type Nested<T> = (T | Nested<T>)[];
export function flattenDeep<T>(arr: Nested<T>): T[] {
  return todo();
}

/**
 * T14. Get the names of the active users who are adults (>= 18),
 * in uppercase, joined with ", ". Do it as ONE chain.
 * activeAdultNames([{name:'ann',age:20,active:true},{name:'bob',age:15,active:true}]) → 'ANN'
 *
 * How to think — read the requirement as a pipeline:
 *  "active AND adult" → filter (one filter with &&, not two)
 *  "names in uppercase" → map
 *  "joined with ', '" → join
 *  Empty input → join of [] is '' automatically.
 */
export function activeAdultNames(users: { name: string; age: number; active: boolean }[]): string {
  return todo();
}
