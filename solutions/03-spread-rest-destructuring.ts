/**
 * SOLUTIONS 03 — SPREAD, REST, DESTRUCTURING (with detailed explanations)
 * Open only after you tried yourself :)
 *
 * Format for every task: solution → WHY it works → alternatives → complexity.
 */

// ===========================================================================
// PART 1 — QUIZ ANSWERS
// ===========================================================================
export const quiz = {
  // Q1: [1, 3]
  // Array destructuring is by POSITION: a = index 0, the empty slot skips index 1,
  // b = index 2.
  q1: [1, 3],

  // Q2: []
  // x takes 1; nothing is left, so rest collects an EMPTY array (never undefined).
  q2: [],

  // Q3: null
  // Defaults trigger only when the value is `undefined`. null is a real value.
  // If null must also fall back, use `obj.a ?? 5` instead of a destructuring default.
  q3: null,

  // Q4: 5
  // The value is undefined → the default is used.
  q4: 5,

  // Q5: { x: 10, y: 20 }
  // Spread applies left to right; later keys overwrite earlier ones:
  //   { x: 1, y: 2 } → x: 10 → y: 20.
  q5: { x: 10, y: 20 },

  // Q6: [[1, 9], [2]]
  // [...arr] creates a new OUTER array, but the inner arrays are the same references.
  // Pushing into copy[0] pushes into arr[0].
  q6: [[1, 9], [2]],

  // Q7: -Infinity
  // Math.max(...[]) is Math.max() with no arguments. -Infinity is the identity for max:
  // any real number is bigger than it.
  q7: -Infinity,

  // Q8: 5
  // Destructuring a primitive works on its wrapper object: 'hello'.length → 5.
  q8: 5,

  // Q9: 'x'
  // Array destructuring uses the iterator, so it works with a Set (in insertion order).
  q9: 'x',

  // Q10: 3
  // Call site: f(...[1, 2], 3) = f(1, 2, 3) (spread). Definition: ...args collects them (rest).
  q10: 3,

  // Q11: [2, 1]
  // The right side builds a temporary array [2, 1], which is destructured back into a, b.
  q11: [2, 1],

  // Q12: true
  // Object rest creates a NEW outer object, but nested values are copied by reference.
  q12: true,

  // Q13: [1, 2]
  // Both values are missing → defaults. They are evaluated LEFT TO RIGHT, so b's default
  // can use a: b = a * 2 = 2.
  q13: [1, 2],

  // Q14: g() → 2, g({}) → 1
  // g(): no argument → the PARAMETER default { x: 2 } is used → x = 2.
  // g({}): an argument exists, so the parameter default is skipped; but x is missing
  //        in it → the PROPERTY default 1 is used.
  q14a: 2,
  q14b: 1,

  // Q15: ['a', 3]
  // An array is an object with keys '0', '1', '2' and a `length` property.
  // { 0: first } reads key 0, { length } reads the length.
  q15: ['a', 3],

  // Q16: ['0', '1']
  // Spreading an array into an OBJECT copies its index keys: { 0: 10, 1: 20 }.
  q16: ['0', '1'],
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. sumAll
 * WHY: the rest parameter gives a real array ([] when called with no args).
 * reduce with initialValue 0 handles the empty case.
 * Complexity: O(n).
 */
export function sumAll(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}

/**
 * T2. omit
 * WHY: { ...obj } is a fresh shallow copy, so deleting keys from it doesn't affect obj.
 * Alternative (no delete):
 *   Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k as K)))
 *   — but keys.includes inside filter is O(n·k); fine for small key lists.
 * Note: destructuring `const { a, ...rest } = obj` only works when keys are known
 * at write time; here they come at runtime.
 * Complexity: O(n + k).
 */
export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const copy = { ...obj };
  for (const key of keys) delete copy[key];
  return copy;
}

/**
 * T3. pick
 * WHY: we copy only the requested keys, and only if they exist (`key in obj`), so missing
 * keys don't show up as `key: undefined` (toStrictEqual in the test would catch that).
 * Complexity: O(k).
 */
export function pick<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  // Starts empty and is filled key by key below. TS can't follow that, so we state the final
  // type up front; it's safe because only keys from K are ever written.
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export type User = { id: number; name: string; password: string; token: string };

/**
 * T4. toPublicUser
 * WHY: naming `password` and `token` in the pattern pulls them OUT; `...publicUser`
 * collects everything else into a NEW object. The input is untouched.
 * (Linters may warn about unused `password`/`token` — that's the intended "drop".)
 */
export function toPublicUser(user: User): Omit<User, 'password' | 'token'> {
  const { password, token, ...publicUser } = user;
  void password;
  void token;
  return publicUser;
}

/**
 * T5. withDefaults
 * WHY: spread treats `undefined` as a real value and would overwrite defaults.
 * So we drop undefined entries first, then merge with overrides on the RIGHT.
 * We compare with `!== undefined` (not truthiness) so 0, '' and false still override.
 * Complexity: O(n).
 */
export function withDefaults<T extends object>(defaults: T, overrides: Partial<T>): T {
  const defined = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined),
  );
  return { ...defaults, ...defined };
}

export type Profile = {
  name: string;
  address: { city: string; zip: string };
  settings: { theme: string };
};

/**
 * T6. setCity (structural sharing)
 * WHY: we create new objects ONLY on the path to the change (profile → address).
 *   - new outer object  → profile !== result (React sees a change)
 *   - new address       → address !== result.address
 *   - settings reused   → same reference (components depending on settings don't re-render)
 * This is exactly what Redux Toolkit / Immer produce for you.
 */
export function setCity(profile: Profile, city: string): Profile {
  return { ...profile, address: { ...profile.address, city } };
}

/**
 * T7. swapEnds
 * WHY: `rest` from destructuring is a NEW array, so pop() on it doesn't touch the input.
 * Alternative without mutation at all:
 *   [arr.at(-1)!, ...arr.slice(1, -1), arr[0]!]
 * Complexity: O(n).
 */
export function swapEnds<T>(arr: T[]): T[] {
  if (arr.length < 2) return [...arr];
  const [first, ...middleAndLast] = arr;
  const last = middleAndLast.pop()!;
  return [last, ...middleAndLast, first!];
}

/**
 * T8. parseCoords
 * WHY: split → strings, map(Number) → numbers, destructure by position.
 * The `= NaN` defaults keep the types honest if the input has fewer parts.
 * Complexity: O(length of input).
 */
export function parseCoords(input: string): { lat: number; lng: number } {
  const [lat = NaN, lng = NaN] = input.split(',').map(Number);
  return { lat, lng };
}

/**
 * T9. fullName
 * WHY: parameter destructuring with a default for the optional field.
 * filter(Boolean) drops the empty middle name so we never get double spaces.
 */
export function fullName({
  first,
  middle = '',
  last,
}: {
  first: string;
  last: string;
  middle?: string;
}): string {
  return [first, middle, last].filter(Boolean).join(' ');
}

/**
 * T10. updateById
 * WHY: map keeps the length; the matching item becomes a NEW object (spread + patch),
 * all other items are returned AS IS (same reference). That's the key to cheap
 * re-render checks: unchanged rows keep their identity.
 * Complexity: O(n).
 */
export function updateById<T extends { id: number }>(
  list: T[],
  id: number,
  patch: Partial<T>,
): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

/**
 * T11. compose
 * WHY: rest collects any number of functions; the returned closure remembers them.
 * reduceRight starts from the LAST function: compose(f, g)(x) = f(g(x)).
 * With zero functions, reduceRight returns the initial value → identity function.
 * Related: pipe = same thing left-to-right (reduce instead of reduceRight).
 */
export function compose<T>(...fns: ((x: T) => T)[]): (x: T) => T {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}

/**
 * T12. renameKeys
 * WHY: entries → map each pair to [newKey, value] → fromEntries.
 * `mapping[key] ?? key` keeps the original name when there's no mapping.
 * Complexity: O(n).
 */
export function renameKeys(
  obj: Record<string, unknown>,
  mapping: Record<string, string>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [mapping[key] ?? key, value]),
  );
}
