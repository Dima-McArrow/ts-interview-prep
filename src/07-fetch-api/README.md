# 07 · Fetch API — конспект

> Как проходить модуль:
>
> 1. Интерактивная лекция (офлайн, фейковый сервер): `npm run lesson 07`
> 2. Живой API: `npm run playground` (нужен интернет)
> 3. Этот конспект — справочник
> 4. Домашка: `src/07-fetch-api/exercises.ts` + `npm run test:watch -- 07-fetch` (тесты подменяют `fetch` моком)
> 5. Разборы: `solutions/07-fetch-api.ts`

## 1. Базовая форма

```ts
const res = await fetch(url, {
  method: 'POST', // GET by default
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(data), // a STRING (or FormData / Blob / URLSearchParams), not an object!
  signal, // AbortSignal for cancel / timeout
});
if (!res.ok) throw new HttpError(res.status, await res.json().catch(() => null));
const json = await res.json();
```

**Два `await`:** первый — пришли статус и заголовки; второй — дочитано и распарсено тело (это поток).

## 2. ⚠️ Главная ловушка

**`fetch` НЕ реджектится на HTTP-ошибки (404, 500…).** На них приходит обычный `Response` с `res.ok === false`.
Реджект бывает **только** при: сетевой ошибке (нет сети, DNS), блокировке CORS, отмене (`AbortError` / `TimeoutError`).

## 3. Карточка `Response`

| Свойство / метод                              | Что это                                                          |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `res.ok`                                      | `true` для статусов **200–299**                                  |
| `res.status` / `res.statusText`               | `404` / `'Not Found'`                                            |
| `res.headers.get('content-type')`             | заголовок (регистр имени не важен)                               |
| `res.json()`                                  | `Promise` с JSON; на пустом/не-JSON теле → `SyntaxError`         |
| `res.text()`                                  | `Promise<string>`; на 204 → `''`                                 |
| `res.blob()` / `arrayBuffer()` / `formData()` | бинарные данные, файлы                                           |
| `res.clone()`                                 | копия, если тело нужно прочитать дважды (вызывать **до** чтения) |

**Тело читается один раз.** Второй `res.json()` → `TypeError: Body is unusable`.

## 4. Отправка данных

| Что шлём | `body`                                    | `Content-Type`                       |
| -------- | ----------------------------------------- | ------------------------------------ |
| JSON     | `JSON.stringify(obj)`                     | `application/json` — **ставишь сам** |
| форма    | `new URLSearchParams({ a: '1' })`         | автоматически                        |
| файлы    | `new FormData()` + `append('file', blob)` | **не ставь сам** (нужен boundary)    |

🪤 `body: { a: 1 }` без `stringify` → на сервер уходит строка `"[object Object]"`.

Методы: **GET** — читать, **POST** — создать (201), **PUT** — заменить целиком, **PATCH** — обновить часть, **DELETE** — удалить (часто 204).

## 5. URL и query-параметры

```ts
const url = new URL('/items', 'https://api.test');
url.searchParams.set('q', 'john doe & co'); // escaping is automatic
fetch(url); // https://api.test/items?q=john+doe+%26+co

new URLSearchParams({ page: '2', sort: 'name' }).toString(); // 'page=2&sort=name'
```

🪤 `new URL('/api', 'https://site.com/old/path')` → `https://site.com/api` (путь со `/` заменяет весь путь базы). Без `/` → `https://site.com/old/api`.

## 6. Отмена и таймаут

```ts
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort(); // rejects with DOMException 'AbortError'

fetch(url, { signal: AbortSignal.timeout(5000) }); // → 'TimeoutError'
```

React: создаёшь `controller` в `useEffect`, в cleanup — `controller.abort()`. Это решает **race condition**, когда ответ на старый запрос приходит позже нового и перезаписывает экран.

Отмена — не «настоящая» ошибка: `AbortError`/`TimeoutError` обычно молча игнорируют, а не показывают тост.

## 7. Retry: что повторять

| Ошибка                            | Повторять?                  |
| --------------------------------- | --------------------------- |
| сетевая (`TypeError`)             | ✅                          |
| `429 Too Many Requests`           | ✅ с паузой (`Retry-After`) |
| `500`, `502`, `503`, `504`        | ✅                          |
| `400`, `401`, `403`, `404`, `422` | ❌ повтор даст то же самое  |

Между попытками — экспоненциальная пауза (100, 200, 400 мс…).

## 8. Статусы, которые надо знать

`200` OK · `201` Created · `204` No Content (**тела нет**) · `301/302` редирект (fetch следует сам) · `304` Not Modified · `400` Bad Request · `401` Unauthorized (не залогинен) · `403` Forbidden (нет прав) · `404` Not Found · `409` Conflict · `422` Validation · `429` Too Many Requests · `500` Server Error · `502/503/504` проблемы шлюза/доступности.

## 9. CORS в двух словах

- Браузер блокирует **чтение** ответа с другого origin (протокол + домен + порт), если сервер не прислал `Access-Control-Allow-Origin`.
- Это защита **браузера**: в Postman/curl/Node тот же запрос работает.
- «Непростые» запросы (PUT/DELETE, JSON, свои заголовки) → сначала **preflight** `OPTIONS`.
- Чинится **на сервере** (заголовки) или прокси. Для `fetch` выглядит как `TypeError: Failed to fetch`.

## 10. fetch vs axios

| fetch                           | axios                 |
| ------------------------------- | --------------------- |
| встроен, 0 КБ                   | библиотека            |
| **не** реджектится на 4xx/5xx   | реджектится на не-2xx |
| JSON вручную                    | автоматически         |
| таймаут — `AbortSignal.timeout` | опция `timeout`       |
| интерсепторы — своя обёртка     | `interceptors`        |
| прогресс загрузки — неудобно    | `onUploadProgress`    |

## 11. Частые вопросы на собесе (с ответами)

**Реджектится ли `fetch` на 404?**
Нет. Только на сетевые ошибки, CORS и отмену. Проверяй `res.ok`.

**Почему два `await`?**
`fetch` резолвится на заголовках; тело — поток, который читается отдельно (`res.json()`).

**Как отменить запрос? Сделать таймаут?**
`AbortController` / `AbortSignal.timeout(ms)`.

**Как отправить JSON? Файл?**
`JSON.stringify` + `Content-Type: application/json`. Для файла — `FormData` без ручного `Content-Type`.

**Что такое CORS и почему в Postman работает?**
Политика браузера. Postman — не браузер.

**Как избежать race condition при поиске?**
Отменять предыдущий запрос (`AbortController`) или игнорировать устаревшие ответы.

**Чем `fetch` отличается от `axios`?** — см. таблицу в разделе 10.
