/**
 * SOLUTIONS 06 — ASYNC, PROMISES, EVENT LOOP (with detailed explanations)
 * Open only after you tried yourself :)
 *
 * Format for every task: solution → WHY it works → alternatives / pitfalls.
 */

// ===========================================================================
// PART 1 — QUIZ ANSWERS
// ===========================================================================
export const quiz = {
  // Q1: ['A', 'D', 'C', 'B']
  // A and D are synchronous. C is a microtask (then). B is a macrotask (setTimeout).
  // Order: all sync → all microtasks → macrotasks.
  q1: ['A', 'D', 'C', 'B'],

  // Q2: ['1', '2', '4', '3']
  // The executor runs synchronously (1, 2 — resolve() doesn't stop it), then the sync
  // push of 4, and only then the then-callback (microtask) pushes 3.
  q2: ['1', '2', '4', '3'],

  // Q3: ['a', 'c', 'b']
  // Calling f() runs its body synchronously until `await` (pushes a). Everything after
  // await is a microtask, so c (sync) comes before b.
  q3: ['a', 'c', 'b'],

  // Q4: [1, 2, 3]
  // Plain values are treated as already-fulfilled promises. Order = input order.
  q4: [1, 2, 3],

  // Q5: [{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: 'x' }]
  // allSettled never rejects; each entry describes the outcome of one input.
  q5: [
    { status: 'fulfilled', value: 1 },
    { status: 'rejected', reason: 'x' },
  ],

  // Q6: 'fast'
  // race settles with the first promise to settle (10ms < 50ms).
  q6: 'fast',

  // Q7: 'b'
  // any ignores rejections and resolves with the first fulfilled promise.
  q7: 'b',

  // Q8: 20
  // 1 → then(x + 1) = 2 → then(throw 2) → catch receives 2 → returns 2 * 10 = 20.
  q8: 20,

  // Q9: 5
  // finally's return value is ignored (unless it throws or returns a rejected promise).
  q9: 5,

  // Q10: undefined
  // An async function without `return` resolves to undefined.
  q10: undefined,

  // Q11: []
  // Nothing to wait for → resolves immediately with an empty array.
  q11: [],

  // Q12: 'object'
  // Calling an async function returns a Promise (an object), even without await.
  q12: 'object',

  // Q13: 1
  // then(2): a non-function handler is ignored and the value passes through unchanged.
  q13: 1,

  // Q14: ['T1', 'P', 'T2']
  // After EACH macrotask (T1), all microtasks (P) run before the next macrotask (T2).
  q14: ['T1', 'P', 'T2'],

  // Q15: 'x!'
  // catch turns the rejection into a value ('x'), then continues with 'x' + '!'.
  q15: 'x!',

  // Q16: [1, 2, 3]
  // Promise.all would return results in INPUT order, but here we push inside the
  // callbacks — those run in COMPLETION order: 10ms (1), 20ms (2), 30ms (3).
  q16: [1, 2, 3],
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. sleep
 * WHY: setTimeout calls resolve after ms. The classic "promisify a callback API" pattern.
 * Node also has it built-in: import { setTimeout as sleep } from 'node:timers/promises'.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * T2. loadAll
 * WHY: map starts every request at once (each getUser call returns a pending promise);
 * Promise.all waits for all of them and keeps input order.
 * Total time ≈ the slowest request, not the sum.
 */
export async function loadAll<T>(ids: number[], getUser: (id: number) => Promise<T>): Promise<T[]> {
  return Promise.all(ids.map((id) => getUser(id)));
}

/**
 * T3. runSequentially
 * WHY: await inside for...of pauses the loop, so the next task starts only after the
 * previous one finished. Total time = sum of all tasks.
 * Alternative: items.reduce((chain, item) => chain.then(...), Promise.resolve([])) —
 * the pre-async/await way; harder to read.
 */
export async function runSequentially<T, R>(
  items: T[],
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (const item of items) {
    results.push(await task(item));
  }
  return results;
}

/**
 * T4. withTimeout
 * WHY: race between the real promise and a promise that rejects after ms.
 *  - If the real one settles first (success OR error), race takes its outcome.
 *  - If the timer fires first, race rejects with the timeout error.
 * finally clears the timer either way (otherwise it may keep a Node process alive).
 * Note: the original operation keeps running — real cancellation needs AbortController (lesson 07).
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * T5. retry
 * WHY: `return await fn()` makes a rejection throw INSIDE this try, so catch can handle it.
 * (With `return fn()` the rejected promise would be returned as is and escape.)
 * Production version: add a delay between attempts (exponential backoff + jitter) and
 * retry only on retriable errors (network, 429, 5xx — lesson 07).
 */
export async function retry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/**
 * T6. summarize
 * WHY: allSettled always resolves with one descriptor per input. The status check narrows
 * the TS type, so r.value / r.reason are available without casts.
 */
export async function summarize<T>(
  promises: Promise<T>[],
): Promise<{ fulfilled: T[]; rejected: unknown[] }> {
  const results = await Promise.allSettled(promises);
  return {
    fulfilled: results.filter((r) => r.status === 'fulfilled').map((r) => r.value),
    rejected: results.filter((r) => r.status === 'rejected').map((r) => r.reason),
  };
}

/**
 * T7. promiseAll (polyfill)
 * WHY:
 *  - results[index] = value keeps INPUT order regardless of completion order;
 *  - `remaining` counts down; when it hits 0, everything is done → resolve;
 *  - passing `reject` directly means the FIRST rejection settles the outer promise;
 *    later reject/resolve calls are ignored (a promise settles only once);
 *  - Promise.resolve(value) wraps plain values (and adopts thenables).
 *  - Empty input must resolve immediately, otherwise remaining never reaches 0.
 */
export function promiseAll<T>(values: (T | Promise<T>)[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(values.length);
    let remaining = values.length;
    if (remaining === 0) return resolve([]);

    values.forEach((value, index) => {
      Promise.resolve(value).then((result) => {
        results[index] = result;
        if (--remaining === 0) resolve(results);
      }, reject);
    });
  });
}

/**
 * T8. mapLimit
 * WHY: we start `limit` workers. Each worker loops: take the next index, await fn, repeat.
 * Since each worker awaits its current task, at most `limit` tasks run at the same time.
 * `nextIndex++` is race-free: JS runs one piece of code at a time, and there's no await
 * between reading and incrementing.
 * Writing results by index keeps input order.
 * Library equivalent: p-limit / p-map.
 */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index]!);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * T9. promisify
 * WHY: we call the original function with the user's args plus our own callback, and the
 * callback settles the promise: error → reject, otherwise → resolve(result).
 * Node's util.promisify does exactly this (plus a few special cases).
 */
export function promisify<A extends unknown[], R>(
  fn: (...args: [...A, (error: Error | null, result?: R) => void]) => void,
): (...args: A) => Promise<R> {
  return (...args) =>
    new Promise<R>((resolve, reject) => {
      // `result` is optional in the callback type (it's absent on error). When error is null,
      // the Node callback convention guarantees the result, so `as R` is safe here.
      fn(...args, (error, result) => (error ? reject(error) : resolve(result as R)));
    });
}

/**
 * T10. cacheAsync (request deduplication)
 * WHY:
 *  - we store the PROMISE synchronously, BEFORE it settles → a second concurrent call finds
 *    it in the cache and shares the same in-flight request (fn is called once);
 *  - on failure, the catch handler deletes the key (so the next call retries) and re-throws
 *    (so callers still get the error);
 *  - on success the settled promise stays in the cache → later calls get the value instantly.
 * This is the core idea of React Query / SWR / DataLoader.
 */
export function cacheAsync<R>(fn: (key: string) => Promise<R>): (key: string) => Promise<R> {
  const cache = new Map<string, Promise<R>>();
  return (key) => {
    const cached = cache.get(key);
    if (cached) return cached;

    const promise = fn(key).catch((error: unknown) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, promise);
    return promise;
  };
}
