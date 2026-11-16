# ts-interview-prep 🎓

Мини-курс по JS/TS для подготовки к собесам на **mid**-уровень.
Каждая тема = отдельная папка в `src/` с одинаковой структурой:

| Файл                | Что это                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `README.md`         | Конспект-справочник на русском: карточка по каждому методу, шпаргалки, вопросы с собесов **с ответами**.                             |
| `lesson.ts`         | Интерактивная лекция в терминале: объяснение → код → твой прогноз → результат → «почему так».                                        |
| `exercises.ts`      | Домашка: **Quiz** («что вернёт код?», у каждого вопроса `Concept:` со ссылкой на секцию лекции) + **Tasks** с блоком «How to think». |
| `exercises.test.ts` | Тесты, которые проверяют домашку. Ответы на квизы там не написаны — они вычисляются запуском тех же сниппетов.                       |

Эталонные решения с подробными разборами (почему так, альтернативы, сложность) — в `solutions/<папка-модуля>.ts`. Открывай только после своей попытки.

## Установка

```bash
npm install
```

Node **22+** обязательно (используются `Set.prototype.union`, `Object.groupBy`, `Promise.withResolvers` и т.д.).

## Оглавление

- 📖 [LESSONS.md](LESSONS.md) — все уроки и их секции (с номерами для `--from`).
- 💻 В терминале: `npm run lessons` — то же самое списком; `npm run lesson <NN> -- --toc` — оглавление одного урока.

## Как заниматься

```bash
# 1. Пройти интерактивную лекцию (Enter — дальше, можно вписать прогноз, q — выход)
npm run lesson 01
npm run lesson 01 -- --from 9   # начать с 9-й секции
npm run lesson 01 -- --all      # без пауз, всё сразу

# 2. Пролистать конспект-справочник: src/01-arrays/README.md

# 3. Включить тесты в режиме watch только для текущего модуля
npm run test:watch -- 01-arrays

# 4. Решать exercises.ts: в quiz вписываешь ответы вместо TODO,
#    в задачах заменяешь `return todo();` своей реализацией.
#    Сохраняешь файл — тесты перезапускаются сами.
```

Как устроена лекция: для каждого примера — 💬 что делаем → код → 🤔 пауза на твой прогноз → → реальный результат (код правда выполняется) → 💡 почему так. В модуле 08 примеры ещё и проверяет **компилятор TypeScript**: видишь `🛑 TS2345: ...` или `✅`.

Как читать вывод тестов:

- **Quiz** — пока ответ `TODO`, вопрос помечен как `todo` (не ошибка). Неверный ответ → ❌ и показывается только **твой** ответ, правильный не спойлерится.
- **Tasks** — обычные тесты: при ошибке видно, что ожидалось и что получилось.
- В модуле 08 есть ещё **тип-задачи** (`types.test-d.ts`) — их проверяет компилятор TS, но результат виден в том же `npm test`.

Как работают заглушки:

```ts
// Quiz: вместо TODO пишешь значение, которое, по-твоему, получится
export const quiz = {
  q1: TODO, // → q1: [2, 4, 6],
};

// Task: вместо todo() пишешь реализацию
export function sum(nums: number[]): number {
  return todo(); // → return nums.reduce((acc, n) => acc + n, 0);
}
```

Все команды:

| Команда                  | Что делает                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `npm run lesson <NN>`    | Интерактивная лекция по номеру (`-- --from N`, `-- --all`) или любой `.ts` файл по пути             |
| `npm run lessons`        | Список всех уроков и их секций (`npm run lessons list` — коротко, без секций)                       |
| `npm run playground`     | Урок 07: живые запросы к jsonplaceholder (нужен интернет)                                           |
| `npm run toc`            | Перегенерировать LESSONS.md                                                                         |
| `npm test`               | Прогнать все тесты один раз                                                                         |
| `npm run test:watch`     | Тесты в watch-режиме (`-- 02-map` чтобы отфильтровать модуль)                                       |
| `npm run test:solutions` | Прогнать **те же** тесты на эталонных решениях (всё должно быть 🟢)                                 |
| `npm run typecheck`      | `tsc --noEmit` — проверка типов во всём проекте                                                     |
| `npm run lint`           | ESLint: ищет баги в коде (форматирование — дело Prettier)                                           |
| `npm run lint:fix`       | ESLint + автоисправление того, что он умеет чинить сам (например, let → const)                      |
| `npm run format`         | Prettier                                                                                            |
| `npm run check:lessons`  | Проверить примеры всех уроков (строки-значения, типы TS), не показывая уроки                        |
| `npm run check`          | Всё разом: typecheck → lint → format:check → check:lessons → test:solutions (стоп на первой ошибке) |

💡 В VS Code поставь рекомендованное расширение **Vitest** (`vitest.explorer`) — тесты появятся в сайдбаре, можно запускать по одному и видеть ✅/❌ прямо в редакторе.

## Роадмап

| #   | Модуль                                                                  | О чём                                                                                                                                 |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | [arrays](src/01-arrays/README.md)                                       | map/filter/reduce/find/some/every/flat/flatMap/sort/splice/slice/at/includes…                                                         |
| 02  | [map-set](src/02-map-set/README.md)                                     | Map vs Object, Set, новые Set-методы, WeakMap/WeakSet                                                                                 |
| 03  | [spread-rest-destructuring](src/03-spread-rest-destructuring/README.md) | `...` в двух ролях, деструктуризация, дефолты, переименование, swap                                                                   |
| 04  | [objects-immutability](src/04-objects-immutability/README.md)           | entries/fromEntries/groupBy, shallow vs deep copy, иммутабельные обновления, 🐛 реальные баги, `?.`/`??`                              |
| 05  | [closures-this-iterators](src/05-closures-this-iterators/README.md)     | замыкания, `this`/bind/arrow, debounce/throttle/memoize, генераторы                                                                   |
| 06  | [async-promises](src/06-async-promises/README.md)                       | event loop, Promise.all/allSettled/race/any, retry, timeout, пул задач                                                                |
| 07  | [fetch-api](src/07-fetch-api/README.md)                                 | fetch, Response, обработка ошибок, AbortController, + `playground.ts` с живым API                                                     |
| 08  | [typescript-mid](src/08-typescript-mid/README.md)                       | generics, utility types, narrowing, discriminated unions, `satisfies`, свои mapped/conditional types (лекция с живым компилятором TS) |

Порядок рекомендованный, но модули независимы.
