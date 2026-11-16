/**
 * EXERCISES 04 — OBJECTS & IMMUTABILITY
 * Watch mode: npm run test:watch -- 04-objects
 *
 * PART 1 — QUIZ: replace each TODO with the exact value the snippet produces.
 *   Each question has a "Concept" line: which idea it checks + the lesson section.
 * PART 2 — TASKS: replace `return todo();` with your implementation.
 *   Each task has a "How to think" block: a step-by-step plan WITHOUT the code.
 *
 * Detailed explanations of every answer: solutions/04-objects-immutability.ts
 */
import { TODO, todo } from '../_utils/todo';

// ===========================================================================
// PART 1 — QUIZ: "What is the result?"
// ===========================================================================
export const quiz = {
  // Q1.  Object.keys({ b: 1, 10: 'x', a: 2, 2: 'y' })
  // Concept: key order — integer-like keys first (lesson §1).
  q1: TODO,

  // Q2.  const a = { n: { v: 1 } };
  //      const b = { ...a };
  //      b.n.v = 2;
  //      a.n.v → ?
  // Concept: spread is a SHALLOW copy (lesson §4).
  q2: TODO,

  // Q3.  JSON.parse(JSON.stringify({ d: undefined, n: NaN, f: () => 1 }))
  // Concept: what a JSON round-trip loses (lesson §4).
  q3: TODO,

  // Q4.  q4a: 0 || 'default'      q4b: 0 ?? 'default'
  // Concept: || vs ?? on falsy values (lesson §9).
  q4a: TODO,
  q4b: TODO,

  // Q5.  '' ?? 'fallback'
  // Concept: ?? only reacts to null/undefined (lesson §9).
  q5: TODO,

  // Q6.  const user = {};
  //      user?.profile?.name → ?
  // Concept: optional chaining short-circuits (lesson §9).
  q6: TODO,

  // Q7.  Object.entries({ a: 1, b: 2 }).map(([k, v]) => k + v)
  // Concept: entries + array methods (lesson §1).
  q7: TODO,

  // Q8.  Object.fromEntries([['a', 1], ['a', 2]])
  // Concept: duplicate keys in fromEntries (lesson §2).
  q8: TODO,

  // Q9.  const frozen = Object.freeze({ list: [1] });
  //      frozen.list.push(2);
  //      frozen.list → ?
  // Concept: Object.freeze is SHALLOW (lesson §6).
  q9: TODO,

  // Q10. q10a: Object.is(NaN, NaN)     q10b: Object.is(0, -0)
  // Concept: Object.is vs === (lesson §10).
  q10a: TODO,
  q10b: TODO,

  // Q11. const t = { a: 1 };
  //      const r = Object.assign(t, { b: 2 });
  //      r === t → ?
  // Concept: Object.assign mutates and returns its target (lesson §5).
  q11: TODO,

  // Q12. const arr = [3, 1, 2];
  //      arr.toSorted() === arr → ?
  // Concept: toSorted returns a NEW array (lesson §7).
  q12: TODO,

  // Q13. [1, 2, 3].with(1, 99)
  // Concept: with(index, value) — immutable replace (lesson §7).
  q13: TODO,

  // Q14. q14a: typeof structuredClone({ d: new Date(0) }).d
  //      q14b: typeof JSON.parse(JSON.stringify({ d: new Date(0) })).d
  // Concept: structuredClone keeps Date, JSON turns it into a string (lesson §4).
  q14a: TODO,
  q14b: TODO,

  // Q15. Object.groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even'))
  // Concept: Object.groupBy (lesson §3).
  q15: TODO,

  // Q16. const cfg = { retries: 0 };
  //      cfg.retries ||= 5;   →  q16a: cfg.retries
  //      const cfg2 = { retries: 0 };
  //      cfg2.retries ??= 5;  →  q16b: cfg2.retries
  // Concept: ||= vs ??= (lesson §9).
  q16a: TODO,
  q16b: TODO,
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. Apply fn to every value, keep keys.
 * mapValues({ a: 1, b: 2 }, (n) => n * 10) → { a: 10, b: 20 }
 *
 * How to think — the main pattern of this lesson:
 *  1. Object.entries(obj) → array of [key, value] pairs.
 *  2. map each pair to [key, fn(value)] (same key, new value).
 *  3. Object.fromEntries(...) → back to an object.
 */
export function mapValues<V, R>(obj: Record<string, V>, fn: (value: V) => R): Record<string, R> {
  return todo();
}

/**
 * T2. Keep only entries for which predicate(value, key) is true.
 * filterObject({ a: 1, b: 20 }, (v) => v > 10) → { b: 20 }
 *
 * How to think: same pattern as T1, but filter instead of map.
 *  Careful with the argument order: predicate(VALUE, key), while entries give [key, value].
 */
export function filterObject<V>(
  obj: Record<string, V>,
  predicate: (value: V, key: string) => boolean,
): Record<string, V> {
  return todo();
}

/**
 * T3. Group user names by role → { [role]: names[] }.
 * Use Object.groupBy (+ your mapValues).
 *
 * How to think:
 *  1. Object.groupBy(members, (m) => m.role) → { admin: [Member...], dev: [Member...] }.
 *  2. Each group is an array of Members, but we need names → map every group: list.map(m => m.name).
 *  3. "Transform every value of an object" = your mapValues from T1.
 *  TS tip: groupBy returns Partial<Record<...>> (groups may be missing) — a cast to
 *  Record<string, Member[]> is fine because only existing groups are present.
 */
export type Member = { name: string; role: 'admin' | 'dev' | 'qa' };
export function namesByRole(members: Member[]): Partial<Record<Member['role'], string[]>> {
  return todo();
}

/**
 * T4. ★ Deep clone WITHOUT structuredClone / JSON.
 * Must support: primitives, arrays, plain objects, Date, Map, Set (nested in any combination).
 *
 * How to think — recursion with one branch per type:
 *  1. Primitive or null (typeof !== 'object' || value === null) → return it as is.
 *  2. Date → new Date(value.getTime()).
 *  3. Map → new Map of pairs where BOTH key and value are deepClone'd.
 *  4. Set → new Set of deepClone'd values.
 *  5. Array → value.map(deepClone).
 *  6. Plain object → entries → deepClone each value → fromEntries.
 *  ORDER MATTERS: check Date/Map/Set/Array BEFORE "plain object" (they are all objects!).
 */
export function deepClone<T>(value: T): T {
  return todo();
}

/**
 * T5. ★ Deep equality for primitives, arrays and plain objects.
 * deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }) → true
 * Key ORDER must not matter. NaN should equal NaN (hint: Object.is).
 *
 * How to think:
 *  1. Object.is(a, b) → true: same primitive or same reference (also handles NaN). Done.
 *  2. If either is not an object (or is null) → they're different primitives → false.
 *  3. One is an array and the other isn't → false ([1] vs { 0: 1 } must be false).
 *  4. Compare key COUNTS (Object.keys). Different → false.
 *     (This is what makes { a: 1 } !== { a: 1, b: undefined }.)
 *  5. Every key of a must exist in b (Object.hasOwn) AND deepEqual(a[key], b[key]) — recursion.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return todo();
}

/**
 * T6. Recursively freeze an object and all nested objects/arrays. Return it.
 *
 * How to think:
 *  1. Not an object (or null) → nothing to freeze, return as is.
 *  2. Object.freeze(obj) — freezes only the top level...
 *  3. ...so walk Object.values(obj) and call deepFreeze on each value (arrays are objects too).
 *  4. Return obj (same reference — freeze doesn't copy).
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  return todo();
}

/**
 * T7. Safe read by dot-path with a fallback (like lodash.get).
 * getIn({ a: { b: { c: 42 } } }, 'a.b.c') → 42
 * getIn({ a: null }, 'a.b.c', 'none') → 'none'
 * getIn({ a: { b: 0 } }, 'a.b', 5) → 0      (careful: 0 is a real value → use ??)
 *
 * How to think:
 *  1. path.split('.') → ['a', 'b', 'c'].
 *  2. Walk the keys with reduce: current = current?.[key]  (?. stops safely on null/undefined).
 *     Array indexes work too: 'list.0.id' → current['0'].
 *  3. Result is null/undefined → return fallback. Use ?? (NOT ||) so 0, '' and false survive.
 *  TS tip: cast `current as Record<string, unknown> | null` before indexing.
 */
export function getIn(obj: unknown, path: string, fallback?: unknown): unknown {
  return todo();
}

/**
 * T8. ★ Immutable write by path (like Immer / lodash/fp set).
 * Returns a NEW object; creates missing levels; untouched branches keep references.
 * setIn({ a: { b: 1 }, x: {} }, ['a', 'c'], 2) → { a: { b: 1, c: 2 }, x: {} }
 *
 * How to think — recursion along the path (structural sharing by hand):
 *  1. Split the path: const [key, ...rest] = path.
 *  2. Last key (rest is empty) → return { ...obj, [key]: value }.
 *  3. Otherwise → return { ...obj, [key]: setIn(obj[key] ?? {}, rest, value) }.
 *     `?? {}` creates missing levels.
 *  4. Spread copies all OTHER keys by reference → untouched branches keep their identity.
 */
export function setIn<T extends object>(obj: T, path: string[], value: unknown): T {
  return todo();
}

/**
 * T9. Shallow diff of two objects. Keys in each array sorted A→Z.
 * diffKeys({ a: 1, b: 2, c: 3 }, { a: 1, b: 20, d: 4 })
 *   → { added: ['d'], removed: ['c'], changed: ['b'] }
 *
 * How to think — it's set algebra on keys (lesson 02):
 *  1. beforeKeys = new Set(Object.keys(before)), afterKeys = same for after.
 *  2. added   = in after but not in before   (difference)
 *     removed = in before but not in after   (difference the other way)
 *     changed = in both (intersection) AND !Object.is(before[k], after[k]).
 *  3. Spread each Set into an array and sort() (strings sort fine without a comparator).
 */
export function diffKeys(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { added: string[]; removed: string[]; changed: string[] } {
  return todo();
}

/**
 * T10. Immutable reducer (Redux / useReducer style). NEVER mutate `state`.
 *  - add:    append { id: nextId, text, done: false } and increment nextId
 *  - toggle: flip `done` of the todo with given id
 *  - remove: delete the todo with given id
 *
 * How to think:
 *  1. switch (action.type) — TS narrows `action` in each case (action.text exists only in 'add').
 *  2. add:    new state, todos: [...state.todos, newTodo], nextId: state.nextId + 1.
 *  3. toggle: { ...state, todos: state.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }.
 *  4. remove: { ...state, todos: state.todos.filter(t => t.id !== id) }.
 *  The tests FREEZE the state: any push/splice/assignment would throw → you'll know immediately.
 */
export type Todo = { id: number; text: string; done: boolean };
export type TodoState = { todos: Todo[]; nextId: number };
export type TodoAction =
  { type: 'add'; text: string } | { type: 'toggle'; id: number } | { type: 'remove'; id: number };

export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  return todo();
}
