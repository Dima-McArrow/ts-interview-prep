# 📚 Оглавление уроков

> Сгенерировано командой `npm run toc` — 8 уроков, 320 интерактивных примеров.
> В терминале то же самое: `npm run lessons`.

## Как запускать

```bash
npm run lesson 01               # весь урок
npm run lesson 01 -- --from 9   # с 9-й секции
npm run lesson 01 -- --all      # без пауз
npm run lesson 01 -- --toc      # только оглавление урока
```

## Уроки

| #   | Урок                                                                                                 | Секций | Примеров |
| --- | ---------------------------------------------------------------------------------------------------- | ------ | -------- |
| 01  | [Урок 01 · Массивы](#урок-01--массивы)                                                               | 12     | 76       |
| 02  | [Урок 02 · Map и Set](#урок-02--map-и-set)                                                           | 10     | 39       |
| 03  | [Урок 03 · Spread, Rest и деструктуризация](#урок-03--spread-rest-и-деструктуризация)                | 8      | 40       |
| 04  | [Урок 04 · Объекты и иммутабельность](#урок-04--объекты-и-иммутабельность)                           | 11     | 37       |
| 05  | [Урок 05 · Замыкания, this, итераторы и генераторы](#урок-05--замыкания-this-итераторы-и-генераторы) | 10     | 35       |
| 06  | [Урок 06 · Async, Promise, Event Loop](#урок-06--async-promise-event-loop)                           | 10     | 31       |
| 07  | [Урок 07 · Fetch API](#урок-07--fetch-api)                                                           | 12     | 25       |
| 08  | [Урок 08 · TypeScript для mid](#урок-08--typescript-для-mid)                                         | 10     | 37       |

## Урок 01 · Массивы

```bash
npm run lesson 01
```

Конспект: [README](src/01-arrays/README.md) · Домашка: [exercises.ts](src/01-arrays/exercises.ts) · Разборы: [solutions/01-arrays.ts](solutions/01-arrays.ts)

| Секция | Тема                                                                         | Примеров | Запуск с этой секции |
| ------ | ---------------------------------------------------------------------------- | -------- | -------------------- |
| 1      | Фундамент: примитивы vs объекты, ссылки и shallow copy                       | 9        | `-- --from 1`        |
| 2      | map — преобразовать каждый элемент                                           | 8        | `-- --from 2`        |
| 3      | filter — оставить только подходящие                                          | 5        | `-- --from 3`        |
| 4      | reduce — свернуть массив в ОДНО значение                                     | 9        | `-- --from 4`        |
| 5      | forEach и for...of — просто пройтись                                         | 4        | `-- --from 5`        |
| 6      | Поиск: find, findIndex, findLast, includes, indexOf, some, every             | 9        | `-- --from 6`        |
| 7      | slice, concat, at, join — кусочки и склейка                                  | 6        | `-- --from 7`        |
| 8      | flat и flatMap — работа с вложенными массивами                               | 4        | `-- --from 8`        |
| 9      | ⚠️ МУТИРУЮЩИЕ методы: push, pop, shift, unshift, splice, sort, reverse, fill | 12       | `-- --from 9`        |
| 10     | ES2023: иммутабельные двойники toSorted, toReversed, toSpliced, with         | 2        | `-- --from 10`       |
| 11     | Создание массивов: Array.from, Array.of, spread, Array.isArray               | 5        | `-- --from 11`       |
| 12     | Цепочки (chaining) и производительность                                      | 3        | `-- --from 12`       |

## Урок 02 · Map и Set

```bash
npm run lesson 02
```

Конспект: [README](src/02-map-set/README.md) · Домашка: [exercises.ts](src/02-map-set/exercises.ts) · Разборы: [solutions/02-map-set.ts](solutions/02-map-set.ts)

| Секция | Тема                                                          | Примеров | Запуск с этой секции |
| ------ | ------------------------------------------------------------- | -------- | -------------------- |
| 1      | Зачем Map, если есть обычный объект?                          | 4        | `-- --from 1`        |
| 2      | Map: основные методы                                          | 5        | `-- --from 2`        |
| 3      | Map: как сравниваются ключи                                   | 3        | `-- --from 3`        |
| 4      | Map: обход                                                    | 4        | `-- --from 4`        |
| 5      | Конвертация: Object ↔ Map ↔ массив ↔ JSON                     | 2        | `-- --from 5`        |
| 6      | Паттерны с Map: подсчёт, группировка, индекс по id            | 4        | `-- --from 6`        |
| 7      | Set: основы                                                   | 6        | `-- --from 7`        |
| 8      | Set для быстрых проверок: has O(1) vs includes O(n)           | 3        | `-- --from 8`        |
| 9      | Алгебра множеств (ES2025): union, intersection, difference... | 4        | `-- --from 9`        |
| 10     | WeakMap и WeakSet                                             | 4        | `-- --from 10`       |

## Урок 03 · Spread, Rest и деструктуризация

```bash
npm run lesson 03
```

Конспект: [README](src/03-spread-rest-destructuring/README.md) · Домашка: [exercises.ts](src/03-spread-rest-destructuring/exercises.ts) · Разборы: [solutions/03-spread-rest-destructuring.ts](solutions/03-spread-rest-destructuring.ts)

| Секция | Тема                                                | Примеров | Запуск с этой секции |
| ------ | --------------------------------------------------- | -------- | -------------------- |
| 1      | Одни и те же три точки: как отличить spread от rest | 3        | `-- --from 1`        |
| 2      | Spread с массивами                                  | 5        | `-- --from 2`        |
| 3      | Spread с объектами                                  | 8        | `-- --from 3`        |
| 4      | Rest-параметры функций                              | 3        | `-- --from 4`        |
| 5      | Деструктуризация массивов (по ПОЗИЦИИ)              | 6        | `-- --from 5`        |
| 6      | Деструктуризация объектов (по ИМЕНИ)                | 8        | `-- --from 6`        |
| 7      | Деструктуризация в параметрах функций               | 4        | `-- --from 7`        |
| 8      | Ошибки, которые нужно узнавать в лицо               | 3        | `-- --from 8`        |

## Урок 04 · Объекты и иммутабельность

```bash
npm run lesson 04
```

Конспект: [README](src/04-objects-immutability/README.md) · Домашка: [exercises.ts](src/04-objects-immutability/exercises.ts) · Разборы: [solutions/04-objects-immutability.ts](solutions/04-objects-immutability.ts)

| Секция | Тема                                                     | Примеров | Запуск с этой секции |
| ------ | -------------------------------------------------------- | -------- | -------------------- |
| 1      | Object.keys / values / entries — объект → массив         | 3        | `-- --from 1`        |
| 2      | Object.fromEntries — массив → объект                     | 4        | `-- --from 2`        |
| 3      | Object.groupBy (ES2024)                                  | 2        | `-- --from 3`        |
| 4      | Shallow copy vs deep copy                                | 5        | `-- --from 4`        |
| 5      | Object.assign vs spread                                  | 2        | `-- --from 5`        |
| 6      | Object.freeze — защита от мутаций (shallow!)             | 2        | `-- --from 6`        |
| 7      | Иммутабельные обновления на практике (React/Redux-стиль) | 3        | `-- --from 7`        |
| 8      | 🐛 Реальные баги из-за ссылок и как их чинить            | 8        | `-- --from 8`        |
| 9      | Optional chaining ?. и nullish coalescing ??             | 4        | `-- --from 9`        |
| 10     | Сравнение объектов: ===, Object.is, «глубокое» сравнение | 2        | `-- --from 10`       |
| 11     | for...in vs Object.keys, Object.hasOwn и in              | 2        | `-- --from 11`       |

## Урок 05 · Замыкания, this, итераторы и генераторы

```bash
npm run lesson 05
```

Конспект: [README](src/05-closures-this-iterators/README.md) · Домашка: [exercises.ts](src/05-closures-this-iterators/exercises.ts) · Разборы: [solutions/05-closures-this-iterators.ts](solutions/05-closures-this-iterators.ts)

| Секция | Тема                                                  | Примеров | Запуск с этой секции |
| ------ | ----------------------------------------------------- | -------- | -------------------- |
| 1      | Область видимости (scope): кто какие переменные видит | 3        | `-- --from 1`        |
| 2      | Замыкание (closure)                                   | 5        | `-- --from 2`        |
| 3      | Классика собеса: var vs let в цикле                   | 3        | `-- --from 3`        |
| 4      | Функции высшего порядка на замыканиях: once, memoize  | 2        | `-- --from 4`        |
| 5      | debounce и throttle                                   | 2        | `-- --from 5`        |
| 6      | Каррирование и частичное применение                   | 2        | `-- --from 6`        |
| 7      | this: определяется в момент ВЫЗОВА                    | 6        | `-- --from 7`        |
| 8      | Стрелочные функции и this                             | 4        | `-- --from 8`        |
| 9      | Протокол итерации: что внутри for...of и spread       | 3        | `-- --from 9`        |
| 10     | Генераторы function*                                  | 5        | `-- --from 10`       |

## Урок 06 · Async, Promise, Event Loop

```bash
npm run lesson 06
```

Конспект: [README](src/06-async-promises/README.md) · Домашка: [exercises.ts](src/06-async-promises/exercises.ts) · Разборы: [solutions/06-async-promises.ts](solutions/06-async-promises.ts)

| Секция | Тема                                                          | Примеров | Запуск с этой секции |
| ------ | ------------------------------------------------------------- | -------- | -------------------- |
| 1      | Promise: объект-«обещание» будущего результата                | 4        | `-- --from 1`        |
| 2      | then / catch / finally — цепочки                              | 3        | `-- --from 2`        |
| 3      | async / await                                                 | 4        | `-- --from 3`        |
| 4      | Последовательно vs параллельно                                | 3        | `-- --from 4`        |
| 5      | Event loop: sync → microtasks → macrotasks                    | 4        | `-- --from 5`        |
| 6      | Promise.all — всё или ничего                                  | 3        | `-- --from 6`        |
| 7      | Promise.allSettled — дождаться всех, несмотря на ошибки       | 2        | `-- --from 7`        |
| 8      | Promise.race и Promise.any                                    | 3        | `-- --from 8`        |
| 9      | Паттерны: таймаут, retry, лимит конкурентности, withResolvers | 4        | `-- --from 9`        |
| 10     | Необработанные ошибки (unhandled rejections)                  | 1        | `-- --from 10`       |

## Урок 07 · Fetch API

```bash
npm run lesson 07
```

Конспект: [README](src/07-fetch-api/README.md) · Домашка: [exercises.ts](src/07-fetch-api/exercises.ts) · Разборы: [solutions/07-fetch-api.ts](solutions/07-fetch-api.ts)

| Секция | Тема                                                               | Примеров | Запуск с этой секции |
| ------ | ------------------------------------------------------------------ | -------- | -------------------- |
| 1      | GET-запрос и «два await»                                           | 2        | `-- --from 1`        |
| 2      | ⚠️ Главная ловушка: fetch НЕ реджектится на 404 и 500              | 3        | `-- --from 2`        |
| 3      | Правильный хелпер: проверяем res.ok и кидаем типизированную ошибку | 1        | `-- --from 3`        |
| 4      | Тело ответа: читается один раз, бывает пустым, бывает не JSON      | 4        | `-- --from 4`        |
| 5      | Отправка данных: POST, PUT, PATCH, DELETE                          | 3        | `-- --from 5`        |
| 6      | URL и query-параметры                                              | 3        | `-- --from 6`        |
| 7      | Заголовки: Authorization и компания                                | 1        | `-- --from 7`        |
| 8      | Отмена и таймаут: AbortController                                  | 3        | `-- --from 8`        |
| 9      | Race condition в поиске (почему в React делают abort)              | 2        | `-- --from 9`        |
| 10     | Несколько запросов: параллельно и с частичными ошибками            | 2        | `-- --from 10`       |
| 11     | Retry: что повторять, а что нет                                    | 1        | `-- --from 11`       |
| 12     | Теория для собеса: CORS и fetch vs axios                           | теория   | `-- --from 12`       |

## Урок 08 · TypeScript для mid

```bash
npm run lesson 08
```

Конспект: [README](src/08-typescript-mid/README.md) · Домашка: [exercises.ts](src/08-typescript-mid/exercises.ts) · Разборы: [solutions/08-typescript-mid.ts](solutions/08-typescript-mid.ts)

| Секция | Тема                                                       | Примеров | Запуск с этой секции |
| ------ | ---------------------------------------------------------- | -------- | -------------------- |
| 1      | Типы существуют только при компиляции                      | 2        | `-- --from 1`        |
| 2      | any vs unknown vs never                                    | 6        | `-- --from 2`        |
| 3      | type vs interface                                          | 3        | `-- --from 3`        |
| 4      | Generics: функции, которые сохраняют тип                   | 4        | `-- --from 4`        |
| 5      | Utility types: Partial, Pick, Omit, Record, ReturnType...  | 5        | `-- --from 5`        |
| 6      | Narrowing: как TS сужает тип                               | 5        | `-- --from 6`        |
| 7      | Discriminated unions + exhaustive check                    | 3        | `-- --from 7`        |
| 8      | as const, typeof, keyof, satisfies, template literal types | 4        | `-- --from 8`        |
| 9      | Mapped и conditional types: пишем свои utility             | 3        | `-- --from 9`        |
| 10     | as — обещание компилятору, а не проверка                   | 2        | `-- --from 10`       |
