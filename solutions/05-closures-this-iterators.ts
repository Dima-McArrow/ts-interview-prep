/**
 * SOLUTIONS 05 — CLOSURES, THIS, ITERATORS & GENERATORS (with detailed explanations)
 * Open only after you tried yourself :)
 *
 * Format for every task: solution → WHY it works → alternatives / pitfalls.
 */

// ===========================================================================
// PART 1 — QUIZ ANSWERS
// ===========================================================================
export const quiz = {
  // Q1: 8
  // makeAdder(5) returns a function that closes over x = 5. add5(3) → 5 + 3.
  q1: 8,

  // Q2: 2
  // The closure holds the VARIABLE n, not its value at creation time. By the time
  // get() runs, n is 2.
  q2: 2,

  // Q3: [3, 3, 3]
  // `var i` is ONE variable for the whole loop. All three arrows close over it,
  // and after the loop it equals 3.
  q3: [3, 3, 3],

  // Q4: [0, 1, 2]
  // `let i` in a for-header creates a NEW binding per iteration; each arrow keeps its own.
  q4: [0, 1, 2],

  // Q5: 2
  // bind returns a new function whose `this` is permanently { v: 2 }.
  q5: 2,

  // Q6: 7
  // call invokes f once with this = { v: 7 }.
  q6: 7,

  // Q7: 1
  // A bound function ignores the `this` passed by call/apply/bind — bind is permanent.
  q7: 1,

  // Q8: 5
  // The arrow inside map has no own `this`; it uses regular()'s `this`, which is `o`
  // because regular was called as o.regular().
  q8: 5,

  // Q9: [1, 2]
  // Spread / for...of only take values with done: false. The `return 3` value has
  // done: true and is dropped.
  q9: [1, 2],

  // Q10: { value: 3, done: true }
  // The third next() reaches `return 3`: the returned value comes WITH done: true.
  q10: { value: 3, done: true },

  // Q11: 2
  // Postfix c++ returns the value BEFORE incrementing: calls return 0, 1, 2.
  q11: 2,

  // Q12: arrow → 'undefined', function → 'object'
  // Regular functions get a `prototype` object (they can be constructors); arrows don't.
  q12a: 'undefined',
  q12b: 'object',

  // Q13: 'y'
  // Array destructuring pulls values from the generator's iterator: skip 'x', take 'y'.
  // The generator is paused after 'y' — 'z' is never even produced.
  q13: 'y',

  // Q14: 'outer'
  // Lexical scope: inner was WRITTEN inside outer, so it sees outer's x, regardless
  // of the global x.
  q14: 'outer',

  // Q15: [11, 12, 13]
  // add(10) returns b => 10 + b, a one-argument function — perfect for map.
  q15: [11, 12, 13],

  // Q16: [[1, 2], []]
  // A generator OBJECT is a stateful iterator. The first spread exhausts it;
  // the second spread starts from "already done" and gets nothing.
  q16: [[1, 2], []],
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. createCounter
 * WHY: `count` lives in the closure; the four arrows are the only way to touch it.
 * `start` is captured too, so reset knows where to go back.
 * `void count++` makes the arrow return undefined (matches the `() => void` type).
 */
export function createCounter(start = 0) {
  let count = start;
  return {
    increment: () => void count++,
    decrement: () => void count--,
    reset: () => {
      count = start;
    },
    value: () => count,
  };
}

/**
 * T2. once
 * WHY: `called` and `result` persist between calls inside the closure.
 * A separate flag (instead of `result === undefined`) handles functions that
 * legitimately return undefined.
 */
export function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let called = false;
  let result: R;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

/**
 * T3. memoize
 * WHY: arrays are compared by reference, so [1, 2] can't be a Map key directly —
 * JSON.stringify turns the argument list into a comparable string.
 * Limitations: arguments must be JSON-serializable; key order of object args matters.
 * Unbounded cache = memory grows forever (an LRU from module 02 fixes that).
 */
export function memoize<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const cache = new Map<string, R>();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key)!;
  };
}

/**
 * T4. debounce
 * WHY: every call cancels the pending timer and schedules a new one with the NEWEST args,
 * so fn runs only after `ms` of silence. Functions are objects → we attach `cancel`.
 * Variants worth mentioning: "leading" debounce (fire on the first call), maxWait.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * T5. throttle (leading edge)
 * WHY: we remember when fn last ACTUALLY ran. Calls inside the window are dropped.
 * -Infinity guarantees the first call passes.
 * Variant: "trailing" throttle also schedules the last dropped call at the end of the window.
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let lastCall = -Infinity;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * T6. curry
 * WHY: collect(collected) returns a function that appends new args. When we have at least
 * fn.length args, call fn; otherwise return ANOTHER collector (a new closure).
 * Because every step is a new closure, partial applications are independent and reusable.
 * Pitfall: fn.length doesn't count rest params or params with defaults.
 */
// `any` on purpose, twice:
//  - `(...args: any[])` accepts ANY function. With unknown[] a function like
//    (a: number, b: number) => number would NOT fit: it needs numbers, so it can't promise
//    to accept unknown values (parameter types are checked in the opposite direction).
//  - the result is `any`: it's either the final value or another curried function, depending
//    on how many args were passed. Typing that precisely needs advanced recursive generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function curry(fn: (...args: any[]) => unknown): (...args: unknown[]) => any {
  const collect =
    (collected: unknown[]) =>
    (...args: unknown[]) => {
      const all = [...collected, ...args];
      return all.length >= fn.length ? fn(...all) : collect(all);
    };
  return collect([]);
}

/**
 * T7. myBind
 * WHY: return a new function (bind doesn't call). It merges preset and call-time args
 * and calls fn with an explicit `this` via apply.
 * A full polyfill would also handle `new boundFn()` — out of scope here.
 */
export function myBind<T, A extends unknown[], R>(
  fn: (this: T, ...args: A) => R,
  ctx: T,
  ...preset: unknown[]
): (...rest: unknown[]) => R {
  // preset and rest are unknown[]: TS can't prove that together they match fn's params A.
  // As with the native bind, passing the right arguments is the caller's job.
  return (...rest) => fn.apply(ctx, [...preset, ...rest] as A);
}

/**
 * T8. idGenerator
 * WHY: the infinite loop is safe because a generator pauses at each yield.
 */
export function* idGenerator(prefix: string): Generator<string> {
  let id = 1;
  while (true) yield `${prefix}-${id++}`;
}

/**
 * T9. take
 * WHY: we pull items one at a time with for...of and stop after n.
 * `return` inside for...of also calls the source iterator's return() — so a generator
 * source gets a chance to clean up (finally blocks run).
 */
export function* take<T>(iterable: Iterable<T>, n: number): Generator<T> {
  if (n <= 0) return;
  let count = 0;
  for (const item of iterable) {
    yield item;
    if (++count >= n) return;
  }
}

/**
 * T10. fibonacci
 * WHY: the pair [a, b] slides forward: (0,1) → (1,1) → (1,2) → (2,3) ...
 * Destructuring swap avoids a temp variable.
 */
export function* fibonacci(): Generator<number> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

/**
 * T11. range (reusable iterable)
 * WHY: the object's [Symbol.iterator] is a generator METHOD. Each spread / for...of calls
 * it again → a brand new generator → iteration can be repeated. Returning a generator
 * object directly would be single-use (see quiz Q16).
 */
export function range(from: number, to: number, step = 1): Iterable<number> {
  return {
    *[Symbol.iterator]() {
      for (let i = from; i <= to; i += step) yield i;
    },
  };
}

/**
 * T12. createStore (mini Redux)
 * WHY: state and listeners live in the closure — nobody can modify them except via
 * dispatch. subscribe returns a closure that knows which listener to remove.
 * A Set gives O(1) unsubscribe and ignores duplicate subscriptions.
 */
export function createStore<S, A>(reducer: (state: S, action: A) => S, initialState: S) {
  let state = initialState;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    dispatch(action: A) {
      state = reducer(state, action);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}
