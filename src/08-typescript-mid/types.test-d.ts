/**
 * Type-level tests for PART 2 of exercises.ts.
 * They are checked by the TypeScript compiler (vitest typecheck), not executed.
 * Red squiggles here = a type task is not solved yet.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type {
  DeepReadonly,
  ElementType,
  Getters,
  KeysOfType,
  MyOmit,
  MyPartial,
  MyPick,
  MyReadonly,
  MyReturnType,
  Nullable,
  UnwrapPromise,
  ValueOf,
} from './exercises';

type User = { id: number; name: string; tags: string[]; address: { city: string } };

describe('08 typescript · Part 2 — Type tasks', () => {
  it('TT1 MyPartial', () => {
    expectTypeOf<MyPartial<User>>().toEqualTypeOf<{
      id?: number;
      name?: string;
      tags?: string[];
      address?: { city: string };
    }>();
  });

  it('TT2 MyReadonly', () => {
    expectTypeOf<MyReadonly<{ a: number; b: string }>>().toEqualTypeOf<{
      readonly a: number;
      readonly b: string;
    }>();
  });

  it('TT3 MyPick', () => {
    expectTypeOf<MyPick<User, 'id' | 'name'>>().toEqualTypeOf<{ id: number; name: string }>();
  });

  it('TT4 MyOmit', () => {
    expectTypeOf<MyOmit<User, 'tags' | 'address'>>().toEqualTypeOf<{ id: number; name: string }>();
  });

  it('TT5 MyReturnType', () => {
    expectTypeOf<MyReturnType<() => string>>().toEqualTypeOf<string>();
    expectTypeOf<MyReturnType<(a: number) => Promise<boolean>>>().toEqualTypeOf<Promise<boolean>>();
  });

  it('TT6 ElementType', () => {
    expectTypeOf<ElementType<string[]>>().toEqualTypeOf<string>();
    expectTypeOf<ElementType<readonly [1, 2]>>().toEqualTypeOf<1 | 2>();
    expectTypeOf<ElementType<number>>().toEqualTypeOf<never>();
  });

  it('TT7 Nullable', () => {
    expectTypeOf<Nullable<{ a: string; b?: number }>>().toEqualTypeOf<{
      a: string | null;
      b?: number | null;
    }>();
  });

  it('TT8 ValueOf', () => {
    expectTypeOf<ValueOf<{ a: string; b: number }>>().toEqualTypeOf<string | number>();
  });

  it('TT9 UnwrapPromise', () => {
    expectTypeOf<UnwrapPromise<Promise<Promise<number>>>>().toEqualTypeOf<number>();
    expectTypeOf<UnwrapPromise<string>>().toEqualTypeOf<string>();
  });

  it('TT10 Getters', () => {
    expectTypeOf<Getters<{ name: string; age: number }>>().toEqualTypeOf<{
      getName: () => string;
      getAge: () => number;
    }>();
  });

  it('TT11 DeepReadonly', () => {
    type Input = { a: { b: { c: number } }; list: { x: string }[]; fn: () => void };
    expectTypeOf<DeepReadonly<Input>>().toEqualTypeOf<{
      readonly a: { readonly b: { readonly c: number } };
      readonly list: readonly { readonly x: string }[];
      readonly fn: () => void;
    }>();
  });

  it('TT12 KeysOfType', () => {
    expectTypeOf<KeysOfType<{ a: string; b: number; c: string }, string>>().toEqualTypeOf<
      'a' | 'c'
    >();
  });
});
