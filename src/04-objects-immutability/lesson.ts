/**
 * LESSON 04 — OBJECTS & IMMUTABILITY (interactive)
 * Run:  npm run lesson 04
 *       npm run lesson 04 -- --from 8   (real bugs section)
 *       npm run lesson 04 -- --all
 */
import { runLesson } from '../_utils/lesson';

// Shared data available inside every snippet.
const prices: Record<string, number> = { apple: 1.2, steak: 15, bread: 2.5, wine: 12 };
const products = [
  { name: 'apple', type: 'fruit' },
  { name: 'steak', type: 'meat' },
  { name: 'kiwi', type: 'fruit' },
];

await runLesson({
  title: 'Урок 04 · Объекты и иммутабельность',
  source: import.meta.filename,
  scope: { prices, products },
  intro: `
В этом уроке три большие темы:
1. Инструменты Object.*: как превращать объекты в массивы и обратно, чтобы применять к ним map/filter/sort.
2. Копирование: shallow vs deep, почему JSON-копия «врёт» и когда нужен structuredClone.
3. Иммутабельность на практике: как обновлять данные, не ломая чужие ссылки, и какие реальные баги бывают, если этого не делать.

Плюс ?. и ?? — операторы, без которых не обходится ни один современный проект.

В примерах доступны:
  prices   = { apple: 1.2, steak: 15, bread: 2.5, wine: 12 }
  products = [{ name: 'apple', type: 'fruit' }, { name: 'steak', type: 'meat' }, { name: 'kiwi', type: 'fruit' }]
`,
  sections: [
    // -----------------------------------------------------------------------
    {
      title: 'Object.keys / values / entries — объект → массив',
      intro: `
У объекта нет map, filter, sort. Зато его можно превратить в массив:

| Метод               | Возвращает                    |
| Object.keys(obj)    | массив КЛЮЧЕЙ (всегда строки) |
| Object.values(obj)  | массив ЗНАЧЕНИЙ               |
| Object.entries(obj) | массив ПАР [key, value]       |

Берутся только СОБСТВЕННЫЕ перечисляемые свойства (без унаследованных из прототипа).

Порядок ключей (частый вопрос!): сначала ключи-«целые числа» по возрастанию, потом строковые ключи в порядке добавления.
`,
      examples: [
        {
          explain: 'Три способа посмотреть на один объект.',
          code: `console.log(Object.keys(prices));
console.log(Object.values(prices));
console.log(Object.entries(prices));`,
          why: 'entries — самый универсальный: в каждой паре и ключ, и значение.',
        },
        {
          explain: 'Сумма всех цен: values + reduce.',
          code: `console.log(Object.values(prices).reduce((acc, p) => acc + p, 0));`,
          why: 'Объект → массив чисел → reduce. (Если результат похож на 30.700000000000003 — это особенность чисел с плавающей точкой, не баг метода.)',
        },
        {
          explain: '🪤 В каком порядке будут ключи?',
          code: `console.log(Object.keys({ b: 1, 2: 'x', a: 1, 1: 'y' }));`,
          why: 'Ключи, похожие на целые числа ("1", "2"), всегда идут первыми и по возрастанию. Остальные — в порядке добавления (b, потом a). Если порядок важен — используй Map.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Object.fromEntries — массив → объект',
      intro: `
Object.fromEntries(pairs) — обратная операция к entries: собирает объект из пар [key, value]. Принимает любой iterable пар: массив, Map, URLSearchParams.

Главный паттерн урока:
  Object.fromEntries( Object.entries(obj).filter/map/sort(...) )
То есть «объект → пары → любые методы массивов → обратно в объект».
`,
      examples: [
        {
          explain: 'Отфильтровать объект по значению: только дешёвые продукты.',
          code: `console.log(Object.fromEntries(Object.entries(prices).filter(([, price]) => price < 10)));`,
          why: 'entries → пары, filter оставляет пары с ценой < 10, fromEntries собирает обратно. [, price] — пропускаем ключ в деструктуризации.',
        },
        {
          explain: 'Преобразовать значения: цены с НДС 20%.',
          code: `const result = Object.fromEntries(
  Object.entries(prices).map(([name, price]) => [name, +(price * 1.2).toFixed(2)]),
);
console.log(result);`,
          why: 'map возвращает НОВЫЕ пары с тем же ключом и новым значением. +(...).toFixed(2) — округление до 2 знаков и обратно в число.',
        },
        {
          explain: 'Отсортировать объект по значению.',
          code: `console.log(Object.fromEntries(Object.entries(prices).toSorted(([, a], [, b]) => a - b)));`,
          why: 'У объекта нет sort, но у массива пар есть. Порядок строковых ключей в новом объекте = порядок добавления, то есть отсортированный.',
        },
        {
          explain: 'Query string → объект одной строкой.',
          code: `console.log(Object.fromEntries(new URLSearchParams('page=2&sort=name&q=js')));`,
          why: 'URLSearchParams — iterable пар, поэтому fromEntries его понимает. Все значения — строки (page: "2", а не 2).',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Object.groupBy (ES2024)',
      intro: `
Object.groupBy(items, fn) — группирует массив в объект: ключ — результат fn, значение — массив элементов с этим ключом.

Ключи — строки. Если нужен ключ-объект или число без превращения в строку — Map.groupBy (урок 02).
Результат — объект с null-прототипом (нет toString и т.п.), поэтому любые ключи безопасны.
`,
      examples: [
        {
          explain: 'Сгруппируем продукты по типу.',
          code: `console.log(Object.groupBy(products, (p) => p.type));`,
          why: 'Каждый продукт попал в массив своего типа. Раньше это писали через reduce (есть в уроке 01, секция reduce).',
        },
        {
          explain: 'Группировка + преобразование: только имена в каждой группе.',
          code: `const groups = Object.groupBy(products, (p) => p.type);
console.log(Object.fromEntries(Object.entries(groups).map(([type, list]) => [type, list!.map((p) => p.name)])));`,
          why: 'groupBy → entries → map по группам → fromEntries. Тот же паттерн «объект → пары → объект».',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Shallow copy vs deep copy',
      intro: `
Вспоминаем урок 01: объекты хранятся по ссылке (адресу).

| Способ копирования                 | Глубина | Что ломается                                                                          |
| { ...obj }, Object.assign({}, obj) | SHALLOW | вложенные объекты общие с оригиналом                                                  |
| JSON.parse(JSON.stringify(obj))    | deep    | теряет undefined и функции, Date → строка, Map/Set → {}, NaN → null, падает на циклах |
| structuredClone(obj)               | deep    | функции → ошибка, прототип класса теряется (методы тоже)                              |

Правило: для «данных» (то, что приходит из API) structuredClone — лучший выбор. Для обновлений state — вообще не deep copy, а structural sharing (секция 7).
`,
      examples: [
        {
          explain: 'Shallow: меняем вложенный массив через копию.',
          code: `const original = { name: 'Ann', tags: ['a', 'b'] };
const shallow = { ...original };
shallow.tags.push('SHARED!');
console.log('original.tags:', original.tags);`,
          why: 'shallow — новый объект, но tags в нём — та же ссылка. Push виден в оригинале.',
        },
        {
          explain: 'JSON-копия: глубокая, но с потерями. Посмотрим, что выживет.',
          code: `const original = {
  born: new Date('1990-01-01'),
  meta: new Map([['k', 1]]),
  nothing: undefined,
  score: NaN,
  greet: () => 'hi',
};
const copy = JSON.parse(JSON.stringify(original));
console.log(copy);
console.log('typeof born:', typeof copy.born);`,
          why: 'Date стал строкой, Map стал {}, undefined и функция исчезли, NaN стал null. Выглядит как копия, но это уже другие данные. Частый источник багов «дата вдруг стала строкой».',
        },
        {
          explain: 'structuredClone: глубокая копия с сохранением Date, Map, Set, undefined.',
          code: `const original = { born: new Date('1990-01-01'), meta: new Map([['k', 1]]), tags: ['a'] };
const deep = structuredClone(original);
deep.tags.push('only in copy');
console.log('original.tags:', original.tags);
console.log('born is Date:', deep.born instanceof Date);
console.log('meta:', deep.meta);`,
          why: 'Всё скопировано по-настоящему, типы сохранены, оригинал не тронут.',
        },
        {
          explain: 'structuredClone умеет циклические ссылки (JSON — нет).',
          code: `type Node = { name: string; self?: Node };
const node: Node = { name: 'cycle' };
node.self = node;
const cloned = structuredClone(node);
console.log('cloned.self === cloned:', cloned.self === cloned);
try {
  console.log('JSON:', JSON.stringify(node));
} catch (e) {
  console.log('JSON:', e instanceof Error ? e.message : e);
}`,
          why: 'structuredClone воспроизводит и структуру ссылок: копия ссылается сама на себя. JSON.stringify на цикле падает с TypeError.',
        },
        {
          explain: 'А функции structuredClone копировать отказывается.',
          code: `console.log(structuredClone({ fn: () => 1 }));`,
          why: 'Функции не «данные» (у них есть замыкания), их нельзя честно скопировать → DataCloneError. Поэтому в state держат только данные, а функции — отдельно.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Object.assign vs spread',
      intro: `
Object.assign(target, ...sources) копирует свойства sources в target и ВОЗВРАЩАЕТ target. То есть он МУТИРУЕТ первый аргумент.

Object.assign({}, a, b) ≈ { ...a, ...b } — если первым передать новый пустой объект, мутации нет.
Сегодня почти всегда пишут spread; assign встречается в старом коде и когда НУЖНО мутировать существующий объект.
`,
      examples: [
        {
          explain: 'assign мутирует и возвращает первый аргумент.',
          code: `const target = { a: 1 };
const result = Object.assign(target, { b: 2 });
console.log('result === target:', result === target);
console.log('target:', target);`,
          why: 'result — это тот же target, уже изменённый. Если target был чьим-то state или props — ты его испортил.',
        },
        {
          explain: 'Безопасный вариант — первый аргумент новый {}. Сравним со spread.',
          code: `console.log(Object.assign({}, { a: 1 }, { a: 2, b: 3 }));
console.log({ ...{ a: 1 }, ...{ a: 2, b: 3 } });`,
          why: 'Одинаковый результат: последний побеждает. Spread короче и не даёт ошибиться с первым аргументом.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Object.freeze — защита от мутаций (shallow!)',
      intro: `
Object.freeze(obj) запрещает добавлять, удалять и менять свойства объекта. В strict mode (а модули всегда strict) попытка записи бросает TypeError.

Но freeze — SHALLOW: вложенные объекты не заморожены. Глубокая заморозка — рекурсивно (задача deepFreeze в упражнениях).

В TypeScript есть защита на этапе компиляции: Readonly<T>, readonly string[], as const. Она бесплатна в рантайме, но работает только в TS-коде.
`,
      examples: [
        {
          explain: 'Пытаемся изменить замороженный объект.',
          code: `const config = Object.freeze({ env: 'prod', db: { host: 'x' } });
// as any: freeze makes fields readonly for TS — check off to see runtime
(config as any).env = 'dev';`,
          why: 'В ES-модулях (strict mode) запись в замороженное свойство — TypeError. В старом нестрогом коде было бы ещё хуже: запись молча игнорировалась бы. TS сам не даст так написать (Object.freeze делает поля readonly) — as any здесь только чтобы показать, что произойдёт в рантайме.',
        },
        {
          explain: '🪤 А вложенный объект?',
          code: `const config = Object.freeze({ env: 'prod', db: { host: 'x' } });
config.db.host = 'CHANGED';
console.log(config.db.host);
console.log('db frozen?', Object.isFrozen(config.db));`,
          why: 'freeze заморозил только верхний уровень. config.db — обычный объект, его можно менять. Классический вопрос: «Object.freeze глубокий?» — нет.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Иммутабельные обновления на практике (React/Redux-стиль)',
      intro: `
Идея: никогда не менять существующие объекты/массивы, а создавать новые — но копировать ТОЛЬКО то, что меняется (structural sharing). Неизменённые части переиспользуются по ссылке.

Шпаргалка для массива в state:
| Операция            | Иммутабельно                                            |
| добавить            | [...list, item]                                         |
| удалить по id       | list.filter((x) => x.id !== id)                         |
| обновить по id      | list.map((x) => (x.id === id ? { ...x, ...patch } : x)) |
| заменить по индексу | list.with(i, item)                                      |
| отсортировать       | list.toSorted(cmp)                                      |
`,
      examples: [
        {
          explain: 'Все операции на одном списке задач — и проверим, что исходник цел.',
          code: `const todos = [
  { id: 1, text: 'learn map', done: true },
  { id: 2, text: 'learn reduce', done: false },
];
const added = [...todos, { id: 3, text: 'learn Set', done: false }];
const removed = todos.filter((t) => t.id !== 1);
const toggled = todos.map((t) => (t.id === 2 ? { ...t, done: !t.done } : t));
console.log('added:', added.length, ' removed ids:', removed.map((t) => t.id));
console.log('toggled[1].done:', toggled[1].done);
console.log('original todos[1].done:', todos[1].done);`,
          why: 'Ни одна операция не тронула todos. Каждая вернула новый массив.',
        },
        {
          explain: 'Ключевой момент structural sharing: неизменённые элементы — ТЕ ЖЕ ссылки.',
          code: `const todos = [
  { id: 1, done: true },
  { id: 2, done: false },
];
const toggled = todos.map((t) => (t.id === 2 ? { ...t, done: !t.done } : t));
console.log('item 1 same reference:', toggled[0] === todos[0]);
console.log('item 2 same reference:', toggled[1] === todos[1]);`,
          why: 'Первый элемент не менялся → map вернул его же (true). Второй — новый объект (false). Поэтому React.memo для строки №1 видит «ничего не изменилось» и не перерисовывает её. Глубокая копия всего списка эту оптимизацию сломала бы.',
        },
        {
          explain: 'Вложенное обновление: копируем путь до изменения.',
          code: `const state = { user: { name: 'Ann', address: { city: 'Paris' } }, settings: { theme: 'dark' } };
const next = { ...state, user: { ...state.user, address: { ...state.user.address, city: 'Lyon' } } };
console.log('city:', next.user.address.city, '/', state.user.address.city);
console.log('settings reused:', next.settings === state.settings);`,
          why: 'Новые объекты: state, user, address (путь до city). settings переиспользован по ссылке. Многословно — поэтому в больших проектах берут Immer (Redux Toolkit использует его внутри), который генерирует ровно это из «мутирующего» кода.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: '🐛 Реальные баги из-за ссылок и как их чинить',
      intro: `
Четыре сценария из реальной жизни. В каждом: ❌ симуляция бага и ✅ исправление. Это ответ на вопрос «зачем мне на практике знать про ссылки и копии».

Общее правило: чужие данные (props, кэш, state, shared-константы) — только ЧИТАЕМ. Нужны изменения → создаём новый объект и копируем ровно тот путь, который меняем.
`,
      examples: [
        {
          explain:
            '❌ Форма редактирования с кнопкой «Отмена». Черновик сделали через shallow copy, юзер поменял город и нажал «Отмена».',
          code: `const user = { name: 'Ann', address: { city: 'Paris' } };
const draft = { ...user };
draft.address.city = 'Lyon';
// user clicks "Cancel" → we just throw the draft away...
console.log('user in the list:', user.address.city);`,
          why: 'Юзер ничего не сохранял, а в списке уже Lyon. draft.address и user.address — один объект. Такие баги называют heisenbugs: проявляются «иногда», зависят от последовательности действий.',
        },
        {
          explain:
            '✅ Фикс: копируем каждый уровень, который будем менять (или structuredClone для черновика).',
          code: `const user = { name: 'Ann', address: { city: 'Paris' } };
const draft = { ...user, address: { ...user.address } };
draft.address.city = 'Lyon';
console.log('user:', user.address.city, ' draft:', draft.address.city);

const draft2 = structuredClone(user);
draft2.address.city = 'Nice';
console.log('user:', user.address.city, ' draft2:', draft2.address.city);`,
          why: 'В обоих вариантах у черновика СВОЙ address. В React ещё лучше вообще не мутировать черновик: setDraft((prev) => ({ ...prev, address: { ...prev.address, city } })), тогда «Отмена» = setDraft(user).',
        },
        {
          explain:
            '❌ Кэш API (React Query / SWR / Apollo) отдаёт ссылку на свои данные. Компонент «локально» сортирует их через sort().',
          code: `const queryCache = { users: [{ name: 'Zoe' }, { name: 'Ann' }] };
// component A
const sortedForA = queryCache.users.sort((a, b) => a.name.localeCompare(b.name));
// component B expects the original API order
console.log('B sees:', queryCache.users.map((u) => u.name));`,
          why: 'sort мутирует массив на месте — а это массив ИЗ КЭША. Все остальные компоненты теперь видят чужую сортировку.',
        },
        {
          explain: '✅ Фикс: производные данные строим в НОВОМ массиве.',
          code: `const queryCache = { users: [{ name: 'Zoe' }, { name: 'Ann' }] };
const sortedForA = queryCache.users.toSorted((a, b) => a.name.localeCompare(b.name));
console.log('A sees:', sortedForA.map((u) => u.name));
console.log('B sees:', queryCache.users.map((u) => u.name));`,
          why: 'toSorted (или [...arr].sort()) не трогает кэш. В React Query ещё удобнее делать это в опции select — результат мемоизируется.',
        },
        {
          explain: '❌ Undo/redo: в историю кладут ссылку на state, а потом мутируют его.',
          code: `const history: { items: string[] }[] = [];
const state = { items: ['a'] };
history.push(state);
state.items.push('b');
const undone = history.pop()!;
console.log('after undo:', undone.items);`,
          why: 'В истории лежит ссылка на тот же объект, который потом изменили. «Откат» вернул уже изменённое состояние — undo ничего не отменил.',
        },
        {
          explain:
            '✅ Фикс: иммутабельные обновления — каждое состояние новый объект, старые никто не трогает.',
          code: `const history: { items: string[] }[] = [];
let current = { items: ['a'] };
history.push(current);
current = { ...current, items: [...current.items, 'b'] };
console.log('current:', current.items);
current = history.pop()!;
console.log('after undo:', current.items);`,
          why: 'Старое состояние никогда не мутировалось, поэтому хранить в истории ссылки безопасно и дёшево. Так работают «time travel» в Redux DevTools и Immer.',
        },
        {
          explain:
            '❌ Бэкенд на Node: общий объект с настройками по умолчанию живёт в памяти сервера между запросами. Сымитируем два запроса.',
          code: `// [] as string[]: empty for now, will hold permission names
const DEFAULT_SETTINGS = { theme: 'light', permissions: [] as string[] };
function getSettings(user: { isAdmin: boolean }) {
  const settings = { ...DEFAULT_SETTINGS };
  if (user.isAdmin) settings.permissions.push('delete');
  return settings;
}
getSettings({ isAdmin: true }); // request 1: admin
console.log('request 2, regular user:', getSettings({ isAdmin: false }).permissions);`,
          why: 'Shallow copy → permissions общий для ВСЕХ запросов. После первого админа у обычного пользователя тоже есть "delete". Это уже не баг UI, а инцидент безопасности.',
        },
        {
          explain: '✅ Фикс: фабрика (новые defaults на каждый вызов) или не мутировать вовсе.',
          code: `// [] as string[]: empty for now, will hold permission names
const createDefaults = () => ({ theme: 'light', permissions: [] as string[] });
function getSettings(user: { isAdmin: boolean }) {
  const settings = createDefaults();
  if (user.isAdmin) settings.permissions.push('delete');
  return settings;
}
getSettings({ isAdmin: true });
console.log('request 2, regular user:', getSettings({ isAdmin: false }).permissions);`,
          why: 'Каждый вызов создаёт свой объект и свой массив — мутировать их безопасно, никто больше на них не ссылается. Дополнительная страховка — Object.freeze на константах (и вложенных массивах): тогда случайный push бросит ошибку, а не утечёт молча.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Optional chaining ?. и nullish coalescing ??',
      intro: `
?. — «если слева null/undefined, вернуть undefined и не идти дальше» (вместо TypeError).
  obj?.a?.b, obj.method?.(), arr?.[0]

?? — «если слева null/undefined, взять правое значение».
|| — «если слева ЛЮБОЕ falsy (0, '', false, NaN, null, undefined), взять правое».

Разница ?? и || — один из самых частых вопросов: для 0, '' и false они ведут себя ПО-РАЗНОМУ.

Логическое присваивание:
  a ??= b   // присвоить, только если a null/undefined
  a ||= b   // присвоить, если a falsy
  a &&= b   // присвоить, если a truthy
`,
      examples: [
        {
          explain: 'Безопасный доступ к глубоким полям.',
          code: `type Account = { profile?: { address?: { city?: string } }; greet?: () => string };
const empty: Account = {};
const full: Account = { profile: { address: { city: 'Paris' } }, greet: () => 'hi' };
console.log(empty.profile?.address?.city);
console.log(full.profile?.address?.city);
console.log(empty.greet?.());
console.log(full.greet?.());`,
          why: 'Для empty цепочка «оборвалась» на первом undefined и вернула undefined, без исключения. ?.() вызывает метод, только если он есть.',
        },
        {
          explain: 'Без ?. — классическая ошибка.',
          code: `const empty: any = {};
console.log(empty.profile.address);`,
          why: 'empty.profile — undefined, и обращение к .address у undefined бросает TypeError. Самая частая ошибка в продакшен-логах фронтендов.',
        },
        {
          explain: '?? vs || на «нормальных» falsy-значениях. Громкость 0 — это валидное значение!',
          code: `const settings = { volume: 0, title: '', muted: false };
console.log('volume || 50 =', settings.volume || 50);
console.log('volume ?? 50 =', settings.volume ?? 50);
console.log("title || 'Untitled' =", settings.title || 'Untitled');
console.log("title ?? 'Untitled' =", settings.title ?? 'Untitled');
console.log('muted || true =', settings.muted || true);
console.log('muted ?? true =', settings.muted ?? true);`,
          why: '|| считает 0, "" и false «пустыми» и подставляет default → баг: юзер выставил громкость 0, а получил 50. ?? подставляет default только для null/undefined. Правило: для значений по умолчанию почти всегда нужен ??.',
        },
        {
          explain: 'Логическое присваивание: ??= и ||=.',
          code: `const a = { retries: 0 };
a.retries ||= 3;
const b = { retries: 0 };
b.retries ??= 3;
console.log('||= :', a.retries, '  ??= :', b.retries);`,
          why: '||= перезаписал 0 (он falsy), а ??= оставил 0 (он не null/undefined). Та же разница, что у || и ??.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Сравнение объектов: ===, Object.is, «глубокое» сравнение',
      intro: `
- === для объектов сравнивает ссылки (урок 01).
- Object.is(a, b) — как ===, но Object.is(NaN, NaN) = true и Object.is(0, -0) = false. Именно так React сравнивает state и зависимости хуков.
- «По содержимому» сравнивают своей функцией deepEqual (задача в упражнениях) или lodash isEqual. JSON.stringify-сравнение зависит от порядка ключей.
`,
      examples: [
        {
          explain: 'Object.is против ===.',
          code: `const nan = Number('not a number');
console.log('NaN === NaN:', nan === nan);
console.log('Object.is(NaN, NaN):', Object.is(nan, nan));
console.log('0 === -0:', 0 === -0);
console.log('Object.is(0, -0):', Object.is(0, -0));`,
          why: 'Две «исправленные» странности ===. На практике важно то, что React использует Object.is: setState(NaN) дважды не вызовет второй ре-рендер.',
        },
        {
          explain: '🪤 Почему JSON-сравнение ненадёжно?',
          code: `const a = { x: 1, y: 2 };
const b = { y: 2, x: 1 };
console.log(JSON.stringify(a) === JSON.stringify(b));`,
          why:
            'Объекты одинаковые по смыслу, но строки разные: ' +
            "'" +
            '{"x":1,"y":2}' +
            "'" +
            ' vs ' +
            "'" +
            '{"y":2,"x":1}' +
            "'" +
            '. JSON сохраняет порядок ключей. Плюс он теряет undefined, функции, Date. Для надёжного сравнения нужен deepEqual.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'for...in vs Object.keys, Object.hasOwn и in',
      intro: `
- for (const key in obj) — обходит и СОБСТВЕННЫЕ, и УНАСЛЕДОВАННЫЕ перечисляемые ключи.
- Object.keys(obj) — только собственные. Почти всегда это то, что нужно.
- 'key' in obj — есть ли ключ (включая прототип).
- Object.hasOwn(obj, 'key') — есть ли СОБСТВЕННЫЙ ключ (современная замена obj.hasOwnProperty).
`,
      examples: [
        {
          explain: 'Объект с прототипом: сравним for...in и Object.keys.',
          code: `const parent = { inherited: true };
const child: Record<string, unknown> = Object.create(parent);
child.own = 1;
const viaForIn: string[] = [];
for (const key in child) viaForIn.push(key);
console.log('for...in:', viaForIn);
console.log('Object.keys:', Object.keys(child));`,
          why: 'for...in зацепил inherited из прототипа. Object.keys — только own. Поэтому в современном коде используют Object.keys/entries, а for...in почти не встречается.',
        },
        {
          explain: 'in vs Object.hasOwn.',
          code: `const parent = { inherited: true };
const child = Object.create(parent);
console.log("'inherited' in child:", 'inherited' in child);
console.log("Object.hasOwn(child, 'inherited'):", Object.hasOwn(child, 'inherited'));
console.log("'toString' in {}:", 'toString' in {});`,
          why: 'in смотрит по всей цепочке прототипов (поэтому даже "toString" in {} → true). hasOwn — только сам объект.',
        },
      ],
    },
  ],
  outro: `
Шпаргалка:
- Объект → массив: Object.keys / values / entries. Обратно: Object.fromEntries.
- Фильтр/маппинг/сортировка объекта: fromEntries(entries(obj).filter/map/toSorted(...)).
- Группировка: Object.groupBy (ключи-строки) / Map.groupBy (любые ключи).
- { ...obj } и Object.assign — shallow. structuredClone — deep (без функций). JSON-копия — deep с потерями.
- Object.assign(target, ...) мутирует target. Object.freeze — shallow.
- Обновления state: копируем только путь до изменения, остальное — по ссылке (structural sharing).
- ?? для значений по умолчанию (0, '' и false — валидные!), || — только когда нужно отбросить ВСЕ falsy.
- Object.is — как ===, но NaN равен NaN, а 0 и -0 различаются (так сравнивает React).
- Object.keys вместо for...in; Object.hasOwn вместо hasOwnProperty.

Дальше:
1. Конспект: src/04-objects-immutability/README.md
2. Домашка: src/04-objects-immutability/exercises.ts → npm run test:watch -- 04-objects
`,
});
