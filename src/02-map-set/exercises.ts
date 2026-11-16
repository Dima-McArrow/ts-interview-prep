/**
 * EXERCISES 02 — MAP & SET
 * Watch mode: npm run test:watch -- 02-map-set
 *
 * PART 1 — QUIZ: replace each TODO with the exact value the snippet produces.
 *   Each question has a "Concept" line: which idea it checks + the lesson section.
 * PART 2 — TASKS: replace `return todo();` with your implementation.
 *   Each task has a "How to think" block: a step-by-step plan WITHOUT the code.
 *
 * Detailed explanations of every answer: solutions/02-map-set.ts
 */
import { TODO, todo } from '../_utils/todo';

// ===========================================================================
// PART 1 — QUIZ: "What is the result?"
// ===========================================================================
export const quiz = {
  // Q1.  const m = new Map();
  //      m.set('a', 1).set('a', 2);
  //      m.size → ?
  // Concept: set on an existing key overwrites (lesson §2).
  q1: 1,

  // Q2.  new Map([['a', 1]]).get('b')
  // Concept: what get returns for a missing key (lesson §2).
  q2: undefined,

  // Q3.  new Set([1, '1', 1, NaN, NaN]).size
  // Concept: SameValueZero — types matter, NaN equals NaN (lesson §3, §7).
  q3: 3,

  // Q4.  JSON.stringify(new Map([['x', 1]]))
  // Concept: Map and JSON (lesson §5).
  q4: '{}',

  // Q5.  const s = new Set([1, 2]);
  //      s.add(2).add(3);
  //      [...s] → ?
  // Concept: add returns the Set; duplicates are ignored (lesson §7).
  q5: [1, 2, 3],

  // Q6.  const m = new Map();
  //      m.set({}, 'value');
  //      m.get({}) → ?
  // Concept: object keys are compared by reference (lesson §3).
  q6: undefined,

  // Q7.  Array.isArray(new Map([['a', 1]]).keys())
  // Concept: keys() returns an iterator (lesson §4).
  q7: false,

  // Q8.  const obj = {};
  //      obj[1] = 'a';
  //      obj['1'] = 'b';
  //      Object.keys(obj) → ?
  // Concept: object keys are strings (lesson §1).
  q8: ['1'],

  // Q9.  [...new Set([1, 2, 3]).difference(new Set([2, 3, 4]))]
  // Concept: set algebra (lesson §9).
  q9: [1],

  // Q10. Object.fromEntries(new Map([['a', 1], ['b', 2]]))
  // Concept: Map → object (lesson §5).
  q10: { a: 1, b: 2 },

  // Q11. new Map([[1, 'one']]).has('1')
  // Concept: Map keeps key types (lesson §1, §3).
  q11: false,

  // Q12. new Set().delete('x')
  // Concept: what delete returns (lesson §2, §7).
  q12: false,

  // Q13. new Set('banana').size
  // Concept: a string is iterable by characters (lesson §7).
  q13: 3,

  // Q14. const order = [];
  //      new Map([['b', 1], ['a', 2]]).forEach((v, k) => order.push(k));
  //      order → ?
  // Concept: iteration order + forEach argument order (lesson §4).
  q14: ['b', 'a'],

  // Q15. [...new Map([['a', 1], ['b', 2]])]
  // Concept: spreading a Map gives [key, value] pairs (lesson §4, §5).
  q15: [
    ['a', 1],
    ['b', 2],
  ],

  // Q16. const m = new Map([['x', 1], ['y', 2]]);
  //      m.set('x', 100);
  //      [...m.keys()] → ?
  // Concept: overwriting does not move the key (lesson §2).
  q16: ['x', 'y'],
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. Count occurrences of each item, return a Map.
 * frequencyMap(['a', 'b', 'a']) → Map { 'a' => 2, 'b' => 1 }
 *
 * How to think:
 *  1. Create an empty Map<T, number>.
 *  2. For each item: current = map.get(item) ?? 0, then map.set(item, current + 1).
 *  3. Return the map. (Insertion order = order of first appearance — tests expect that.)
 */
export function frequencyMap<T>(items: T[]): Map<T, number> {
  const count = new Map();
  for (const item of items) {
    const prev = count.get(item) || 0;
    count.set(item, prev + 1);
  }
  return count;
}

/**
 * T2. Return the first element that appears for the SECOND time, or undefined.
 * firstDuplicate([2, 1, 3, 1, 2]) → 1   (1 repeats at index 3, before 2 repeats at index 4)
 *
 * How to think:
 *  1. Walk left to right and remember what you've already "seen" — a Set.
 *  2. For each item: if seen.has(item) → this is the answer, return immediately.
 *     Otherwise seen.add(item).
 *  3. Need an early exit → for...of with return (forEach can't stop).
 *  4. Loop finished without a hit → return undefined.
 */
export function firstDuplicate<T>(arr: T[]): T | undefined {
  const acc = new Set();

  for (const item of arr) {
    if (acc.has(item)) {
      return item;
    }

    acc.add(item);
  }

  return undefined;
}

/**
 * T3. Do two arrays share at least one value? Must be O(n + m), not O(n * m).
 * hasCommon([1, 2], [3, 2]) → true
 *
 * How to think:
 *  1. a.some(x => b.includes(x)) works but is O(n * m) — includes scans b every time.
 *  2. Put one array into a Set (O(n) once), then check the other with has (O(1) each).
 *  3. "At least one" → some (it stops at the first match).
 */
export function hasCommon<T>(a: T[], b: T[]): boolean {
  const doesit = new Set(a);
  for (const e of b) {
    if (doesit.has(e)) return true;
  }
  return false;
}

/**
 * T4. Group items by key into a Map — implement it manually (no Map.groupBy).
 * groupBy(['one', 'two', 'three'], (s) => s.length) → Map { 3 => ['one', 'two'], 5 => ['three'] }
 *
 * How to think:
 *  1. For each item compute its key with getKey(item).
 *  2. If the Map already has an array for that key → push the item into it.
 *  3. Otherwise → set a NEW array [item] for that key.
 *  Pushing into arrays that YOU created inside the function is fine (not the input).
 */
export function groupBy<T, K>(items: T[], getKey: (item: T) => K): Map<K, T[]> {
  return todo();
}

/**
 * T5. Unique values present in BOTH arrays, in the order of the first array.
 * commonItems([1, 2, 2, 3, 4], [4, 2, 2, 9]) → [2, 4]
 *
 * How to think:
 *  1. "Present in b" check must be fast → new Set(b) + has.
 *  2. Filter a by that check — this keeps a's order.
 *  3. a may contain duplicates (2, 2) → dedupe the result (another Set).
 *  ⚠️ Set.prototype.intersection gives the right values but NOT a's order (see lesson §9).
 */
export function commonItems<T>(a: T[], b: T[]): T[] {
  return todo();
}

/**
 * T6. Are two strings anagrams? Ignore case and spaces.
 * isAnagram('Listen', 'Silent') → true;  isAnagram('Dormitory', 'dirty room') → true
 *
 * How to think:
 *  1. Normalize both: lowercase + remove spaces.
 *  2. Different lengths → definitely not anagrams.
 *  3. Count letters of the first string in a Map (like T1).
 *  4. Walk the second string and DECREMENT counts; if a letter is missing or already 0 → false.
 *  5. All letters consumed → true.
 *  (Short O(n log n) alternative: compare sorted letters. Try it too.)
 */
export function isAnagram(a: string, b: string): boolean {
  return todo();
}

/**
 * T7. Classic: find indexes of two numbers that sum to target. One pass, O(n).
 * twoSum([2, 7, 11, 15], 9) → [0, 1]
 * twoSum([1, 2], 10) → null
 *
 * How to think:
 *  1. For the current number n we need a partner p = target - n.
 *  2. Keep a Map<value, index> of numbers we've ALREADY passed.
 *  3. If the Map has p → answer is [indexOfP, currentIndex].
 *  4. Otherwise store n with its index and move on.
 *  5. Checking BEFORE storing prevents using the same element twice (twoSum([3], 6)).
 *  Tip: for (const [i, n] of nums.entries()) gives index and value.
 */
export function twoSum(nums: number[], target: number): [number, number] | null {
  return todo();
}

/**
 * T8. Keep only the first item for each key.
 * uniqueBy([{id:1,v:'a'},{id:1,v:'b'},{id:2,v:'c'}], (x) => x.id) → [{id:1,v:'a'},{id:2,v:'c'}]
 *
 * How to think:
 *  1. Same idea as T2: a Set of keys we've already seen.
 *  2. filter: keep the item if its key is NOT in the set yet — and add the key.
 *  3. Order is preserved automatically by filter.
 */
export function uniqueBy<T, K>(items: T[], getKey: (item: T) => K): T[] {
  return todo();
}

/**
 * T9. Merge two count maps by summing values.
 * mergeCounts(Map{a:1,b:2}, Map{b:3,c:4}) → Map{a:1,b:5,c:4}
 * Inputs must NOT be mutated.
 *
 * How to think:
 *  1. Start from a COPY of the first map: new Map(a) — the Map constructor accepts a Map.
 *  2. For each [key, count] of b: result.set(key, (result.get(key) ?? 0) + count).
 *  3. a and b stay untouched because we only wrote into the copy.
 */
export function mergeCounts(a: Map<string, number>, b: Map<string, number>): Map<string, number> {
  return todo();
}

/**
 * T10. Swap keys and values.
 * invert(new Map([['a', 1], ['b', 2]])) → Map { 1 => 'a', 2 => 'b' }
 *
 * How to think:
 *  1. [...map] gives [[k, v], ...].
 *  2. map each pair to [v, k].
 *  3. new Map(...) from the swapped pairs.
 */
export function invert<K, V>(map: Map<K, V>): Map<V, K> {
  return todo();
}

/**
 * T11. ★ LRU cache (Least Recently Used) — very popular interview task.
 * - get(key): returns value or undefined; marks the key as "recently used".
 * - put(key, value): inserts/updates; if size exceeds capacity, evicts the
 *   LEAST recently used key.
 *
 * How to think:
 *  1. Store data in a private Map. Map remembers INSERTION order.
 *  2. "Mark as recently used" = delete the key and set it again → it moves to the END.
 *  3. So the FIRST key in map.keys() is always the least recently used one.
 *  4. get: if missing → undefined; else read value, delete, set again, return value.
 *  5. put: delete (in case it exists), set; if size > capacity → delete the first key:
 *     map.keys().next().value
 *  6. keys(): [...map.keys()].
 */
export class LRUCache<K, V> {
  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    return todo();
  }

  put(key: K, value: V): void {
    todo();
  }

  /** Keys from least to most recently used (for tests). */
  keys(): K[] {
    return todo();
  }
}

/**
 * T12. ★ Length of the longest substring without repeating characters.
 * longestUniqueRun('abcabcbb') → 3 ('abc');  longestUniqueRun('bbbb') → 1;  longestUniqueRun('') → 0
 *
 * How to think — "sliding window":
 *  1. Keep a window [start, i] that has no repeated characters.
 *  2. Remember the LAST index of every character in a Map<char, index>.
 *  3. When char at i was seen INSIDE the window (lastIndex >= start),
 *     move start to lastIndex + 1 — this drops the duplicate from the window.
 *  4. Update lastIndex for the char, update best = max(best, i - start + 1).
 *  Tricky case: 'abba' → 2. When the second 'a' comes, its old index (0) is already
 *  OUTSIDE the window (start is 2), so start must not jump back.
 */
export function longestUniqueRun(s: string): number {
  return todo();
}
