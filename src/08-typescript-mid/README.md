# 08 · TypeScript для mid — конспект

> Как проходить модуль:
>
> 1. Интерактивная лекция: `npm run lesson 08` — примеры проверяет **настоящий компилятор TS**: ты видишь `🛑 TS2345: ...` или `✅` + результат выполнения.
> 2. Этот конспект — справочник
> 3. Домашка: `src/08-typescript-mid/exercises.ts` + `npm run test:watch -- 08-typescript`
>    - Part 1 — рантайм-задачи (`exercises.test.ts`)
>    - Part 2 — тип-задачи (`types.test-d.ts`, проверяются компилятором)
> 4. Разборы: `solutions/08-typescript-mid.ts`

## `type` vs `interface`

|                                           | `interface`                   | `type`                   |
| ----------------------------------------- | ----------------------------- | ------------------------ |
| Объекты                                   | ✅                            | ✅                       |
| Union / tuple / примитивы / mapped types  | ❌                            | ✅                       |
| `extends`                                 | ✅ `interface B extends A`    | через `&` (intersection) |
| Declaration merging (дописать поля позже) | ✅ (две декларации сливаются) | ❌ (ошибка дубликата)    |

Практика: `interface` для публичных контрактов объектов/классов, `type` для всего остального. Главное — единообразие в проекте.

## `any` vs `unknown` vs `never`

- `any` — выключает проверку типов. Заразен: всё, что из него получено, тоже `any`.
- `unknown` — «что-то есть, но я не знаю что». Нельзя использовать, пока не **сузишь** (`typeof`, `instanceof`, type guard). Используй для внешних данных (JSON, `catch (e)`).
- `never` — значения не бывает: функция всегда кидает, или исчерпан union (exhaustive check).

## Generics — типы-параметры

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2]); // T выведен как number

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
getProp({ a: 1, b: 'x' }, 'b'); // string
getProp({ a: 1 }, 'zzz'); // ❌ ошибка компиляции
```

`extends` в generic = **ограничение** («T должен быть как минимум таким»).

## Utility types — must know

| Тип                     | Что делает                                        |
| ----------------------- | ------------------------------------------------- |
| `Partial<T>`            | все поля опциональные                             |
| `Required<T>`           | все поля обязательные                             |
| `Readonly<T>`           | все поля readonly                                 |
| `Pick<T, 'a' \| 'b'>`   | только указанные поля                             |
| `Omit<T, 'a'>`          | все, кроме указанных                              |
| `Record<K, V>`          | объект с ключами `K` и значениями `V`             |
| `Exclude<U, X>`         | убрать из union члены, совместимые с `X`          |
| `Extract<U, X>`         | оставить из union только совместимые с `X`        |
| `NonNullable<T>`        | убрать `null` и `undefined`                       |
| `ReturnType<typeof fn>` | тип возвращаемого значения                        |
| `Parameters<typeof fn>` | кортеж типов аргументов                           |
| `Awaited<T>`            | «развернуть» Promise: `Awaited<Promise<X>>` → `X` |

## Narrowing (сужение типов)

`typeof x === 'string'`, `x instanceof Date`, `'key' in obj`, `Array.isArray(x)`, сравнение с литералом, truthiness-проверка, **пользовательский type guard** `(x): x is User => ...`, **assertion function** `asserts x is User`.

## Discriminated unions — самый полезный паттерн

```ts
type State =
  { status: 'loading' } | { status: 'success'; data: User[] } | { status: 'error'; error: string };

switch (state.status) {
  case 'success':
    state.data; // TS знает, что data есть
  case 'error':
    state.error;
}
```

Exhaustive check: в `default` присвой `const _exhaustive: never = state;` — если добавишь новый статус и забудешь обработать, будет ошибка компиляции.

## `as const`, `satisfies`, `keyof`, `typeof`

```ts
const ROLES = ['admin', 'user'] as const; // readonly ['admin', 'user'] — литералы, а не string[]
type Role = (typeof ROLES)[number]; // 'admin' | 'user'

const config = { port: 3000, host: 'x' } satisfies Record<string, string | number>;
// satisfies проверяет совместимость, но СОХРАНЯЕТ точный тип (config.port — number, не string | number)

type Keys = keyof typeof config; // 'port' | 'host'
```

## Mapped & conditional types (для уверенного mid)

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
type ElementOf<T> = T extends (infer E)[] ? E : never;
```

## Как тестировать типы

Типы проверяются **компилятором**, а не выполнением кода. В этом модуле:

- рантайм-задачи (Part 1) — обычные тесты в `exercises.test.ts`;
- тип-задачи (Part 2) — `types.test-d.ts` с `expectTypeOf<A>().toEqualTypeOf<B>()`. Vitest прогоняет их через `tsc` в режиме **typecheck** — они появляются в том же `npm test` как обычные тесты ✅/❌. Красные подчёркивания в `types.test-d.ts` в VS Code = задача ещё не решена.
- `npm run typecheck` эти файлы специально **исключает**, чтобы нерешённые тип-задачи не ломали проверку всего проекта.

Сообщения об ошибках у `expectTypeOf` многословные — ищи в них `Expected ..., Actual ...`.

## `as` — обещание, а не проверка

`(await res.json()) as User` ничего не проверяет. Если бэкенд поменял формат — TS не узнает, баг всплывёт далеко от причины. Валидируй на границе: type guard / парсер / **zod**:

```ts
const Post = z.object({ id: z.number(), title: z.string() });
type Post = z.infer<typeof Post>;
const post = Post.parse(await res.json()); // throws with a clear message if the shape is wrong
```

## Частые вопросы на собесе (с ответами)

**`type` vs `interface`?**
Оба описывают объекты. `interface` поддерживает declaration merging и `extends`; `type` умеет union, tuple, mapped/conditional types. Главное — единообразие в проекте.

**`any` vs `unknown`?**
`any` выключает проверку (и «заражает» всё вокруг). `unknown` требует сузить тип перед использованием — безопасный выбор для внешних данных и `catch (e)`.

**Что такое generics и зачем `extends`?**
Параметры-типы, которые переносят информацию о типе со входа на выход. `extends` — ограничение: «T должен быть как минимум таким».

**Напишите свой `Partial` / `Pick` / `Readonly`.**
`{ [K in keyof T]?: T[K] }`, `{ [P in K]: T[P] }`, `{ readonly [K in keyof T]: T[K] }`.

**Что такое discriminated union и exhaustive check?**
Union объектов с общим литеральным полем; после проверки поля TS сужает тип. Exhaustive check: `const x: never = value` в `default` — ошибка компиляции, если забыли вариант.

**Чем `as` опасен? Чем `satisfies` лучше?**
`as` заставляет компилятор поверить на слово. `satisfies` проверяет соответствие типу и сохраняет точный выведенный тип.

**Как типизировать ответ `fetch`?**
`res.json()` → `unknown`, дальше валидация (type guard / zod), а не `as`.
