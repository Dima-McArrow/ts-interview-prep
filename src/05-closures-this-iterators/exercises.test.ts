import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCounter,
  createStore,
  curry,
  debounce,
  fibonacci,
  idGenerator,
  memoize,
  myBind,
  once,
  quiz,
  range,
  take,
  throttle,
} from './exercises';
import { defineQuiz } from '../_utils/quiz';

function f(this: { v: number } | undefined) {
  return this?.v;
}
function* g() {
  yield 1;
  yield 2;
  return 3;
}

const expected = {
  q1: (() => {
    const makeAdder = (x: number) => (y: number) => x + y;
    return makeAdder(5)(3);
  })(),
  q2: (() => {
    let n = 1;
    const get = () => n;
    n = 2;
    return get();
  })(),
  q3: (() => {
    const fns: (() => number)[] = [];
    // `var` on purpose: the quiz checks that var is ONE variable for the whole loop.
    // eslint-disable-next-line no-var
    for (var i = 0; i < 3; i++) fns.push(() => i);
    return fns.map((fn) => fn());
  })(),
  q4: (() => {
    const fns: (() => number)[] = [];
    for (let i = 0; i < 3; i++) fns.push(() => i);
    return fns.map((fn) => fn());
  })(),
  q5: (() => {
    const obj = {
      v: 1,
      get() {
        return this.v;
      },
    };
    return obj.get.bind({ v: 2 })();
  })(),
  q6: f.call({ v: 7 }),
  q7: f.bind({ v: 1 }).call({ v: 2 }),
  q8: (() => {
    const o = {
      v: 5,
      regular() {
        return [1].map(() => this.v)[0];
      },
    };
    return o.regular();
  })(),
  q9: [...g()],
  q10: (() => {
    const it = g();
    it.next();
    it.next();
    return it.next();
  })(),
  q11: (() => {
    const counter = (() => {
      let c = 0;
      return () => c++;
    })();
    counter();
    counter();
    return counter();
  })(),
  q12a: typeof (() => {}).prototype,
  q12b: typeof function () {}.prototype,
  q13: (() => {
    const [, b] = (function* () {
      yield 'x';
      yield 'y';
      yield 'z';
    })();
    return b;
  })(),
  q14: (() => {
    const x = 'global';
    void x;
    function outer() {
      const x = 'outer';
      return function inner() {
        return x;
      };
    }
    return outer()();
  })(),
  q15: (() => {
    const add = (a: number) => (b: number) => a + b;
    return [1, 2, 3].map(add(10));
  })(),
  q16: (() => {
    const gen = (function* () {
      yield 1;
      yield 2;
    })();
    const first = [...gen];
    const second = [...gen];
    return [first, second];
  })(),
};

defineQuiz('05 closures · Part 1 — Quiz', quiz, expected);

describe('05 closures · Part 2 — Tasks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('T1 createCounter', () => {
    const c = createCounter(10);
    c.increment();
    c.increment();
    c.decrement();
    expect(c.value()).toBe(11);
    c.reset();
    expect(c.value()).toBe(10);
    const other = createCounter();
    expect(other.value(), 'counters are independent').toBe(0);
  });

  it('T2 once', () => {
    const spy = vi.fn((x: number) => x * 2);
    const onceSpy = once(spy);
    expect(onceSpy(2)).toBe(4);
    expect(onceSpy(100)).toBe(4);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('T3 memoize', () => {
    const spy = vi.fn((a: number, b: number) => a + b);
    const add = memoize(spy);
    expect(add(1, 2)).toBe(3);
    expect(add(1, 2)).toBe(3);
    expect(add(2, 1)).toBe(3);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('T4 debounce', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 100);
    debounced('a');
    vi.advanceTimersByTime(50);
    debounced('b');
    vi.advanceTimersByTime(50);
    debounced('c');
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('c');

    debounced('d');
    debounced.cancel();
    vi.advanceTimersByTime(200);
    expect(spy, 'cancel drops the pending call').toHaveBeenCalledTimes(1);
  });

  it('T5 throttle', () => {
    const spy = vi.fn();
    const throttled = throttle(spy, 100);
    throttled(1); // runs immediately
    throttled(2); // ignored
    vi.advanceTimersByTime(50);
    throttled(3); // ignored
    vi.advanceTimersByTime(60);
    throttled(4); // 110ms passed → runs
    expect(spy.mock.calls).toEqual([[1], [4]]);
  });

  it('T6 curry', () => {
    const sum3 = (a: number, b: number, c: number) => a + b + c;
    const curried = curry(sum3);
    expect(curried(1)(2)(3)).toBe(6);
    expect(curried(1, 2)(3)).toBe(6);
    expect(curried(1)(2, 3)).toBe(6);
    expect(curried(1, 2, 3)).toBe(6);
    const add1 = curried(1);
    expect(add1(1)(1), 'partials are reusable').toBe(3);
    expect(add1(10)(10)).toBe(21);
  });

  it('T7 myBind', () => {
    const bindSpy = vi.spyOn(Function.prototype, 'bind');
    function greet(this: { name: string }, greeting: string, mark: string) {
      return `${greeting} ${this.name}${mark}`;
    }
    const bound = myBind(greet, { name: 'Ann' }, 'Hi');
    expect(bound('!')).toBe('Hi Ann!');
    expect(bindSpy, 'do not use .bind()').not.toHaveBeenCalled();
    bindSpy.mockRestore();
  });

  it('T8 idGenerator', () => {
    const ids = idGenerator('user');
    expect(ids.next().value).toBe('user-1');
    expect(ids.next().value).toBe('user-2');
    expect(ids.next().value).toBe('user-3');
  });

  it('T9 take (lazy)', () => {
    function* naturals() {
      let n = 1;
      while (true) yield n++;
    }
    expect([...take(naturals(), 3)]).toEqual([1, 2, 3]);
    expect([...take([1, 2], 5)]).toEqual([1, 2]);
    expect([...take([1, 2], 0)]).toEqual([]);
  });

  it('T10 fibonacci', () => {
    const fib = fibonacci();
    const first10 = Array.from({ length: 10 }, () => fib.next().value);
    expect(first10).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  });

  it('T11 range (reusable iterable)', () => {
    const r = range(1, 3);
    expect(Array.isArray(r), 'must not be an array').toBe(false);
    expect([...r]).toEqual([1, 2, 3]);
    expect([...r], 'second iteration works too').toEqual([1, 2, 3]);
    expect([...range(0, 10, 5)]).toEqual([0, 5, 10]);
  });

  it('T12 createStore', () => {
    const store = createStore(
      (state: number, action: 'inc' | 'dec') => (action === 'inc' ? state + 1 : state - 1),
      0,
    );
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.dispatch('inc');
    store.dispatch('inc');
    expect(store.getState()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.dispatch('dec');
    expect(store.getState()).toBe(1);
    expect(listener, 'unsubscribed listener is not called').toHaveBeenCalledTimes(2);
  });
});
