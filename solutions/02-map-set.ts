/**
 * SOLUTIONS 02 — MAP & SET (with detailed explanations)
 * Open only after you tried yourself :)
 *
 * Format for every task: solution → WHY it works → alternatives → complexity.
 */

// ===========================================================================
// PART 1 — QUIZ ANSWERS
// ===========================================================================
export const quiz = {
  // Q1: 1
  // set('a', 1) adds the key, set('a', 2) OVERWRITES the same key. One key → size 1.
  q1: 1,

  // Q2: undefined
  // get never throws for a missing key; it returns undefined.
  q2: undefined,

  // Q3: 3
  // Set uses SameValueZero: 1 and '1' are different (number vs string),
  // repeated 1 is dropped, and NaN equals NaN so the second NaN is dropped too.
  // Result: {1, '1', NaN} → 3.
  q3: 3,

  // Q4: '{}'
  // JSON.stringify serializes own enumerable PROPERTIES. A Map keeps its entries in
  // internal slots, not properties, so it looks like an empty object to JSON.
  // Fix: JSON.stringify(Object.fromEntries(map)).
  q4: '{}',

  // Q5: [1, 2, 3]
  // add returns the Set itself (chainable). Adding 2 again does nothing.
  q5: [1, 2, 3],

  // Q6: undefined
  // Two {} literals are two objects at two different addresses → two different keys.
  q6: undefined,

  // Q7: false
  // keys() returns a Map ITERATOR (lazy cursor), not an array. Use [...m.keys()].
  q7: false,

  // Q8: ['1']
  // Object keys are always strings: obj[1] is stored under '1', so obj['1'] overwrites it.
  q8: ['1'],

  // Q9: [1]
  // difference = elements of the first set that are NOT in the second.
  q9: [1],

  // Q10: { a: 1, b: 2 }
  // Object.fromEntries accepts any iterable of [key, value] pairs — a Map is one.
  q10: { a: 1, b: 2 },

  // Q11: false
  // Map keeps key types: number 1 and string '1' are different keys.
  q11: false,

  // Q12: false
  // delete returns whether the value existed. An empty Set had nothing to delete.
  q12: false,

  // Q13: 3
  // A string is iterable by characters: b, a, n, a, n, a → unique {b, a, n} → 3.
  q13: 3,

  // Q14: ['b', 'a']
  // Maps iterate in INSERTION order (not alphabetical). Also note forEach's callback
  // gets (value, key) — the snippet correctly pushes the 2nd argument, the key.
  q14: ['b', 'a'],

  // Q15: [['a', 1], ['b', 2]]
  // A Map iterates over [key, value] pairs, so spreading gives an array of pairs.
  q15: [
    ['a', 1],
    ['b', 2],
  ],

  // Q16: ['x', 'y']
  // Overwriting an existing key updates the value but keeps the key's position.
  q16: ['x', 'y'],
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. frequencyMap
 * WHY: for each item we read the current count (?? 0 handles "not seen yet") and store +1.
 * A Map (not an object) keeps the item's original type: 1 and '1' are counted separately,
 * and object items work too.
 * Complexity: O(n) time, O(k) memory (k = unique items).
 */
export function frequencyMap<T>(items: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return counts;
}

/**
 * T2. firstDuplicate
 * WHY: the Set remembers what we've passed. The first time has() is true, the current
 * item is the earliest SECOND occurrence. for...of lets us return immediately.
 * Alternative: arr.find((x, i) => arr.indexOf(x) !== i) — shorter but O(n²).
 * Complexity: O(n) time, O(n) memory.
 */
export function firstDuplicate<T>(arr: T[]): T | undefined {
  const seen = new Set<T>();
  for (const item of arr) {
    if (seen.has(item)) return item;
    seen.add(item);
  }
  return undefined;
}

/**
 * T3. hasCommon
 * WHY: building the Set is one O(n) pass; each has() is O(1); some() stops at the first hit.
 * Alternative (Node 22+): !new Set(a).isDisjointFrom(new Set(b)).
 * Complexity: O(n + m) time, O(n) memory. (The naive a.some(x => b.includes(x)) is O(n·m).)
 */
export function hasCommon<T>(a: T[], b: T[]): boolean {
  const setA = new Set(a);
  return b.some((x) => setA.has(x));
}

/**
 * T4. groupBy
 * WHY: one pass. For each item we either append to the existing group or create a new one.
 * Storing the array reference in the Map and pushing into it later is safe: it's our array.
 * Built-in equivalent: Map.groupBy(items, getKey).
 * Complexity: O(n) time and memory.
 */
export function groupBy<T, K>(items: T[], getKey: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/**
 * T5. commonItems
 * WHY: filter over `a` keeps a's order; setB.has makes the check O(1); the outer Set
 * removes duplicates that `a` may contain.
 * ⚠️ [...new Set(a).intersection(new Set(b))] has the right VALUES but the spec iterates
 * the SMALLER set, so here it would return [4, 2] instead of [2, 4].
 * Complexity: O(n + m) time and memory.
 */
export function commonItems<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return [...new Set(a.filter((x) => setB.has(x)))];
}

/**
 * T6. isAnagram
 * WHY: two strings are anagrams when every letter appears the same number of times.
 * Count letters of x, then "consume" them with y. A missing/exhausted letter → false.
 * Since lengths are equal, if nothing went negative, all counts end at exactly 0.
 * Alternative: sort letters of both and compare: O(n log n) but a one-liner:
 *   const sort = (s) => [...s].sort().join(''); return sort(x) === sort(y);
 * Complexity: O(n) time, O(k) memory (k = distinct letters).
 */
export function isAnagram(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replaceAll(' ', '');
  const x = normalize(a);
  const y = normalize(b);
  if (x.length !== y.length) return false;

  const counts = new Map<string, number>();
  for (const ch of x) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of y) {
    const left = counts.get(ch);
    if (!left) return false; // undefined (never seen) or 0 (already used up)
    counts.set(ch, left - 1);
  }
  return true;
}

/**
 * T7. twoSum
 * WHY: for the current n the partner is target - n. If we have SEEN the partner before,
 * its index is in the Map. We check before storing n, so an element never pairs with itself.
 * Brute force (two nested loops) is O(n²) — mention it, then give this O(n) version.
 * Complexity: O(n) time, O(n) memory.
 */
export function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // value → index
  for (const [i, n] of nums.entries()) {
    const j = seen.get(target - n);
    if (j !== undefined) return [j, i];
    seen.set(n, i);
  }
  return null;
}

/**
 * T8. uniqueBy
 * WHY: same "seen" Set idea as T2, applied inside filter. The first item for each key passes
 * (and registers the key); later items with the same key are rejected.
 * Alternative: new Map(items.map(x => [getKey(x), x])) keeps the LAST item per key, not the first.
 * Complexity: O(n) time and memory.
 */
export function uniqueBy<T, K>(items: T[], getKey: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * T9. mergeCounts
 * WHY: new Map(a) is a shallow copy of a (values are numbers, so shallow is enough).
 * We only write into the copy → a and b stay untouched.
 * Complexity: O(|a| + |b|) time and memory.
 */
export function mergeCounts(a: Map<string, number>, b: Map<string, number>): Map<string, number> {
  const result = new Map(a);
  for (const [key, count] of b) {
    result.set(key, (result.get(key) ?? 0) + count);
  }
  return result;
}

/**
 * T10. invert
 * WHY: spread → array of pairs → swap each pair → build a Map. If two keys share a value,
 * the last one wins (later set overwrites).
 * Complexity: O(n) time and memory.
 */
export function invert<K, V>(map: Map<K, V>): Map<V, K> {
  return new Map([...map].map(([k, v]) => [v, k]));
}

/**
 * T11. LRUCache
 * WHY: a Map iterates in insertion order. "Touching" a key = delete + set, which moves it
 * to the end. Therefore the FIRST key is always the least recently used one → evict it.
 * All operations are O(1). (In other languages you'd build this from a hash map + doubly
 * linked list; JS Map gives you both for free — great point to mention in an interview.)
 */
export class LRUCache<K, V> {
  private readonly store = new Map<K, V>();

  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    if (!this.store.has(key)) return undefined;
    const value = this.store.get(key)!;
    this.store.delete(key);
    this.store.set(key, value); // move to the end = most recently used
    return value;
  }

  put(key: K, value: V): void {
    this.store.delete(key); // so an update also counts as "recently used"
    this.store.set(key, value);
    if (this.store.size > this.capacity) {
      // First key = least recently used. `.next().value` is typed K | undefined (TS doesn't
      // know the map is non-empty); here size > capacity, so a first key always exists.
      const oldest = this.store.keys().next().value as K;
      this.store.delete(oldest);
    }
  }

  keys(): K[] {
    return [...this.store.keys()];
  }
}

/**
 * T12. longestUniqueRun (sliding window)
 * WHY: the window [start, i] never contains duplicates. When char at i was last seen at
 * `prev` INSIDE the window (prev >= start), we cut the window right after it.
 * The `prev >= start` check is crucial for cases like 'abba': at the last 'a', its previous
 * index 0 is already left of the window (start = 2), so we must NOT move start back.
 * Complexity: O(n) time, O(k) memory (k = alphabet size).
 */
export function longestUniqueRun(s: string): number {
  const lastIndex = new Map<string, number>();
  let start = 0;
  let best = 0;
  for (const [i, ch] of [...s].entries()) {
    const prev = lastIndex.get(ch);
    if (prev !== undefined && prev >= start) start = prev + 1;
    lastIndex.set(ch, i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}
