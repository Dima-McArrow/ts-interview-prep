import { describe, expect, it } from 'vitest';
import {
  deepClone,
  deepEqual,
  deepFreeze,
  diffKeys,
  filterObject,
  getIn,
  mapValues,
  namesByRole,
  quiz,
  setIn,
  todoReducer,
  type TodoState,
} from './exercises';
import { defineQuiz } from '../_utils/quiz';

// Widens a literal to "maybe null" so TS doesn't flag `0 ?? x` as unreachable.
const maybe = <T>(value: T): T | null => value;

const expected = {
  q1: Object.keys({ b: 1, 10: 'x', a: 2, 2: 'y' }),
  q2: (() => {
    const a = { n: { v: 1 } };
    const b = { ...a };
    b.n.v = 2;
    return a.n.v;
  })(),
  q3: JSON.parse(JSON.stringify({ d: undefined, n: NaN, f: () => 1 })),
  q4a: (0 as number) || 'default',
  q4b: maybe(0) ?? 'default',
  q5: maybe('') ?? 'fallback',
  q6: (() => {
    // A user WITHOUT a profile. Typed as {} alone, `user.profile` wouldn't compile; the cast
    // describes the real shape ("profile may be missing"), which is what ?. is for.
    const user = {} as { profile?: { name?: string } };
    return user?.profile?.name;
  })(),
  q7: Object.entries({ a: 1, b: 2 }).map(([k, v]) => k + v),
  q8: Object.fromEntries([
    ['a', 1],
    ['a', 2],
  ]),
  q9: (() => {
    const frozen = Object.freeze({ list: [1] });
    frozen.list.push(2);
    return frozen.list;
  })(),
  q10a: Object.is(NaN, NaN),
  q10b: Object.is(0, -0),
  q11: (() => {
    const t = { a: 1 };
    const r = Object.assign(t, { b: 2 });
    return r === t;
  })(),
  q12: (() => {
    const arr = [3, 1, 2];
    return arr.toSorted() === arr;
  })(),
  q13: [1, 2, 3].with(1, 99),
  q14a: typeof structuredClone({ d: new Date(0) }).d,
  q14b: typeof JSON.parse(JSON.stringify({ d: new Date(0) })).d,
  q15: { ...Object.groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even')) },
  q16a: (() => {
    const cfg = { retries: 0 };
    cfg.retries ||= 5;
    return cfg.retries;
  })(),
  q16b: (() => {
    const cfg2 = { retries: 0 as number | null };
    cfg2.retries ??= 5;
    return cfg2.retries;
  })(),
};

defineQuiz('04 objects · Part 1 — Quiz', quiz, expected);

describe('04 objects · Part 2 — Tasks', () => {
  it('T1 mapValues', () => {
    expect(mapValues({ a: 1, b: 2 }, (n) => n * 10)).toEqual({ a: 10, b: 20 });
    expect(mapValues({ a: 'x' }, (s) => s.length)).toEqual({ a: 1 });
  });

  it('T2 filterObject', () => {
    expect(filterObject({ a: 1, b: 20 }, (v) => v > 10)).toEqual({ b: 20 });
    expect(filterObject({ keep: 1, drop: 2 }, (_v, k) => k === 'keep')).toEqual({ keep: 1 });
  });

  it('T3 namesByRole', () => {
    expect(
      namesByRole([
        { name: 'Ann', role: 'admin' },
        { name: 'Bob', role: 'dev' },
        { name: 'Cid', role: 'dev' },
      ]),
    ).toEqual({ admin: ['Ann'], dev: ['Bob', 'Cid'] });
  });

  it('T4 deepClone', () => {
    const src = {
      n: 1,
      s: 'x',
      nil: null,
      list: [1, { deep: true }],
      date: new Date('2020-01-01'),
      map: new Map([['k', { v: 1 }]]),
      set: new Set([1, 2]),
    };
    const copy = deepClone(src);
    expect(copy).toEqual(src);
    expect(copy).not.toBe(src);
    expect(copy.list).not.toBe(src.list);
    expect(copy.list[1]).not.toBe(src.list[1]);
    expect(copy.date).toBeInstanceOf(Date);
    expect(copy.date).not.toBe(src.date);
    expect(copy.date.getTime()).toBe(src.date.getTime());
    expect(copy.map).toBeInstanceOf(Map);
    expect(copy.map.get('k')).not.toBe(src.map.get('k'));
    expect(copy.set).toBeInstanceOf(Set);
    expect(copy.set).not.toBe(src.set);
    expect(deepClone(5)).toBe(5);
    expect(deepClone(null)).toBe(null);
  });

  it('T5 deepEqual', () => {
    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual([1], { 0: 1 })).toBe(false);
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual(null, {})).toBe(false);
    expect(deepEqual('1', 1)).toBe(false);
  });

  it('T6 deepFreeze', () => {
    const obj = deepFreeze({ a: { b: { c: 1 } }, list: [{ x: 1 }] });
    expect(Object.isFrozen(obj)).toBe(true);
    expect(Object.isFrozen(obj.a)).toBe(true);
    expect(Object.isFrozen(obj.a.b)).toBe(true);
    expect(Object.isFrozen(obj.list)).toBe(true);
    expect(Object.isFrozen(obj.list[0])).toBe(true);
  });

  it('T7 getIn', () => {
    expect(getIn({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
    expect(getIn({ a: null }, 'a.b.c', 'none')).toBe('none');
    expect(getIn({ a: { b: 0 } }, 'a.b', 5)).toBe(0);
    expect(getIn({ list: [{ id: 7 }] }, 'list.0.id')).toBe(7);
    expect(getIn(undefined, 'a')).toBeUndefined();
  });

  it('T8 setIn', () => {
    const src = { a: { b: 1 }, x: {} };
    const result = setIn(src, ['a', 'c'], 2);
    expect(result).toEqual({ a: { b: 1, c: 2 }, x: {} });
    expect(src).toEqual({ a: { b: 1 }, x: {} });
    expect(result.x, 'untouched branch keeps reference').toBe(src.x);
    expect(setIn({}, ['p', 'q', 'r'], 'deep')).toEqual({ p: { q: { r: 'deep' } } });
  });

  it('T9 diffKeys', () => {
    expect(diffKeys({ a: 1, b: 2, c: 3 }, { a: 1, b: 20, d: 4 })).toEqual({
      added: ['d'],
      removed: ['c'],
      changed: ['b'],
    });
    expect(diffKeys({}, {})).toEqual({ added: [], removed: [], changed: [] });
  });

  it('T10 todoReducer (immutable)', () => {
    // The state is frozen on purpose: any mutation in your reducer (push, splice, assignment)
    // throws right away. Object.freeze([]) is typed `readonly never[]`, which doesn't fit the
    // mutable `todos: Todo[]`; `as never` fits any type, so it silences only that mismatch.
    const s0: TodoState = Object.freeze({ todos: Object.freeze([]) as never, nextId: 1 });
    const s1 = todoReducer(s0, { type: 'add', text: 'learn' });
    expect(s1).toEqual({ todos: [{ id: 1, text: 'learn', done: false }], nextId: 2 });
    const s2 = todoReducer(deepFreezeForTest(s1), { type: 'toggle', id: 1 });
    expect(s2.todos[0]!.done).toBe(true);
    expect(s1.todos[0]!.done, 'previous state untouched').toBe(false);
    const s3 = todoReducer(deepFreezeForTest(s2), { type: 'remove', id: 1 });
    expect(s3.todos).toEqual([]);
    expect(s3.nextId).toBe(2);
  });
});

// Local helper so T10 doesn't depend on your T6 implementation.
function deepFreezeForTest<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreezeForTest);
    Object.freeze(value);
  }
  return value;
}
