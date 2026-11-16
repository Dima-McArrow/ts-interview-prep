import { describe, expect, it } from 'vitest';
import {
  LRUCache,
  commonItems,
  firstDuplicate,
  frequencyMap,
  groupBy,
  hasCommon,
  invert,
  isAnagram,
  longestUniqueRun,
  mergeCounts,
  quiz,
  twoSum,
  uniqueBy,
} from './exercises';
import { defineQuiz } from '../_utils/quiz';

const expected = {
  q1: (() => {
    const m = new Map<string, number>();
    m.set('a', 1).set('a', 2);
    return m.size;
  })(),
  q2: new Map([['a', 1]]).get('b'),
  q3: new Set<unknown>([1, '1', 1, NaN, NaN]).size,
  q4: JSON.stringify(new Map([['x', 1]])),
  q5: (() => {
    const s = new Set([1, 2]);
    s.add(2).add(3);
    return [...s];
  })(),
  q6: (() => {
    const m = new Map<object, string>();
    m.set({}, 'value');
    return m.get({});
  })(),
  q7: Array.isArray(new Map([['a', 1]]).keys()),
  q8: (() => {
    const obj: Record<string, string> = {};
    obj[1] = 'a';
    obj['1'] = 'b';
    return Object.keys(obj);
  })(),
  q9: [...new Set([1, 2, 3]).difference(new Set([2, 3, 4]))],
  q10: Object.fromEntries(
    new Map([
      ['a', 1],
      ['b', 2],
    ]),
  ),
  q11: new Map<unknown, string>([[1, 'one']]).has('1'),
  q12: new Set().delete('x'),
  q13: new Set('banana').size,
  q14: (() => {
    const order: string[] = [];
    new Map([
      ['b', 1],
      ['a', 2],
    ]).forEach((_v, k) => order.push(k));
    return order;
  })(),
  q15: [
    ...new Map([
      ['a', 1],
      ['b', 2],
    ]),
  ],
  q16: (() => {
    const m = new Map([
      ['x', 1],
      ['y', 2],
    ]);
    m.set('x', 100);
    return [...m.keys()];
  })(),
};

defineQuiz('02 map-set · Part 1 — Quiz', quiz, expected);

describe('02 map-set · Part 2 — Tasks', () => {
  it('T1 frequencyMap', () => {
    const result = frequencyMap(['a', 'b', 'a']);
    expect(result).toBeInstanceOf(Map);
    expect([...result]).toEqual([
      ['a', 2],
      ['b', 1],
    ]);
  });

  it('T2 firstDuplicate', () => {
    expect(firstDuplicate([2, 1, 3, 1, 2])).toBe(1);
    expect(firstDuplicate(['a', 'b'])).toBeUndefined();
    expect(firstDuplicate([])).toBeUndefined();
  });

  it('T3 hasCommon', () => {
    expect(hasCommon([1, 2], [3, 2])).toBe(true);
    expect(hasCommon([1, 2], [3, 4])).toBe(false);
    expect(hasCommon([], [1])).toBe(false);
  });

  it('T4 groupBy', () => {
    const result = groupBy(['one', 'two', 'three'], (s) => s.length);
    expect(result).toBeInstanceOf(Map);
    expect([...result]).toEqual([
      [3, ['one', 'two']],
      [5, ['three']],
    ]);
  });

  it('T5 commonItems', () => {
    expect(commonItems([1, 2, 2, 3, 4], [4, 2, 2, 9])).toEqual([2, 4]);
    expect(commonItems([1], [2])).toEqual([]);
  });

  it('T6 isAnagram', () => {
    expect(isAnagram('Listen', 'Silent')).toBe(true);
    expect(isAnagram('Dormitory', 'dirty room')).toBe(true);
    expect(isAnagram('aab', 'abb')).toBe(false);
    expect(isAnagram('abc', 'abcd')).toBe(false);
  });

  it('T7 twoSum', () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
    expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]);
    expect(twoSum([3, 3], 6)).toEqual([0, 1]);
    expect(twoSum([1, 2], 10)).toBeNull();
  });

  it('T8 uniqueBy', () => {
    expect(
      uniqueBy(
        [
          { id: 1, v: 'a' },
          { id: 1, v: 'b' },
          { id: 2, v: 'c' },
        ],
        (x) => x.id,
      ),
    ).toEqual([
      { id: 1, v: 'a' },
      { id: 2, v: 'c' },
    ]);
  });

  it('T9 mergeCounts (inputs not mutated)', () => {
    const a = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    const b = new Map([
      ['b', 3],
      ['c', 4],
    ]);
    expect(Object.fromEntries(mergeCounts(a, b))).toEqual({ a: 1, b: 5, c: 4 });
    expect(Object.fromEntries(a)).toEqual({ a: 1, b: 2 });
    expect(Object.fromEntries(b)).toEqual({ b: 3, c: 4 });
  });

  it('T10 invert', () => {
    const result = invert(
      new Map([
        ['a', 1],
        ['b', 2],
      ]),
    );
    expect([...result]).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
  });

  it('T11 LRUCache', () => {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    expect(cache.get('a')).toBe(1); // 'a' becomes most recent → order: b, a
    expect(cache.keys()).toEqual(['b', 'a']);
    cache.put('c', 3); // evicts 'b' (least recently used)
    expect(cache.get('b')).toBeUndefined();
    expect(cache.keys()).toEqual(['a', 'c']);
    cache.put('a', 10); // update refreshes 'a'
    expect(cache.keys()).toEqual(['c', 'a']);
    cache.put('d', 4); // evicts 'c'
    expect(cache.keys()).toEqual(['a', 'd']);
    expect(cache.get('a')).toBe(10);
  });

  it('T12 longestUniqueRun', () => {
    expect(longestUniqueRun('abcabcbb')).toBe(3);
    expect(longestUniqueRun('bbbb')).toBe(1);
    expect(longestUniqueRun('pwwkew')).toBe(3);
    expect(longestUniqueRun('abba')).toBe(2);
    expect(longestUniqueRun('')).toBe(0);
  });
});
