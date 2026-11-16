/**
 * LESSON 08 — TYPESCRIPT FOR MID-LEVEL (interactive)
 * Run:  npm run lesson 08
 *       npm run lesson 08 -- --from 5   (utility types)
 *       npm run lesson 08 -- --all
 *
 * Examples with `typecheck: true` are first checked by the real TypeScript compiler:
 * you see the exact compiler error (🛑 TS2345: ...) — or ✅ and then the runtime result.
 */
import { runLesson } from '../_utils/lesson';

await runLesson({
  title: 'Урок 08 · TypeScript для mid',
  source: import.meta.filename,
  intro: `
Этот урок особенный: большинство примеров сначала проверяет НАСТОЯЩИЙ компилятор TypeScript.
- 🛑 TS2345: ... — ошибка компиляции, ровно как в VS Code. Код при этом НЕ запускается.
- ✅ компилируется — дальше код выполняется как обычно.

Твоя задача в паузе 🤔 — угадать: скомпилируется или нет, и если нет — почему.

Темы:
1. Что TS проверяет, а что нет (типы исчезают в рантайме).
2. any / unknown / never; type vs interface.
3. Generics и utility types.
4. Narrowing и discriminated unions.
5. as const, satisfies, keyof/typeof, mapped и conditional types.
`,
  sections: [
    // -----------------------------------------------------------------------
    {
      title: 'Типы существуют только при компиляции',
      intro: `
TypeScript = JavaScript + типы. Компилятор проверяет типы, а потом СТИРАЕТ их: в браузер/Node уходит обычный JS.

Следствия:
- Типы не защищают от данных, пришедших в рантайме (API, localStorage, JSON.parse) — там нужна валидация.
- typeof x === 'User' не существует: в рантайме нет типов, только значения.
- Ошибку компиляции можно «заглушить» (as any, @ts-ignore) — и тогда баг проявится уже при выполнении.
`,
      examples: [
        {
          explain: 'Функция ждёт строку, а мы передаём число. Что скажет компилятор?',
          code: `function shout(text: string) {
  return text.toUpperCase();
}
shout(42);`,
          typecheck: true,
          why: 'Ошибка ловится ДО запуска — в редакторе, в CI, на сборке. Это главная ценность TS: баг не доезжает до пользователя.',
        },
        {
          explain:
            'Тот же код, но типы «заглушили» через as any. Компилятор доволен — а что будет при запуске?',
          code: `function shout(text: string) {
  return text.toUpperCase();
}
console.log(shout(42 as any));`,
          why: 'Компиляция прошла, а в рантайме — TypeError: у числа нет toUpperCase. as any выключает проверку, и ошибка переезжает из редактора к пользователю. Поэтому any — красный флаг на code review.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'any vs unknown vs never',
      intro: `
| Тип     | Смысл                           | Что можно делать                                   |
| any     | «выключи проверку»              | всё что угодно (и это опасно, any заразен)         |
| unknown | «что-то есть, но я не знаю что» | ничего, пока не сузишь (typeof, instanceof, guard) |
| never   | «значения не бывает»            | функция всегда кидает / исчерпанный union          |

Правило: для внешних данных (JSON.parse, ответ API, catch (e)) используй unknown, а не any. unknown заставляет проверить данные перед использованием.
`,
      examples: [
        {
          explain: 'С any можно всё — даже то, что упадёт.',
          code: `const data: any = JSON.parse('{"a":1}');
console.log(data.user.name.toUpperCase());`,
          typecheck: true,
          why: 'Компилятор молчит. В рантайме data.user — undefined → TypeError. any отключил всю защиту.',
        },
        {
          explain: 'То же с unknown.',
          code: `const data: unknown = JSON.parse('{"a":1}');
console.log(data.user);`,
          typecheck: true,
          why: 'unknown нельзя использовать, пока не докажешь компилятору, что там. Это раздражает — и именно поэтому защищает.',
        },
        {
          explain: 'Сужаем unknown проверками — и TS разрешает доступ.',
          code: `const data: unknown = JSON.parse('{"a":1}');
if (typeof data === 'object' && data !== null && 'a' in data) {
  console.log('a =', data.a);
}`,
          typecheck: true,
          why: 'После проверок TS знает: data — объект с полем a. Это и есть narrowing (секция 6).',
        },
        {
          explain: 'catch (e) — в strict-режиме e имеет тип unknown.',
          code: `try {
  JSON.parse('{bad json');
} catch (e) {
  console.log(e.message);
}`,
          typecheck: true,
          why: 'Бросить можно что угодно (throw "строка", throw 42), поэтому e: unknown. Правильно: if (e instanceof Error) console.log(e.message).',
        },
        {
          explain: 'Как правильно: сужаем e через instanceof Error.',
          code: `function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
try {
  const data = JSON.parse('{bad json');
  console.log(data);
} catch (e) {
  console.log(errorMessage(e));
}
try {
  throw 'just a string';
} catch (e) {
  console.log(errorMessage(e));
}`,
          typecheck: true,
          why: 'instanceof Error сужает unknown до Error — после этого e.message доступен без as. Ветка String(e) страхует случай, когда бросили не Error: строку, число, что угодно. Такой хелпер обычно один на проект. И он лучше популярного (e as Error).message: на throw "строка" тот молча вернул бы undefined.',
        },
        {
          explain: 'never: функция, которая никогда не возвращает управление.',
          code: `function fail(message: string): never {
  throw new Error(message);
}
const value: string = Math.random() > 2 ? 'ok' : fail('impossible');
console.log(typeof value);`,
          typecheck: 'only',
          why: 'never совместим с любым типом, поэтому fail(...) можно использовать там, где ждут string. Главное применение never — exhaustive check (секция 7).',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'type vs interface',
      intro: `
|                                       | interface                    | type                 |
| объекты                               | ✅                            | ✅                    |
| union, tuple, примитивы, mapped types | ❌                            | ✅                    |
| расширение                            | extends                      | & (intersection)     |
| declaration merging                   | ✅ (две декларации сливаются) | ❌ (ошибка дубликата) |

Практика: interface — для формы объектов и классов (особенно в публичных API библиотек), type — для всего остального (union, utility). Главное — единообразие в проекте.
`,
      examples: [
        {
          explain: 'Declaration merging: два interface с одним именем сливаются.',
          code: `interface User {
  id: number;
}
interface User {
  name: string;
}
const u: User = { id: 1 };`,
          typecheck: true,
          why: 'Две декларации слились в { id: number; name: string } → не хватает name. Так библиотеки позволяют расширять свои типы (например, Window или Express Request).',
        },
        {
          explain: 'А с type так нельзя.',
          code: `type User = { id: number };
type User = { name: string };`,
          typecheck: true,
          why: 'type — это псевдоним, его нельзя объявить дважды.',
        },
        {
          explain: 'Union — только через type.',
          code: `type Status = 'idle' | 'loading' | 'error';
let s: Status = 'idle';
s = 'done';`,
          typecheck: true,
          why: 'Литеральный union: переменная может принимать только эти три строки. Опечатки и лишние статусы ловятся компилятором.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Generics: функции, которые сохраняют тип',
      intro: `
Generic — это «параметр-тип». Как аргумент функции, только для типов.

function first<T>(arr: T[]): T | undefined
— «какой тип элементов пришёл, такой и вернётся». TS обычно выводит T сам.

Ограничения (constraints): <T extends Something> — «T должен быть как минимум таким».
Самый полезный приём: <T, K extends keyof T> — K может быть только ключом T, а T[K] — тип значения по этому ключу.
`,
      examples: [
        {
          explain: 'Без generics тип теряется.',
          code: `function firstAny(arr: unknown[]) {
  return arr[0];
}
const n = firstAny([1, 2, 3]);
console.log(n.toFixed());`,
          typecheck: true,
          why: 'Функция вернула unknown — информация о том, что там числа, потеряна.',
        },
        {
          explain: 'С generic T тип «протекает» от входа к выходу.',
          code: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const n = first([1, 2, 3]);
const s = first(['a']);
console.log(n?.toFixed(1), s?.toUpperCase());`,
          typecheck: true,
          why: 'TS сам вывел T = number для первого вызова и T = string для второго. ?. нужен, потому что массив может быть пустым (T | undefined).',
        },
        {
          explain: 'K extends keyof T: безопасный доступ к свойству по имени.',
          code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { id: 1, name: 'Ann', tags: ['ts'] };
const tags = getProp(user, 'tags');
console.log(tags.join(','));
console.log(getProp(user, 'age'));`,
          typecheck: true,
          why: 'Для "tags" TS знает возвращаемый тип — string[]. А "age" — не ключ user, ошибка на этапе компиляции. Так типизированы lodash.get, формы (react-hook-form) и т.п.',
        },
        {
          explain: 'Ограничение по форме: «всё, у чего есть length».',
          code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
console.log(longest('abc', 'de'));
console.log(longest([1], [1, 2]));
console.log(longest(10, 20));`,
          typecheck: true,
          why: 'Строки и массивы подходят (у них есть length), числа — нет.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Utility types: Partial, Pick, Omit, Record, ReturnType...',
      intro: `
| Тип                   | Что делает                                     |                       |
| Partial<T>            | все поля опциональные (PATCH-запрос, черновик) |                       |
| Required<T>           | все поля обязательные                          |                       |
| Readonly<T>           | все поля readonly                              |                       |
| Pick<T, 'a'           | 'b'>                                           | только указанные поля |
| Omit<T, 'a'>          | все, кроме указанных                           |                       |
| Record<K, V>          | объект с ключами K и значениями V              |                       |
| Exclude<U, X>         | убрать из union члены, совместимые с X         |                       |
| Extract<U, X>         | оставить из union только совместимые с X       |                       |
| NonNullable<T>        | убрать null и undefined                        |                       |
| ReturnType<typeof fn> | тип результата функции                         |                       |
| Parameters<typeof fn> | кортеж типов аргументов                        |                       |
| Awaited<T>            | «развернуть» Promise                           |                       |

Идея: не дублировать типы. Есть User — производные (UserUpdate, PublicUser) строятся из него, и при изменении User всё обновляется автоматически.
`,
      examples: [
        {
          explain: 'Partial + Omit: тело PATCH-запроса — любое поле, кроме id.',
          code: `interface User { id: number; name: string; email: string; }
type UserUpdate = Partial<Omit<User, 'id'>>;
const patch1: UserUpdate = { name: 'New name' };
const patch2: UserUpdate = { id: 5 };`,
          typecheck: true,
          why: 'patch1 — ок (одно поле из разрешённых). patch2 — ошибка: id исключён через Omit.',
        },
        {
          explain: 'Pick и Record: превью пользователя и словарь по id.',
          code: `interface User { id: number; name: string; email: string; }
type UserPreview = Pick<User, 'id' | 'name'>;
const byId: Record<number, UserPreview> = { 1: { id: 1, name: 'Ann' } };
const broken: Record<number, UserPreview> = { 2: { id: 2 } };`,
          typecheck: true,
          why: 'В broken не хватает name — Pick оставил его обязательным.',
        },
        {
          explain: 'Readonly: защита от мутаций на этапе компиляции (вспоминаем урок 04).',
          code: `const config: Readonly<{ env: string }> = { env: 'prod' };
config.env = 'dev';
const list: readonly number[] = [1, 2];
list.push(3);`,
          typecheck: true,
          why: 'Две ошибки: присваивание readonly-полю и push у readonly-массива (у него просто нет мутирующих методов). Ноль стоимости в рантайме, в отличие от Object.freeze.',
        },
        {
          explain: 'Exclude и NonNullable — работа с union.',
          code: `type Role = 'admin' | 'user' | 'guest';
type StaffRole = Exclude<Role, 'guest'>;
const r: StaffRole = 'guest';
type MaybeName = string | null | undefined;
const n: NonNullable<MaybeName> = null;`,
          typecheck: true,
          why: 'guest убран из StaffRole, null — из NonNullable. Обе строки — ошибки.',
        },
        {
          explain: 'Типы ИЗ значений: ReturnType, Parameters, Awaited.',
          code: `async function fetchUser(id: number, withPosts = false) {
  return { id, withPosts, name: 'Ann' };
}
type Result = Awaited<ReturnType<typeof fetchUser>>;
type Args = Parameters<typeof fetchUser>;
const args: Args = [1];
const result: Result = await fetchUser(...args);
console.log(result);`,
          typecheck: true,
          why: 'typeof fetchUser — тип функции. ReturnType даёт Promise<{...}>, Awaited разворачивает Promise. Тип результата выведен из реализации — его не нужно описывать руками и синхронизировать.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Narrowing: как TS сужает тип',
      intro: `
Внутри if TypeScript «понимает» проверки и сужает тип переменной:
- typeof x === 'string' | 'number' | 'boolean' | 'function' | 'object' | ...
- x instanceof Date
- 'key' in obj
- Array.isArray(x)
- x === null / x !== undefined / литералы
- пользовательский type guard: (x): x is User => ...
- assertion function: asserts x is User
`,
      examples: [
        {
          explain: 'typeof / instanceof / Array.isArray в одной функции.',
          code: `function describe(x: string | number | Date | string[] | null): string {
  if (x === null) return 'null';
  if (typeof x === 'string') return 'string of length ' + x.length;
  if (typeof x === 'number') return 'number ' + x.toFixed(1);
  if (x instanceof Date) return 'year ' + x.getFullYear();
  return 'array of ' + x.length;
}
console.log(describe('hey'), '|', describe(3.14), '|', describe(new Date(2020, 0)), '|', describe(['a']));`,
          typecheck: true,
          why: 'После каждой проверки TS исключает уже обработанные варианты. В последней строке остался только string[] — поэтому x.length без ошибок.',
        },
        {
          explain: 'Без сужения нельзя.',
          code: `function len(x: string | number) {
  return x.length;
}`,
          typecheck: true,
          why: 'У number нет length — компилятор требует сначала проверить тип.',
        },
        {
          explain: 'in-оператор для объектов разной формы.',
          code: `type Fish = { swim: () => string };
type Bird = { fly: () => string };
const move = (animal: Fish | Bird) => ('swim' in animal ? animal.swim() : animal.fly());
console.log(move({ fly: () => 'flying' }));`,
          typecheck: true,
          why: 'Если есть swim — это Fish, иначе TS понимает, что это Bird.',
        },
        {
          explain: 'Пользовательский type guard — проверка данных из API.',
          code: `type User = { id: number; name: string };
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'number' &&
    'name' in value && typeof value.name === 'string'
  );
}
const data: unknown = JSON.parse('{"id":1,"name":"Ann"}');
if (isUser(data)) console.log(data.name.toUpperCase());
console.log(isUser({ id: '1' }));`,
          typecheck: true,
          why: "value is User — обещание компилятору: «если вернул true, это User». Внутри if data уже User. Это рантайм-проверка + сужение типа в одном месте. А внутри самого guard работает обычное сужение: после 'id' in value TS знает, что у value есть id, поэтому value.id можно читать без as.",
        },
        {
          explain: 'filter с type guard: убрать null из массива так, чтобы TS это понял.',
          code: `const mixed = [1, null, 2, undefined, 3];
const bad: number[] = mixed.filter((x) => x != null);
const good: number[] = mixed.filter((x): x is number => x != null);`,
          typecheck: true,
          why: 'В новых версиях TS (5.5+) простые предикаты выводятся автоматически, поэтому обе строки компилируются. В старых TS первая строка давала ошибку (тип оставался (number | null | undefined)[]), и нужно было писать явный guard (x): x is number.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Discriminated unions + exhaustive check',
      intro: `
Самый полезный паттерн TS в реальных проектах. Union объектов с общим полем-«дискриминатором» (status, type, kind):

type State =
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: string };

После проверки state.status === 'success' TS знает, что у state есть data. Невозможные состояния («загрузка И ошибка одновременно») просто не описываются типом.

Exhaustive check: в default присвоить значение переменной типа never. Если кто-то добавит новый вариант и забудет его обработать — ошибка компиляции.
`,
      examples: [
        {
          explain: 'Рендер разных состояний запроса.',
          code: `type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: string };
function render(state: RequestState): string {
  switch (state.status) {
    case 'idle': return 'Press the button';
    case 'loading': return 'Loading...';
    case 'success': return 'Got ' + state.data.length + ' items';
    case 'error': return 'Error: ' + state.error;
  }
}
console.log(render({ status: 'success', data: ['a', 'b'] }));
console.log(render({ status: 'error', error: '500' }));`,
          typecheck: true,
          why: 'В case "success" доступен state.data, в case "error" — state.error. Обращение к data в другом case было бы ошибкой.',
        },
        {
          explain: 'Нельзя создать «невозможное» состояние.',
          code: `type RequestState =
  | { status: 'loading' }
  | { status: 'success'; data: string[] };
const s: RequestState = { status: 'loading', data: ['x'] };`,
          typecheck: true,
          why: 'Объект loading с данными не подходит ни под один вариант union. Сравни с «плоским» типом { loading: boolean; data?: ...; error?: ... }, где возможны любые бессмысленные комбинации.',
        },
        {
          explain: 'Exhaustive check: добавили статус "cancelled", а в switch забыли.',
          code: `type Status = 'idle' | 'loading' | 'done' | 'cancelled';
function label(s: Status): string {
  switch (s) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    case 'done': return 'Done';
    default: {
      const exhaustive: never = s;
      return exhaustive;
    }
  }
}`,
          typecheck: true,
          why: 'В default остался вариант "cancelled", а его нельзя присвоить в never → ошибка компиляции указывает на забытый case. Без этого трюка функция молча вернула бы undefined.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'as const, typeof, keyof, satisfies, template literal types',
      intro: `
- as const — «заморозить» литерал: массив становится readonly-кортежем литералов, строки — литеральными типами.
- typeof value (в позиции типа) — взять тип у значения.
- keyof T — union ключей типа.
- (typeof ARR)[number] — union типов элементов массива.
- satisfies T — ПРОВЕРИТЬ, что значение подходит под T, но СОХРАНИТЬ точный выведенный тип (в отличие от аннотации : T).
- Template literal types: \`GET /\${string}\`.
`,
      examples: [
        {
          explain: 'Без as const: массив строк. С as const: точные литералы → union.',
          code: `const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number];
const ok: Role = 'editor';
const bad: Role = 'superadmin';`,
          typecheck: true,
          why: 'Role = "admin" | "editor" | "viewer" — выведен из массива. Добавишь роль в массив — тип обновится сам. Без as const тип был бы просто string.',
        },
        {
          explain: 'Объект-«enum» (многие команды предпочитают его TS-enum).',
          code: `const Status = { Active: 'active', Banned: 'banned' } as const;
type Status = (typeof Status)[keyof typeof Status];
const s: Status = Status.Active;
const t: Status = 'deleted';
console.log(s);`,
          typecheck: true,
          why: 'Status (значение) — обычный объект в рантайме, Status (тип) — "active" | "banned". keyof typeof Status = "Active" | "Banned", индексный доступ даёт значения.',
        },
        {
          explain: 'Аннотация : T vs satisfies T.',
          code: `type Theme = Record<string, string | [number, number, number]>;
const annotated: Theme = { primary: '#000', accent: [255, 0, 0] };
const checked = { primary: '#000', accent: [255, 0, 0] } satisfies Theme;
console.log(checked.primary.toUpperCase());
console.log(annotated.primary.toUpperCase());`,
          typecheck: true,
          why: 'С аннотацией тип primary — string | [number, number, number], и toUpperCase недоступен без проверки. С satisfies значение проверено на соответствие Theme, но тип остался точным: primary — string. Лучшее из двух миров.',
        },
        {
          explain: 'Template literal types: строковые шаблоны на уровне типов.',
          code: `type HttpMethod = 'GET' | 'POST';
type Route = \`\${HttpMethod} /\${string}\`;
const ok: Route = 'GET /users';
const bad: Route = 'PATCH /users';`,
          typecheck: true,
          why: 'PATCH не входит в HttpMethod → строка не подходит под шаблон.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Mapped и conditional types: пишем свои utility',
      intro: `
Mapped type — «пройтись по ключам и построить новый тип»:
  type MyPartial<T> = { [K in keyof T]?: T[K] };
  type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
Переименование ключей через as:
  type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };

Conditional type — тернарник на уровне типов, infer — «вытащить» тип изнутри:
  type ElementOf<T> = T extends (infer E)[] ? E : never;
  type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

«Напишите свой Partial/Pick/ReturnType» — частый вопрос на собесе mid+. Эти задачи есть в упражнениях (types.test-d.ts).
`,
      examples: [
        {
          explain: 'Свой Partial и Pick.',
          code: `type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type User = { id: number; name: string };
const p: MyPartial<User> = {};
const pk: MyPick<User, 'name'> = { name: 'Ann' };
const bad: MyPick<User, 'email'> = {};`,
          typecheck: true,
          why: 'MyPartial сделал все поля опциональными ({} подходит). MyPick требует, чтобы K был ключом User — "email" не ключ.',
        },
        {
          explain: 'Getters: переименование ключей.',
          code: `type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
type UserGetters = Getters<{ name: string; age: number }>;
const g: UserGetters = { getName: () => 'Ann', getAge: () => 30 };
const bad: UserGetters = { getName: () => 'Ann' };
console.log(g.getName());`,
          typecheck: true,
          why: 'Из { name, age } получилось { getName, getAge }. bad — ошибка: не хватает getAge.',
        },
        {
          explain: 'infer: достать тип элемента массива и тип результата промиса.',
          code: `type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type Unwrap<T> = T extends Promise<infer V> ? V : T;
const el: ElementOf<string[]> = 'x';
const num: Unwrap<Promise<number>> = 'not a number';`,
          typecheck: true,
          why: 'ElementOf<string[]> = string ✅. Unwrap<Promise<number>> = number, поэтому строка — ошибка.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'as — обещание компилятору, а не проверка',
      intro: `
x as User не проверяет данные. Это ты говоришь компилятору «поверь мне». Если ты ошибся, баг проявится далеко от места, где он возник.

Особенно опасно для ответов API: const user = (await res.json()) as User. Если бэкенд поменял формат, TS не узнает.

Правильно: проверять данные на границе (type guard, или библиотеки zod / valibot), а внутри приложения уже доверять типам.
`,
      examples: [
        {
          explain: 'as «доверяет» нам — даже когда данные не те.',
          code: `type User = { id: number; name: string };
const fromApi = JSON.parse('{"id":"1","title":"oops"}') as User;
console.log(typeof fromApi.id, fromApi.name);`,
          typecheck: true,
          why: 'Компиляция прошла, но id — строка, а name — undefined. Дальше по коду fromApi.name.toUpperCase() упадёт — и искать причину будешь долго.',
        },
        {
          explain: 'Валидация на границе: функция-парсер вместо as.',
          code: `type Post = { id: number; title: string };
function parsePost(raw: unknown): Post {
  if (
    typeof raw === 'object' && raw !== null &&
    'id' in raw && typeof raw.id === 'number' &&
    'title' in raw && typeof raw.title === 'string'
  ) {
    return { id: raw.id, title: raw.title };
  }
  throw new Error('Invalid Post payload');
}
console.log(parsePost({ id: 1, title: 'Hello', extra: true }));
console.log(parsePost({ id: '1' }));`,
          typecheck: true,
          why: 'Ошибка формата ловится сразу и с понятным сообщением. С zod то же самое пишется короче: const Post = z.object({ id: z.number(), title: z.string() }); type Post = z.infer<typeof Post>.',
        },
      ],
    },
  ],
  outro: `
Шпаргалка:
- Типы проверяются при компиляции и стираются в рантайме → внешние данные валидируй.
- any выключает проверку; unknown требует сузить; never — «значения не бывает».
- interface — объекты (+ merging), type — всё остальное (union, mapped...).
- Generics: <T> переносит тип со входа на выход; <K extends keyof T> + T[K] — типобезопасный доступ.
- Utility: Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, NonNullable, ReturnType, Parameters, Awaited.
- Narrowing: typeof, instanceof, in, Array.isArray, value is T, asserts value is T.
- Discriminated union + exhaustive check (const x: never = value) — лучший способ моделировать состояния.
- as const → литералы; satisfies → проверить, сохранив точный тип.
- Mapped: { [K in keyof T]: ... }, переименование через as; conditional + infer.
- as — это обещание, а не проверка.

Дальше:
1. Конспект: src/08-typescript-mid/README.md
2. Домашка: src/08-typescript-mid/exercises.ts → npm run test:watch -- 08-typescript
   (Part 2 — тип-задачи, проверяются в types.test-d.ts)
`,
});
