/**
 * EXERCISES 03 — SPREAD, REST, DESTRUCTURING
 * Watch mode: npm run test:watch -- 03-spread
 *
 * PART 1 — QUIZ: replace each TODO with the exact value the snippet produces.
 *   Each question has a "Concept" line: which idea it checks + the lesson section.
 * PART 2 — TASKS: replace `return todo();` with your implementation.
 *   Each task has a "How to think" block: a step-by-step plan WITHOUT the code.
 *
 * Detailed explanations of every answer: solutions/03-spread-rest-destructuring.ts
 */
import { TODO, todo } from '../_utils/todo';

// ===========================================================================
// PART 1 — QUIZ: "What is the result?"
// ===========================================================================
export const quiz = {
  // Q1.  const [a, , b] = [1, 2, 3];
  //      [a, b] → ?
  // Concept: array destructuring by position, skipping with an empty slot (lesson §5).
  q1: TODO,

  // Q2.  const [x, ...rest] = [1];
  //      rest → ?
  // Concept: rest in destructuring always gives an array (lesson §5).
  q2: TODO,

  // Q3.  const { a = 5 } = { a: null };
  //      a → ?
  // Concept: defaults trigger ONLY for undefined (lesson §6).
  q3: TODO,

  // Q4.  const { a = 5 } = { a: undefined };
  //      a → ?
  // Concept: defaults trigger ONLY for undefined (lesson §6).
  q4: TODO,

  // Q5.  const o = { x: 1, y: 2 };
  //      const r = { ...o, x: 10, ...{ y: 20 } };
  //      r → ?
  // Concept: in object spread the LAST key wins (lesson §3).
  q5: TODO,

  // Q6.  const arr = [[1], [2]];
  //      const copy = [...arr];
  //      copy[0].push(9);
  //      arr → ?
  // Concept: array spread is a SHALLOW copy (lesson §2).
  q6: TODO,

  // Q7.  Math.max(...[])
  // Concept: Math.max with no arguments (lesson §2).
  q7: TODO,

  // Q8.  const { length } = 'hello';
  //      length → ?
  // Concept: destructuring a primitive uses its wrapper object (lesson §6).
  q8: TODO,

  // Q9.  const [first] = new Set(['x', 'y']);
  //      first → ?
  // Concept: array destructuring works with ANY iterable (lesson §5).
  q9: TODO,

  // Q10. function f(...args) { return args.length; }
  //      f(...[1, 2], 3) → ?
  // Concept: spread at the call site + rest in the definition (lesson §1, §4).
  q10: TODO,

  // Q11. let a = 1, b = 2;
  //      [a, b] = [b, a];
  //      [a, b] → ?
  // Concept: swap via destructuring (lesson §5).
  q11: TODO,

  // Q12. const original = { x: 1, nested: { y: 2 } };
  //      const { ...copy } = original;
  //      copy.nested === original.nested → ?
  // Concept: object rest is a SHALLOW copy (lesson §3, §6).
  q12: TODO,

  // Q13. const [a = 1, b = a * 2] = [];
  //      [a, b] → ?
  // Concept: defaults are evaluated left to right and may use earlier variables (lesson §5).
  q13: TODO,

  // Q14. function g({ x = 1 } = { x: 2 }) { return x; }
  //      q14a: g() → ?     q14b: g({}) → ?
  // Concept: parameter default vs property default (lesson §7).
  q14a: TODO,
  q14b: TODO,

  // Q15. const { 0: first, length } = ['a', 'b', 'c'];
  //      [first, length] → ?
  // Concept: an array is an object — index keys and length (lesson §6).
  q15: TODO,

  // Q16. Object.keys({ ...[10, 20] })
  // Concept: spreading an array into an OBJECT (lesson §3).
  q16: TODO,
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. Sum any number of arguments (rest parameter).
 * sumAll() → 0;  sumAll(1, 2, 3) → 6
 *
 * How to think:
 *  1. `...nums` already gives you a real array of all arguments ([] when there are none).
 *  2. Many numbers → one number: reduce with initialValue 0.
 */
export function sumAll(...nums: number[]): number {
  return todo();
}

/**
 * T2. Return a NEW object without the given keys.
 * omit({ a: 1, b: 2, c: 3 }, 'a', 'c') → { b: 2 }
 *
 * How to think (two ways):
 *  A. Make a shallow copy with spread, then `delete copy[key]` for each key.
 *     Deleting from YOUR copy is fine — the input stays untouched.
 *  B. Object.entries(obj) → filter out pairs whose key is in `keys` → Object.fromEntries.
 *  Note: we can't use destructuring `const { a, ...rest }` here because the keys are
 *  only known at runtime.
 */
export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  return todo();
}

/**
 * T3. Return a NEW object with only the given keys (missing keys are skipped).
 * pick({ a: 1, b: 2, c: 3 }, 'a', 'c') → { a: 1, c: 3 }
 *
 * How to think:
 *  1. Start with an empty result object.
 *  2. For each requested key: copy obj[key] into the result ONLY if the key exists
 *     (`key in obj`) — the test checks that missing keys don't appear as undefined.
 *  TS tip: `const result = {} as Pick<T, K>` lets you assign result[key] = obj[key].
 */
export function pick<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  return todo();
}

/**
 * T4. Remove sensitive fields from a user with ONE destructuring statement.
 * toPublicUser({ id: 1, name: 'Ann', password: 'x', token: 'y' }) → { id: 1, name: 'Ann' }
 *
 * How to think:
 *  1. Object destructuring with rest: name the fields you want to DROP,
 *     collect everything else with `...publicUser`.
 *  2. Return the rest object. (The dropped variables are intentionally unused.)
 */
export type User = { id: number; name: string; password: string; token: string };
export function toPublicUser(user: User): Omit<User, 'password' | 'token'> {
  return todo();
}

/**
 * T5. Merge defaults with overrides, but IGNORE overrides that are `undefined`.
 * Plain `{ ...defaults, ...overrides }` would replace port: 80 with port: undefined!
 * withDefaults({ host: 'localhost', port: 80 }, { port: undefined, host: 'api' })
 *   → { host: 'api', port: 80 }
 *
 * How to think:
 *  1. The problem: `undefined` is a real value for spread — it overwrites.
 *  2. So first remove undefined entries from overrides:
 *     Object.entries(overrides) → filter(([, v]) => v !== undefined) → Object.fromEntries.
 *  3. Then the usual merge: { ...defaults, ...cleanedOverrides } (overrides go RIGHT).
 *  4. Careful: 0, '' and false are valid overrides — only undefined is skipped.
 */
export function withDefaults<T extends object>(defaults: T, overrides: Partial<T>): T {
  return todo();
}

/**
 * T6. Immutably update a nested field: return a new profile where address.city = city.
 * Requirements (checked by tests):
 *  - the original is untouched;
 *  - unchanged branches keep the SAME reference (profile.settings);
 *  - changed branches are NEW objects (profile.address).
 */
// How to think:
//  1. Which objects are on the path to the change? profile → address. Both must be NEW.
//  2. Everything else (name, settings) is reused as is — spread copies those references.
//  3. One expression: { ...profile, address: { ...profile.address, city } }.
export type Profile = {
  name: string;
  address: { city: string; zip: string };
  settings: { theme: string };
};
export function setCity(profile: Profile, city: string): Profile {
  return todo();
}

/**
 * T7. Swap first and last elements → NEW array. Use destructuring.
 * swapEnds([1, 2, 3, 4]) → [4, 2, 3, 1];  swapEnds([1]) → [1];  swapEnds([]) → []
 *
 * How to think:
 *  1. Edge cases first: length < 2 → return a copy ([...arr]).
 *  2. Destructure: const [first, ...rest] = arr. Now the last element is the end of `rest`.
 *  3. Take the last from rest (rest.pop() is fine — `rest` is a NEW array, not the input),
 *     then build [last, ...middle, first].
 *  Alternative without pop: arr.at(-1), arr.slice(1, -1).
 */
export function swapEnds<T>(arr: T[]): T[] {
  return todo();
}

/**
 * T8. Parse "lat,lng" into numbers with array destructuring.
 * parseCoords('48.85,2.35') → { lat: 48.85, lng: 2.35 }
 *
 * How to think:
 *  1. split(',') → ['48.85', '2.35'] (strings!).
 *  2. map(Number) → [48.85, 2.35]. (Not map(parseFloat)? It works too, but remember the
 *     map(parseInt) trap from lesson 01 — Number is the safe habit.)
 *  3. Destructure into [lat, lng] and return { lat, lng } (shorthand properties).
 */
export function parseCoords(input: string): { lat: number; lng: number } {
  return todo();
}

/**
 * T9. Format a full name. Use parameter destructuring with a default for `middle`.
 * fullName({ first: 'John', last: 'Doe' }) → 'John Doe'
 * fullName({ first: 'John', middle: 'R.', last: 'Doe' }) → 'John R. Doe'
 *
 * How to think:
 *  1. Destructure right in the parameter list: ({ first, middle = '', last }: ...).
 *  2. Build [first, middle, last], drop empty parts (filter(Boolean)), join(' ').
 *     This avoids a double space when there is no middle name.
 */
export function fullName(person: { first: string; last: string; middle?: string }): string {
  return todo();
}

/**
 * T10. React-style immutable list update: patch the item with the given id.
 * Other items must keep their SAME reference; the input array must not be mutated.
 * updateById([{id:1,done:false},{id:2,done:false}], 2, { done: true })
 *   → [{id:1,done:false},{id:2,done:true}]
 *
 * How to think:
 *  1. "Same length, one item changed" → map.
 *  2. For the matching id return a NEW object { ...item, ...patch }.
 *  3. For all others return the SAME item (not a copy!) — the test checks reference equality.
 *     That's what makes React.memo skip re-rendering unchanged rows.
 */
export function updateById<T extends { id: number }>(
  list: T[],
  id: number,
  patch: Partial<T>,
): T[] {
  return todo();
}

/**
 * T11. Compose functions right-to-left (rest params + reduceRight).
 * compose(add1, double)(5) → add1(double(5)) → 11
 * compose()(5) → 5
 *
 * How to think:
 *  1. compose returns a NEW function x => ... (a closure over fns).
 *  2. Right-to-left: the LAST function is applied first. reduceRight walks from the end.
 *  3. reduceRight((acc, fn) => fn(acc), x): acc starts as x and passes through each fn.
 *  4. No functions → reduceRight returns the initial x → identity. ✅
 */
export function compose<T>(...fns: ((x: T) => T)[]): (x: T) => T {
  return todo();
}

/**
 * T12. Rename keys according to a mapping; keys not in the mapping stay as is.
 * renameKeys({ a: 1, b: 2 }, { a: 'alpha' }) → { alpha: 1, b: 2 }
 *
 * How to think:
 *  1. Object → pairs (Object.entries) → transform pairs → object (Object.fromEntries).
 *  2. For each [key, value]: the new key is mapping[key] if it exists, otherwise key (use ??).
 */
export function renameKeys(
  obj: Record<string, unknown>,
  mapping: Record<string, string>,
): Record<string, unknown> {
  return todo();
}
