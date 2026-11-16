/**
 * EXERCISES 06 — ASYNC, PROMISES, EVENT LOOP
 * Watch mode: npm run test:watch -- 06-async
 *
 * In the quiz, `order` is an empty array (`const order: string[] = []`) that the snippet
 * pushes into; answer with the final contents of `order`.
 *
 * PART 1 — QUIZ: replace each TODO with the exact value the snippet produces.
 *   Each question has a "Concept" line: which idea it checks + the lesson section.
 * PART 2 — TASKS: replace `return todo();` with your implementation.
 *   Each task has a "How to think" block: a step-by-step plan WITHOUT the code.
 *
 * Detailed explanations of every answer: solutions/06-async-promises.ts
 */
import { TODO, todo } from '../_utils/todo';

// ===========================================================================
// PART 1 — QUIZ: "What is the result?"
// ===========================================================================
export const quiz = {
  // Q1.  order.push('A');
  //      setTimeout(() => order.push('B'));
  //      Promise.resolve().then(() => order.push('C'));
  //      order.push('D');
  // Concept: sync → microtasks → macrotasks (lesson §5).
  q1: TODO,

  // Q2.  new Promise((resolve) => { order.push('1'); resolve(); order.push('2'); })
  //        .then(() => order.push('3'));
  //      order.push('4');
  // Concept: the executor runs synchronously; then is a microtask (lesson §1, §5).
  q2: TODO,

  // Q3.  async function f() { order.push('a'); await null; order.push('b'); }
  //      f();
  //      order.push('c');
  // Concept: an async function runs synchronously until the first await (lesson §5).
  q3: TODO,

  // Q4.  await Promise.all([1, Promise.resolve(2), 3])
  // Concept: Promise.all accepts plain values (lesson §6).
  q4: TODO,

  // Q5.  await Promise.allSettled([Promise.resolve(1), Promise.reject('x')])
  // Concept: the shape of allSettled results (lesson §7).
  q5: TODO,

  // Q6.  await Promise.race([sleep(50).then(() => 'slow'), sleep(10).then(() => 'fast')])
  // Concept: race — first settled wins (lesson §8).
  q6: TODO,

  // Q7.  await Promise.any([Promise.reject('a'), Promise.resolve('b')])
  // Concept: any skips rejections (lesson §8).
  q7: TODO,

  // Q8.  await Promise.resolve(1)
  //        .then((x) => x + 1)
  //        .then((x) => { throw x; })
  //        .catch((x) => x * 10)
  // Concept: throw jumps to catch; catch's return continues the chain (lesson §2).
  q8: TODO,

  // Q9.  await Promise.resolve(5).finally(() => 100)
  // Concept: finally does not change the value (lesson §2).
  q9: TODO,

  // Q10. async function g() {}
  //      await g() → ?
  // Concept: async function without return (lesson §3).
  q10: TODO,

  // Q11. await Promise.all([])
  // Concept: Promise.all of an empty array (lesson §6).
  q11: TODO,

  // Q12. typeof (async () => 1)()
  // Concept: calling an async function returns a Promise object (lesson §3).
  q12: TODO,

  // Q13. await Promise.resolve(1).then(2).then((x) => x)   // yes, then(2) — not a function!
  // Concept: a non-function argument to then is ignored (lesson §2).
  q13: TODO,

  // Q14. setTimeout(() => { order.push('T1'); Promise.resolve().then(() => order.push('P')); });
  //      setTimeout(() => order.push('T2'));
  // Concept: microtasks run after EACH macrotask (lesson §5).
  q14: TODO,

  // Q15. await Promise.reject(new Error('x'))
  //        .catch((e) => e.message)
  //        .then((m) => m + '!')
  // Concept: catch recovers the chain (lesson §2).
  q15: TODO,

  // Q16. const results = [];
  //      await Promise.all([3, 1, 2].map(async (n) => { await sleep(n * 10); results.push(n); }));
  //      results → ?
  // Concept: Promise.all keeps input order, but side effects happen in completion order (lesson §4, §6).
  q16: TODO,
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. Promise-based sleep.
 * await sleep(100) — resolves (with undefined) after 100ms.
 *
 * How to think:
 *  1. setTimeout is callback-based; wrap it into a Promise.
 *  2. new Promise((resolve) => setTimeout(resolve, ms)) — the timer calls resolve for you.
 */
export function sleep(ms: number): Promise<void> {
  return todo();
}

/**
 * T2. Load all users IN PARALLEL, results in the same order as ids.
 *
 * How to think:
 *  1. ids.map(getUser) STARTS every request immediately and gives an array of promises.
 *  2. Promise.all waits for all of them and keeps the INPUT order.
 *  The test checks that both requests started before any finished — don't await in a loop!
 */
export async function loadAll<T>(ids: number[], getUser: (id: number) => Promise<T>): Promise<T[]> {
  return todo();
}

/**
 * T3. Run the task for each item ONE BY ONE (next starts only after previous finished).
 * Returns results in order. (Use case: API with strict rate limit.)
 *
 * How to think:
 *  1. for...of + await: the loop pauses on each await, so the next task starts later.
 *  2. Push each result into an array and return it.
 *  ⚠️ forEach(async ...) would NOT wait (lesson §4).
 */
export async function runSequentially<T, R>(
  items: T[],
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  return todo();
}

/**
 * T4. Reject with Error(`Timeout after ${ms}ms`) if the promise takes longer than ms.
 * Otherwise resolve/reject exactly like the original promise.
 *
 * How to think:
 *  1. Create a "timeout promise" that REJECTS after ms: new Promise<never>((_, reject) => ...).
 *  2. Promise.race([promise, timeout]) — whoever settles first wins.
 *     If the original promise rejects first, race rejects with ITS error (the test checks this).
 *  3. Bonus: keep the timer id and clearTimeout in .finally(), so no timer is left hanging.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return todo();
}

/**
 * T5. Call fn until it succeeds, at most `attempts` times. If all fail, reject with the LAST error.
 *
 * How to think:
 *  1. Loop up to `attempts` times.
 *  2. try { return await fn(); } — `return await`, so a rejection is caught by THIS catch.
 *  3. catch: remember the error, continue the loop.
 *  4. After the loop: throw the last remembered error.
 */
export async function retry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  return todo();
}

/**
 * T6. Wait for all promises and summarise.
 * summarize([Promise.resolve(1), Promise.reject('e'), Promise.resolve(2)])
 *   → { fulfilled: [1, 2], rejected: ['e'] }
 *
 * How to think:
 *  1. Promise.allSettled never rejects — it gives { status, value } / { status, reason }.
 *  2. filter by status, then map to value / reason.
 *  TS tip: r.status === 'fulfilled' narrows r, so r.value is typed correctly.
 */
export async function summarize<T>(
  promises: Promise<T>[],
): Promise<{ fulfilled: T[]; rejected: unknown[] }> {
  return todo();
}

/**
 * T7. ★ Implement Promise.all yourself (don't call Promise.all / allSettled).
 * - resolves with values in INPUT order
 * - rejects as soon as any input rejects
 * - [] → resolves with []
 * - accepts plain values too (hint: Promise.resolve(x))
 *
 * How to think:
 *  1. Return new Promise((resolve, reject) => { ... }).
 *  2. Empty input → resolve([]) right away (otherwise you'd wait forever).
 *  3. Prepare results = new Array(n) and a counter `remaining = n`.
 *  4. For each value (with its index i): Promise.resolve(value).then(
 *        (v) => { results[i] = v; if (--remaining === 0) resolve(results); },
 *        reject)                       ← first rejection wins; later calls are ignored
 *  5. Writing by INDEX keeps input order even if promises finish in a different order.
 */
export function promiseAll<T>(values: (T | Promise<T>)[]): Promise<T[]> {
  return todo();
}

/**
 * T8. ★ Map with a concurrency limit: never more than `limit` fn calls in flight.
 * Results in input order.
 *
 * How to think — a pool of "workers":
 *  1. results = new Array(items.length); let next = 0 (index of the next item to process).
 *  2. A worker is an async loop: while (next < items.length) { const i = next++;
 *     results[i] = await fn(items[i]); }
 *     `next++` is safe: JS is single-threaded, nothing interrupts between reading and increment.
 *  3. Start min(limit, items.length) workers and await Promise.all(workers).
 *  4. At most `limit` fn calls are in flight because each worker awaits its current one.
 */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  return todo();
}

/**
 * T9. Convert a Node-style callback function into a promise-returning one.
 * Callback signature: (error, result) => void.
 * const readP = promisify(readFileLike);  await readP('a.txt')
 *
 * How to think:
 *  1. Return a function (...args) => new Promise(...).
 *  2. Inside, call the original fn with all args PLUS one extra argument — the callback:
 *     (error, result) => error ? reject(error) : resolve(result).
 *  This is exactly what Node's util.promisify does.
 */
export function promisify<A extends unknown[], R>(
  fn: (...args: [...A, (error: Error | null, result?: R) => void]) => void,
): (...args: A) => Promise<R> {
  return todo();
}

/**
 * T10. ★ Deduplicate in-flight requests (like React Query / SWR do).
 * - Concurrent calls with the same key share ONE promise (fn called once).
 * - After success, the value stays cached (same promise returned).
 * - After failure, the key is removed so the next call retries.
 *
 * How to think:
 *  1. Cache the PROMISE, not the value: Map<string, Promise<R>>.
 *     Storing the promise immediately is what makes CONCURRENT calls share one request.
 *  2. If the key is in the cache → return the cached promise.
 *  3. Otherwise: const promise = fn(key).catch((e) => { cache.delete(key); throw e; });
 *     cache.set(key, promise); return promise.
 *     (re-throw so callers still see the error!)
 */
export function cacheAsync<R>(fn: (key: string) => Promise<R>): (key: string) => Promise<R> {
  return todo();
}
