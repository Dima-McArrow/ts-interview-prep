/**
 * LESSON 02 — MAP & SET (interactive)
 * Run:  npm run lesson 02
 *       npm run lesson 02 -- --from 7   (start from section 7)
 *       npm run lesson 02 -- --all      (no pauses)
 */
import { runLesson } from '../_utils/lesson';

// Shared data available inside every snippet.
const users = [
  { id: 10, name: 'Ann', role: 'admin' },
  { id: 20, name: 'Bob', role: 'dev' },
  { id: 30, name: 'Cid', role: 'dev' },
];

await runLesson({
  title: 'Урок 02 · Map и Set',
  source: import.meta.filename,
  scope: { users },
  intro: `
Map и Set — две коллекции, которые появились в ES2015 и которые на собесе любят противопоставлять обычным объектам и массивам.

- Map — словарь «ключ → значение», где ключом может быть ЧТО УГОДНО (число, объект, функция), а порядок всегда = порядку вставки.
- Set — набор УНИКАЛЬНЫХ значений. Добавил дубликат — ничего не произошло.

Главные вопросы урока:
1. Чем Map лучше обычного объекта {} и когда всё-таки брать объект?
2. Почему Set.has() быстрее, чем array.includes()?
3. Как Map и Set сравнивают ключи (подсказка: как === из урока 01, по ссылке для объектов).

Во всех примерах доступна переменная users:
  { id: 10, name: 'Ann', role: 'admin' }
  { id: 20, name: 'Bob', role: 'dev' }
  { id: 30, name: 'Cid', role: 'dev' }
`,
  sections: [
    // -----------------------------------------------------------------------
    {
      title: 'Зачем Map, если есть обычный объект?',
      intro: `
Обычный объект {} годами использовали как словарь. Но у него есть врождённые проблемы, когда ключи заранее неизвестны (id, слова, пользовательский ввод):

1. Ключи объекта — ТОЛЬКО строки (или symbol). Число 1 молча превращается в строку "1", а объект-ключ — в строку "[object Object]".
2. У объекта есть прототип: в нём уже «живут» ключи вроде toString и constructor.
3. Узнать размер — только через Object.keys(obj).length (это O(n): создаётся массив всех ключей).
4. Объект не iterable: for...of по нему не работает, нужен Object.entries.

Map решает все четыре проблемы. Посмотрим на каждую.
`,
      examples: [
        {
          explain: 'Проблема 1: числовые ключи в объекте превращаются в строки.',
          code: `const scores: Record<string, string> = {};
scores[1] = 'number one';
scores['1'] = 'string one';
console.log(scores);
console.log('keys:', Object.keys(scores));`,
          why: 'scores[1] и scores["1"] — это ОДИН и тот же ключ "1". Второе присваивание перезаписало первое. Map так не делает (см. дальше).',
        },
        {
          explain: 'Проблема 1, хуже: объект как ключ объекта.',
          code: `const ann = { name: 'Ann' };
const bob = { name: 'Bob' };
const visits: Record<string, number> = {};
// as any: TS won't use an object as an object key — forced, to see plain JS
visits[ann as any] = 1;
visits[bob as any] = 2;
console.log(visits);`,
          why: 'Оба объекта превратились в одну и ту же строку "[object Object]" — второй перезаписал первый. Хранить данные «по объекту» в обычном объекте нельзя. В TS пришлось даже написать as any — компилятор не даёт сделать такое случайно.',
        },
        {
          explain: 'Проблема 2: в «пустом» объекте уже есть ключи из прототипа.',
          code: `const dict: Record<string, unknown> = {};
console.log("'toString' in dict:", 'toString' in dict);
console.log("'constructor' in dict:", 'constructor' in dict);`,
          why: 'Оператор in смотрит и в прототип. Если словарь хранит слова из текста и кто-то напишет слово "constructor" — получишь неожиданное поведение. Map пустой по-настоящему.',
        },
        {
          explain: 'Та же задача через Map — все ключи живут отдельно и с сохранением типа.',
          code: `const ann = { name: 'Ann' };
const bob = { name: 'Bob' };
const m = new Map<unknown, string>();
m.set(1, 'number one');
m.set('1', 'string one');
m.set(ann, 'Ann data');
m.set(bob, 'Bob data');
console.log('size:', m.size);
console.log(m);`,
          why: 'Четыре разных ключа: число 1, строка "1" и два разных объекта. Ничего не склеилось. size — свойство, считается мгновенно.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Map: основные методы',
      intro: `
| Метод               | Что делает                         | Возвращает                 |
| new Map(entries?)   | создать (можно из массива пар)     | Map                        |
| map.set(key, value) | добавить или перезаписать          | САМ Map → можно чейнить    |
| map.get(key)        | прочитать                          | значение или undefined     |
| map.has(key)        | проверить наличие                  | boolean                    |
| map.delete(key)     | удалить                            | boolean: был ли такой ключ |
| map.clear()         | удалить всё                        | undefined                  |
| map.size            | количество (СВОЙСТВО, без скобок!) | число                      |

Все операции set/get/has/delete — в среднем O(1), то есть не зависят от размера Map.
`,
      examples: [
        {
          explain: 'Создадим Map из массива пар [ключ, значение] и почитаем из него.',
          code: `const prices = new Map([
  ['apple', 1.2],
  ['bread', 2.5],
]);
console.log('get apple:', prices.get('apple'));
console.log('get kiwi:', prices.get('kiwi'));
console.log('has bread:', prices.has('bread'));
console.log('size:', prices.size);`,
          why: 'Конструктор принимает массив пар (или любой iterable пар). Отсутствующий ключ → undefined, не ошибка. size — без скобок, это свойство.',
        },
        {
          explain: 'set возвращает сам Map, поэтому вызовы можно склеивать в цепочку.',
          code: `const m = new Map<string, number>().set('a', 1).set('b', 2).set('c', 3);
console.log(m);`,
          why: 'Каждый set вернул тот же Map, и следующий set вызвался на нём. Сравни с массивом: push возвращает длину, а не массив, — там так не получится.',
        },
        {
          explain: 'delete возвращает boolean — был ли ключ. Удалим один и тот же ключ дважды.',
          code: `const m = new Map([['a', 1]]);
console.log('first delete:', m.delete('a'));
console.log('second delete:', m.delete('a'));
console.log('size:', m.size);`,
          why: 'Первый раз ключ был → true. Второй раз его уже нет → false. Удобно, когда нужно знать, удалилось ли что-то.',
        },
        {
          explain: 'Перезапись значения: меняется ли позиция ключа в порядке обхода?',
          code: `const m = new Map([
  ['x', 1],
  ['y', 2],
  ['z', 3],
]);
m.set('x', 100);
console.log([...m.keys()]);
console.log(m.get('x'));`,
          why: 'Значение обновилось, но ключ остался на СВОЁМ месте (первым). Порядок Map — это порядок ПЕРВОЙ вставки ключа. Чтобы «передвинуть» ключ в конец, его надо удалить и вставить заново (на этом трюке строится LRU-кэш — есть в упражнениях).',
        },
        {
          explain: 'Ловушка: get не отличает «ключа нет» от «значение undefined».',
          code: `const m = new Map<string, number | undefined>([['a', undefined]]);
console.log('get a:', m.get('a'));
console.log('get zzz:', m.get('zzz'));
console.log('has a:', m.has('a'));
console.log('has zzz:', m.has('zzz'));`,
          why: 'Оба get вернули undefined. Если значения могут быть undefined, проверяй наличие через has, а не через get.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Map: как сравниваются ключи',
      intro: `
Map сравнивает ключи по алгоритму SameValueZero. Это почти ===:
- примитивы — по значению (1 и 1 — один ключ; 1 и "1" — разные);
- объекты — ПО ССЫЛКЕ (адресу), как в уроке 01;
- отличие от ===: NaN равен NaN (поэтому NaN можно использовать как ключ).
`,
      examples: [
        {
          explain: 'Объект как ключ: читаем по той же ссылке и по «такому же» объекту.',
          code: `const ann = { name: 'Ann' };
const visits = new Map([[ann, 3]]);
console.log('same reference:', visits.get(ann));
console.log('look-alike object:', visits.get({ name: 'Ann' }));`,
          why: '{ name: "Ann" } во втором get — новый объект по новому адресу. Для Map это совсем другой ключ → undefined. Читать можно только по той же ссылке.',
        },
        {
          explain: 'NaN как ключ — работает (в отличие от indexOf).',
          code: `const m = new Map([[NaN, 'not a number']]);
console.log(m.get(NaN));`,
          why: 'SameValueZero считает NaN равным NaN, поэтому ключ находится. С === так не вышло бы: NaN === NaN → false.',
        },
        {
          explain: 'Классика: кэш «данные пользователя по объекту-пользователю».',
          code: `const cache = new Map<object, string>();
const user = users[0];
cache.set(user, 'expensive result for Ann');
console.log(cache.get(users[0]));
console.log(cache.get({ ...users[0] }));`,
          why: 'users[0] — та же ссылка → нашлось. { ...users[0] } — копия с теми же полями, но новым адресом → не нашлось. Если кэшируешь по объектам, следи, чтобы объект не пересоздавался.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Map: обход',
      intro: `
Map — iterable. for...of по нему отдаёт пары [key, value].

Методы keys(), values(), entries() возвращают ИТЕРАТОРЫ, а не массивы. У итератора нет map/filter (в старом коде), поэтому его часто превращают в массив: [...map.keys()] или Array.from(map.values()).

forEach у Map тоже есть, но порядок аргументов колбэка — (value, key), значение ПЕРВЫМ. Это частая опечатка.
`,
      examples: [
        {
          explain: 'for...of с деструктуризацией пары.',
          code: `const roles = new Map(users.map((u) => [u.name, u.role]));
for (const [name, role] of roles) {
  console.log(name, '→', role);
}`,
          why: 'Каждый элемент — массив [key, value], деструктуризация раскладывает его в две переменные. Порядок = порядок вставки.',
        },
        {
          explain: 'keys() возвращает итератор, а не массив.',
          code: `const roles = new Map(users.map((u) => [u.name, u.role]));
console.log('keys():', roles.keys());
console.log('is array?', Array.isArray(roles.keys()));
console.log('spread:', [...roles.keys()]);`,
          why: 'Итератор — «ленивый курсор» по коллекции. Чтобы применить map/filter/sort, превращаем его в массив через spread или Array.from.',
        },
        {
          explain: 'Отфильтровать Map: превращаем в массив пар, фильтруем, собираем обратно.',
          code: `const roles = new Map(users.map((u) => [u.name, u.role]));
const devs = new Map([...roles].filter(([, role]) => role === 'dev'));
console.log(devs);`,
          why: '[...roles] даёт массив пар, filter оставляет нужные, new Map собирает обратно. [, role] — деструктуризация с пропуском первого элемента (ключ не нужен).',
        },
        {
          explain: '🪤 Ловушка: forEach у Map передаёт (value, key) — значение первым.',
          code: `const m = new Map([['a', 1]]);
m.forEach((first, second) => console.log('first:', first, ' second:', second));`,
          why: 'Первый аргумент — значение (1), второй — ключ ("a"). Сделано для единообразия с массивами (там первым идёт элемент). Если перепутать, код молча работает неправильно.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Конвертация: Object ↔ Map ↔ массив ↔ JSON',
      intro: `
- Объект → Map: new Map(Object.entries(obj))
- Map → объект: Object.fromEntries(map)
- Map → массив пар: [...map]
- JSON: JSON.stringify НЕ умеет Map — получится "{}". Сначала преврати в объект или массив пар.
`,
      examples: [
        {
          explain: 'Туда и обратно.',
          code: `const obj = { a: 1, b: 2 };
const m = new Map(Object.entries(obj));
console.log('Map:', m);
console.log('back to object:', Object.fromEntries(m));
console.log('array of pairs:', [...m]);`,
          why: 'Object.entries и Object.fromEntries — мост между объектами и миром пар. Map принимает и отдаёт ровно такие пары.',
        },
        {
          explain: '🪤 Что сделает JSON.stringify с Map?',
          code: `const m = new Map([['a', 1]]);
console.log(JSON.stringify(m));
console.log(JSON.stringify(Object.fromEntries(m)));`,
          why: 'JSON сериализует только собственные перечисляемые свойства объекта. Данные Map хранятся во внутренних слотах, а не в свойствах → "{}". Классический баг: отправил Map на сервер — пришёл пустой объект.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Паттерны с Map: подсчёт, группировка, индекс по id',
      intro: `
Три задачи, которые встречаются постоянно — и на собесах, и в реальном коде:
1. Подсчитать, сколько раз встречается каждый элемент (частоты).
2. Сгруппировать элементы по признаку.
3. Быстро искать объект по id. Вместо array.find (O(n) на каждый поиск) один раз строим Map и дальше get за O(1).
`,
      examples: [
        {
          explain: 'Частоты слов: get с запасным значением + set.',
          code: `const words = ['js', 'ts', 'js', 'go', 'js'];
const counts = new Map<string, number>();
for (const w of words) {
  counts.set(w, (counts.get(w) ?? 0) + 1);
}
console.log(counts);`,
          why: 'Для каждого слова читаем текущий счётчик (если его нет — ?? 0) и записываем +1. Такой же паттерн, как reduce в объект, только без проблем с ключами.',
        },
        {
          explain: 'Самое частое слово: превращаем Map в массив пар и ищем максимум.',
          code: `const counts = new Map([
  ['js', 3],
  ['ts', 1],
  ['go', 1],
]);
const [topWord, topCount] = [...counts].reduce((best, cur) => (cur[1] > best[1] ? cur : best));
console.log(topWord, topCount);`,
          why: 'reduce без initialValue здесь безопасен, потому что Map точно не пустой; в общем случае проверяй size. Пары сравниваем по второму элементу (count).',
        },
        {
          explain: 'Группировка встроенным Map.groupBy (ES2024).',
          code: `console.log(Map.groupBy(users, (u) => u.role));`,
          why: 'Возвращает Map, где ключ — результат колбэка, значение — массив элементов. Ключом может быть что угодно, в отличие от Object.groupBy (урок 04), где ключи — строки.',
        },
        {
          explain: 'Индекс по id: строим Map один раз, ищем мгновенно.',
          code: `const byId = new Map(users.map((u) => [u.id, u]));
console.log(byId.get(20));
console.log(byId.has(99));`,
          why: 'users.map превращает каждого пользователя в пару [id, user], new Map собирает словарь. Дальше get(id) — O(1). Если искать через users.find в цикле по 1000 элементам, это 1000 × n операций; с Map — 1000.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Set: основы',
      intro: `
Set — коллекция УНИКАЛЬНЫХ значений. Уникальность — по тому же SameValueZero, что и у ключей Map (объекты — по ссылке).

| Метод          | Что делает | Возвращает         |
| new Set(iter?) | создать    | Set без дубликатов |
| set.add(v)     | добавить   | САМ Set (чейнится) |
| set.has(v)     | проверить  | boolean — за O(1)! |
| set.delete(v)  | удалить    | boolean: было ли   |
| set.size       | количество | число (свойство)   |
| [...set]       | в массив   | массив             |

Порядок обхода — порядок вставки.
`,
      examples: [
        {
          explain: 'Создадим Set из массива с повторами.',
          code: `console.log(new Set(['js', 'ts', 'js', 'react', 'ts']));`,
          why: 'Повторы выброшены, первое вхождение каждого значения сохранило свою позицию.',
        },
        {
          explain: 'Убрать дубликаты из массива — самый частый use case Set.',
          code: `const ids = [3, 1, 3, 2, 1];
const unique = [...new Set(ids)];
console.log(unique);`,
          why: 'Массив → Set (дубликаты исчезли) → spread обратно в массив. Работает за O(n), в отличие от filter + indexOf, который O(n²).',
        },
        {
          explain: 'add уже существующего значения ничего не делает.',
          code: `const tags = new Set(['js']);
tags.add('ts').add('js').add('ts');
console.log(tags, 'size:', tags.size);`,
          why: 'add вернул сам Set, поэтому можно чейнить. Повторные js и ts просто проигнорированы.',
        },
        {
          explain: 'Сначала с переменными: два «одинаковых» объекта в Set.',
          code: `const a = { id: 1 };
const b = { id: 1 };
const set = new Set([a, b, a]);
console.log('size:', set.size);`,
          why: 'a и b — разные объекты (разные адреса), поэтому оба остались. Повтор a — тот же адрес — выброшен. Итого 2. Set не сравнивает содержимое объектов.',
        },
        {
          explain: '🪤 Та же ловушка в «собесовском» виде, без переменных:',
          code: `console.log(new Set([{ id: 1 }, { id: 1 }]).size);`,
          why: 'Каждый литерал { id: 1 } — новый объект → два разных значения → 2. Чтобы убрать дубликаты объектов по полю, нужен Map по ключу (или uniqueBy из упражнений).',
        },
        {
          explain: 'Set из строки — уникальные символы.',
          code: `console.log(new Set('hello'));`,
          why: 'Строка — iterable по символам. Буква l повторяется → остаётся одна. Частая задачка: «сколько уникальных символов в строке?» → new Set(str).size.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Set для быстрых проверок: has O(1) vs includes O(n)',
      intro: `
array.includes(x) проходит по массиву от начала, пока не найдёт x → O(n).
set.has(x) находит x через хеш-таблицу → в среднем O(1), независимо от размера.

На маленьких массивах разницы не видно. Но если проверка стоит внутри цикла (например, filter по одному массиву с includes по другому), получается O(n × m). С Set — O(n + m).

На собесе это звучит так: «Как найти пересечение двух массивов за линейное время?» → один массив кладём в Set, второй фильтруем через has.
`,
      examples: [
        {
          explain: 'Отфильтруем сообщения по «чёрному списку» слов.',
          code: `const banned = new Set(['spam', 'scam']);
const messages = ['hi', 'spam', 'hello', 'scam', 'bye'];
console.log(messages.filter((m) => !banned.has(m)));`,
          why: 'Для каждого сообщения проверка has — O(1). Если бы banned был массивом с includes, на каждое сообщение был бы проход по всему чёрному списку.',
        },
        {
          explain: 'Есть ли у двух массивов общие элементы — за O(n + m).',
          code: `const a = [1, 5, 9, 12];
const b = [3, 4, 9];
const setA = new Set(a);
console.log(b.some((x) => setA.has(x)));`,
          why: 'Один проход, чтобы построить Set из a, один проход по b. some остановится на первом совпадении (9).',
        },
        {
          explain: 'Посчитаем операции: сколько сравнений делает includes в худшем случае.',
          code: `const big = Array.from({ length: 10_000 }, (_, i) => i);
let comparisons = 0;
const found = big.some((x) => {
  comparisons++;
  return x === 9_999;
});
console.log('found:', found, ' comparisons:', comparisons);
console.log('Set.has does ~1 hash lookup:', new Set(big).has(9_999));`,
          why: 'Чтобы найти последний элемент, линейный поиск сделал 10 000 сравнений. Set.has — одна операция хеш-поиска. Построить Set тоже стоит O(n), поэтому он окупается, когда проверок много.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Алгебра множеств (ES2025): union, intersection, difference...',
      intro: `
С Node 22 у Set есть методы из математики. Все возвращают НОВЫЙ Set, исходные не трогают:

| Метод                    | Смысл                   | Пример A={1,2,3}, B={2,3,4} |
| A.union(B)               | A ∪ B (всё)             | {1,2,3,4}                   |
| A.intersection(B)        | A ∩ B (общее)           | {2,3}                       |
| A.difference(B)          | A \\ B (в A, но не в B) | {1}                         |
| A.symmetricDifference(B) | только в одном          | {1,4}                       |
| A.isSubsetOf(B)          | A ⊆ B?                  | false                       |
| A.isSupersetOf(B)        | A ⊇ B?                  | false                       |
| A.isDisjointFrom(B)      | нет общих?              | false                       |

На собесе всё равно часто просят «по-старому» через filter + has — это показывает, что ты понимаешь, как оно работает.
`,
      examples: [
        {
          explain: 'Все методы на одной паре множеств.',
          code: `const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
console.log('union:', a.union(b));
console.log('intersection:', a.intersection(b));
console.log('difference:', a.difference(b));
console.log('symmetricDifference:', a.symmetricDifference(b));
console.log('a untouched:', a);`,
          why: 'Каждый метод вернул новый Set. a не изменился — методы иммутабельные.',
        },
        {
          explain: 'Проверки-предикаты.',
          code: `const a = new Set([1, 2, 3]);
console.log('{2} subset of a:', new Set([2]).isSubsetOf(a));
console.log('a superset of {1,2}:', a.isSupersetOf(new Set([1, 2])));
console.log('a disjoint from {9}:', a.isDisjointFrom(new Set([9])));`,
          why: 'Возвращают boolean. isDisjointFrom = «нет ни одного общего элемента».',
        },
        {
          explain: 'То же «по-старому»: пересечение и разность через filter + has.',
          code: `const a = [1, 2, 3, 4];
const setB = new Set([2, 4, 6]);
console.log('intersection:', a.filter((x) => setB.has(x)));
console.log('difference:', a.filter((x) => !setB.has(x)));`,
          why: 'Тот же результат, работает в любом окружении, и порядок элементов гарантированно как в a.',
        },
        {
          explain:
            '🪤 Нюанс, о котором мало кто знает: в каком порядке intersection отдаёт элементы?',
          code: `console.log(new Set([1, 2, 3, 4]).intersection(new Set([4, 2])));`,
          why: 'По спецификации intersection обходит МЕНЬШЕЕ из двух множеств, поэтому порядок взят из {4, 2}, а не из первого. Если порядок важен (например, для отображения), используй filter + has.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'WeakMap и WeakSet',
      intro: `
WeakMap — как Map, но:
- ключами могут быть ТОЛЬКО объекты (и незарегистрированные symbol);
- ключ хранится «слабо»: если на объект больше никто не ссылается, сборщик мусора (GC) удалит его вместе с записью в WeakMap;
- поэтому WeakMap НЕЛЬЗЯ обойти (нет keys/values/forEach) и у него нет size — содержимое может исчезнуть в любой момент.

WeakSet — то же для Set.

Зачем: хранить данные «рядом» с объектом, не мешая ему умереть. Примеры: кэш вычислений для DOM-узлов, приватные данные экземпляров класса, пометка «этот объект уже обработан». С обычным Map такие записи жили бы вечно → утечка памяти.
`,
      examples: [
        {
          explain: 'Метаданные для объекта в WeakMap.',
          code: `const meta = new WeakMap<object, { clicks: number }>();
const button = { id: 'buy' };
meta.set(button, { clicks: 5 });
console.log(meta.get(button));
console.log(meta.has({ id: 'buy' }));`,
          why: 'Работает как Map: get/set/has/delete. Ключ сравнивается по ссылке, поэтому похожий объект не находится.',
        },
        {
          explain: 'Примитив как ключ WeakMap — нельзя.',
          code: `// as any: TS won't take a string as a WeakMap key — check off to see plain JS
console.log(new WeakMap().set('key' as any, 1));`,
          why: 'Строку нельзя «собрать» сборщиком мусора как отдельный объект, поэтому WeakMap принимает только объекты. TypeError. TS такой вызов не пропустит (строка — не WeakKey) — as any здесь только чтобы показать ошибку чистого JS.',
        },
        {
          explain: 'Обойти WeakMap нельзя — методов обхода просто нет.',
          code: `const wm = new WeakMap();
console.log('keys' in wm, 'forEach' in wm, 'size' in wm);`,
          why: 'Нет keys, forEach и size. Это не недоработка: если бы их можно было вызвать, результат зависел бы от того, когда прошёл GC — недетерминированно.',
        },
        {
          explain: 'WeakSet: пометить объекты как «уже обработанные».',
          code: `const processed = new WeakSet<object>();
const job1 = { id: 1 };
const job2 = { id: 2 };
processed.add(job1);
console.log('job1 processed?', processed.has(job1));
console.log('job2 processed?', processed.has(job2));`,
          why: 'Когда job1 перестанет быть нужен приложению, он исчезнет из памяти вместе с пометкой. С обычным Set пришлось бы удалять вручную.',
        },
      ],
    },
  ],
  outro: `
Когда что брать:
- Ключи заранее известны и фиксированы (форма данных, DTO, конфиг) → обычный объект / interface в TS.
- Ключи динамические (id, слова, ввод пользователя), частые добавления/удаления, нужен size или порядок → Map.
- Ключи — объекты → Map (или WeakMap, если не хочешь мешать GC).
- Нужно отправить в JSON → объект (или Object.fromEntries(map) перед отправкой).
- Убрать дубликаты → [...new Set(arr)].
- Много проверок «есть ли x» → Set + has вместо includes.
- Данные «рядом» с объектом без утечек памяти → WeakMap / WeakSet.

Дальше:
1. Конспект: src/02-map-set/README.md
2. Домашка: src/02-map-set/exercises.ts → npm run test:watch -- 02-map-set
`,
});
