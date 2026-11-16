/**
 * LESSON 05 — CLOSURES, THIS, ITERATORS & GENERATORS (interactive)
 * Run:  npm run lesson 05
 *       npm run lesson 05 -- --from 7   (this)
 *       npm run lesson 05 -- --all
 */
import { runLesson } from '../_utils/lesson';

// Helper available inside every snippet: await sleep(ms).
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

await runLesson({
  title: 'Урок 05 · Замыкания, this, итераторы и генераторы',
  source: import.meta.filename,
  scope: { sleep },
  intro: `
Это «фундаментальный» урок: темы, по которым на собесе проверяют, понимаешь ли ты, КАК работает JS, а не только как им пользоваться.

1. Область видимости и замыкания — на них держатся React-хуки, debounce, memoize, модули, фабрики.
2. this — почему «теряется контекст» и как это чинить (bind, стрелки).
3. Итераторы и генераторы — что на самом деле происходит в for...of и spread.

Во всех примерах доступна функция sleep(ms) — пауза для асинхронных демонстраций.
`,
  sections: [
    // -----------------------------------------------------------------------
    {
      title: 'Область видимости (scope): кто какие переменные видит',
      intro: `
Лексическая область видимости: функция видит переменные того места, где она НАПИСАНА (а не того, где её вызвали). Внутренние области видят внешние, внешние внутренние — нет.

Блочная область: let и const живут внутри ближайших { }. var — внутри функции целиком (игнорирует блоки if/for) — один из источников классических багов.
`,
      examples: [
        {
          explain: 'Внутренняя функция видит внешние переменные.',
          code: `const greeting = 'Hello';
function outer() {
  const name = 'Ann';
  function inner() {
    return greeting + ', ' + name;
  }
  return inner();
}
console.log(outer());`,
          why: 'inner ищет переменную сначала у себя, потом во внешней функции (name), потом ещё выше (greeting). Это и есть цепочка областей видимости (scope chain).',
        },
        {
          explain: 'Лексическая = «где написана», а не «откуда вызвана».',
          code: `const x = 'global';
function readX() {
  return x;
}
function caller() {
  const x = 'local in caller';
  return readX();
}
console.log(caller());`,
          why: 'readX написана на верхнем уровне, поэтому видит верхний x. То, что её вызвали из caller со своим x, не важно.',
        },
        {
          explain: 'let — блочная область, var — функциональная.',
          code: `if (true) {
  var a = 'var leaks out';
  let b = 'let stays inside';
}
console.log(typeof a, '/', typeof b);`,
          typecheck: 'and-run',
          why: 'var «вытекает» из блока if (видна во всей функции), let — нет. TS это видит сразу: снаружи блока имени b просто нет (Cannot find name \'b\'), а JS молча даёт typeof → "undefined". Поэтому в современном коде var не используют.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Замыкание (closure)',
      intro: `
Замыкание = функция + ссылка на переменные того окружения, где она была создана.

Функция «помнит» внешние переменные ДАЖЕ ПОСЛЕ ТОГО, как внешняя функция завершилась. Переменные не уничтожаются, пока на них ссылается хотя бы одна живая функция.

Важно: замыкание хранит ссылку на ПЕРЕМЕННУЮ, а не снимок значения. Поменялась переменная — функция видит новое значение.

Где используется: приватное состояние (фабрики, модули), once/memoize/debounce, каррирование, обработчики событий, React-хуки (и их баги со «stale closure»).
`,
      examples: [
        {
          explain: 'Классика: счётчик с приватным состоянием.',
          code: `function createCounter() {
  let count = 0;
  return () => ++count;
}
const next = createCounter();
console.log(next(), next(), next());`,
          why: 'createCounter уже отработала, но count жив: на него ссылается возвращённая стрелка. Каждый вызов next меняет ТОТ ЖЕ count.',
        },
        {
          explain: 'Каждый вызов фабрики создаёт НОВОЕ замыкание со своей переменной.',
          code: `function createCounter() {
  let count = 0;
  return () => ++count;
}
const a = createCounter();
const b = createCounter();
a();
a();
console.log('a:', a(), ' b:', b());`,
          why: 'У a и b свои независимые count. Это и есть «приватное состояние» без классов.',
        },
        {
          explain: 'Снаружи до приватной переменной не добраться.',
          code: `function createWallet(initial: number) {
  let balance = initial;
  return {
    deposit: (amount: number) => (balance += amount),
    getBalance: () => balance,
  };
}
const wallet = createWallet(100);
wallet.deposit(50);
console.log('balance:', wallet.getBalance());
console.log('has balance property?', 'balance' in wallet);`,
          why: 'balance существует только внутри замыкания. Изменить его можно только через deposit. Это инкапсуляция — как private в классах.',
        },
        {
          explain: 'Замыкание хранит ссылку на переменную, а не значение на момент создания.',
          code: `let greeting = 'hello';
const sayIt = () => greeting;
greeting = 'bonjour';
console.log(sayIt());`,
          why: 'sayIt читает greeting в момент ВЫЗОВА. Переменная поменялась → функция видит новое значение.',
        },
        {
          explain: '«Stale closure» — та же механика, но баг (так выглядит в React-хуках).',
          code: `function makeLogger() {
  let count = 0;
  const snapshot = count; // value copied at creation time
  return {
    inc: () => count++,
    logLive: () => count,
    logStale: () => snapshot,
  };
}
const l = makeLogger();
l.inc();
l.inc();
console.log('live:', l.logLive(), ' stale:', l.logStale());`,
          why: 'logLive читает переменную count → 2. logStale читает snapshot — переменную, в которую СКОПИРОВАЛИ значение при создании → 0. В React это выглядит как «в setInterval/useEffect всегда старое значение state»: колбэк замкнул переменную из старого рендера.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Классика собеса: var vs let в цикле',
      intro: `
Сначала разберём механику на массиве функций, потом — то же самое в «собесовском» виде с setTimeout.

var — ОДНА переменная на всю функцию. let в заголовке for — НОВАЯ переменная на КАЖДУЮ итерацию.
`,
      examples: [
        {
          explain: 'Соберём функции в массив в цикле с var и вызовем их после цикла.',
          code: `const fns: (() => number)[] = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns.map((f) => f()));`,
          why: 'Все три стрелки замкнули ОДНУ и ту же переменную i. К моменту вызова цикл закончился, i = 3. Поэтому [3, 3, 3].',
        },
        {
          explain: 'То же самое с let.',
          code: `const fns: (() => number)[] = [];
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns.map((f) => f()));`,
          why: 'С let на каждой итерации создаётся НОВАЯ переменная i, и каждая стрелка замыкает свою: 0, 1, 2.',
        },
        {
          explain: '🪤 Теперь собесовская версия: setTimeout в цикле с var.',
          code: `const out: number[] = [];
for (var i = 0; i < 3; i++) {
  setTimeout(() => out.push(i));
}
await sleep(10);
console.log(out);`,
          why: 'Колбэки setTimeout выполняются ПОСЛЕ цикла (урок 06 — event loop), а замкнули они одну переменную i = 3. Фикс: let вместо var.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Функции высшего порядка на замыканиях: once, memoize',
      intro: `
Функция высшего порядка (HOF) — функция, которая принимает и/или возвращает функцию. Почти все полезные утилиты (once, memoize, debounce, throttle) устроены одинаково:

  function wrapper(fn) {
    // state lives here, in the closure
    return (...args) => { /* use state, call fn(...args) */ };
  }
`,
      examples: [
        {
          explain:
            'once: выполнить функцию только при первом вызове, дальше отдавать запомненный результат.',
          code: `function once<A extends unknown[], R>(fn: (...args: A) => R) {
  let called = false;
  let result: R;
  return (...args: A): R => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
const init = once(() => {
  console.log('init runs!');
  return 42;
});
console.log('first:', init());
console.log('second:', init());`,
          why: 'called и result живут в замыкании и переживают вызовы. "init runs!" напечатан один раз. Применение: инициализация SDK, подключение к БД.',
        },
        {
          explain: 'memoize: кэшировать результат по аргументу.',
          code: `function memoize<R>(fn: (n: number) => R) {
  const cache = new Map<number, R>();
  return (n: number): R => {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n)!;
  };
}
let calls = 0;
const slowSquare = (n: number) => {
  calls++;
  return n * n;
};
const fastSquare = memoize(slowSquare);
fastSquare(9);
fastSquare(9);
fastSquare(9);
console.log('real calls:', calls);`,
          why: 'cache — в замыкании. Первый вызов посчитал и сохранил, следующие взяли из Map. Так работают useMemo, reselect и кэш запросов.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'debounce и throttle',
      intro: `
Обе утилиты ограничивают, как часто вызывается функция. Обе хранят состояние (таймер / время последнего вызова) в замыкании.

| Утилита  | Поведение                                                | Где применять                                 |
| debounce | вызвать через ms после ПОСЛЕДНЕГО вызова (ждёт «тишины») | поиск при вводе, автосохранение, resize-финал |
| throttle | вызывать НЕ ЧАЩЕ раза в ms                               | scroll, mousemove, отправка аналитики         |

Аналогия: debounce — лифт, который ждёт, пока все зайдут (каждый новый человек сбрасывает таймер). Throttle — автобус по расписанию: уезжает раз в N минут, сколько бы людей ни пришло.
`,
      examples: [
        {
          explain: 'debounce: пользователь быстро печатает "react" — сколько будет запросов к API?',
          code: `function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
const requests: string[] = [];
const search = debounce((q: string) => requests.push(q), 20);
for (const q of ['r', 're', 'rea', 'reac', 'react']) search(q);
await sleep(40);
console.log(requests);`,
          why: 'Каждый вызов сбрасывал таймер (clearTimeout) и ставил новый. Сработал только последний — с "react". Один запрос вместо пяти.',
        },
        {
          explain:
            'throttle: события скролла идут каждые 5 мс, а обработчик разрешён не чаще раза в 20 мс.',
          code: `function throttle<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let last = 0;
  return (...args: A) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}
const handled: number[] = [];
const onScroll = throttle((y: number) => handled.push(y), 20);
for (let y = 0; y < 10; y++) {
  onScroll(y * 100);
  await sleep(5);
}
console.log(handled);`,
          why: 'Из 10 событий обработано примерно 3 (точные числа зависят от таймеров): первое сразу, дальше раз в ~20 мс. Остальные просто проигнорированы.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Каррирование и частичное применение',
      intro: `
Каррирование: f(a, b, c) → f(a)(b)(c). Функция принимает аргументы по одному, каждый раз возвращая новую функцию (замыкание над уже переданными).

Частичное применение: «зафиксировать» часть аргументов и получить специализированную функцию. На практике это главный смысл каррирования.
`,
      examples: [
        {
          explain: 'Каррированная функция сложения.',
          code: `const add = (a: number) => (b: number) => (c: number) => a + b + c;
console.log(add(1)(2)(3));
const add10 = add(10);
console.log(add10(1)(1));`,
          why: 'add(10) вернул функцию, которая помнит a = 10. Её можно переиспользовать сколько угодно раз.',
        },
        {
          explain: 'Практичный пример: функция «цена с налогом» для разных стран.',
          code: `const withTax = (rate: number) => (price: number) => +(price * (1 + rate)).toFixed(2);
const frenchVat = withTax(0.2);
const germanVat = withTax(0.19);
console.log([10, 20].map(frenchVat));
console.log([10, 20].map(germanVat));`,
          why: 'Специализированные функции удобно передавать прямо в map — они принимают ровно один аргумент. Сравни с проблемой map(parseInt) из урока 01.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'this: определяется в момент ВЫЗОВА',
      intro: `
this у обычной функции — это не «объект, в котором функция написана», а то, КАК её вызвали:

| Как вызвали           | this                                            |
| obj.method()          | obj (то, что слева от точки)                    |
| fn() — просто функция | undefined (в strict mode / модулях)             |
| new Fn()              | новый создаваемый объект                        |
| fn.call(ctx, a, b)    | ctx, вызов СРАЗУ, аргументы списком             |
| fn.apply(ctx, [a, b]) | ctx, вызов СРАЗУ, аргументы массивом            |
| fn.bind(ctx)          | НОВАЯ функция с навсегда привязанным ctx        |
| стрелочная функция    | this снаружи (лексический), call/bind не меняют |

Мнемоника для call/apply: Apply — Array.
`,
      examples: [
        {
          explain: 'Метод, вызванный через точку.',
          code: `const user = {
  name: 'Ann',
  hi() {
    return 'Hi, I am ' + this.name;
  },
};
console.log(user.hi());`,
          why: 'Слева от точки user → this = user.',
        },
        {
          explain: '«Потеря контекста»: достали метод в переменную и вызвали отдельно.',
          code: `const user = {
  name: 'Ann',
  hi() {
    return 'Hi, I am ' + this.name;
  },
};
const hi = user.hi;
console.log(hi());`,
          why: 'При вызове hi() слева от скобок нет объекта → this = undefined (strict mode) → обращение к undefined.name → TypeError. Функция не «помнит», из какого объекта её достали.',
        },
        {
          explain: 'То же самое незаметно происходит, когда метод передают как колбэк.',
          code: `const counter = {
  count: 0,
  inc() {
    this.count++;
  },
};
[1, 2].forEach(counter.inc);`,
          why: 'forEach вызывает переданную функцию как обычную функцию → this = undefined. Классика: setTimeout(obj.method), button.addEventListener("click", obj.method), arr.map(obj.method).',
        },
        {
          explain: 'call и apply: вызвать СЕЙЧАС с нужным this.',
          code: `function introduce(this: { name: string }, greeting: string, mark: string) {
  return greeting + ', I am ' + this.name + mark;
}
const bob = { name: 'Bob' };
console.log(introduce.call(bob, 'Hi', '!'));
console.log(introduce.apply(bob, ['Hey', '?']));`,
          why: 'Разница только в передаче аргументов: call — списком, apply — массивом.',
        },
        {
          explain: 'bind: создать НОВУЮ функцию с навсегда привязанным this.',
          code: `const user = {
  name: 'Ann',
  hi() {
    return 'Hi, I am ' + this.name;
  },
};
const boundHi = user.hi.bind(user);
console.log(boundHi());
console.log([1].map(boundHi));`,
          why: 'bind не вызывает функцию, а возвращает новую. Её можно передавать куда угодно — this не потеряется.',
        },
        {
          explain: '🪤 Можно ли «перепривязать» уже привязанную функцию?',
          code: `function getName(this: { name: string }) {
  return this.name;
}
const bound = getName.bind({ name: 'first' });
console.log(bound.call({ name: 'second' }));
console.log(bound.bind({ name: 'third' })());`,
          why: 'Нет. bind привязывает this навсегда: ни call, ни повторный bind его не меняют.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Стрелочные функции и this',
      intro: `
У стрелочной функции НЕТ своего this. Она берёт this из места, где написана (лексически), как обычную переменную. call/apply/bind его не меняют.

Отсюда два правила:
1. Стрелка ВНУТРИ метода — идеальна для колбэков: она видит this метода.
2. Стрелка КАК метод объекта — плохая идея: this будет не объектом, а внешним контекстом.

Ещё отличия стрелок: нет arguments, нельзя вызвать через new, нет prototype.
`,
      examples: [
        {
          explain: 'Стрелка внутри метода видит this метода.',
          code: `const team = {
  name: 'Core',
  members: ['Ann', 'Bob'],
  list() {
    return this.members.map((m) => m + ' @ ' + this.name);
  },
};
console.log(team.list());`,
          why: 'Стрелка внутри map берёт this из list, а list вызван как team.list() → this = team. С обычной function внутри map this был бы undefined.',
        },
        {
          explain: 'Стрелка КАК метод объекта — this не тот.',
          code: `const obj = {
  name: 'obj',
  arrow: () => typeof this,
  regular() {
    return typeof this;
  },
};
console.log('arrow:', obj.arrow());
console.log('regular:', obj.regular());`,
          why: 'Объектный литерал не создаёт своего this. Стрелка взяла this снаружи (здесь — undefined), а не obj. Обычный метод получил obj. Поэтому методы объектов пишут обычными функциями.',
        },
        {
          explain:
            'Метод-стрелка в КЛАССЕ — популярный фикс потери контекста (React class components).',
          code: `class Timer {
  seconds = 0;
  tickMethod() {
    this.seconds++;
  }
  tickArrow = () => {
    this.seconds++;
  };
}
const t = new Timer();
[1, 2].forEach(t.tickArrow);
console.log('after forEach(t.tickArrow):', t.seconds);
[1].forEach(t.tickMethod);`,
          why: 'Поле-стрелка создаётся в конструкторе, где this = экземпляр, и запоминает его навсегда. Обычный метод при передаче как колбэк теряет this → TypeError.',
        },
        {
          explain: 'У стрелки нет prototype — её нельзя вызвать через new.',
          code: `console.log('arrow prototype:', typeof (() => {}).prototype);
console.log('function prototype:', typeof function () {}.prototype);`,
          why: 'Обычная функция может быть конструктором (у неё есть prototype). Стрелка — нет.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Протокол итерации: что внутри for...of и spread',
      intro: `
- Iterable — объект с методом [Symbol.iterator](), который возвращает ИТЕРАТОР.
- Итератор — объект с методом next(), возвращающим { value, done }.

for...of, spread [...x], деструктуризация [a, b] = x, Array.from, new Map/Set, Promise.all — все работают через этот протокол.

Iterable из коробки: Array, String, Map, Set, arguments, NodeList, генераторы. Обычный объект {} — НЕ iterable.
`,
      examples: [
        {
          explain: 'Вручную пройдём массив через итератор.',
          code: `const it = ['a', 'b'][Symbol.iterator]();
console.log(it.next());
console.log(it.next());
console.log(it.next());`,
          why: 'Каждый next() двигает курсор. Когда элементы закончились — { value: undefined, done: true }. for...of делает ровно это и останавливается на done: true.',
        },
        {
          explain: 'Сделаем свой объект iterable.',
          code: `const range = {
  from: 1,
  to: 4,
  // Iterator<number>: tells TS the values are numbers (the done result has none)
  [Symbol.iterator](): Iterator<number> {
    let current = this.from;
    const last = this.to;
    return {
      next: () => (current <= last ? { value: current++, done: false } : { value: undefined, done: true }),
    };
  },
};
console.log([...range]);
console.log(Math.max(...range));`,
          why: 'Как только у объекта появился [Symbol.iterator], с ним работают spread, for...of и всё остальное.',
        },
        {
          explain: 'А обычный объект?',
          code: `const plain: any = { a: 1 };
for (const x of plain) console.log(x);`,
          why: 'TypeError: plain is not iterable. Для объектов: for (const [k, v] of Object.entries(obj)).',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Генераторы function*',
      intro: `
Генератор — функция, которую можно ставить на ПАУЗУ.
- Вызов gen() НЕ выполняет тело: он возвращает итератор (объект-генератор).
- Каждый next() выполняет тело до следующего yield и отдаёт его значение.
- return в генераторе даёт последнее { value, done: true } — for...of и spread его ИГНОРИРУЮТ.
- Объект-генератор ОДНОРАЗОВЫЙ: прошёл до конца — второй раз пустой.

Зачем: ленивые (вычисляются по запросу) и даже бесконечные последовательности, удобные обходы деревьев, итераторы для своих структур. На них же исторически построены async/await и redux-saga.
`,
      examples: [
        {
          explain: 'Пошаговое выполнение. Следи, когда печатается "body starts".',
          code: `function* steps() {
  console.log('body starts');
  yield 'one';
  yield 'two';
  return 'done';
}
const gen = steps();
console.log('generator created');
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());`,
          why: 'После steps() тело ещё не выполнялось. Первый next() запустил его до первого yield. return отдал { value: "done", done: true }, дальше — всегда { value: undefined, done: true }.',
        },
        {
          explain: 'Spread игнорирует return-значение.',
          code: `function* steps() {
  yield 'one';
  yield 'two';
  return 'done';
}
console.log([...steps()]);`,
          why: 'Spread и for...of берут только значения с done: false. "done" потерялось.',
        },
        {
          explain: '🪤 Генератор одноразовый.',
          code: `const gen = (function* () {
  yield 1;
  yield 2;
})();
console.log('first:', [...gen]);
console.log('second:', [...gen]);`,
          why: 'Объект-генератор — это итератор с состоянием. Дошёл до конца — так и остался. Если нужно перебирать много раз, возвращай iterable с методом *[Symbol.iterator]() (задача T11) или вызывай генератор заново.',
        },
        {
          explain: 'Бесконечная ленивая последовательность + iterator helpers (Node 22+).',
          code: `function* naturals() {
  let n = 1;
  while (true) yield n++;
}
const result = naturals()
  .map((n) => n * n)
  .filter((n) => n % 2 === 0)
  .take(4)
  .toArray();
console.log(result);`,
          why: 'while (true) не зависает, потому что значения вычисляются по одному, только когда их просят. take(4) остановил генератор после 4-х подходящих. Это «ленивые» map/filter у итераторов — в отличие от массивов, они не создают промежуточных массивов.',
        },
        {
          explain: 'yield* делегирует другому iterable — удобно для обхода деревьев.',
          code: `type TreeNode = { value: string; children?: TreeNode[] };
function* walk(node: TreeNode): Generator<string> {
  yield node.value;
  for (const child of node.children ?? []) yield* walk(child);
}
const tree: TreeNode = { value: 'root', children: [{ value: 'a', children: [{ value: 'a1' }] }, { value: 'b' }] };
console.log([...walk(tree)]);`,
          why: 'yield* walk(child) «вливает» все значения рекурсивного обхода в текущий генератор. Обход в глубину в 3 строки.',
        },
      ],
    },
  ],
  outro: `
Шпаргалка:
- Замыкание = функция + переменные места создания. Хранит ССЫЛКУ на переменную, не значение.
- Каждый вызов фабрики → новое замыкание со своими переменными (приватное состояние).
- var в цикле — одна переменная на всё; let — новая на каждую итерацию.
- once / memoize / debounce / throttle — HOF, хранящие состояние в замыкании.
- debounce — после паузы (поиск), throttle — не чаще N мс (scroll).
- this — по способу ВЫЗОВА: obj.m() → obj; m() → undefined; bind — навсегда; call/apply — сразу.
- Стрелка берёт this снаружи: хороша для колбэков внутри методов, плоха как метод объекта.
- Iterable = [Symbol.iterator](); итератор = next() → { value, done }.
- Генератор: ленивый, ставится на паузу на yield, объект-генератор одноразовый.

Дальше:
1. Конспект: src/05-closures-this-iterators/README.md
2. Домашка: src/05-closures-this-iterators/exercises.ts → npm run test:watch -- 05-closures
`,
});
