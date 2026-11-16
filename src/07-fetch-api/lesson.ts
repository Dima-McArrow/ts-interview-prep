/**
 * LESSON 07 — FETCH API (interactive)
 * Run:  npm run lesson 07
 *       npm run lesson 07 -- --from 8   (abort & race conditions)
 *       npm run lesson 07 -- --all
 *
 * Works OFFLINE: global fetch is replaced with a mock server (see mock-api.ts) that uses
 * the real Request/Response classes. For the real internet version: npm run playground.
 */
import { runLesson } from '../_utils/lesson';
import { HttpError } from './http-error';
import { installMockFetch } from './mock-api';

installMockFetch(); // from now on fetch('/users') hits the fake server

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

await runLesson({
  title: 'Урок 07 · Fetch API',
  source: import.meta.filename,
  scope: { HttpError, sleep },
  intro: `
fetch — встроенный в браузер (и в Node 18+) способ делать HTTP-запросы. Его спрашивают почти на каждом фронтенд-собесе, и почти всегда с одной и той же ловушкой (секция 2).

В этом уроке fetch подменён на локальный «фейковый сервер», поэтому всё работает без интернета и детерминированно. Используются НАСТОЯЩИЕ классы Request и Response — всё, что ты увидишь, работает так же с реальным API.

Маршруты фейкового сервера (база https://api.test, можно писать относительные пути):
  GET  /users, /users/:id (1..3, иначе 404)     POST /users (201; 400 без name)
  GET  /items?page=N (3 страницы)               GET  /search?q=... (короткие запросы — медленнее)
  GET  /slow (300 мс)   /broken (500)   /empty (204)   /text (text/plain)
  GET  /flaky (503 дважды, потом 200)   /offline (сетевая ошибка)   /echo-headers

Также доступны: HttpError (наш класс ошибки) и sleep(ms).
`,
  sections: [
    // -----------------------------------------------------------------------
    {
      title: 'GET-запрос и «два await»',
      intro: `
const res = await fetch(url, options?)

fetch возвращает Promise<Response>. Типичный код содержит ДВА await:
1. await fetch(url) — пришли статус и ЗАГОЛОВКИ. Тело ещё может «качаться» (это поток/stream).
2. await res.json() — тело дочитано до конца и распарсено.

Объект Response:
| Свойство / метод                        | Что это                            |
| res.ok                                  | true, если статус 200–299          |
| res.status                              | число: 200, 201, 204, 404, 500...  |
| res.statusText                          | 'OK', 'Not Found'...               |
| res.headers.get(h)                      | заголовок (имя без учёта регистра) |
| res.json()                              | Promise с распарсенным JSON        |
| res.text()                              | Promise со строкой                 |
| res.blob() / arrayBuffer() / formData() | бинарные данные, файлы             |
`,
      examples: [
        {
          explain: 'Простой GET: смотрим на Response и тело.',
          code: `const res = await fetch('/users/1');
console.log('status:', res.status, ' ok:', res.ok);
console.log('content-type:', res.headers.get('Content-Type'));
const user = await res.json();
console.log('body:', user);`,
          why: 'Первый await дал объект Response (статус и заголовки). Второй await прочитал тело. Обрати внимание: Content-Type нашёлся, хотя сервер прислал его в нижнем регистре — заголовки регистронезависимы.',
        },
        {
          explain: 'Почему нельзя сразу res.json без await?',
          code: `const res = await fetch('/users/1');
console.log(res.json());`,
          why: 'res.json() — тоже асинхронный: он возвращает Promise, потому что тело читается потоком. Без await у тебя промис, а не данные.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: '⚠️ Главная ловушка: fetch НЕ реджектится на 404 и 500',
      intro: `
Промис fetch отклоняется (reject) ТОЛЬКО если запрос вообще не удалось выполнить:
- нет сети, DNS, сервер не отвечает;
- CORS заблокировал ответ (в браузере);
- запрос отменён через AbortController.

Если сервер ОТВЕТИЛ — хоть 404, хоть 500 — это успешный Response с res.ok === false. Проверять res.ok — твоя обязанность.

Это отличие от axios: axios реджектится на любой статус вне 2xx.
`,
      examples: [
        {
          explain: 'Запросим несуществующего пользователя. Попадём ли в catch?',
          code: `try {
  const res = await fetch('/users/999');
  console.log('no exception! status:', res.status, ' ok:', res.ok);
  console.log('error body:', await res.json());
} catch (e) {
  console.log('catch:', e instanceof Error ? e.message : e);
}`,
          why: 'Никакого исключения. Код в try выполнился полностью — с данными ошибки. Если бы ты сразу взял user.name из этого ответа, получил бы undefined и баг где-то дальше по коду.',
        },
        {
          explain: '500 — тоже «успешный» промис.',
          code: `const res = await fetch('/broken');
console.log(res.status, res.ok);`,
          why: 'Сервер упал, но ответил → fetch доволен.',
        },
        {
          explain: 'А вот сетевая ошибка — уже реджект.',
          code: `console.log(await fetch('/offline'));`,
          why: 'Сервер не ответил вообще → TypeError ("fetch failed" в Node, "Failed to fetch" в Chrome). Это единственная «нормальная» причина попасть в catch, кроме отмены.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Правильный хелпер: проверяем res.ok и кидаем типизированную ошибку',
      intro: `
В реальном проекте fetch почти никогда не вызывают «голым» — его оборачивают в хелпер, который:
1. проверяет res.ok;
2. при ошибке читает тело (сервер обычно объясняет, что не так) и кидает свою ошибку со статусом;
3. возвращает распарсенный JSON с типом.

Тогда вызывающий код может писать обычный try/catch и различать ошибки: if (e instanceof HttpError && e.status === 404).
`,
      examples: [
        {
          explain: 'Пишем getJSON и вызываем его для существующего и несуществующего пользователя.',
          code: `async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new HttpError(res.status, body);
  }
  // res.json() is Promise<any> in browsers: the cast is OUR promise, not a check
  return res.json() as Promise<T>;
}
console.log('ok:', await getJSON('/users/2'));
try {
  await getJSON('/users/42');
} catch (e) {
  if (e instanceof HttpError) console.log('HttpError:', e.status, e.body);
}`,
          why: 'Теперь 404 превращается в исключение, как и ожидает большинство кода. .catch(() => null) на чтении тела — на случай, если тело ошибки не JSON (например, HTML-страница 502 от прокси).',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Тело ответа: читается один раз, бывает пустым, бывает не JSON',
      intro: `
- Тело — это поток. Его можно прочитать ОДИН раз: второй res.json() → TypeError "Body is unusable". Нужно дважды — res.clone() ДО чтения.
- 204 No Content — тела нет. res.json() упадёт с SyntaxError. res.text() вернёт ''.
- res.json() на не-JSON (HTML, текст) → SyntaxError.
- Безопасная стратегия: смотреть Content-Type или читать text() и парсить вручную (задача T7).
`,
      examples: [
        {
          explain: 'Читаем тело дважды.',
          code: `const res = await fetch('/users/2');
await res.json();
console.log(await res.json());`,
          why: 'Поток уже прочитан до конца. Повторно его не прочитать.',
        },
        {
          explain: 'clone() ДО чтения решает проблему.',
          code: `const res = await fetch('/users/2');
const copy = res.clone();
console.log('original:', (await res.json()).name);
console.log('clone:', (await copy.json()).name);`,
          why: 'clone «раздваивает» поток. Нужно, например, когда логгер хочет посмотреть тело, а основной код — тоже.',
        },
        {
          explain: '204 No Content.',
          code: `const res = await fetch('/empty');
console.log('status:', res.status, ' ok:', res.ok);
console.log('text():', await res.text());
console.log(
  'json():',
  await res.json().catch((e: unknown) => (e instanceof Error ? e.name : String(e))),
);`,
          why: '204 — успешный ответ без тела (часто на DELETE или PUT). text() даёт пустую строку, json() падает: пустая строка — невалидный JSON.',
        },
        {
          explain: 'Текстовый ответ и json().',
          code: `const res = await fetch('/text');
console.log('content-type:', res.headers.get('content-type'));
console.log(await res.clone().text());
console.log(await res.json().catch((e: unknown) => (e instanceof Error ? e.name : String(e))));`,
          why: 'Сервер прислал text/plain. json() пытается распарсить "plain text body" → SyntaxError.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Отправка данных: POST, PUT, PATCH, DELETE',
      intro: `
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

| Что шлём | body                                  | Content-Type                     |
| JSON     | JSON.stringify(obj)                   | 'application/json' — СТАВИШЬ САМ |
| форма    | new URLSearchParams({ a: '1' })       | ставится автоматически           |
| файлы    | new FormData() + append('file', blob) | НЕ ставь сам (нужен boundary)    |

Методы: GET (читать), POST (создать), PUT (заменить целиком), PATCH (обновить часть), DELETE (удалить).
`,
      examples: [
        {
          explain: 'Создаём пользователя.',
          code: `const res = await fetch('/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Dima', email: 'dima@test.dev' }),
});
console.log('status:', res.status);
console.log('created:', await res.json());`,
          why: '201 Created — стандартный статус для успешного создания. Сервер вернул созданный объект с id.',
        },
        {
          explain: '🪤 Частый баг: передать объект в body без JSON.stringify.',
          code: `// as any: TS won't accept a plain object as body — imitating untyped JS code
const req = new Request('https://x.test', { method: 'POST', body: { name: 'Dima' } as any });
console.log(await req.text());`,
          why: 'body ожидает строку/FormData/Blob. Объект превращается в строку через String(obj) → "[object Object]". Сервер получит мусор и ответит 400. В TS этот баг ловится сразу — обычный объект не подходит под тип body. as any здесь изображает код без типов (чистый JS или данные типа any).',
        },
        {
          explain: 'Ошибка валидации от сервера (400).',
          code: `const res = await fetch('/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
});
console.log(res.status, await res.json());`,
          why: 'Сервер сказал, что name обязателен. Опять же: fetch не кинул исключение — проверяй res.ok.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'URL и query-параметры',
      intro: `
Не склеивай query-строку руками ('?q=' + text) — забудешь экранирование, и "a&b" сломает запрос. Используй:
- new URL(path, base) — собрать абсолютный URL;
- url.searchParams.set(key, value) — добавить параметр с правильным экранированием;
- new URLSearchParams(obj) — query из объекта.
`,
      examples: [
        {
          explain: 'Собираем URL с параметрами, которые надо экранировать.',
          code: `const url = new URL('/items', 'https://api.test');
url.searchParams.set('page', '2');
url.searchParams.set('q', 'john doe & co');
console.log(url.toString());
console.log(await (await fetch(url)).json());`,
          why: 'Пробел стал +, & стал %26 — иначе сервер решил бы, что "co" — отдельный параметр. fetch принимает объект URL напрямую.',
        },
        {
          explain: 'Query из объекта, пропуская пустые значения.',
          code: `const filters = { status: 'active', role: undefined, sort: 'name' };
const qs = new URLSearchParams(
  Object.entries(filters).filter((entry): entry is [string, string] => entry[1] !== undefined),
);
console.log(qs.toString());`,
          why: 'Без фильтра undefined превратился бы в строку "undefined" в запросе. Паттерн entries → filter из урока 04.',
        },
        {
          explain: '🪤 Как работает new URL с абсолютным путём?',
          code: `console.log(new URL('/api/v1', 'https://site.com/old/path').href);
console.log(new URL('api/v1', 'https://site.com/old/path').href);`,
          why: 'Путь со слешем "/api/v1" заменяет весь путь базы. Без слеша — относительный: заменяется только последний сегмент ("path"). Частая причина «почему запрос улетел не туда».',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Заголовки: Authorization и компания',
      intro: `
headers можно передать объектом или через new Headers(). Имена заголовков регистронезависимы.

Частые:
- Authorization: Bearer <token> — авторизация;
- Content-Type — что МЫ отправляем;
- Accept — что мы хотим получить.
`,
      examples: [
        {
          explain: 'Сервер /echo-headers возвращает заголовки, которые получил.',
          code: `const res = await fetch('/echo-headers', {
  headers: { Authorization: 'Bearer secret-token', Accept: 'application/json' },
});
const { headers } = await res.json();
console.log('authorization:', headers.authorization);
console.log('accept:', headers.accept);`,
          why: 'Заголовки дошли (имена в нижнем регистре — так их нормализует Headers). В реальном проекте Authorization добавляет API-клиент (задача T9), чтобы не писать его в каждом запросе.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Отмена и таймаут: AbortController',
      intro: `
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort();  // fetch rejects with DOMException name === 'AbortError'

Встроенный таймаут: fetch(url, { signal: AbortSignal.timeout(5000) }) → при срабатывании name === 'TimeoutError'.

Зачем отменять:
- пользователь ушёл со страницы / закрыл модалку;
- пришёл новый поисковый запрос — старый уже не нужен (следующая секция);
- в React: создаёшь controller в useEffect, в cleanup вызываешь controller.abort().
`,
      examples: [
        {
          explain: 'Отменяем долгий запрос через 20 мс.',
          code: `const controller = new AbortController();
const request = fetch('/slow', { signal: controller.signal });
setTimeout(() => controller.abort(), 20);
console.log(await request);`,
          why: 'Запрос реджектится с AbortError. В реальном браузере соединение действительно разрывается, а не просто игнорируется ответ.',
        },
        {
          explain: 'Встроенный таймаут без ручного setTimeout.',
          code: `console.log(await fetch('/slow', { signal: AbortSignal.timeout(30) }));`,
          why: 'AbortSignal.timeout(ms) сам отменяет запрос. Имя ошибки — TimeoutError, поэтому можно отличить «таймаут» от «пользователь отменил».',
        },
        {
          explain:
            'Как отличать отмену от настоящей ошибки (чтобы не показывать юзеру красный тост).',
          code: `const isAbort = (e: unknown) =>
  e instanceof DOMException && (e.name === 'AbortError' || e.name === 'TimeoutError');
const controller = new AbortController();
controller.abort();
const error = await fetch('/users', { signal: controller.signal }).catch((e) => e);
console.log('is abort?', isAbort(error));
console.log('network error is abort?', isAbort(await fetch('/offline').catch((e) => e)));`,
          why: 'Отмена — это нормальная ситуация, её обычно молча игнорируют. Сетевая ошибка (TypeError) — настоящая проблема, её показывают.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Race condition в поиске (почему в React делают abort)',
      intro: `
Пользователь печатает "r", потом "re". Уходят два запроса. Если ответ на "r" придёт ПОЗЖЕ ответа на "re", на экране окажутся результаты для "r" — устаревшие.

На нашем фейковом сервере короткие запросы специально отвечают медленнее, чтобы воспроизвести баг.

Решение: при новом запросе отменять предыдущий (AbortController). Альтернатива — игнорировать ответы, которые не соответствуют последнему запросу (флаг ignore в useEffect).
`,
      examples: [
        {
          explain: '❌ Наивно: оба запроса, кто последний ответил — тот и на экране.',
          code: `let shownOnScreen = '';
const search = async (q: string) => {
  const res = await fetch('/search?q=' + encodeURIComponent(q));
  shownOnScreen = (await res.json()).q;
};
await Promise.all([search('r'), search('re')]);
console.log('user typed "re", screen shows results for:', shownOnScreen);`,
          why: 'Ответ на "re" пришёл первым, потом его ПЕРЕЗАПИСАЛ более медленный ответ на "r". Пользователь видит неправильные результаты.',
        },
        {
          explain: '✅ Каждый новый запрос отменяет предыдущий.',
          code: `let shownOnScreen = '';
let current: AbortController | null = null;
const search = async (q: string) => {
  current?.abort();
  current = new AbortController();
  try {
    const res = await fetch('/search?q=' + encodeURIComponent(q), { signal: current.signal });
    shownOnScreen = (await res.json()).q;
  } catch (e) {
    if (!(e instanceof DOMException && e.name === 'AbortError')) throw e;
    console.log('request for "' + q + '" was aborted');
  }
};
await Promise.all([search('r'), search('re')]);
console.log('screen shows results for:', shownOnScreen);`,
          why: 'Запрос "r" отменён и его ответ никогда не попадёт на экран. Это паттерн из задачи T10 и стандартный cleanup в useEffect.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Несколько запросов: параллельно и с частичными ошибками',
      intro: `
- Нужно ВСЁ или ничего (данные страницы без любого куска бессмысленны) → Promise.all.
- Части независимы (виджеты дашборда, массовая загрузка) → Promise.allSettled или .catch на каждом запросе.
`,
      examples: [
        {
          explain: 'Параллельно: два пользователя за один «раунд».',
          code: `const [ann, bob] = await Promise.all([
  fetch('/users/1').then((r) => r.json()),
  fetch('/users/2').then((r) => r.json()),
]);
console.log(ann.name, '&', bob.name);`,
          why: 'Оба запроса ушли одновременно. Деструктуризация результата Promise.all — частый приём. (Здесь для краткости без проверки res.ok — в реальном коде используй getJSON.)',
        },
        {
          explain: 'Три пользователя, один не существует — не роняем всё.',
          code: `const ids = [1, 2, 999];
const results = await Promise.allSettled(
  ids.map(async (id) => {
    const res = await fetch('/users/' + id);
    if (!res.ok) throw new HttpError(res.status);
    return (await res.json()).name;
  }),
);
const messages = results.map((r) => {
  if (r.status === 'fulfilled') return r.value;
  return 'failed: ' + (r.reason instanceof Error ? r.reason.message : String(r.reason));
});
console.log(messages);`,
          why: 'Каждый запрос сам проверяет res.ok и кидает HttpError. allSettled собирает успехи и ошибки вместе.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Retry: что повторять, а что нет',
      intro: `
| Ошибка                  | Повторять?   | Почему                                          |
| сетевая (TypeError)     | да           | временный сбой сети                             |
| 429 Too Many Requests   | да, с паузой | сервер просит подождать (смотри Retry-After)    |
| 500, 502, 503, 504      | да           | временная проблема сервера / шлюза              |
| 400, 401, 403, 404, 422 | НЕТ          | ошибка в запросе — повтор даст тот же результат |

Между попытками — экспоненциальная пауза (100, 200, 400 мс...), чтобы не добивать и без того плохой сервер.
`,
      examples: [
        {
          explain: '/flaky дважды отвечает 503, потом 200.',
          code: `async function fetchRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      const retriable = res.status === 429 || res.status >= 500;
      if (!retriable || attempt > retries) return res;
      console.log('attempt', attempt, '→', res.status, ', retrying...');
    } catch (e) {
      if (attempt > retries) throw e;
      console.log('attempt', attempt, '→ network error, retrying...');
    }
    await sleep(5 * 2 ** attempt);
  }
}
console.log('final status:', (await fetchRetry('/flaky')).status);
console.log('404 is not retried:', (await fetchRetry('/users/999')).status);`,
          why: 'Две попытки упали с 503, третья успешна. 404 вернулся сразу, без повторов — повторять бессмысленно.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Теория для собеса: CORS и fetch vs axios',
      intro: `
CORS (Cross-Origin Resource Sharing):
- Браузер блокирует ЧТЕНИЕ ответа с другого origin (протокол + домен + порт), если сервер не прислал разрешающий заголовок Access-Control-Allow-Origin.
- Это защита БРАУЗЕРА. Поэтому в Postman/curl/Node тот же запрос работает — там нет браузерной политики.
- Для «непростых» запросов (PUT/DELETE, JSON Content-Type, свои заголовки) браузер сначала шлёт preflight-запрос OPTIONS.
- Чинится на СЕРВЕРЕ (заголовки CORS) или через прокси, а не на фронте.
- Для fetch CORS-ошибка выглядит как сетевая: TypeError "Failed to fetch".

fetch vs axios:
| fetch                                       | axios                   |
| встроен, 0 КБ                               | библиотека              |
| НЕ реджектится на 4xx/5xx — проверяй res.ok | реджектится на не-2xx   |
| JSON: вручную res.json() / JSON.stringify   | автоматически           |
| таймаут — AbortSignal.timeout               | опция timeout           |
| интерсепторы — пишешь обёртку               | встроенные interceptors |
| прогресс загрузки — неудобно (streams)      | onUploadProgress        |

Ответ на собесе: «Использую fetch с тонкой обёрткой (проверка ok, JSON, токен, таймаут), axios — если проект уже на нём или нужен прогресс загрузки».
`,
    },
  ],
  outro: `
Шпаргалка:
- const res = await fetch(url); const data = await res.json(); — два await (заголовки, потом тело).
- fetch НЕ реджектится на 404/500 → if (!res.ok) throw new HttpError(res.status, body).
- Реджект только при сетевой ошибке / CORS / отмене.
- Тело читается один раз (clone до чтения); 204 — без тела; json() на не-JSON → SyntaxError.
- POST JSON: method + 'Content-Type: application/json' + JSON.stringify(body).
- Query — через URL / URLSearchParams, не склейкой строк.
- Отмена: AbortController / AbortSignal.timeout; AbortError и TimeoutError — не «настоящие» ошибки.
- Race condition в поиске → abort предыдущего запроса.
- Retry: сеть, 429, 5xx — да; остальные 4xx — нет. С экспоненциальной паузой.

Дальше:
1. Конспект: src/07-fetch-api/README.md
2. Живой API: npm run playground
3. Домашка: src/07-fetch-api/exercises.ts → npm run test:watch -- 07-fetch
`,
});
