/**
 * LESSON 06 — ASYNC, PROMISES, EVENT LOOP (interactive)
 * Run:  npm run lesson 06
 *       npm run lesson 06 -- --from 5   (event loop)
 *       npm run lesson 06 -- --all
 */
import { runLesson } from '../_utils/lesson';

// Helpers available inside every snippet.
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Fake async API: resolves with `value` after `ms`, or rejects if `fail` is true. */
function delay<T>(value: T, ms: number, fail = false): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(`failed: ${String(value)}`)) : resolve(value)), ms),
  );
}

await runLesson({
  title: 'Урок 06 · Async, Promise, Event Loop',
  source: import.meta.filename,
  scope: { sleep, delay },
  intro: `
JS однопоточный: в каждый момент выполняется только одна строчка твоего кода. При этом браузер и Node умеют ждать сеть, таймеры, диск — не блокируя всё остальное. Как? Через асинхронность: «начни операцию, а когда будет результат — позови меня».

Этот урок — про то, как этим управлять:
1. Promise: что это, как создавать, then/catch/finally.
2. async/await — удобный синтаксис поверх промисов.
3. Event loop: в каком порядке на самом деле выполняется код (любимая задача собесов).
4. Комбинаторы Promise.all / allSettled / race / any.
5. Паттерны: параллельно vs последовательно, таймаут, retry, лимит конкурентности.

В примерах доступны:
  sleep(ms)               — пауза
  delay(value, ms, fail?) — «фейковый API»: через ms мс вернёт value (или ошибку, если fail = true)
`,
  sections: [
    // -----------------------------------------------------------------------
    {
      title: 'Promise: объект-«обещание» будущего результата',
      intro: `
Promise — объект, который представляет результат, которого ЕЩЁ нет.

Три состояния:
- pending — ждём;
- fulfilled — успех, есть value;
- rejected — ошибка, есть reason.

Переход pending → fulfilled/rejected происходит ОДИН раз и навсегда (promise «settled»).

Создание: new Promise((resolve, reject) => { ... }). Функция внутри (executor) запускается СРАЗУ и СИНХРОННО. Асинхронно только то, когда ты вызовешь resolve/reject.
`,
      examples: [
        {
          explain: 'Executor выполняется сразу. Следи за порядком логов.',
          code: `console.log('1. before new Promise');
const p = new Promise<string>((resolve) => {
  console.log('2. executor runs synchronously');
  resolve('done');
});
console.log('3. after new Promise');
console.log('4. value:', await p);`,
          why: 'Никакого «потом» для executor нет: он выполнился прямо во время new Promise. Асинхронно приходит только результат через await/then.',
        },
        {
          explain: 'Промис settle-ится только один раз.',
          code: `const p = new Promise((resolve, reject) => {
  resolve('first');
  resolve('second');
  reject(new Error('third'));
});
console.log(await p);`,
          why: 'Первый resolve зафиксировал результат. Последующие resolve/reject молча игнорируются.',
        },
        {
          explain: 'Готовые промисы: Promise.resolve и Promise.reject.',
          code: `console.log(await Promise.resolve(42));
console.log(
  await Promise.reject(new Error('nope')).catch(
    (e: unknown) => 'caught: ' + (e instanceof Error ? e.message : String(e)),
  ),
);`,
          why: 'Удобно, когда функция должна вернуть промис, а значение уже известно (например, из кэша).',
        },
        {
          explain: 'Промис «в процессе» — что видно, если залогировать его до завершения?',
          code: `const p = delay('data', 20);
console.log('right away:', p);
await p;
console.log('after await:', p);`,
          why: 'Node показывает состояние: <pending>, а после завершения — само значение. Сам промис — это контейнер, а не данные. Чтобы достать данные — await или then.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'then / catch / finally — цепочки',
      intro: `
- then(onFulfilled) — что делать с результатом. ВСЕГДА возвращает НОВЫЙ промис → можно чейнить.
- catch(onRejected) — обработать ошибку любого предыдущего звена.
- finally(fn) — выполнить в любом случае (спрятать лоадер). Значение НЕ меняет.

Правила передачи по цепочке:
1. Вернул из then значение → следующий then получит его.
2. Вернул из then ПРОМИС → цепочка ДОЖДЁТСЯ его и передаст результат.
3. throw в then → цепочка прыгает в ближайший catch.
4. catch вернул значение → цепочка снова «успешная».
`,
      examples: [
        {
          explain: 'Все четыре правила в одной цепочке.',
          code: `const result = await Promise.resolve(2)
  .then((n) => n * 10)
  .then((n) => delay(n + 1, 10))
  .then((n) => {
    if (n > 20) throw new Error('too big: ' + n);
    return n;
  })
  .catch((e: unknown) => 'recovered from "' + (e instanceof Error ? e.message : String(e)) + '"')
  .finally(() => console.log('finally: always runs'));
console.log(result);`,
          why: '2 → 20 (значение) → 21 (дождались промиса delay) → throw → catch вернул строку → цепочка снова успешная → finally не меняет значение.',
        },
        {
          explain: '🪤 Частая ошибка: забыть return внутри then.',
          code: `const value = await Promise.resolve(1)
  .then((n) => {
    delay(n * 100, 10);
  })
  .then((result) => result);
console.log(value);`,
          why: 'Внутри { } без return then возвращает undefined, и цепочка НЕ ждёт delay. Следующий then получил undefined. Та же ловушка, что с map в уроке 01.',
        },
        {
          explain: 'catch ловит ошибку любого звена выше, остальные then пропускаются.',
          code: `const result = await Promise.reject(new Error('boom'))
  .then(() => console.log('skipped 1'))
  .then(() => console.log('skipped 2'))
  .catch((e: unknown) => 'caught: ' + (e instanceof Error ? e.message : String(e)));
console.log(result);`,
          why: 'Отклонённый промис «проваливается» через все then без обработчика ошибок до первого catch.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'async / await',
      intro: `
async/await — синтаксический сахар над промисами. Код выглядит синхронным, но не блокирует поток.

- async-функция ВСЕГДА возвращает Promise. return x = resolve(x), throw e = reject(e).
- await p — «поставь эту функцию на паузу, пока p не settle-ится». Остальной код (другие функции, UI) в это время работает.
- Ошибки ловятся обычным try/catch.
- await можно только внутри async-функции (и на верхнем уровне ES-модуля).
`,
      examples: [
        {
          explain: 'async-функция всегда возвращает промис — даже если внутри просто return 5.',
          code: `async function getNumber() {
  return 5;
}
console.log('without await:', getNumber());
console.log('with await:', await getNumber());`,
          why: 'Без await ты получаешь промис, а не 5. Типичная ошибка: if (await isAdmin()) против if (isAdmin()) — второй вариант всегда truthy, потому что промис — объект!',
        },
        {
          explain: 'async-функция без return.',
          code: `async function nothing() {}
console.log(await nothing());`,
          why: 'Promise<undefined>. Как и у обычной функции без return, только завёрнуто в промис.',
        },
        {
          explain: 'try/catch с await.',
          code: `async function safeLoad() {
  try {
    const data = await delay('x', 10, true);
    return 'ok: ' + data;
  } catch (e) {
    return 'caught: ' + (e instanceof Error ? e.message : String(e));
  }
}
console.log(await safeLoad());`,
          why: 'await «разворачивает» rejected-промис в обычный throw, который ловит catch. Код читается сверху вниз, как синхронный.',
        },
        {
          explain: '🪤 return без await внутри try — ошибка улетает мимо catch.',
          code: `async function bad() {
  try {
    return delay('x', 10, true);
  } catch {
    return 'caught inside';
  }
}
console.log(
  await bad().catch(
    (e: unknown) => 'escaped to caller: ' + (e instanceof Error ? e.message : String(e)),
  ),
);`,
          why: 'return promise отдаёт промис наружу, не дожидаясь его. Когда он отклоняется, функция уже вышла из try. Фикс: return await delay(...) — тогда ошибка случится ВНУТРИ try.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Последовательно vs параллельно',
      intro: `
await в цикле = последовательно: следующий запрос стартует после окончания предыдущего. 3 запроса по 1 с = 3 с.

Promise.all(items.map(async ...)) = параллельно: все стартуют сразу. 3 запроса по 1 с ≈ 1 с.

Выбор:
- запросы независимы → параллельно;
- следующий зависит от предыдущего, или API с жёстким rate limit → последовательно (или лимит конкурентности, секция 9).

⚠️ forEach НЕ ждёт async-колбэки. arr.forEach(async ...) запускает всё и сразу идёт дальше.
`,
      examples: [
        {
          explain: 'Последовательно: await внутри for...of.',
          code: `const start = Date.now();
const results: number[] = [];
for (const id of [1, 2, 3]) {
  results.push(await delay(id, 30));
}
console.log(results, '— took ~' + Math.round((Date.now() - start) / 10) * 10 + 'ms');`,
          why: 'Каждый delay ждал завершения предыдущего: 3 × 30 = ~90 мс.',
        },
        {
          explain: 'Параллельно: Promise.all + map.',
          code: `const start = Date.now();
const results = await Promise.all([1, 2, 3].map((id) => delay(id, 30)));
console.log(results, '— took ~' + Math.round((Date.now() - start) / 10) * 10 + 'ms');`,
          why: 'map сразу ЗАПУСТИЛ все три delay (получили массив промисов), Promise.all дождался всех. ~30 мс. Тот же результат в 3 раза быстрее.',
        },
        {
          explain: '🪤 forEach + async: «почему данные ещё не сохранились?»',
          code: `const saved: number[] = [];
[1, 2, 3].forEach(async (id) => {
  await sleep(10);
  saved.push(id);
});
console.log('right after forEach:', saved);
await sleep(30);
console.log('30ms later:', saved);`,
          why: 'forEach вызывает async-колбэк, получает промис и выбрасывает его — ничего не ждёт. Фикс: for...of с await (последовательно) или await Promise.all(arr.map(async ...)) (параллельно).',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Event loop: sync → microtasks → macrotasks',
      intro: `
Упрощённая модель, которой хватает для 95% вопросов на собесе:

1. Выполняется весь СИНХРОННЫЙ код (call stack пустеет).
2. Выполняются ВСЕ МИКРОзадачи: колбэки then/catch/finally, продолжение после await, queueMicrotask.
3. Выполняется ОДНА МАКРОзадача: колбэк setTimeout/setInterval, событие, I/O.
4. Снова шаг 2 (все микрозадачи), потом следующая макрозадача — и так по кругу.

Мнемоника: sync → micro (промисы) → macro (таймеры).
setTimeout(fn, 0) — это НЕ «сразу», а «после всего синхронного и всех микрозадач».
Микрозадачи выполняются по очереди (FIFO), в порядке постановки.
`,
      examples: [
        {
          explain: 'Сначала понятная версия: подписываем каждую строку её типом и смотрим порядок.',
          code: `const order: string[] = [];
order.push('sync 1');
setTimeout(() => order.push('macro: setTimeout'));
Promise.resolve().then(() => order.push('micro: then'));
order.push('sync 2');
await sleep(5);
console.log(order);`,
          why: 'Сначала весь синхронный код (sync 1, sync 2), потом микрозадача (then), потом макрозадача (setTimeout) — хотя setTimeout был запланирован РАНЬШЕ then.',
        },
        {
          explain: '🪤 Классика собеса в «голом» виде. Что выведется?',
          code: `const out: number[] = [];
out.push(1);
setTimeout(() => out.push(2));
Promise.resolve().then(() => out.push(3));
out.push(4);
await sleep(5);
console.log(out);`,
          why: '1 и 4 — синхронные, 3 — микрозадача, 2 — макрозадача. Ответ 1, 4, 3, 2.',
        },
        {
          explain: 'async-функция выполняется СИНХРОННО до первого await.',
          code: `const out: string[] = [];
async function work() {
  out.push('a: inside async, before await');
  await null;
  out.push('c: after await (microtask)');
}
work();
out.push('b: after calling work()');
await sleep(5);
console.log(out);`,
          why: 'Вызов async-функции не «откладывает» её тело: оно идёт синхронно до await. Всё после await — микрозадача.',
        },
        {
          explain: 'Микрозадачи внутри макрозадачи: выполнятся ДО следующей макрозадачи.',
          code: `const out: string[] = [];
setTimeout(() => {
  out.push('T1');
  Promise.resolve().then(() => out.push('micro inside T1'));
});
setTimeout(() => out.push('T2'));
await sleep(10);
console.log(out);`,
          why: 'После каждой макрозадачи (T1) движок сначала выгребает ВСЕ микрозадачи, и только потом берёт следующую макрозадачу (T2).',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Promise.all — всё или ничего',
      intro: `
Promise.all(iterable) ждёт ВСЕ промисы.
- Успех: массив результатов В ПОРЯДКЕ ВХОДА (не в порядке завершения!).
- Ошибка: реджектится с ПЕРВОЙ ошибкой (fail-fast). Остальные промисы при этом НЕ отменяются — просто их результаты игнорируются.
- Можно передавать обычные значения — они считаются уже выполненными.
- Promise.all([]) → сразу [].
`,
      examples: [
        {
          explain: 'Порядок результатов = порядок входа.',
          code: `console.log(await Promise.all([delay('slow', 40), delay('fast', 10), 'plain value']));`,
          why: '"fast" завершился первым, но в результате стоит на своём месте (индекс 1). Удобно: результат можно сразу деструктурировать: const [user, posts] = await Promise.all([...]).',
        },
        {
          explain: 'Fail-fast: одна ошибка — и весь Promise.all отклонён.',
          code: `console.log(await Promise.all([delay('a', 40), delay('b', 10, true), delay('c', 20)]));`,
          why: 'Через 10 мс b упал → Promise.all сразу отклонился с его ошибкой. Результаты a и c потеряны, хотя они успешно завершатся позже.',
        },
        {
          explain: 'Пустой массив.',
          code: `console.log(await Promise.all([]));`,
          why: 'Нечего ждать — сразу [].',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Promise.allSettled — дождаться всех, несмотря на ошибки',
      intro: `
Promise.allSettled НИКОГДА не реджектится. Возвращает массив объектов:
- { status: 'fulfilled', value }
- { status: 'rejected', reason }

Когда: дашборд из нескольких независимых виджетов (упал один — остальные показываем), массовые операции с отчётом «сколько успешно / сколько с ошибкой».
`,
      examples: [
        {
          explain: 'Успех и ошибка в одном вызове.',
          code: `const results = await Promise.allSettled([delay('ok', 10), delay('bad', 20, true)]);
const messages = results.map((r) => {
  if (r.status === 'fulfilled') return 'value: ' + r.value;
  return 'error: ' + (r.reason instanceof Error ? r.reason.message : String(r.reason));
});
console.log(messages);`,
          why: 'Оба промиса дождались, ошибка не уронила всё. Проверка r.status === "fulfilled" ещё и сужает тип в TS (discriminated union — урок 08).',
        },
        {
          explain: 'Разделить успехи и ошибки.',
          code: `const results = await Promise.allSettled([delay(1, 5), delay(2, 5, true), delay(3, 5)]);
console.log('ok:', results.filter((r) => r.status === 'fulfilled').map((r) => r.value));
console.log('failed:', results.filter((r) => r.status === 'rejected').length);`,
          why: 'Типичный код для «массовых операций»: показать пользователю, что 2 из 3 сохранились.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Promise.race и Promise.any',
      intro: `
| Метод        | Результат                           | Реджект                                |
| Promise.race | первый SETTLED (успех ИЛИ ошибка)   | если первым завершился с ошибкой       |
| Promise.any  | первый УСПЕШНЫЙ (ошибки игнорирует) | только если упали ВСЕ → AggregateError |

race — для таймаутов («запрос или таймер, кто быстрее»).
any — для «самого быстрого рабочего зеркала / CDN».
`,
      examples: [
        {
          explain: 'race: кто первый — тот и победил.',
          code: `console.log(await Promise.race([delay('slow', 40), delay('fast', 10)]));
console.log(
  await Promise.race([delay('slow', 40), delay('fast-fail', 10, true)]).catch(
    (e: unknown) => 'rejected: ' + (e instanceof Error ? e.message : String(e)),
  ),
);`,
          why: 'race не смотрит, успех это или ошибка: первый завершившийся определяет результат.',
        },
        {
          explain: 'any: первый УСПЕШНЫЙ, быстрые ошибки игнорируются.',
          code: `console.log(await Promise.any([delay('slow-ok', 40), delay('x', 10, true)]));`,
          why: 'Быстрый промис упал, но any подождал успешный.',
        },
        {
          explain: 'any, когда упали все.',
          code: `const result = await Promise.any([delay('a', 10, true), delay('b', 20, true)]).catch(
  (e: AggregateError) => e.name + ' with ' + e.errors.length + ' errors',
);
console.log(result);`,
          why: 'AggregateError хранит все ошибки в e.errors.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Паттерны: таймаут, retry, лимит конкурентности, withResolvers',
      intro: `
Эти функции просят написать на собесах mid-уровня (они же есть в упражнениях):
- withTimeout(promise, ms) — через Promise.race;
- retry(fn, attempts) — цикл + try/catch (+ экспоненциальная задержка между попытками);
- mapLimit(items, limit, fn) — не больше N задач одновременно (пул «воркеров»);
- Promise.withResolvers() (ES2024) — достать resolve/reject наружу из executor.
`,
      examples: [
        {
          explain: 'withTimeout через race.',
          code: `function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
console.log(await withTimeout(delay('fast', 10), 100));
console.log(
  await withTimeout(delay('slow', 100), 20).catch((e: unknown) =>
    e instanceof Error ? e.message : String(e),
  ),
);`,
          why: 'Гонка между реальным промисом и таймером, который реджектится. finally убирает таймер, чтобы он не держал процесс и не срабатывал впустую.',
        },
        {
          explain: 'retry с экспоненциальной задержкой. Функция падает 2 раза, на третий — успех.',
          code: `async function retry<T>(fn: () => Promise<T>, attempts: number, baseMs = 5): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      console.log('attempt', i, 'failed');
      if (i >= attempts) throw e;
      await sleep(baseMs * 2 ** (i - 1));
    }
  }
}
let calls = 0;
console.log('result:', await retry(() => delay('success', 5, ++calls < 3), 5));`,
          why: 'return await — обязательно, иначе catch не увидит ошибку (секция 3). Задержки 5, 10, 20... мс (backoff) дают серверу «отдышаться».',
        },
        {
          explain: 'Лимит конкурентности: 6 задач, не больше 2 одновременно.',
          code: `async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
let inFlight = 0;
let maxInFlight = 0;
const res = await mapLimit([1, 2, 3, 4, 5, 6], 2, async (n) => {
  inFlight++;
  maxInFlight = Math.max(maxInFlight, inFlight);
  await sleep(10);
  inFlight--;
  return n * 10;
});
console.log(res, ' max in flight:', maxInFlight);`,
          why: 'Запускаем limit «воркеров». Каждый берёт следующий индекс (next++ безопасен: JS однопоточный, между await никто не вмешается) и обрабатывает, пока задачи не кончатся. Результаты кладём по индексу — порядок сохранён.',
        },
        {
          explain: 'Promise.withResolvers: resolve снаружи — удобно для событий и очередей.',
          code: `const { promise, resolve } = Promise.withResolvers<string>();
setTimeout(() => resolve('resolved from outside'), 10);
console.log(await promise);`,
          why: 'Раньше для этого писали let resolve; new Promise((r) => (resolve = r)). Теперь — одна строка.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Необработанные ошибки (unhandled rejections)',
      intro: `
Если промис отклонился, а catch/try-await нигде нет — это unhandled rejection.
- В браузере: ошибка в консоли + событие unhandledrejection.
- В Node: по умолчанию ПРОЦЕСС ПАДАЕТ.

Самая частая причина — забыли await (или return) перед промисом. Код «выглядит» обработанным, но try/catch его не ловит.
`,
      examples: [
        {
          explain: 'Забыли await: try/catch не ловит ошибку.',
          code: `async function save() {
  try {
    delay('save', 5, true);
    return 'looks fine?';
  } catch {
    return 'caught';
  }
}
console.log(await save());
await sleep(20);`,
          why: 'delay запущен без await → функция сразу вернула "looks fine?", а ошибка случилась ПОЗЖЕ, когда try уже закончился. Наш движок перехватил её как unhandled rejection; в Node без этого процесс бы упал. Линтер (@typescript-eslint/no-floating-promises) ловит такие места.',
        },
      ],
    },
  ],
  outro: `
Шпаргалка:
- Promise: pending → fulfilled/rejected, один раз. Executor — синхронный.
- then возвращает НОВЫЙ промис; return значение / промис / throw управляют цепочкой. Не забывай return!
- async-функция всегда возвращает Promise; await разворачивает его; ошибки — через try/catch.
- В try используй return await, иначе ошибка улетит мимо catch.
- Event loop: sync → все микрозадачи (then/await) → одна макрозадача (setTimeout) → снова микрозадачи...
- Параллельно: await Promise.all(items.map(fn)). Последовательно: for...of + await. forEach + async НЕ ждёт.
- all — всё или первая ошибка; allSettled — всегда ждёт всех; race — первый settled; any — первый успешный.
- Паттерны: withTimeout (race), retry (цикл + backoff), mapLimit (воркеры), withResolvers.

Дальше:
1. Конспект: src/06-async-promises/README.md
2. Домашка: src/06-async-promises/exercises.ts → npm run test:watch -- 06-async
`,
});
