# 06 · Async, Promise, Event Loop — конспект

> Как проходить модуль:
>
> 1. Интерактивная лекция: `npm run lesson 06` (event loop: `-- --from 5`)
> 2. Этот конспект — справочник
> 3. Домашка: `src/06-async-promises/exercises.ts` + `npm run test:watch -- 06-async`
> 4. Разборы: `solutions/06-async-promises.ts`

## 1. Promise

**Объект-«обещание» результата, которого ещё нет.** Состояния: `pending` → `fulfilled` (value) **или** `rejected` (reason). Переход — **один раз**.

```ts
const p = new Promise<number>((resolve, reject) => {
  // the executor runs IMMEDIATELY and synchronously
  setTimeout(() => resolve(42), 100);
});
Promise.resolve(1); // already fulfilled
Promise.reject(new Error('x')); // already rejected
Promise.withResolvers<T>(); // ES2024: { promise, resolve, reject }
```

## 2. `then` / `catch` / `finally`

| Метод         | Что делает                          | Возвращает                                               |
| ------------- | ----------------------------------- | -------------------------------------------------------- |
| `then(fn)`    | обработать результат                | **новый** промис                                         |
| `catch(fn)`   | обработать ошибку любого звена выше | новый промис (снова «успешный», если fn вернул значение) |
| `finally(fn)` | выполнить всегда (спрятать лоадер)  | новый промис с **тем же** значением                      |

Правила цепочки:

1. `return value` → следующий `then` получит `value`.
2. `return promise` → цепочка **дождётся** промиса.
3. `throw` → переход к ближайшему `catch`.
4. ⚠️ Забыл `return` в `{ }` → следующий `then` получит `undefined` и **не дождётся** вложенного промиса.

## 3. `async` / `await`

- `async`-функция **всегда** возвращает `Promise` (`return x` → resolve, `throw e` → reject). Без `return` → `Promise<undefined>`.
- `await p` — пауза **этой** функции до settle промиса; остальной код работает.
- Ошибки — через `try/catch`.
- ⚠️ `if (isAdmin())` без `await` — всегда truthy: промис — объект.
- ⚠️ Внутри `try` пиши `return await fn()`, иначе rejection улетит мимо `catch`.

## 4. Последовательно vs параллельно

```ts
// ❌ sequential: 3 × 1s = 3s (OK only if requests depend on each other / rate limit)
for (const id of ids) results.push(await fetchUser(id));

// ✅ parallel: ~1s
const results = await Promise.all(ids.map((id) => fetchUser(id)));

// ❌ forEach does NOT wait for async callbacks
ids.forEach(async (id) => await save(id)); // the code below runs immediately
```

## 5. Event loop

1. Весь **синхронный** код.
2. **Все микрозадачи** (FIFO): `then`/`catch`/`finally`, продолжение после `await`, `queueMicrotask`.
3. **Одна макрозадача**: `setTimeout`/`setInterval`, события, I/O.
4. → снова п.2.

```ts
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
console.log(4);
// 1 4 3 2
```

- `async`-функция выполняется **синхронно до первого `await`**.
- `setTimeout(fn, 0)` — не «сразу», а «после синхронного кода и всех микрозадач».
- После **каждой** макрозадачи выгребаются **все** микрозадачи.

## 6. Комбинаторы

| Метод                    | Ждёт            | Fulfilled, когда… | Rejected, когда…              | Результат                              |
| ------------------------ | --------------- | ----------------- | ----------------------------- | -------------------------------------- |
| `Promise.all(ps)`        | все             | **все** успешны   | **первая** ошибка (fail-fast) | массив значений **в порядке входа**    |
| `Promise.allSettled(ps)` | все             | **всегда**        | никогда                       | `{status, value}` / `{status, reason}` |
| `Promise.race(ps)`       | первый settled  | первый — успех    | первый — ошибка               | значение / ошибка самого быстрого      |
| `Promise.any(ps)`        | первый успешный | хоть один успешен | **все** упали                 | значение / `AggregateError`            |

- `Promise.all([])` → `[]` сразу.
- `Promise.all` **не отменяет** остальные промисы при ошибке (для отмены — `AbortController`, урок 07).

## 7. Паттерны (все есть в задачах)

```ts
// Timeout
Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));

// Retry with exponential backoff
for (let i = 1; ; i++) {
  try {
    return await fn();
  } catch (e) {
    if (i >= attempts) throw e;
    await sleep(base * 2 ** (i - 1));
  }
}

// Concurrency limit: start `limit` workers that pull the next index
async function worker() {
  while (next < items.length) {
    const i = next++;
    results[i] = await fn(items[i]);
  }
}
await Promise.all(Array.from({ length: limit }, worker));
```

## 8. Unhandled rejections

Отклонённый промис без `catch` / `try-await` → в браузере ошибка в консоли, в **Node процесс падает**. Главная причина — **забытый `await`**. Линтер: `@typescript-eslint/no-floating-promises`.

## 9. Частые вопросы на собесе (с ответами)

**Разница `all` / `allSettled` / `race` / `any`?** — см. таблицу в разделе 6.

**Что выведет код с `setTimeout` + `Promise.then` + `console.log`?**
Сначала синхронное, потом микрозадачи (промисы), потом макрозадачи (таймеры).

**Почему `forEach` + `async` не работает?**
`forEach` не ждёт возвращённые промисы. Нужно `for...of` + `await` или `Promise.all(arr.map(...))`.

**Как сделать таймаут для промиса? Retry?**
`Promise.race` с таймером. Retry — цикл + `try { return await }` + backoff.

**Как ограничить количество параллельных запросов?**
Пул из N «воркеров», которые берут следующий элемент (`mapLimit`), или библиотека `p-limit`.

**Что вернёт `async` функция без `return`?**
`Promise<undefined>`.

**Выполняется ли executor `new Promise(...)` асинхронно?**
Нет, синхронно и сразу. Асинхронны только колбэки `then`.
