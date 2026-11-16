/**
 * SOLUTIONS 08 — TYPESCRIPT FOR MID-LEVEL (with detailed explanations)
 * Open only after you tried yourself :)
 */

// ===========================================================================
// PART 1 — RUNTIME TASKS
// ===========================================================================

export type User = { id: number; name: string; role: 'admin' | 'user'; email?: string };

/**
 * T1. isUser
 * WHY: a type guard is a RUNTIME check whose boolean result TS trusts for narrowing.
 * We first rule out primitives and null, then check every field's runtime type.
 * The single cast to Record<string, unknown> is safe: we only READ fields and check them.
 * Pitfall: the guard is only as good as its checks — if you forget a field, TS will still
 * trust it. That's why schema libraries (zod) are popular: the check and the type come from
 * one definition.
 */
export function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'number' &&
    typeof v.name === 'string' &&
    (v.role === 'admin' || v.role === 'user') &&
    (v.email === undefined || typeof v.email === 'string')
  );
}

/**
 * T2. groupByKey
 * WHY: `K extends keyof T` restricts `key` to real property names (typos fail to compile),
 * and item[key] is typed T[K]. String(...) turns any key value into a valid object key.
 * `??=` creates the group array on first use.
 */
export function groupByKey<T, K extends keyof T>(items: T[], key: K): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const group = String(item[key]);
    (groups[group] ??= []).push(item);
  }
  return groups;
}

export type AppEvent =
  | { type: 'login'; user: string }
  | { type: 'logout'; user: string }
  | { type: 'purchase'; user: string; items: string[]; total: number }
  | { type: 'error'; code: number; message: string };

/**
 * T3. describeEvent
 * WHY: `type` is the discriminant. In each case TS narrows `event` to one variant, so
 * event.items / event.code are available exactly where they exist.
 * The `never` assignment in default is the exhaustive check: if a new variant is added to
 * AppEvent and not handled, `event` in default is no longer `never` → compile error.
 */
export function describeEvent(event: AppEvent): string {
  switch (event.type) {
    case 'login':
      return `${event.user} logged in`;
    case 'logout':
      return `${event.user} logged out`;
    case 'purchase':
      return `${event.user} bought ${event.items.length} item(s) for ${event.total}€`;
    case 'error':
      return `Error ${event.code}: ${event.message}`;
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
}

export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

/**
 * T4. parseAge
 * WHY: Result is a discriminated union on `ok`. The caller must check `if (r.ok)` before
 * TS allows reading r.value — errors become part of the type instead of invisible throws.
 * Number('') is 0 and Number('  ') is 0 — that's why blank input is checked explicitly.
 * Order of checks gives the most specific error first.
 */
export function parseAge(input: string): Result<number> {
  const n = Number(input);
  if (input.trim() === '' || Number.isNaN(n)) return { ok: false, error: 'not a number' };
  if (!Number.isInteger(n)) return { ok: false, error: 'not an integer' };
  if (n < 0 || n > 150) return { ok: false, error: 'out of range' };
  return { ok: true, value: n };
}

export type Config = { host: string; port: number; debug: boolean };

/**
 * T5. parseConfig
 * WHY: we accept `unknown` (honest about external data) and narrow step by step.
 * Each `typeof` check narrows the destructured variable, so the final return needs NO casts —
 * a good sign that the validation really covers the type.
 * Non-objects become {} → host is undefined → the first error is 'host', as required.
 */
export function parseConfig(raw: unknown): Config {
  // Same idea as isUser: after the object check we only READ fields as unknown and check
  // each one below, so this single cast can't hide a wrong type.
  const obj = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const { host, port, debug = false } = obj;

  if (typeof host !== 'string' || host.length === 0) throw new Error('Invalid config: host');
  if (typeof port !== 'number' || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid config: port');
  }
  if (typeof debug !== 'boolean') throw new Error('Invalid config: debug');
  return { host, port, debug };
}

/**
 * T6. createEmitter
 * WHY: the generic signatures tie the event name to its payload type:
 *   on<E>(event: E, handler: (payload: Events[E]) => void)
 * so emit('login', 42) fails to compile when Events['login'] is { user: string }.
 * Inside, handlers are stored in a Map<eventName, Set<handler>>; a Set gives O(1) removal.
 * The internal casts are unavoidable: one Map stores handlers for DIFFERENT payload types.
 * The PUBLIC API stays fully type-safe — that's what matters.
 */
export function createEmitter<Events extends Record<string, unknown>>() {
  type Handler<E extends keyof Events> = (payload: Events[E]) => void;
  const handlers = new Map<keyof Events, Set<Handler<keyof Events>>>();

  return {
    on<E extends keyof Events>(event: E, handler: Handler<E>): () => void {
      if (!handlers.has(event)) handlers.set(event, new Set());
      const set = handlers.get(event)!;
      set.add(handler as Handler<keyof Events>);
      return () => void set.delete(handler as Handler<keyof Events>);
    },
    emit<E extends keyof Events>(event: E, payload: Events[E]): void {
      handlers.get(event)?.forEach((handler) => handler(payload));
    },
  };
}

// ===========================================================================
// PART 2 — TYPE-LEVEL TASKS
// ===========================================================================

export type TODO_TYPE = { readonly __todo: 'implement this type' };

/** TT1. Mapped type: for every key K of T, an optional property of the same type. */
export type MyPartial<T> = { [K in keyof T]?: T[K] };

/** TT2. Same idea with the `readonly` modifier. */
export type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

/** TT3. Iterate over the CHOSEN keys K (constrained to keyof T), not over all keys. */
export type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

/**
 * TT4. Key remapping with `as`: mapping a key to `never` removes it.
 * Equivalent: MyPick<T, Exclude<keyof T, K>> — this is literally how the built-in Omit works.
 */
export type MyOmit<T, K extends keyof T> = { [P in keyof T as P extends K ? never : P]: T[P] };

/**
 * TT5. `infer R` captures the return type in the "pattern" of a function type.
 * `never[]` for the parameters: function parameters are contravariant, so never[] accepts
 * functions with any parameter list (unknown[] would reject e.g. (a: number) => ...).
 */
export type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never;

/** TT6. `readonly (infer E)[]` matches mutable arrays, readonly arrays and tuples. */
export type ElementType<T> = T extends readonly (infer E)[] ? E : never;

/**
 * TT7. Homomorphic mapped type (iterates keyof T) → keeps `?` and `readonly` modifiers,
 * so `b?: number` becomes `b?: number | null`.
 */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

/** TT8. Indexing with a UNION of keys gives a UNION of value types. */
export type ValueOf<T> = T[keyof T];

/** TT9. Recursive conditional type: keep unwrapping while it's still a Promise. */
export type UnwrapPromise<T> = T extends Promise<infer V> ? UnwrapPromise<V> : T;

/**
 * TT10. Key remapping + template literal type + intrinsic Capitalize.
 * `string & K` keeps only string keys (symbol/number keys can't be capitalized).
 */
export type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

/**
 * TT11. Recursion with an ordered chain of conditionals:
 * functions first (they're objects too, and we don't want to map their properties),
 * then arrays (→ readonly arrays of deep-readonly elements), then objects, then primitives.
 */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer E)[]
    ? readonly DeepReadonly<E>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

/**
 * TT12. Two steps:
 *  1. { [K in keyof T]: T[K] extends V ? K : never } → { a: 'a'; b: never; c: 'c' }
 *  2. [keyof T] → union of those values → 'a' | 'c' (never disappears from unions).
 */
export type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
