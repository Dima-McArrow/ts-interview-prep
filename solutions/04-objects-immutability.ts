/**
 * SOLUTIONS 04 — OBJECTS & IMMUTABILITY (with detailed explanations)
 * Open only after you tried yourself :)
 *
 * Format for every task: solution → WHY it works → alternatives → complexity.
 */

// ===========================================================================
// PART 1 — QUIZ ANSWERS
// ===========================================================================
export const quiz = {
  // Q1: ['2', '10', 'b', 'a']
  // Integer-like keys come first in ascending NUMERIC order (2 < 10), then string keys
  // in insertion order (b, a). All keys are strings.
  q1: ['2', '10', 'b', 'a'],

  // Q2: 2
  // { ...a } copies only the top level. b.n and a.n are the same object.
  q2: 2,

  // Q3: { n: null }
  // JSON drops undefined values and functions entirely, and turns NaN into null.
  q3: { n: null },

  // Q4: '||' → 'default', '??' → 0
  // || falls back on ANY falsy value (0 is falsy). ?? only on null/undefined.
  q4a: 'default',
  q4b: 0,

  // Q5: ''
  // '' is falsy but NOT null/undefined, so ?? keeps it.
  q5: '',

  // Q6: undefined
  // user.profile is undefined → ?. stops the chain and returns undefined (no TypeError).
  q6: undefined,

  // Q7: ['a1', 'b2']
  // entries → [['a', 1], ['b', 2]]; k + v concatenates the key string with the number.
  q7: ['a1', 'b2'],

  // Q8: { a: 2 }
  // fromEntries assigns pairs in order; the later 'a' overwrites the earlier one.
  q8: { a: 2 },

  // Q9: [1, 2]
  // freeze is shallow: the object can't get a new `list`, but the array itself is not frozen.
  q9: [1, 2],

  // Q10: Object.is(NaN, NaN) → true, Object.is(0, -0) → false
  // The two places where Object.is differs from ===. React compares state with Object.is.
  q10a: true,
  q10b: false,

  // Q11: true
  // Object.assign mutates its FIRST argument and returns that same object.
  q11: true,

  // Q12: false
  // toSorted always returns a new array (even if it's already sorted).
  q12: false,

  // Q13: [1, 99, 3]
  // with(index, value) returns a copy with one element replaced; the original stays.
  q13: [1, 99, 3],

  // Q14: structuredClone → 'object' (a real Date), JSON → 'string' (ISO date string)
  q14a: 'object',
  q14b: 'string',

  // Q15: { odd: [1, 3], even: [2, 4] }
  // Keys appear in the order groups are first created: 1 is odd → 'odd' first.
  q15: { odd: [1, 3], even: [2, 4] },

  // Q16: ||= → 5, ??= → 0
  // ||= assigns because 0 is falsy; ??= doesn't because 0 is not null/undefined.
  q16a: 5,
  q16b: 0,
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. mapValues
 * WHY: entries → map pairs (same key, transformed value) → fromEntries.
 * Complexity: O(n).
 */
export function mapValues<V, R>(obj: Record<string, V>, fn: (value: V) => R): Record<string, R> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)]));
}

/**
 * T2. filterObject
 * WHY: same pattern with filter. Note the argument swap: entries give [key, value],
 * the predicate expects (value, key).
 * Complexity: O(n).
 */
export function filterObject<V>(
  obj: Record<string, V>,
  predicate: (value: V, key: string) => boolean,
): Record<string, V> {
  return Object.fromEntries(Object.entries(obj).filter(([key, value]) => predicate(value, key)));
}

export type Member = { name: string; role: 'admin' | 'dev' | 'qa' };

/**
 * T3. namesByRole
 * WHY: groupBy gives { role: Member[] }; mapValues turns each Member[] into string[].
 * Reusing small generic helpers (mapValues) is exactly what interviewers like to see.
 * Alternative: a single reduce building { [role]: names[] } directly.
 * Complexity: O(n).
 */
export function namesByRole(members: Member[]): Partial<Record<Member['role'], string[]>> {
  const groups = Object.groupBy(members, (m) => m.role);
  // groupBy's TS type is Partial<Record<K, T[]>>; every present key has an array.
  return mapValues(groups as Record<string, Member[]>, (list) => list.map((m) => m.name));
}

/**
 * T4. deepClone
 * WHY: one recursive branch per type. Special objects (Date, Map, Set, Array) are checked
 * BEFORE the generic "plain object" branch, because they are all `typeof 'object'`.
 * Map keys are cloned too (they can be objects).
 * Limitations (fine for this task): no cycles, class instances become plain objects.
 * In production: structuredClone(value).
 * Complexity: O(total number of nested values).
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value; // primitives & functions
  // `as T` below: TS can't link a runtime check (value instanceof Date) back to the generic T,
  // so it doesn't know a new Date IS a T. Each branch returns the same kind it received.
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (value instanceof Map) {
    return new Map([...value].map(([k, v]) => [deepClone(k), deepClone(v)])) as T;
  }
  if (value instanceof Set) return new Set([...value].map(deepClone)) as T;
  if (Array.isArray(value)) return value.map(deepClone) as T;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepClone(v)])) as T;
}

/**
 * T5. deepEqual
 * WHY, step by step:
 *   1. Object.is covers identical primitives, the same reference, and NaN === NaN.
 *   2. If either side isn't an object (or is null), they're different values.
 *   3. Array vs non-array → different shapes.
 *   4. Different number of own keys → different (catches { a: 1 } vs { a: 1, b: undefined }).
 *   5. Every key of a exists in b and the values are deepEqual (recursion).
 * Key ORDER doesn't matter because we look keys up by name.
 * Complexity: O(total number of nested values).
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  // The checks above proved both are non-null objects, but type `object` can't be indexed by
  // a string key. Record<string, unknown> lets us READ fields as unknown — safe, we only read.
  const recA = a as Record<string, unknown>;
  const recB = b as Record<string, unknown>;
  return keysA.every((key) => Object.hasOwn(recB, key) && deepEqual(recA[key], recB[key]));
}

/**
 * T6. deepFreeze
 * WHY: Object.freeze is shallow, so we recurse into every value. The isFrozen check
 * avoids infinite recursion on cycles and skips work on already-frozen parts.
 * Complexity: O(total number of nested values).
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj !== null && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const value of Object.values(obj)) deepFreeze(value);
  }
  return obj;
}

/**
 * T7. getIn
 * WHY: reduce walks the path; `?.[key]` turns "missing level" into undefined instead of a
 * TypeError. The final `??` falls back only on null/undefined, so 0 / '' / false survive
 * (with `||`, getIn({ a: { b: 0 } }, 'a.b', 5) would wrongly return 5).
 * Complexity: O(path length).
 */
export function getIn(obj: unknown, path: string, fallback?: unknown): unknown {
  // `current` is unknown at every level; the cast lets us index it, and ?. turns a missing
  // (null/undefined) level into undefined. Primitives are read like objects: a string level
  // has `length`, a number level has no `b` → undefined.
  const result = path
    .split('.')
    .reduce<unknown>((current, key) => (current as Record<string, unknown> | null)?.[key], obj);
  return result ?? fallback;
}

/**
 * T8. setIn (structural sharing by hand)
 * WHY: recursion along the path. At each level we spread the current object (copying
 * all OTHER keys by reference) and replace only the key on the path.
 *   - untouched branches (x) keep their identity → cheap === checks in React/Redux
 *   - `?? {}` creates missing intermediate objects
 * This is the core idea behind Immer and Redux Toolkit.
 * Complexity: O(path length) new objects.
 */
export function setIn<T extends object>(obj: T, path: string[], value: unknown): T {
  const [key, ...rest] = path;
  // The path is a runtime string[], so TS can't check what lives at the end of it:
  // `value as T` is the price of string paths (lodash.set has the same trade-off).
  if (key === undefined) return value as T;
  // T's keys are unknown here, so index it as a plain record by the runtime key.
  const record = obj as Record<string, unknown>;
  const child = (record[key] ?? {}) as object;
  return { ...obj, [key]: rest.length ? setIn(child, rest, value) : value };
}

/**
 * T9. diffKeys
 * WHY: set algebra on key sets (lesson 02): difference both ways for added/removed,
 * intersection + value comparison for changed. Object.is so NaN → NaN isn't "changed".
 * sort() without a comparator is fine here: these are strings.
 * Complexity: O(n log n) because of sorting.
 */
export function diffKeys(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { added: string[]; removed: string[]; changed: string[] } {
  const beforeKeys = new Set(Object.keys(before));
  const afterKeys = new Set(Object.keys(after));
  return {
    added: [...afterKeys.difference(beforeKeys)].sort(),
    removed: [...beforeKeys.difference(afterKeys)].sort(),
    changed: [...beforeKeys.intersection(afterKeys)]
      .filter((k) => !Object.is(before[k], after[k]))
      .sort(),
  };
}

export type Todo = { id: number; text: string; done: boolean };
export type TodoState = { todos: Todo[]; nextId: number };
export type TodoAction =
  { type: 'add'; text: string } | { type: 'toggle'; id: number } | { type: 'remove'; id: number };

/**
 * T10. todoReducer
 * WHY: a discriminated union on `type` lets TS narrow `action` per case.
 * Each branch returns a NEW state built with spread / map / filter — never push or assign.
 * Untouched todos keep their references (map returns `t` as is).
 * Because TS knows all 3 cases are handled, no default branch is needed for the return type.
 */
export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'add':
      return {
        todos: [...state.todos, { id: state.nextId, text: action.text, done: false }],
        nextId: state.nextId + 1,
      };
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };
    case 'remove':
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };
  }
}
