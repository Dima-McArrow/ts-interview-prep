import { describe, expect, it } from 'vitest';
import {
  activeAdultNames,
  chunk,
  countWords,
  doubleEvens,
  flattenDeep,
  isSortedAsc,
  partition,
  quiz,
  range,
  removeAt,
  sortPeople,
  sumBy,
  topNames,
  uniq,
  zip,
  type Person,
} from './exercises';
import { defineQuiz } from '../_utils/quiz';

// Expected quiz values are computed by running the very same snippets.
const expected = {
  q1: [1, 2, 3].map((n) => n * 2),
  q2: ['1', '2', '3'].map(parseInt),
  q3: [10, 1, 5, 100].sort(),
  q4: (() => {
    const arr = [1, 2, 3];
    return arr.push(4);
  })(),
  ...(() => {
    const arr = [1, 2, 3, 4, 5];
    const removed = arr.splice(1, 2);
    return { q5a: removed, q5b: arr };
  })(),
  q6: ([] as number[]).every((x) => x > 100),
  q7a: [NaN].includes(NaN),
  q7b: [NaN].indexOf(NaN),
  q8: [1, [2, [3, [4]]]].flat(),
  q9: [1, 2, 3].reduce((acc, n) => acc + n, ''),
  q10: (() => {
    const a = [{ n: 1 }];
    const b = a.slice();
    b[0]!.n = 99;
    return a[0]!.n;
  })(),
  q11: (() => {
    const grid: string[][] = new Array(2).fill([]);
    grid[0]!.push('x');
    return grid;
  })(),
  q12: [1, 2, 3].forEach((n) => n * 2),
  q13a: [1, 2, 3].at(-1),
  q13b: [1, 2, 3].slice(-2),
  ...(() => {
    const nums = [3, 1, 2];
    const sorted = nums.toSorted();
    return { q14a: sorted, q14b: nums };
  })(),
  q15a: [1, 2, 3].find((n) => n > 10),
  q15b: [1, 2, 3].findIndex((n) => n > 10),
  q16: [1, 2, 3, 4].flatMap((n) => (n % 2 === 0 ? [n, n] : [])),
  q17: ['a', 'b', 'c'].map((_ch, i, arr) => arr.length - i),
  q18a: ([1, 2] as number[]) === ([1, 2] as number[]),
  q18b: (() => {
    const a = [1, 2];
    const b = a;
    b.push(3);
    return a;
  })(),
};

defineQuiz('01 arrays · Part 1 — Quiz', quiz, expected);

describe('01 arrays · Part 2 — Tasks', () => {
  it('T1 doubleEvens', () => {
    const input = [1, 2, 3, 4];
    expect(doubleEvens(input)).toEqual([4, 8]);
    expect(doubleEvens([1, 3])).toEqual([]);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  it('T2 sumBy', () => {
    expect(sumBy([{ price: 2 }, { price: 3 }], (x) => x.price)).toBe(5);
    // A bare [] is typed never[], so `x.price` wouldn't compile. The cast only says what the
    // empty array WOULD hold; it can't lie, because there is nothing inside.
    expect(sumBy([] as { price: number }[], (x) => x.price)).toBe(0);
  });

  it('T3 countWords', () => {
    expect(countWords(['a', 'b', 'a'])).toEqual({ a: 2, b: 1 });
    expect(countWords([])).toEqual({});
  });

  it('T4 uniq', () => {
    expect(uniq([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
    expect(uniq(['x', 'x'])).toEqual(['x']);
    expect(uniq([])).toEqual([]);
  });

  it('T5 chunk', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    expect(chunk([], 3)).toEqual([]);
  });

  it('T6 partition', () => {
    expect(partition([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([
      [2, 4],
      [1, 3],
    ]);
    expect(partition([], () => true)).toEqual([[], []]);
  });

  it('T7 sortPeople (sorted + not mutated)', () => {
    const people: Person[] = [
      { name: 'Zed', age: 30 },
      { name: 'Ann', age: 25 },
      { name: 'Bob', age: 30 },
    ];
    const snapshot = structuredClone(people);
    expect(sortPeople(people).map((p) => p.name)).toEqual(['Ann', 'Bob', 'Zed']);
    expect(people, 'input must not be mutated').toEqual(snapshot);
  });

  it('T8 topNames (not mutated)', () => {
    const players = [
      { name: 'a', score: 1 },
      { name: 'b', score: 5 },
      { name: 'c', score: 3 },
    ];
    expect(topNames(players, 2)).toEqual(['b', 'c']);
    expect(topNames(players, 10)).toEqual(['b', 'c', 'a']);
    expect(players[0]!.name, 'input must not be mutated').toBe('a');
  });

  it('T9 zip', () => {
    expect(zip([1, 2, 3], ['a', 'b'])).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
    expect(zip([], [1])).toEqual([]);
  });

  it('T10 range', () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(2, 10, 3)).toEqual([2, 5, 8]);
    expect(range(3, 3)).toEqual([]);
  });

  it('T11 removeAt (not mutated)', () => {
    const arr = ['a', 'b', 'c'];
    expect(removeAt(arr, 1)).toEqual(['a', 'c']);
    expect(removeAt(arr, 0)).toEqual(['b', 'c']);
    expect(arr).toEqual(['a', 'b', 'c']);
  });

  it('T12 isSortedAsc', () => {
    expect(isSortedAsc([1, 2, 2, 5])).toBe(true);
    expect(isSortedAsc([3, 1])).toBe(false);
    expect(isSortedAsc([])).toBe(true);
    expect(isSortedAsc([7])).toBe(true);
  });

  it('T13 flattenDeep', () => {
    expect(flattenDeep([1, [2, [3, [4]], 5]])).toEqual([1, 2, 3, 4, 5]);
    expect(flattenDeep([[[['deep']]]])).toEqual(['deep']);
    expect(flattenDeep([])).toEqual([]);
  });

  it('T14 activeAdultNames', () => {
    expect(
      activeAdultNames([
        { name: 'ann', age: 20, active: true },
        { name: 'bob', age: 15, active: true },
        { name: 'cid', age: 40, active: false },
        { name: 'dan', age: 18, active: true },
      ]),
    ).toBe('ANN, DAN');
    expect(activeAdultNames([])).toBe('');
  });
});
