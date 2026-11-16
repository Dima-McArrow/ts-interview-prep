# 03 · Spread, Rest и деструктуризация — конспект

> Как проходить модуль:
>
> 1. Интерактивная лекция: `npm run lesson 03`
> 2. Этот конспект — справочник
> 3. Домашка: `src/03-spread-rest-destructuring/exercises.ts` + `npm run test:watch -- 03-spread`
> 4. Разборы: `solutions/03-spread-rest-destructuring.ts`

## 1. `...` — один синтаксис, две противоположные роли

| Роль       | Где стоят точки                                              | Что делает                       |
| ---------- | ------------------------------------------------------------ | -------------------------------- |
| **Spread** | справа от `=`, в вызове функции, внутри `[]` / `{}` литерала | **распаковывает** одно во многое |
| **Rest**   | слева от `=` (в деструктуризации) или в параметрах функции   | **собирает** многое в одно       |

```ts
// SPREAD — unpack
const all = [...a, ...b];
const user2 = { ...user, age: 31 };
Math.max(...nums);

// REST — collect
const [first, ...others] = arr;
const { password, ...safeUser } = user;
function sum(...nums: number[]) {}
```

Мнемоника: **spread — «раздать»**, **rest — «остальное»**.

## 2. Карточка: spread в массивах `[...x]`

- **Работает с:** любым **iterable** (массив, строка, `Set`, `Map`, генератор). Обычный объект — `TypeError: not iterable`.
- **Создаёт:** **новый** массив; копия **shallow** (вложенные объекты общие).
- **Применения:**

| Задача                       | Код                                         |
| ---------------------------- | ------------------------------------------- |
| склеить                      | `[...a, ...b]`                              |
| иммутабельный push / unshift | `[...arr, x]` / `[x, ...arr]`               |
| вставить в середину          | `[...arr.slice(0, i), x, ...arr.slice(i)]`  |
| shallow copy                 | `[...arr]`                                  |
| массив → аргументы           | `Math.max(...nums)`                         |
| iterable → массив            | `[...'abc']`, `[...new Set(x)]`, `[...map]` |

⚠️ `Math.max(...[])` → `-Infinity`. Spread огромного массива (сотни тысяч элементов) в аргументы может упасть с `RangeError`.

## 3. Карточка: spread в объектах `{...x}`

- **Копирует:** собственные перечисляемые свойства. Прототип **не** копируется: экземпляр класса превращается в plain object **без методов**.
- **Копия shallow:** вложенные объекты общие.
- **Конфликт ключей:** побеждает **последний** (тот, что правее).
- `{ ...null }`, `{ ...undefined }` — ок, игнорируются. `{ ...'hi' }` → `{ 0: 'h', 1: 'i' }`.

```ts
{ ...user, name: 'Bob' }; // update a field
{ ...defaults, ...options }; // options override defaults ✅
{ ...options, ...defaults }; // ❌ defaults override user's options
{ ...state, user: { ...state.user, city: 'Lyon' } }; // nested update (structural sharing)
{ name, ...(isAdmin && { role: 'admin' }) }; // conditional field
```

## 4. Карточка: rest-параметры `function f(a, ...rest)`

- `rest` — **настоящий массив** (в отличие от старого `arguments`); если лишних аргументов нет → `[]`.
- Может быть **только последним**: `function f(...a, b)` → SyntaxError.
- Паттерн «обёртка»: `(...args) => fn(...args)` — пробросить все аргументы (logger, debounce, memoize).

## 5. Карточка: деструктуризация массивов (по позиции)

```ts
const [a, b] = [1, 2]; // a=1, b=2
const [, second] = arr; // skip
const [head, ...tail] = arr; // rest → new array (may be [])
const [x = 0, y = 0] = coords; // defaults (only for undefined)
[a, b] = [b, a]; // swap
const [count, setCount] = useState(0); // tuple from a function
const [firstChar] = 'hello'; // any iterable
```

## 6. Карточка: деструктуризация объектов (по имени)

```ts
const { id, name } = user;
const { name: userName } = user; // rename: SOURCE: newName
const { role = 'guest' } = user; // default — ONLY for undefined!
const { theme: uiTheme = 'dark' } = settings; // rename + default
const {
  address: { city },
} = user; // nested — `address` is NOT a variable!
const {
  address,
  address: { city },
} = user; // both
const { password, ...publicUser } = user; // immutable omit
const { [key]: value } = obj; // computed key (new name required)
```

### ⚠️ Default срабатывает только на `undefined`

```ts
const { a = 1 } = { a: null }; // a === null (!!)
const { b = 1 } = { b: undefined }; // b === 1
const role = user.role ?? 'guest'; // if null must also fall back
```

## 7. Деструктуризация в параметрах

```ts
function connect({ host = 'localhost', port = 5432 } = {}) {} // `= {}` makes the argument optional
function Button({ label, disabled = false }: Props) {} // React props
Object.entries(obj).map(([key, value]) => ...); // pairs in callbacks
for (const [key, value] of map) {} // pairs in loops
```

🪤 `function g({ x = 1 } = { x: 2 })`: `g()` → 2 (default **параметра**), `g({})` → 1 (default **поля**).

## 8. Ошибки, которые нужно узнавать

| Код                         | Результат                                            | Защита                           |
| --------------------------- | ---------------------------------------------------- | -------------------------------- |
| `const { x } = null`        | `TypeError: Cannot destructure property 'x' of null` | `obj ?? {}`                      |
| `function f({ x }) {}; f()` | `TypeError` (destructuring `undefined`)              | `({ x } = {})`                   |
| `[...undefined]`            | `TypeError: undefined is not iterable`               | `[...(arr ?? [])]`               |
| `{ ...undefined }`          | ✅ `{}`                                              | —                                |
| `const [...a, b] = arr`     | `SyntaxError`                                        | `arr.at(-1)`, `arr.slice(0, -1)` |

## 9. Частые вопросы на собесе (с ответами)

**Разница между spread и rest?**
Одинаковый синтаксис `...`. Spread распаковывает (справа от `=`, в вызовах, в литералах), rest собирает (слева от `=`, в параметрах).

**`{ ...obj }` — глубокая копия?**
Нет, shallow. Вложенные объекты общие. Глубокая — `structuredClone(obj)`.

**Как убрать поле из объекта иммутабельно?**
`const { password, ...rest } = user`.

**Как поменять местами две переменные?**
`[a, b] = [b, a]`.

**Что выведет `const { a = 5 } = { a: null }`?**
`null`: default срабатывает только для `undefined`.

**Чем rest-параметры лучше `arguments`?**
Это настоящий массив (есть `map`/`filter`), работает в стрелочных функциях, явно виден в сигнатуре, нормально типизируется в TS.

**В каком порядке применяются свойства в `{ ...a, ...b }`?**
Слева направо, при совпадении ключей побеждает `b`.
