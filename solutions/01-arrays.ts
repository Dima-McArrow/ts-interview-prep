/**
 * SOLUTIONS 01 — ARRAYS (with detailed explanations)
 * Open only after you tried yourself :)
 *
 * Format for every task:
 *   - the solution
 *   - WHY it works (step by step)
 *   - alternatives and their trade-offs
 *   - complexity: time / extra memory (n = input length)
 */

// ===========================================================================
// PART 1 — QUIZ ANSWERS
// ===========================================================================
export const quiz = {
  // Q1: [2, 4, 6]
  // map calls the callback for each element and collects the results into a NEW
  // array of the SAME length. The original [1, 2, 3] is untouched.
  q1: [2, 4, 6],

  // Q2: [1, NaN, NaN]
  // map calls the callback with THREE arguments: (value, index, array).
  // parseInt takes (string, radix), so it receives the index as the radix:
  //   parseInt('1', 0) → 1    radix 0 means "auto" (decimal)
  //   parseInt('2', 1) → NaN  radix 1 does not exist (valid range is 2..36)
  //   parseInt('3', 2) → NaN  '3' is not a binary digit
  // Fix: .map(Number) or .map((s) => parseInt(s, 10)).
  q2: [1, NaN, NaN],

  // Q3: [1, 10, 100, 5]
  // Without a comparator, sort converts elements to STRINGS and compares them
  // character by character (like words in a dictionary):
  //   '1' < '10' < '100' < '5'   because '1' < '5' at the first character.
  // Fix for numbers: .sort((a, b) => a - b).
  q3: [1, 10, 100, 5],

  // Q4: 4
  // push returns the NEW LENGTH of the array, not the array itself.
  // Classic bug: const updated = arr.push(x); → updated is a number.
  q4: 4,

  // Q5: removed = [2, 3], arr = [1, 4, 5]
  // splice(start, deleteCount) removes `deleteCount` items starting at `start`,
  // MUTATES the array, and RETURNS the removed items as an array.
  // Compare: slice(1, 3) would return [2, 3] too but leave arr untouched.
  q5a: [2, 3],
  q5b: [1, 4, 5],

  // Q6: true
  // "Vacuous truth": every asks "is there an element that FAILS the check?".
  // An empty array has no elements, so nothing fails → true.
  // (some on [] → false: there is no element that passes.)
  q6: true,

  // Q7: includes → true, indexOf → -1
  // NaN is the only value not equal to itself: NaN === NaN is false.
  // indexOf compares with === → never finds NaN → -1.
  // includes uses the SameValueZero algorithm, where NaN equals NaN → true.
  q7a: true,
  q7b: -1,

  // Q8: [1, 2, [3, [4]]]
  // flat() has default depth 1: it opens only ONE level of nesting.
  // [2, [3, [4]]] is opened → 2 and [3, [4]] become top-level items.
  q8: [1, 2, [3, [4]]],

  // Q9: '123'
  // initialValue is '' (a string), so acc is a string and + concatenates:
  //   '' + 1 = '1' → '1' + 2 = '12' → '12' + 3 = '123'
  q9: '123',

  // Q10: 99
  // slice() makes a SHALLOW copy: a new array, but the SAME object inside.
  // b[0] and a[0] point to one object, so changing it through b is visible via a.
  q10: 99,

  // Q11: [['x'], ['x']]
  // fill([]) evaluates [] ONCE and puts that SAME array reference in every slot.
  // Pushing into grid[0] pushes into the only array, visible from both slots.
  // Fix: Array.from({ length: 2 }, () => []) creates a new [] per slot.
  q11: [['x'], ['x']],

  // Q12: undefined
  // forEach ALWAYS returns undefined; the callback's return values are discarded.
  q12: undefined,

  // Q13: at(-1) → 3, slice(-2) → [2, 3]
  // Negative indexes count from the end: -1 is the last, -2 the second to last.
  // at returns one element; slice(-2) returns a copy from index length-2 to the end.
  q13a: 3,
  q13b: [2, 3],

  // Q14: sorted = [1, 2, 3], nums = [3, 1, 2]
  // toSorted (ES2023) returns a NEW sorted array and does NOT mutate the original.
  q14a: [1, 2, 3],
  q14b: [3, 1, 2],

  // Q15: find → undefined, findIndex → -1
  // Different "not found" markers: find returns an ELEMENT (none → undefined),
  // findIndex returns an INDEX (none → -1, because undefined is not a number).
  q15a: undefined,
  q15b: -1,

  // Q16: [2, 2, 4, 4]
  // flatMap = map + flat(1). Odd numbers return [] → disappear.
  // Even numbers return [n, n] → both items are "poured" into the result.
  q16: [2, 2, 4, 4],

  // Q17: [3, 2, 1]
  // The callback gets (value, index, array). arr.length is 3:
  //   i=0 → 3-0=3, i=1 → 3-1=2, i=2 → 3-2=1. The `ch` value is not even used.
  q17: [3, 2, 1],

  // Q18: false, [1, 2, 3]
  // Arrays are OBJECTS, and === compares objects by REFERENCE (address in memory).
  //   q18a: each [1, 2] literal creates a new array at a new address → false,
  //         even though the contents are identical.
  //   q18b: `const b = a` copies the ADDRESS, not the array. a and b are two names
  //         for ONE array, so b.push(3) is visible through a.
  q18a: false,
  q18b: [1, 2, 3],
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. doubleEvens
 * WHY: filter keeps items where n % 2 === 0; map doubles the survivors.
 * ORDER MATTERS: map first would double everything, and every doubled number is even,
 * so the filter would keep them all.
 * Alternative: flatMap((n) => (n % 2 === 0 ? [n * 2] : [])) — one pass, less readable.
 * Complexity: O(n) time, O(n) memory.
 */
export function doubleEvens(nums: number[]): number[] {
  return nums.filter((n) => n % 2 === 0).map((n) => n * 2);
}

/**
 * T2. sumBy
 * WHY: reduce folds the array into one number. initialValue 0 is the "sum of nothing",
 * so sumBy([]) correctly returns 0 instead of throwing.
 * Alternative: for...of with a `let total = 0` — equally good.
 * Complexity: O(n) time, O(1) memory.
 */
export function sumBy<T>(items: T[], getValue: (item: T) => number): number {
  return items.reduce((acc, item) => acc + getValue(item), 0);
}

/**
 * T3. countWords
 * WHY: we start with an empty object. For each word:
 *   acc[word] ?? 0  → current count, or 0 if this is the first time
 *   + 1             → count this occurrence
 * and we must `return acc`, otherwise the next iteration gets undefined.
 * Mutating `acc` here is fine: it's OUR object created by initialValue, not the input.
 * Alternative: a Map (module 02) — better if words can be "__proto__" or "constructor".
 * Complexity: O(n) time, O(k) memory (k = unique words).
 */
export function countWords(words: string[]): Record<string, number> {
  return words.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});
}

/**
 * T4. uniq
 * WHY: a Set keeps only unique values (by SameValueZero) and remembers insertion
 * order, so the first occurrence of each value wins. Spread turns it back into an array.
 * Alternative: arr.filter((x, i) => arr.indexOf(x) === i)
 *   → keeps x only at the position of its FIRST occurrence.
 *   → but indexOf is O(n) inside a loop → O(n²) total. Fine for 10 items, bad for 100k.
 * Complexity (Set version): O(n) time, O(n) memory.
 */
export function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * T5. chunk
 * WHY:
 *   1. Number of chunks = Math.ceil(length / size): 5 items by 2 → 3 chunks.
 *   2. Chunk i covers indexes [i * size, i * size + size).
 *   3. slice handles the last short chunk: slice(4, 6) on length 5 just returns [5].
 * Edge case: [] → Math.ceil(0 / 3) = 0 chunks → [].
 * Alternative: a for loop with `i += size` and push(arr.slice(i, i + size)).
 * Complexity: O(n) time, O(n) memory.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

/**
 * T6. partition
 * WHY: one pass; each item goes into exactly one of the two NEW arrays.
 * Pushing into our own result arrays is not "mutating the input".
 * Alternatives:
 *   - [arr.filter(p), arr.filter((x) => !p(x))] — shortest, but 2 passes and p runs twice.
 *   - reduce with [[], []] — works, but with spread it copies on every step (O(n²)).
 * Complexity: O(n) time, O(n) memory.
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const passed: T[] = [];
  const failed: T[] = [];
  for (const item of arr) {
    (predicate(item) ? passed : failed).push(item);
  }
  return [passed, failed];
}

export type Person = { name: string; age: number };

/**
 * T7. sortPeople
 * WHY:
 *   - toSorted returns a new array (the input stays as is — the test checks this).
 *   - a.age - b.age < 0 when a is younger → younger first.
 *   - When ages are equal the difference is 0, which is falsy, so `||` evaluates
 *     the tie-breaker: localeCompare for names.
 * Alternative for older runtimes: [...people].sort(sameComparator).
 * Complexity: O(n log n) time, O(n) memory.
 */
export function sortPeople(people: Person[]): Person[] {
  return people.toSorted((a, b) => a.age - b.age || a.name.localeCompare(b.name));
}

/**
 * T8. topNames
 * WHY: a 3-step pipeline:
 *   toSorted(b - a) → highest score first, input untouched
 *   slice(0, n)     → first n; if n > length, slice just returns everything
 *   map(name)       → only names
 * Complexity: O(n log n) because of sorting. (For huge n with tiny "top k" a heap is
 * O(n log k) — worth mentioning in an interview, not worth writing.)
 */
export function topNames(players: { name: string; score: number }[], n: number): string[] {
  return players
    .toSorted((a, b) => b.score - a.score)
    .slice(0, n)
    .map((p) => p.name);
}

/**
 * T9. zip
 * WHY: the result can't be longer than the shorter array, so length = Math.min(...).
 * Array.from builds `length` pairs; pair i is [a[i], b[i]].
 * The `!` is a TS non-null assertion: index access is typed as possibly undefined
 * only with noUncheckedIndexedAccess; here it documents that i < length is safe.
 * Complexity: O(min(n, m)) time and memory.
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const length = Math.min(a.length, b.length);
  return Array.from({ length }, (_, i) => [a[i]!, b[i]!]);
}

/**
 * T10. range
 * WHY:
 *   count = ceil((end - start) / step): range(2, 10, 3) → ceil(8 / 3) = 3 → [2, 5, 8].
 *   Math.max(0, ...) protects from a negative length (range(5, 0) → []).
 *   The i-th value is start + i * step.
 * Complexity: O(count) time and memory.
 */
export function range(start: number, end: number, step = 1): number[] {
  const length = Math.max(0, Math.ceil((end - start) / step));
  return Array.from({ length }, (_, i) => start + i * step);
}

/**
 * T11. removeAt
 * WHY: toSpliced is the immutable version of splice: same arguments, returns a NEW array.
 * Alternatives (all fine):
 *   [...arr.slice(0, index), ...arr.slice(index + 1)]  — works everywhere
 *   arr.filter((_, i) => i !== index)                  — very readable
 * Complexity: O(n) time and memory for all three.
 */
export function removeAt<T>(arr: T[], index: number): T[] {
  return arr.toSpliced(index, 1);
}

/**
 * T12. isSortedAsc
 * WHY: "sorted" = every element is >= its previous neighbour.
 *   every gives us (n, i, arr) → we compare n with arr[i - 1].
 *   i === 0 has no previous element → automatically OK.
 *   every stops at the first violation → efficient.
 *   Empty array → every returns true (vacuous truth), which is what we want.
 * Complexity: O(n) time, O(1) memory.
 */
export function isSortedAsc(nums: number[]): boolean {
  return nums.every((n, i, arr) => i === 0 || arr[i - 1]! <= n);
}

/**
 * T13. flattenDeep (without .flat)
 * WHY: recursion.
 *   - Base case: a non-array element is added as is.
 *   - Recursive case: an array element is flattened by the SAME function first,
 *     then its items are added.
 *   The recursion ends because nesting depth is finite.
 * Note: [...acc, ...x] copies acc on every step (O(n²) worst case). A faster version
 * pushes into one result array:
 *   const out: T[] = [];
 *   const walk = (a: Nested<T>) => a.forEach((x) => (Array.isArray(x) ? walk(x) : out.push(x)));
 *   walk(arr); return out;
 * Complexity (push version): O(total items) time and memory.
 */
export type Nested<T> = (T | Nested<T>)[];
export function flattenDeep<T>(arr: Nested<T>): T[] {
  return arr.reduce<T[]>(
    (acc, item) => (Array.isArray(item) ? [...acc, ...flattenDeep(item)] : [...acc, item]),
    [],
  );
}

/**
 * T14. activeAdultNames
 * WHY: read the requirement as a pipeline:
 *   filter (active AND adult — ONE filter with &&) → map (uppercase name) → join(', ').
 * join on an empty array returns '' — no special case needed.
 * Complexity: O(n) time and memory.
 */
export function activeAdultNames(users: { name: string; age: number; active: boolean }[]): string {
  return users
    .filter((u) => u.active && u.age >= 18)
    .map((u) => u.name.toUpperCase())
    .join(', ');
}
