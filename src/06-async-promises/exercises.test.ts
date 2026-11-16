import { describe, expect, it, vi } from 'vitest';
import {
  cacheAsync,
  loadAll,
  mapLimit,
  promiseAll,
  promisify,
  quiz,
  retry,
  runSequentially,
  sleep,
  summarize,
  withTimeout,
} from './exercises';
import { defineQuiz } from '../_utils/quiz';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Runs a snippet that pushes into `order`, waits for timers to flush, returns `order`. */
async function collect(snippet: (order: string[]) => void | Promise<void>) {
  const order: string[] = [];
  await snippet(order);
  await wait(20);
  return order;
}

const expected: Record<keyof typeof quiz, () => Promise<unknown>> = {
  q1: () =>
    collect((order) => {
      order.push('A');
      setTimeout(() => order.push('B'));
      Promise.resolve().then(() => order.push('C'));
      order.push('D');
    }),
  q2: () =>
    collect((order) => {
      new Promise<void>((resolve) => {
        order.push('1');
        resolve();
        order.push('2');
      }).then(() => order.push('3'));
      order.push('4');
    }),
  q3: () =>
    collect((order) => {
      async function f() {
        order.push('a');
        await null;
        order.push('b');
      }
      f();
      order.push('c');
    }),
  q4: async () => Promise.all([1, Promise.resolve(2), 3]),
  q5: async () => Promise.allSettled([Promise.resolve(1), Promise.reject('x')]),
  q6: async () => Promise.race([wait(50).then(() => 'slow'), wait(10).then(() => 'fast')]),
  q7: async () => Promise.any([Promise.reject('a'), Promise.resolve('b')]),
  q8: async () =>
    Promise.resolve(1)
      .then((x) => x + 1)
      .then((x) => {
        throw x;
      })
      .catch((x: number) => x * 10),
  q9: async () => Promise.resolve(5).finally(() => 100),
  q10: async () => {
    async function g() {}
    return g();
  },
  q11: async () => Promise.all([]),
  q12: async () => typeof (async () => 1)(),
  // The quiz asks what happens when .then gets a NON-function (2): it is ignored and the
  // value passes through. TS forbids then(2), so the cast lets us run plain-JS behavior.
  q13: async () =>
    (Promise.resolve(1) as unknown as { then: (x: unknown) => Promise<unknown> })
      .then(2)
      .then((x: unknown) => x),
  q14: () =>
    collect((order) => {
      setTimeout(() => {
        order.push('T1');
        Promise.resolve().then(() => order.push('P'));
      });
      setTimeout(() => order.push('T2'));
    }),
  q15: async () =>
    Promise.reject(new Error('x'))
      .catch((e: unknown) => (e instanceof Error ? e.message : String(e)))
      .then((m) => m + '!'),
  q16: async () => {
    const results: number[] = [];
    await Promise.all(
      [3, 1, 2].map(async (n) => {
        await wait(n * 10);
        results.push(n);
      }),
    );
    return results;
  },
};

defineQuiz('06 async · Part 1 — Quiz', quiz, expected);

describe('06 async · Part 2 — Tasks', () => {
  it('T1 sleep', async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    const p = sleep(100).then(done);
    await vi.advanceTimersByTimeAsync(99);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('T2 loadAll runs in parallel', async () => {
    let started = 0;
    const getUser = async (id: number) => {
      started++;
      await wait(30 - id * 10); // later ids finish first
      return { id };
    };
    const promise = loadAll([1, 2], getUser);
    promise.catch(() => {}); // avoid an "unhandled rejection" if an expect below fails first
    expect(started, 'both requests must start immediately').toBe(2);
    expect(await promise).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('T3 runSequentially runs one at a time', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const order: number[] = [];
    const result = await runSequentially([3, 1, 2], async (n) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await wait(n * 5);
      order.push(n);
      inFlight--;
      return n * 10;
    });
    expect(result).toEqual([30, 10, 20]);
    expect(order).toEqual([3, 1, 2]);
    expect(maxInFlight).toBe(1);
  });

  it('T4 withTimeout', async () => {
    await expect(
      withTimeout(
        wait(5).then(() => 'ok'),
        50,
      ),
    ).resolves.toBe('ok');
    await expect(
      withTimeout(
        wait(50).then(() => 'late'),
        10,
      ),
    ).rejects.toThrow('Timeout after 10ms');
    await expect(withTimeout(Promise.reject(new Error('own')), 50)).rejects.toThrow('own');
  });

  it('T5 retry', async () => {
    let calls = 0;
    const flaky = vi.fn(async () => {
      calls++;
      if (calls < 3) throw new Error(`fail ${calls}`);
      return 'ok';
    });
    await expect(retry(flaky, 5)).resolves.toBe('ok');
    expect(flaky).toHaveBeenCalledTimes(3);

    let n = 0;
    const alwaysFails = vi.fn(async () => {
      throw new Error(`fail ${++n}`);
    });
    await expect(retry(alwaysFails, 2)).rejects.toThrow('fail 2');
    expect(alwaysFails).toHaveBeenCalledTimes(2);
  });

  it('T6 summarize', async () => {
    const inputs = [Promise.resolve(1), Promise.reject('e'), Promise.resolve(2)];
    inputs.forEach((p) => p.catch(() => {})); // keep Node quiet while the task is unsolved
    expect(await summarize(inputs)).toEqual({ fulfilled: [1, 2], rejected: ['e'] });
  });

  it('T7 promiseAll', async () => {
    const allSpy = vi.spyOn(Promise, 'all');
    const settledSpy = vi.spyOn(Promise, 'allSettled');
    await expect(
      promiseAll<string | number>([wait(20).then(() => 'slow'), 'plain', Promise.resolve(3)]),
    ).resolves.toEqual(['slow', 'plain', 3]);
    await expect(promiseAll([])).resolves.toEqual([]);
    await expect(
      promiseAll([wait(50).then(() => 1), Promise.reject(new Error('boom'))]),
    ).rejects.toThrow('boom');
    expect(allSpy, 'do not use Promise.all').not.toHaveBeenCalled();
    expect(settledSpy, 'do not use Promise.allSettled').not.toHaveBeenCalled();
    allSpy.mockRestore();
    settledSpy.mockRestore();
  });

  it('T8 mapLimit', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const result = await mapLimit([1, 2, 3, 4, 5], 2, async (n) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await wait((6 - n) * 3);
      inFlight--;
      return n * 2;
    });
    expect(result).toEqual([2, 4, 6, 8, 10]);
    expect(maxInFlight).toBe(2);
    expect(await mapLimit([], 3, async (x) => x)).toEqual([]);
  });

  it('T9 promisify', async () => {
    const divide = (a: number, b: number, cb: (err: Error | null, result?: number) => void) => {
      setTimeout(() => (b === 0 ? cb(new Error('div by 0')) : cb(null, a / b)));
    };
    const divideP = promisify<[number, number], number>(divide);
    await expect(divideP(10, 2)).resolves.toBe(5);
    await expect(divideP(1, 0)).rejects.toThrow('div by 0');
  });

  it('T10 cacheAsync', async () => {
    let attempt = 0;
    const fetcher = vi.fn(async (key: string) => {
      await wait(10);
      attempt++;
      if (key === 'flaky' && attempt === 1) throw new Error('first try fails');
      return `data:${key}`;
    });
    const cached = cacheAsync(fetcher);

    const [a, b] = await Promise.all([cached('flaky'), cached('flaky')]).catch(() => [
      'err',
      'err',
    ]);
    expect([a, b]).toEqual(['err', 'err']);
    expect(fetcher, 'concurrent calls share one request').toHaveBeenCalledTimes(1);

    await expect(cached('flaky'), 'failed key is retried').resolves.toBe('data:flaky');
    await expect(cached('flaky')).resolves.toBe('data:flaky');
    expect(fetcher, 'success is cached').toHaveBeenCalledTimes(2);
  });
});
