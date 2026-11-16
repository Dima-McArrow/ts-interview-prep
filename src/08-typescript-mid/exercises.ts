/**
 * EXERCISES 08 — TYPESCRIPT FOR MID-LEVEL
 *
 * Two kinds of tasks:
 *  PART 1 — runtime functions with good types      → checked by `npm test` (exercises.test.ts)
 *  PART 2 — pure TYPE-level tasks (type aliases)    → checked by `npm test` too, via
 *           vitest typecheck (types.test-d.ts). Errors also show up as red squiggles
 *           in types.test-d.ts in VS Code.
 *
 * Each task has a "How to think" block: a step-by-step plan WITHOUT the code.
 * Detailed explanations: solutions/08-typescript-mid.ts
 *
 * Watch mode: npm run test:watch -- 08-typescript
 */
import { todo } from '../_utils/todo';

// ===========================================================================
// PART 1 — RUNTIME TASKS
// ===========================================================================

export type User = { id: number; name: string; role: 'admin' | 'user'; email?: string };

/**
 * T1. Type guard: is this unknown value a valid User?
 * id: number, name: string, role: 'admin' | 'user', email: string if present.
 *
 * How to think (lesson §6):
 *  1. First: is it a non-null object? (typeof value === 'object' && value !== null)
 *  2. Cast once to Record<string, unknown> to read fields without TS complaints.
 *  3. Check each field's runtime type: typeof id === 'number', typeof name === 'string',
 *     role is exactly 'admin' or 'user', email is undefined OR a string.
 *  4. Return the boolean; the `value is User` return type does the narrowing for callers.
 */
export function isUser(value: unknown): value is User {
  return todo();
}

/**
 * T2. Group items by the value of a given key. Key values are converted to strings.
 * groupByKey(users, 'role') → { admin: [...], user: [...] }
 * Notice how K extends keyof T makes groupByKey(users, 'nope') a compile error.
 *
 * How to think (lesson §4):
 *  1. Start with {} typed as Record<string, T[]>.
 *  2. For each item: const group = String(item[key]) — item[key] has type T[K], which may
 *     be a number etc., so convert it to a string key.
 *  3. (groups[group] ??= []).push(item) — create the array on first use, then push.
 */
export function groupByKey<T, K extends keyof T>(items: T[], key: K): Record<string, T[]> {
  return todo();
}

/**
 * T3. Discriminated union + exhaustive switch.
 * Return a human-readable message for each event:
 *  login    → `${user} logged in`
 *  logout   → `${user} logged out`
 *  purchase → `${user} bought ${items.length} item(s) for ${total}€`
 *  error    → `Error ${code}: ${message}`
 *
 * How to think (lesson §7):
 *  1. switch (event.type) — inside each case TS knows the exact variant
 *     (event.items exists only in 'purchase', event.code only in 'error').
 *  2. Add `default: { const exhaustive: never = event; return exhaustive; }` —
 *     if someone adds a 5th event type, this line stops compiling.
 */
export type AppEvent =
  | { type: 'login'; user: string }
  | { type: 'logout'; user: string }
  | { type: 'purchase'; user: string; items: string[]; total: number }
  | { type: 'error'; code: number; message: string };

export function describeEvent(event: AppEvent): string {
  return todo();
}

/**
 * T4. Result type instead of exceptions (Rust/Go style error handling).
 * parseAge('42')   → { ok: true, value: 42 }
 * parseAge('abc')  → { ok: false, error: 'not a number' }
 * parseAge('-1')   → { ok: false, error: 'out of range' }   (valid range: 0..150, integers only)
 * parseAge('1.5')  → { ok: false, error: 'not an integer' }
 *
 * How to think:
 *  1. const n = Number(input). Careful: Number('') is 0, not NaN → treat empty/blank input
 *     as 'not a number' explicitly (input.trim() === '').
 *  2. Check in this order: not a number → not an integer (Number.isInteger) → out of range.
 *  3. Return object literals; the Result<number> return type checks their shape.
 *  Why Result? The CALLER is forced by TS to check `ok` before reading `value` —
 *  errors can't be silently ignored like an uncaught exception.
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export function parseAge(input: string): Result<number> {
  return todo();
}

/**
 * T5. Validate an unknown config (e.g. parsed JSON) and return a typed one.
 * Rules: port — integer 1..65535; host — non-empty string; debug — optional boolean (default false).
 * Throw Error('Invalid config: <field>') for the FIRST invalid field (check order: host, port, debug).
 *
 * How to think (lesson §10 — validate at the boundary):
 *  1. Not an object (or null) → treat it as {} so the first check (host) fails naturally.
 *  2. Destructure { host, port, debug = false } — all are `unknown` at this point.
 *  3. Check host, then port (typeof number + Number.isInteger + range), then debug (boolean).
 *  4. After the checks TS has narrowed all three → return { host, port, debug } with NO casts.
 */
export type Config = { host: string; port: number; debug: boolean };

export function parseConfig(raw: unknown): Config {
  return todo();
}

/**
 * T6. ★ Typed event emitter. `Events` maps event names to payload types:
 *   const emitter = createEmitter<{ login: { user: string }; logout: undefined }>();
 *   emitter.on('login', (p) => p.user);          // p is { user: string }
 *   emitter.emit('login', { user: 'Ann' });
 *   emitter.emit('login', 42);                   // ❌ compile error
 * on() returns an unsubscribe function.
 *
 * How to think (lesson §4 generics + module 05 closures):
 *  1. Closure state: const handlers = new Map<keyof Events, Set<(payload: any) => void>>().
 *  2. on(event, handler): get or create the Set for the event, add the handler,
 *     return () => set.delete(handler).
 *  3. emit(event, payload): handlers.get(event)?.forEach((h) => h(payload)).
 *  The generic signatures (E extends keyof Events, payload: Events[E]) are already written
 *  for you — they are what makes emit('login', 42) a compile error.
 */
export function createEmitter<Events extends Record<string, unknown>>(): {
  on: <E extends keyof Events>(event: E, handler: (payload: Events[E]) => void) => () => void;
  emit: <E extends keyof Events>(event: E, payload: Events[E]) => void;
} {
  return todo();
}

// ===========================================================================
// PART 2 — TYPE-LEVEL TASKS
// Replace `TODO_TYPE` with a real type. Checked by types.test-d.ts.
// Do NOT use the built-in utility with the same purpose (e.g. Partial for MyPartial) —
// write the mapped / conditional type yourself. (Lesson §9 shows the building blocks.)
// ===========================================================================

/** Placeholder: replace it in each alias below. */
export type TODO_TYPE = { readonly __todo: 'implement this type' };

/**
 * TT1. All properties optional.  MyPartial<{ a: number }> → { a?: number }
 * How to think: mapped type over keyof T, add the `?` modifier: { [K in keyof T]?: ... }.
 */
export type MyPartial<T> = TODO_TYPE;

/**
 * TT2. All properties readonly.
 * How to think: same as TT1 but with the `readonly` modifier in front of the key.
 */
export type MyReadonly<T> = TODO_TYPE;

/**
 * TT3. Only keys K.  MyPick<{ a: 1; b: 2 }, 'a'> → { a: 1 }
 * How to think: iterate over K (not over keyof T!): { [P in K]: T[P] }.
 */
export type MyPick<T, K extends keyof T> = TODO_TYPE;

/**
 * TT4. All keys except K.
 * How to think (two ways):
 *  A. Key remapping: { [P in keyof T as P extends K ? never : P]: T[P] } — `never` drops a key.
 *  B. Your MyPick + the built-in Exclude: MyPick<T, Exclude<keyof T, K>>.
 */
export type MyOmit<T, K extends keyof T> = TODO_TYPE;

/**
 * TT5. Return type of a function.
 * How to think: conditional type + infer:
 *  F extends (...args: never[]) => infer R ? R : never.
 *  (never[] for args accepts functions with ANY parameters.)
 */
export type MyReturnType<F> = TODO_TYPE;

/**
 * TT6. Element type of an array (also readonly arrays); non-arrays → never.
 *  ElementType<string[]> → string;  ElementType<readonly [1, 2]> → 1 | 2
 * How to think: T extends readonly (infer E)[] ? E : never.
 *  `readonly` in the pattern matches BOTH mutable and readonly arrays (and tuples).
 */
export type ElementType<T> = TODO_TYPE;

/**
 * TT7. Every property may also be null.  Nullable<{ a: string }> → { a: string | null }
 * How to think: mapped type, value type T[K] | null. Optional properties stay optional
 * automatically (homomorphic mapped types preserve modifiers).
 */
export type Nullable<T> = TODO_TYPE;

/**
 * TT8. Union of all value types.  ValueOf<{ a: string; b: number }> → string | number
 * How to think: indexed access with a union of keys: T[keyof T].
 */
export type ValueOf<T> = TODO_TYPE;

/**
 * TT9. Unwrap nested promises.  UnwrapPromise<Promise<Promise<number>>> → number; non-promise stays as is.
 * How to think: recursive conditional type:
 *  T extends Promise<infer V> ? UnwrapPromise<V> : T.
 */
export type UnwrapPromise<T> = TODO_TYPE;

/**
 * TT10. ★ Getter names.  Getters<{ name: string }> → { getName: () => string }
 * How to think: key remapping with a template literal type:
 *  { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }
 *  `string & K` filters out number/symbol keys (Capitalize accepts only strings).
 */
export type Getters<T> = TODO_TYPE;

/**
 * TT11. ★ Readonly at every depth (objects and arrays inside objects). Functions stay as is.
 * How to think — recursive conditional, ORDER of checks matters:
 *  1. T is a function → T (functions are objects too, so check them FIRST).
 *  2. T is an array of E → readonly DeepReadonly<E>[].
 *  3. T is an object → { readonly [K in keyof T]: DeepReadonly<T[K]> }.
 *  4. Otherwise (primitive) → T.
 */
export type DeepReadonly<T> = TODO_TYPE;

/**
 * TT12. ★ Keys of T whose values are of type V.  KeysOfType<{ a: string; b: number; c: string }, string> → 'a' | 'c'
 * How to think — a classic two-step trick:
 *  1. Map every key to ITSELF or never: { [K in keyof T]: T[K] extends V ? K : never }
 *     → { a: 'a'; b: never; c: 'c' }
 *  2. Take the union of its values with [keyof T] → 'a' | never | 'c' = 'a' | 'c'.
 */
export type KeysOfType<T, V> = TODO_TYPE;
