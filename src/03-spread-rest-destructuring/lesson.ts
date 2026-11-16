/**
 * LESSON 03 — SPREAD, REST, DESTRUCTURING (interactive)
 * Run:  npm run lesson 03
 *       npm run lesson 03 -- --from 5
 *       npm run lesson 03 -- --all
 */
import { runLesson } from '../_utils/lesson';

// Shared data available inside every snippet.
// The type says role may be a string OR null; this user simply has no role yet.
// (Without it, `role: null` would be typed as "always null".)
type User = {
  id: number;
  name: string;
  password: string;
  address: { city: string; zip: string };
  role: string | null;
};
const user: User = {
  id: 7,
  name: 'Ann',
  password: 'secret',
  address: { city: 'Paris', zip: '75001' },
  role: null,
};

await runLesson({
  title: 'Урок 03 · Spread, Rest и деструктуризация',
  source: import.meta.filename,
  scope: { user },
  intro: `
Три вещи, которые в современном JS/TS встречаются в КАЖДОМ файле: в React-компонентах, редьюсерах, API-слоях, утилитах.

- Spread (...) — «распаковать» массив или объект.
- Rest (...) — «собрать остаток» в массив или объект.
- Деструктуризация — достать значения из массива/объекта в переменные одной строкой.

Spread и rest выглядят ОДИНАКОВО (три точки), но делают противоположные вещи. На собесе почти всегда спрашивают: «В чём разница между spread и rest?»

Во всех примерах доступна переменная user:
  { id: 7, name: 'Ann', password: 'secret',
    address: { city: 'Paris', zip: '75001' }, role: null }
`,
  sections: [
    // -----------------------------------------------------------------------
    {
      title: 'Одни и те же три точки: как отличить spread от rest',
      intro: `
Определяется МЕСТОМ, где стоят точки:

| Где стоят ...                                   | Что это | Что делает                   |
| справа от =, в вызове функции, внутри [] или {} | SPREAD  | распаковывает одно во многое |
| слева от = (в деструктуризации), в параметрах   | REST    | собирает многое в одно       |

Мнемоника: spread — «раздать» (раскладываю карты на стол), rest — «остальное» (собираю оставшиеся карты в руку).
`,
      examples: [
        {
          explain: 'SPREAD справа от =: распаковываем два массива в новый.',
          code: `const a = [1, 2];
const b = [3, 4];
const all = [...a, ...b];
console.log(all);`,
          why: '...a «высыпал» элементы a внутрь нового массива, потом ...b — свои. Результат — новый массив [1, 2, 3, 4].',
        },
        {
          explain: 'REST слева от =: собираем «всё остальное» в массив.',
          code: `const [first, ...others] = [1, 2, 3, 4];
console.log('first:', first);
console.log('others:', others);`,
          why: 'Первый элемент ушёл в first, а ...others СОБРАЛ всё оставшееся в новый массив. Те же три точки, обратный смысл.',
        },
        {
          explain: 'Оба в одной функции: rest в параметрах, spread при вызове.',
          code: `function sum(...nums: number[]) {
  return nums.reduce((acc, n) => acc + n, 0);
}
const values = [1, 2, 3];
console.log(sum(...values));`,
          why: 'При ВЫЗОВЕ sum(...values) — spread: массив распаковался в три аргумента sum(1, 2, 3). В ОПРЕДЕЛЕНИИ function sum(...nums) — rest: три аргумента собрались обратно в массив nums.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Spread с массивами',
      intro: `
[...arr] — создаёт НОВЫЙ массив с элементами arr.
Применения:
- склеить: [...a, ...b] (замена concat);
- вставить в середину: [...a, 'X', ...b];
- скопировать: [...arr] (shallow copy — вспоминаем урок 01!);
- передать массив как аргументы: Math.max(...nums);
- превратить iterable в массив: [...'abc'], [...new Set(x)], [...map].

Spread в [] работает с ЛЮБЫМ iterable (массив, строка, Set, Map, генератор), но НЕ с обычным объектом.
`,
      examples: [
        {
          explain: 'Вставка в середину и иммутабельное добавление в начало/конец.',
          code: `const list = ['b', 'c'];
console.log([...list, 'd']);
console.log(['a', ...list]);
console.log(['a', ...list, 'X', ...list]);
console.log('original:', list);`,
          why: 'Каждый раз создаётся новый массив, list не меняется. [...list, x] — иммутабельный push, [x, ...list] — иммутабельный unshift. Именно так добавляют элементы в React state.',
        },
        {
          explain: 'Копия через spread — shallow. Вложенный массив общий.',
          code: `const matrix = [[1], [2]];
const copy = [...matrix];
copy[0].push(100);
console.log('matrix:', matrix);
console.log('copy === matrix:', copy === matrix);`,
          why: 'Внешний массив новый (false), но внутри лежат те же ссылки на [1] и [2]. Push в copy[0] виден в matrix[0]. Точно как в уроке 01.',
        },
        {
          explain: 'Spread как аргументы функции.',
          code: `const nums = [5, 9, 2];
console.log(Math.max(...nums));
// as any: TS wants numbers here, not an array — check off to see plain JS
console.log(Math.max(nums as any));`,
          why: 'Math.max ждёт отдельные числа, а не массив. Math.max(...nums) = Math.max(5, 9, 2) → 9. Без spread передали ОДИН аргумент-массив → NaN. TS такой вызов не пропустит (ошибка компиляции) — as any здесь только чтобы показать, что произойдёт в чистом JS.',
        },
        {
          explain: 'Spread работает с любым iterable.',
          code: `console.log([...'hey']);
console.log([...new Set([1, 1, 2])]);
console.log([...new Map([['k', 'v']])]);`,
          why: 'Строка → символы, Set → уникальные значения, Map → пары [ключ, значение]. Всё, что поддерживает for...of, можно распаковать в массив.',
        },
        {
          explain: 'А обычный объект в массив распаковать нельзя.',
          code: `// as any: TS won't spread a plain object into an array — check off to see JS
console.log([...({ a: 1 } as any)]);`,
          why: 'Обычный объект не iterable (у него нет Symbol.iterator). Для объекта используй Object.keys/values/entries. TS этот код не скомпилирует — as any здесь только чтобы показать ошибку чистого JS.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Spread с объектами',
      intro: `
{ ...obj } — новый объект с собственными перечисляемыми свойствами obj.

ПРАВИЛО №1: при совпадении ключей ПОБЕЖДАЕТ ПОСЛЕДНИЙ. Порядок важен.
ПРАВИЛО №2: копия поверхностная (shallow): вложенные объекты общие.
ПРАВИЛО №3: прототип не копируется: экземпляр класса превращается в plain object, методы класса теряются.

Где используется постоянно:
- обновить поле иммутабельно: { ...user, name: 'Bob' };
- defaults + опции: { ...defaults, ...options };
- React props: <Button {...props} />;
- Redux/useReducer: return { ...state, loading: true }.
`,
      examples: [
        {
          explain: 'Копия с изменённым полем — самый частый паттерн.',
          code: `const renamed = { ...user, name: 'Bob' };
console.log(renamed.name, '/', user.name);`,
          why: 'Сначала скопированы все поля user, потом name перезаписан на "Bob". user не изменился.',
        },
        {
          explain: 'Порядок важен. Сначала понятная версия: defaults и options в переменных.',
          code: `const defaults = { theme: 'light', lang: 'en', debug: false };
const options = { lang: 'fr' };
console.log('defaults first:', { ...defaults, ...options });
console.log('options first:', { ...options, ...defaults });`,
          why: 'Побеждает тот, кто правее. В первом случае options перезаписали lang → "fr". Во втором defaults перезаписали lang обратно на "en" — опция пользователя потерялась. Правильно: { ...defaults, ...options }.',
        },
        {
          explain: '🪤 Та же ловушка в собесовском виде: что получится?',
          code: `const patch = { name: 'Bob' };
const result = { ...patch, ...user };
console.log(result.name);`,
          why: '...user стоит ПОСЛЕ patch, поэтому его name ("Ann") перезаписал "Bob". Если видишь spread — сразу смотри, кто правее.',
        },
        {
          explain: 'Shallow: вложенный address — тот же объект.',
          code: `const copy = { ...user };
console.log('copy.address === user.address:', copy.address === user.address);`,
          why: 'Скопирована только «первая полка». address в копии — та же ссылка. copy.address.city = "Lyon" изменил бы и user.',
        },
        {
          explain:
            'Правильное иммутабельное обновление вложенного поля: spread на КАЖДОМ уровне до изменения.',
          code: `const moved = { ...user, address: { ...user.address, city: 'Lyon' } };
console.log('moved:', moved.address.city);
console.log('user:', user.address.city);
console.log('address is new:', moved.address !== user.address);`,
          why: 'Создали новый внешний объект И новый address. Город изменился только в копии. Этот приём называется structural sharing: копируем путь до изменения, остальное (например, id, name) переиспользуем.',
        },
        {
          explain: 'Условное добавление поля: spread от false/undefined ничего не добавляет.',
          code: `const build = (isAdmin: boolean) => ({ name: 'Ann', ...(isAdmin && { role: 'admin' }) });
console.log(build(true));
console.log(build(false));`,
          why: 'isAdmin && {...} даёт либо объект, либо false. Spread объекта добавляет его поля, spread false — ничего. Удобный приём для опциональных полей в запросах к API.',
        },
        {
          explain: 'Spread null и undefined в объект — безопасен.',
          code: `function withDefaults(overrides: { a?: number } | null | undefined) {
  return { a: 1, b: 2, ...overrides };
}
console.log(withDefaults({ a: 10 }));
console.log(withDefaults(null));
console.log(withDefaults(undefined));`,
          why: 'В объектном spread null и undefined просто игнорируются — дефолты остались как были. Поэтому настройки, которые могут прийти как null/undefined, можно спредить без проверки. (В массивном spread — TypeError, см. секцию «Ошибки».)',
        },
        {
          explain: 'Spread экземпляра класса теряет методы.',
          code: `class Point {
  constructor(public x: number) {}
  double() {
    return this.x * 2;
  }
}
const p = new Point(2);
const copy = { ...p };
console.log('copy:', copy);
console.log('has double?', 'double' in copy);`,
          why: 'Spread копирует только собственные поля (x). Методы лежат в прототипе класса, а прототип не копируется → copy — обычный объект без double. Для копии экземпляра используй конструктор или structuredClone (тоже теряет прототип!) — лучше хранить в state простые объекты.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Rest-параметры функций',
      intro: `
function f(a, ...rest) — все аргументы после a собираются в НАСТОЯЩИЙ массив rest.

Правила:
- rest-параметр может быть только ПОСЛЕДНИМ;
- если лишних аргументов нет — rest будет пустым массивом [], а не undefined;
- это замена старого arguments: тот был «похож на массив», но без map/filter, и его нет у стрелочных функций.
`,
      examples: [
        {
          explain: 'Сумма любого количества аргументов.',
          code: `const sum = (...nums: number[]) => nums.reduce((acc, n) => acc + n, 0);
console.log(sum(1, 2, 3));
console.log(sum());`,
          why: 'nums — массив всех аргументов. При вызове без аргументов nums = [], reduce с initialValue 0 возвращает 0.',
        },
        {
          explain: 'Обычные параметры + rest.',
          code: `function tag(label: string, ...items: string[]) {
  return label + ': ' + items.join(' | ');
}
console.log(tag('fruits', 'apple', 'kiwi', 'mango'));`,
          why: 'Первый аргумент ушёл в label, остальные собрались в items.',
        },
        {
          explain: 'Обёртка, которая пробрасывает все аргументы дальше (rest + spread).',
          code: `function logged<A extends unknown[], R>(fn: (...args: A) => R) {
  return (...args: A): R => {
    console.log('calling with', args);
    return fn(...args);
  };
}
const add = (a: number, b: number) => a + b;
console.log('result:', logged(add)(2, 3));`,
          why: '(...args) собирает все аргументы в массив, fn(...args) распаковывает их обратно. Так пишут логгеры, debounce, memoize (урок 05) — обёртке не нужно знать, сколько аргументов у fn.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Деструктуризация массивов (по ПОЗИЦИИ)',
      intro: `
const [a, b] = arr — a получает arr[0], b получает arr[1]. Имена переменных любые: важна только позиция.

Возможности:
- пропуск элементов: const [, second] = arr;
- rest: const [head, ...tail] = arr;
- значения по умолчанию: const [x = 0] = arr (срабатывают, только если там undefined);
- swap без временной переменной: [a, b] = [b, a];
- работает с любым iterable: строка, Set, Map, генератор.
`,
      examples: [
        {
          explain: 'Базовый случай: RGB-цвет в три переменные.',
          code: `const [r, g, b] = [255, 128, 0];
console.log(r, g, b);`,
          why: 'r = arr[0], g = arr[1], b = arr[2].',
        },
        {
          explain: 'Пропуск элемента и rest.',
          code: `const [, second, ...rest] = ['a', 'b', 'c', 'd'];
console.log('second:', second);
console.log('rest:', rest);`,
          why: 'Пустое место перед запятой пропускает элемент. rest собрал всё после second.',
        },
        {
          explain: 'Значения по умолчанию и короткий массив.',
          code: `const [x = 'default-x', y = 'default-y'] = ['given'];
console.log(x, y);`,
          why: 'x получил "given". Для y в массиве ничего нет (undefined) → сработал default.',
        },
        {
          explain: 'Swap двух переменных без temp.',
          code: `let left = 'L';
let right = 'R';
[left, right] = [right, left];
console.log(left, right);`,
          why: 'Справа создаётся временный массив [right, left] = ["R", "L"], слева он деструктурируется обратно в переменные. Классический вопрос на собесе.',
        },
        {
          explain: 'Функция возвращает «несколько значений» как кортеж — как useState в React.',
          code: `function useCounter(): [number, (n: number) => void] {
  let value = 0;
  return [value, (n) => (value = n)];
}
const [count, setCount] = useCounter();
console.log(count, typeof setCount);`,
          why: 'Массив-кортеж + деструктуризация позволяют вызывающему коду назвать переменные как угодно. Поэтому useState возвращает массив, а не объект: const [user, setUser] = useState().',
        },
        {
          explain: 'Деструктуризация любого iterable: Set и строки.',
          code: `const [firstTag] = new Set(['js', 'ts']);
const [firstChar, secondChar] = 'hey';
console.log(firstTag, firstChar, secondChar);`,
          why: 'Деструктуризация массива на самом деле работает через итератор — поэтому подходят любые iterable.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Деструктуризация объектов (по ИМЕНИ)',
      intro: `
const { name, age } = obj — переменные получают значения одноимённых свойств. Порядок не важен, важны имена.

Возможности:
- переименование: const { name: userName } = obj (читается «возьми name КАК userName»);
- default: const { role = 'guest' } = obj — ТОЛЬКО для undefined, не для null!;
- переименование + default: const { theme: uiTheme = 'dark' } = obj;
- вложенная: const { address: { city } } = obj (address сам переменной НЕ становится);
- rest: const { password, ...safe } = obj — убрать поля иммутабельно;
- вычисляемый ключ: const { [key]: value } = obj.
`,
      examples: [
        {
          explain: 'Базовый случай.',
          code: `const { id, name } = user;
console.log(id, name);`,
          why: 'Переменные id и name получили значения user.id и user.name.',
        },
        {
          explain: 'Переименование: name → userName.',
          code: `const { name: userName } = user;
console.log(userName);`,
          why: 'Слева от двоеточия — ИМЯ СВОЙСТВА в объекте, справа — имя НОВОЙ переменной. Переменная name при этом не создаётся.',
        },
        {
          explain: 'Default для отсутствующего поля.',
          code: `const settings: { nickname?: string } = {};
const { nickname = 'anon' } = settings;
console.log(nickname);`,
          why: 'Свойства nickname нет → значение undefined → сработал default.',
        },
        {
          explain: '🪤 А теперь ловушка: у user поле role равно null. Сработает ли default?',
          code: `const { role = 'guest' } = user;
console.log(role);`,
          why: 'НЕТ. Default срабатывает только для undefined. null — это «значение есть, и оно пустое», поэтому role = null. Если null тоже надо заменять, используй ??: const role = user.role ?? "guest".',
        },
        {
          explain: 'Вложенная деструктуризация.',
          code: `const {
  address: { city },
} = user;
console.log(city);`,
          why: 'Достали city из user.address одной строкой.',
        },
        {
          explain: '🪤 А существует ли после этого переменная address?',
          code: `const {
  address: { zip },
} = user;
console.log(zip);
console.log(typeof address);`,
          typecheck: 'and-run',
          why: 'address: { zip } — это «путь», а не объявление переменной. Создаётся только zip, поэтому TS сразу говорит: Cannot find name \'address\'. А чистый JS молчит: typeof от необъявленной переменной даёт "undefined" без ошибки. Если нужны оба: const { address, address: { zip } } = user.',
        },
        {
          explain: 'Rest: убрать пароль перед отправкой клиенту.',
          code: `const { password, ...publicUser } = user;
console.log(publicUser);`,
          why: 'password ушёл в свою переменную, всё остальное — в новый объект publicUser. Исходный user не тронут. Это стандартный иммутабельный «omit».',
        },
        {
          explain: 'Вычисляемый ключ: имя поля — в переменной.',
          code: `const field = 'name';
const { [field]: value } = user;
console.log(value);`,
          why: '[field] вычисляется → "name". Синтаксис { [key]: newName } обязательно требует новое имя переменной.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Деструктуризация в параметрах функций',
      intro: `
Самый практичный кейс: функция принимает объект-опции и сразу раскладывает его с defaults.

function connect({ host = 'localhost', port = 5432 } = {}) { ... }

Зачем = {} в конце: если вызвать connect() вообще без аргумента, деструктуризация попытается разобрать undefined → TypeError. Default всего параметра = {} это предотвращает.

Так же устроены React-компоненты: function Button({ label, onClick, disabled = false }) { ... }.
`,
      examples: [
        {
          explain: 'Опции с defaults.',
          code: `function connect({ host = 'localhost', port = 5432, ssl = false } = {}) {
  return (ssl ? 'https' : 'http') + '://' + host + ':' + port;
}
console.log(connect());
console.log(connect({ port: 3000 }));
console.log(connect({ host: 'db', ssl: true }));`,
          why: 'Каждое поле берёт значение из переданного объекта или свой default. Вызывать можно с любым подмножеством опций, порядок не важен — в этом преимущество перед позиционными параметрами.',
        },
        {
          explain: 'Что если забыть = {}?',
          code: `function connect({ host = 'localhost' }: { host?: string }) {
  return host;
}
// as any: TS won't allow connect() with no argument — like a JS caller
console.log((connect as any)());`,
          why: 'Без аргумента параметр = undefined, а undefined деструктурировать нельзя → TypeError. Поэтому для опциональных опций всегда пиши = {}. TS не даст вызвать connect() без аргумента — as any здесь изображает вызов из JS-кода или с данными типа any.',
        },
        {
          explain: '🪤 Хитрый вопрос с собеса: default параметра vs default поля.',
          code: `function g({ x = 1 } = { x: 2 }) {
  return x;
}
console.log('g():', g());
console.log('g({}):', g({}));`,
          why: 'g() — аргумента нет → используется default ПАРАМЕТРА { x: 2 } → x = 2. g({}) — аргумент есть (пустой объект), поэтому default параметра не нужен, но поля x нет → default ПОЛЯ 1.',
        },
        {
          explain: 'Деструктуризация в for...of и в колбэках.',
          code: `const scores = { ann: 10, bob: 7 };
for (const [player, score] of Object.entries(scores)) {
  console.log(player, score);
}
console.log(Object.entries(scores).map(([p, s]) => p + '=' + s));`,
          why: 'Object.entries даёт пары [key, value], и мы раскладываем каждую пару прямо в заголовке цикла или в параметрах колбэка.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Ошибки, которые нужно узнавать в лицо',
      intro: `
- Деструктуризация null/undefined → TypeError: Cannot destructure property ... of undefined.
- Spread undefined/null в МАССИВ → TypeError: ... is not iterable.
- Spread null/undefined в ОБЪЕКТ — ок, игнорируется.
- Rest не последним → SyntaxError (код даже не запустится).
`,
      examples: [
        {
          explain: 'Деструктурируем ответ API, который вернул null.',
          code: `const response: { data: string } = JSON.parse('null');
const { data } = response;`,
          why: 'Нельзя достать свойство из null. Так это и случается в жизни: JSON.parse возвращает any (как и res.json() в браузерных типах), any молча присваивается в { data: string } — тип «врёт», компилятор молчит. В реальном коде: const { data } = response ?? {} или проверка перед деструктуризацией.',
        },
        {
          explain: 'Spread undefined в массив.',
          code: `const items: number[] = JSON.parse('{}').items;
console.log([...items]);`,
          why: 'Массивный spread требует iterable, а undefined — нет. Защита: [...(items ?? [])].',
        },
        {
          explain: 'Rest не последним — синтаксическая ошибка.',
          code: `const [...head, last] = [1, 2, 3];`,
          typecheck: 'and-run',
          why: 'Код не компилируется: rest-элемент обязан быть последним. TS говорит это в редакторе, а в чистом JS это SyntaxError ещё до запуска — ни одна строка не выполнится. Чтобы взять последний элемент: arr.at(-1), а остальное — arr.slice(0, -1).',
        },
      ],
    },
  ],
  outro: `
Шпаргалка:
- [...a, ...b] — склеить; [...arr] — shallow copy; f(...args) — массив в аргументы.
- { ...obj, field: v } — обновить поле; побеждает тот, кто ПРАВЕЕ.
- { ...state, nested: { ...state.nested, x } } — обновить вложенное (structural sharing).
- function f(...args) — собрать аргументы; rest всегда последний.
- const [a, , c] = arr — по позиции; const { a: alias = def } = obj — по имени.
- Default срабатывает ТОЛЬКО для undefined (null его не триггерит).
- Опции функции: ({ a = 1, b = 2 } = {}).
- const { secret, ...safe } = obj — иммутабельно убрать поле.

Дальше:
1. Конспект: src/03-spread-rest-destructuring/README.md
2. Домашка: src/03-spread-rest-destructuring/exercises.ts → npm run test:watch -- 03-spread
`,
});
