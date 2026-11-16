import { describe, expect, it } from 'vitest';
import {
  compose,
  fullName,
  omit,
  parseCoords,
  pick,
  quiz,
  renameKeys,
  setCity,
  sumAll,
  swapEnds,
  toPublicUser,
  updateById,
  withDefaults,
  type Profile,
} from './exercises';
import { defineQuiz } from '../_utils/quiz';

const expected = {
  q1: (() => {
    const [a, , b] = [1, 2, 3];
    return [a, b];
  })(),
  q2: (() => {
    const [, ...rest] = [1];
    return rest;
  })(),
  q3: (() => {
    const { a = 5 } = { a: null };
    return a;
  })(),
  q4: (() => {
    const { a = 5 } = { a: undefined };
    return a;
  })(),
  q5: (() => {
    const o = { x: 1, y: 2 };
    const patch = { y: 20 };
    return { ...o, x: 10, ...patch };
  })(),
  q6: (() => {
    const arr = [[1], [2]];
    const copy = [...arr];
    copy[0]!.push(9);
    return arr;
  })(),
  q7: Math.max(...([] as number[])),
  q8: (() => {
    const { length } = 'hello';
    return length;
  })(),
  q9: (() => {
    const [first] = new Set(['x', 'y']);
    return first;
  })(),
  q10: (() => {
    function f(...args: number[]) {
      return args.length;
    }
    return f(...[1, 2], 3);
  })(),
  q11: (() => {
    let a = 1;
    let b = 2;
    [a, b] = [b, a];
    return [a, b];
  })(),
  q12: (() => {
    const original = { x: 1, nested: { y: 2 } };
    const { ...copy } = original;
    return copy.nested === original.nested;
  })(),
  q13: (() => {
    const [a = 1, b = a * 2] = [] as number[];
    return [a, b];
  })(),
  ...(() => {
    function g({ x = 1 }: { x?: number } = { x: 2 }) {
      return x;
    }
    return { q14a: g(), q14b: g({}) };
  })(),
  q15: (() => {
    const { 0: first, length } = ['a', 'b', 'c'];
    return [first, length];
  })(),
  q16: Object.keys({ ...[10, 20] }),
};

defineQuiz('03 spread-rest · Part 1 — Quiz', quiz, expected);

describe('03 spread-rest · Part 2 — Tasks', () => {
  it('T1 sumAll', () => {
    expect(sumAll()).toBe(0);
    expect(sumAll(1, 2, 3)).toBe(6);
  });

  it('T2 omit', () => {
    const src = { a: 1, b: 2, c: 3 };
    expect(omit(src, 'a', 'c')).toEqual({ b: 2 });
    expect(omit(src)).toEqual(src);
    expect(omit(src)).not.toBe(src);
    expect(src).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('T3 pick', () => {
    const src: { a: number; b: number; c?: number } = { a: 1, b: 2 };
    expect(pick(src, 'a')).toEqual({ a: 1 });
    expect(pick(src, 'a', 'c')).toStrictEqual({ a: 1 });
  });

  it('T4 toPublicUser', () => {
    expect(toPublicUser({ id: 1, name: 'Ann', password: 'x', token: 'y' })).toStrictEqual({
      id: 1,
      name: 'Ann',
    });
  });

  it('T5 withDefaults ignores undefined overrides', () => {
    const defaults = { host: 'localhost', port: 80 };
    expect(withDefaults(defaults, { port: undefined, host: 'api' })).toEqual({
      host: 'api',
      port: 80,
    });
    expect(withDefaults(defaults, {})).toEqual(defaults);
    expect(withDefaults(defaults, { port: 0 })).toEqual({ host: 'localhost', port: 0 });
    expect(defaults).toEqual({ host: 'localhost', port: 80 });
  });

  it('T6 setCity (immutable nested update)', () => {
    const profile: Profile = {
      name: 'Ann',
      address: { city: 'Paris', zip: '75001' },
      settings: { theme: 'dark' },
    };
    const updated = setCity(profile, 'Lyon');
    expect(updated.address.city).toBe('Lyon');
    expect(updated.address.zip).toBe('75001');
    expect(profile.address.city, 'original must stay Paris').toBe('Paris');
    expect(updated).not.toBe(profile);
    expect(updated.address).not.toBe(profile.address);
    expect(updated.settings, 'unchanged branch keeps reference').toBe(profile.settings);
  });

  it('T7 swapEnds', () => {
    const arr = [1, 2, 3, 4];
    expect(swapEnds(arr)).toEqual([4, 2, 3, 1]);
    expect(arr).toEqual([1, 2, 3, 4]);
    expect(swapEnds([1])).toEqual([1]);
    expect(swapEnds([])).toEqual([]);
  });

  it('T8 parseCoords', () => {
    expect(parseCoords('48.85,2.35')).toEqual({ lat: 48.85, lng: 2.35 });
    expect(parseCoords('-1,0')).toEqual({ lat: -1, lng: 0 });
  });

  it('T9 fullName', () => {
    expect(fullName({ first: 'John', last: 'Doe' })).toBe('John Doe');
    expect(fullName({ first: 'John', middle: 'R.', last: 'Doe' })).toBe('John R. Doe');
  });

  it('T10 updateById', () => {
    const list = [
      { id: 1, done: false },
      { id: 2, done: false },
    ];
    const result = updateById(list, 2, { done: true });
    expect(result).toEqual([
      { id: 1, done: false },
      { id: 2, done: true },
    ]);
    expect(result).not.toBe(list);
    expect(result[0], 'untouched item keeps reference').toBe(list[0]);
    expect(list[1]!.done, 'input not mutated').toBe(false);
  });

  it('T11 compose', () => {
    const add1 = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    expect(compose(add1, double)(5)).toBe(11);
    expect(compose(double, add1)(5)).toBe(12);
    expect(compose<number>()(5)).toBe(5);
  });

  it('T12 renameKeys', () => {
    expect(renameKeys({ a: 1, b: 2 }, { a: 'alpha' })).toEqual({ alpha: 1, b: 2 });
    expect(renameKeys({}, { a: 'x' })).toEqual({});
  });
});
