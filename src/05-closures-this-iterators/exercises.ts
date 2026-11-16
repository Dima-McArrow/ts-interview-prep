/**
 * EXERCISES 05 — CLOSURES, THIS, ITERATORS & GENERATORS
 * Watch mode: npm run test:watch -- 05-closures
 *
 * PART 1 — QUIZ: replace each TODO with the exact value the snippet produces.
 *   Each question has a "Concept" line: which idea it checks + the lesson section.
 * PART 2 — TASKS: replace `return todo();` with your implementation.
 *   Each task has a "How to think" block: a step-by-step plan WITHOUT the code.
 *
 * Detailed explanations of every answer: solutions/05-closures-this-iterators.ts
 */
import { TODO, todo } from '../_utils/todo';

// ===========================================================================
// PART 1 — QUIZ: "What is the result?"
// ===========================================================================
export const quiz = {
  // Q1.  function makeAdder(x) { return (y) => x + y; }
  //      const add5 = makeAdder(5);
  //      add5(3) → ?
  // Concept: closure keeps the outer parameter alive (lesson §2).
  q1: TODO,

  // Q2.  let n = 1;
  //      const get = () => n;
  //      n = 2;
  //      get() → ?
  // Concept: a closure holds the VARIABLE, not a snapshot (lesson §2).
  q2: TODO,

  // Q3.  const fns = [];
  //      for (var i = 0; i < 3; i++) fns.push(() => i);
  //      fns.map((f) => f()) → ?
  // Concept: var is one variable for the whole loop (lesson §3).
  q3: TODO,

  // Q4.  Same as Q3 but with `let i` → ?
  // Concept: let creates a new binding per iteration (lesson §3).
  q4: TODO,

  // Q5.  const obj = { v: 1, get() { return this.v; } };
  //      const g = obj.get.bind({ v: 2 });
  //      g() → ?
  // Concept: bind fixes `this` (lesson §7).
  q5: TODO,

  // Q6.  function f() { return this?.v; }
  //      f.call({ v: 7 }) → ?
  // Concept: call sets `this` for one call (lesson §7).
  q6: TODO,

  // Q7.  const bound = f.bind({ v: 1 });   // f from Q6
  //      bound.call({ v: 2 }) → ?
  // Concept: bind is permanent — call can't override it (lesson §7).
  q7: TODO,

  // Q8.  const o = { v: 5, regular() { return [1].map(() => this.v)[0]; } };
  //      o.regular() → ?
  // Concept: an arrow inside a method takes the method's `this` (lesson §8).
  q8: TODO,

  // Q9.  function* g() { yield 1; yield 2; return 3; }
  //      [...g()] → ?
  // Concept: spread ignores a generator's return value (lesson §10).
  q9: TODO,

  // Q10. const it = g();   // g from Q9
  //      it.next(); it.next();
  //      it.next() → ?
  // Concept: the `return` of a generator comes with done: true (lesson §10).
  q10: TODO,

  // Q11. const counter = (() => { let c = 0; return () => c++; })();
  //      counter(); counter();
  //      counter() → ?
  // Concept: closure + postfix c++ returns the OLD value (lesson §2).
  q11: TODO,

  // Q12. q12a: typeof (() => {}).prototype     q12b: typeof function () {}.prototype
  // Concept: arrow functions have no prototype (lesson §8).
  q12a: TODO,
  q12b: TODO,

  // Q13. const [, b] = (function* () { yield 'x'; yield 'y'; yield 'z'; })();
  //      b → ?
  // Concept: destructuring pulls values from an iterator (lesson §9, §10).
  q13: TODO,

  // Q14. const x = 'global';
  //      function outer() { const x = 'outer'; return function inner() { return x; }; }
  //      outer()() → ?
  // Concept: lexical scope — where a function is WRITTEN matters (lesson §1).
  q14: TODO,

  // Q15. const add = (a) => (b) => a + b;
  //      [1, 2, 3].map(add(10)) → ?
  // Concept: currying / partial application (lesson §6).
  q15: TODO,

  // Q16. const gen = (function* () { yield 1; yield 2; })();
  //      const first = [...gen];
  //      const second = [...gen];
  //      [first, second] → ?
  // Concept: a generator object is single-use (lesson §10).
  q16: TODO,
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. Counter with private state (closure). `value()` returns the current count.
 * const c = createCounter(10); c.increment(); c.increment(); c.decrement(); c.value() → 11
 * c.reset() → back to the initial value.
 *
 * How to think:
 *  1. Keep `let count = start` INSIDE createCounter — that's the private state.
 *  2. Return an object of small arrow functions; each one closes over `count`.
 *  3. reset sets count back to `start` (the parameter is also captured by the closure).
 *  4. value is a FUNCTION (value()), so it always reads the current count.
 */
export function createCounter(start = 0): {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  value: () => number;
} {
  return todo();
}

/**
 * T2. Call fn only once; later calls return the first result without calling fn.
 *
 * How to think:
 *  1. Two pieces of state in the closure: `called` (boolean) and `result`.
 *  2. Return (...args) => { if not called: mark called, result = fn(...args); return result }.
 *  Why a separate `called` flag instead of checking `result === undefined`?
 *  Because fn may legitimately return undefined — it must still run only once.
 */
export function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  return todo();
}

/**
 * T3. Cache results by arguments. Use a Map and JSON.stringify(args) as the key.
 * const slowAdd = (a, b) => a + b;  const add = memoize(slowAdd);
 * add(1, 2); add(1, 2);  → slowAdd called once.
 *
 * How to think:
 *  1. A Map<string, R> in the closure is the cache.
 *  2. Key = JSON.stringify(args) — turns [1, 2] into the string "[1,2]", so equal
 *     argument lists give equal keys (arrays as keys would be compared by reference!).
 *  3. If the cache doesn't have the key → compute and store. Return the cached value.
 *  Note: (1, 2) and (2, 1) are DIFFERENT keys — the test expects 2 real calls.
 */
export function memoize<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  return todo();
}

/**
 * T4. Debounce: call fn `ms` after the LAST call, with the LAST arguments.
 * The returned function also has .cancel() to drop a pending call.
 *
 * How to think:
 *  1. Closure state: `timer` (the id returned by setTimeout).
 *  2. On every call: clearTimeout(timer) (cancel the previous plan),
 *     then timer = setTimeout(() => fn(...args), ms) (plan with the NEWEST args).
 *  3. Functions are objects → you can attach a property: debounced.cancel = () => clearTimeout(timer).
 *  Tests use fake timers, so no real waiting happens.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): ((...args: A) => void) & { cancel: () => void } {
  return todo();
}

/**
 * T5. Throttle (leading): call fn immediately, then ignore calls for `ms`.
 *
 * How to think:
 *  1. Closure state: `lastCall` — timestamp of the last ACTUAL call of fn.
 *     Start it at -Infinity so the very first call always passes.
 *  2. On every call: now = Date.now(); if now - lastCall >= ms → update lastCall, call fn.
 *     Otherwise do nothing (the call is dropped).
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  return todo();
}

/**
 * T6. ★ Curry any function by its arity (fn.length).
 * const sum3 = (a, b, c) => a + b + c;
 * curry(sum3)(1)(2)(3) → 6;   curry(sum3)(1, 2)(3) → 6;   curry(sum3)(1)(2, 3) → 6
 *
 * How to think:
 *  1. fn.length = number of declared parameters (3 for sum3). That's when we're "done".
 *  2. Write a helper collect(collectedSoFar) that returns (...args) => { ... }.
 *  3. Inside: all = [...collectedSoFar, ...args].
 *     Enough arguments → return fn(...all). Not enough → return collect(all) (a NEW function).
 *  4. Start with collect([]).
 *  Because each step creates a NEW closure, partial results are reusable:
 *  const add1 = curried(1); add1(1)(1) and add1(10)(10) don't interfere.
 */
// `any` on purpose, twice:
//  - `(...args: any[])` accepts ANY function. With unknown[] a function like
//    (a: number, b: number) => number would NOT fit: it needs numbers, so it can't promise
//    to accept unknown values (parameter types are checked in the opposite direction).
//  - the result is `any`: it's either the final value or another curried function, depending
//    on how many args were passed. Typing that precisely needs advanced recursive generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function curry(fn: (...args: any[]) => unknown): (...args: unknown[]) => any {
  return todo();
}

/**
 * T7. Implement bind WITHOUT using Function.prototype.bind (use call or apply).
 * Supports preset arguments: myBind(fn, ctx, 1)(2) ≡ fn.call(ctx, 1, 2)
 *
 * How to think:
 *  1. Return a NEW function (bind never calls fn immediately).
 *  2. That function collects its own args (...rest) and calls
 *     fn.apply(ctx, [...preset, ...rest]) — apply takes the args as an array.
 *  3. Use an ARROW for the returned function so nothing inside depends on its own `this`.
 */
export function myBind<T, A extends unknown[], R>(
  fn: (this: T, ...args: A) => R,
  ctx: T,
  ...preset: unknown[]
): (...rest: unknown[]) => R {
  return todo();
}

/**
 * T8. Generator of IDs: idGenerator('user') yields 'user-1', 'user-2', ... forever.
 *
 * How to think:
 *  1. A local counter `let id = 1` inside the generator.
 *  2. while (true) { yield prefix + '-' + id; id++ } — infinite is fine: it's lazy,
 *     each next() runs only until the next yield.
 */
export function* idGenerator(prefix: string): Generator<string> {
  todo();
}

/**
 * T9. Lazily take the first n items of ANY iterable (must work with infinite ones).
 * [...take(naturals(), 3)] → [1, 2, 3]
 * Do NOT convert the whole iterable to an array!
 *
 * How to think:
 *  1. for...of over the iterable, yield each item, count them.
 *  2. When count reaches n → `return` (this also tells the source iterator to stop).
 *  3. Edge case n <= 0: return before touching the iterable at all.
 *  [...infinite] would hang forever — that's why we pull items one by one.
 */
export function* take<T>(iterable: Iterable<T>, n: number): Generator<T> {
  todo();
}

/**
 * T10. Infinite Fibonacci generator: 0, 1, 1, 2, 3, 5, 8, ...
 *
 * How to think:
 *  1. Keep two numbers: a = 0, b = 1.
 *  2. Forever: yield a, then shift the pair: [a, b] = [b, a + b] (swap trick from lesson 03).
 */
export function* fibonacci(): Generator<number> {
  todo();
}

/**
 * T11. Return a REUSABLE iterable range (not an array!).
 * const r = range(1, 3);  [...r] → [1, 2, 3];  [...r] again → [1, 2, 3]
 * Hint: an object with [Symbol.iterator]() that returns a fresh iterator each time
 * (a generator method `*[Symbol.iterator]() {}` is the easiest way).
 *
 * How to think:
 *  1. Returning a generator OBJECT directly would be single-use (quiz Q16!).
 *  2. Instead return an object whose [Symbol.iterator] is a generator METHOD:
 *     every for...of / spread calls it again and gets a FRESH iterator.
 *  3. Inside: for (let i = from; i <= to; i += step) yield i.
 */
export function range(from: number, to: number, step = 1): Iterable<number> {
  return todo();
}

/**
 * T12. ★ Mini Redux store built on closures.
 * - getState(): current state
 * - dispatch(action): state = reducer(state, action); then call every listener
 * - subscribe(listener): returns an unsubscribe function
 *
 * How to think — everything lives in the closure:
 *  1. let state = initialState; const listeners = new Set<() => void>().
 *  2. getState: () => state.
 *  3. dispatch: state = reducer(state, action); then call every listener.
 *  4. subscribe: add the listener; return () => listeners.delete(listener).
 *     (A Set makes unsubscribe O(1) and ignores double subscriptions.)
 *  This is literally how Redux's createStore works — great interview talking point.
 */
export function createStore<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): {
  getState: () => S;
  dispatch: (action: A) => void;
  subscribe: (listener: () => void) => () => void;
} {
  return todo();
}
