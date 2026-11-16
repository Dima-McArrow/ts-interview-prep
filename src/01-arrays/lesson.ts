/**
 * LESSON 01 — ARRAYS (interactive)
 * Run:  npm run lesson 01
 *       npm run lesson 01 -- --from 8   (start from section 8)
 *       npm run lesson 01 -- --all      (no pauses)
 *
 * Every `code` string below is compiled and executed by the lesson engine,
 * so the output you see is exactly what this code produces.
 */
import { runLesson } from '../_utils/lesson';

// Shared data available inside every snippet as `users`.
const users = [
  { id: 1, name: 'Ann', age: 31, active: true },
  { id: 2, name: 'Bob', age: 25, active: false },
  { id: 3, name: 'Cid', age: 42, active: true },
  { id: 4, name: 'Dan', age: 25, active: true },
];

await runLesson({
  title: 'Урок 01 · Массивы',
  source: import.meta.filename,
  scope: { users },
  intro: `
Привет! Это интерактивная лекция. Схема для каждого примера:
- 💬 объяснение, что делаем;
- код;
- 🤔 пауза: сначала ПОДУМАЙ, что получится (можешь вписать прогноз), потом жми Enter;
- → реальный результат (код правда выполнился);
- 💡 почему результат именно такой.

Главная мысль урока. Про КАЖДЫЙ метод массива на собесе ждут два ответа:
1. Мутирует ли он исходный массив (меняет «на месте») или нет?
2. Что он возвращает: новый массив, один элемент, индекс, boolean, длину или undefined?

Если ты уверенно отвечаешь на эти два вопроса про map, filter, reduce, sort, splice, slice, push и прочие — ты уже выше половины кандидатов.

Во всех примерах доступна переменная users (4 пользователя):
  { id: 1, name: 'Ann', age: 31, active: true }
  { id: 2, name: 'Bob', age: 25, active: false }
  { id: 3, name: 'Cid', age: 42, active: true }
  { id: 4, name: 'Dan', age: 25, active: true }
`,
  sections: [
    // -----------------------------------------------------------------------
    {
      title: 'Фундамент: примитивы vs объекты, ссылки и shallow copy',
      intro: `
Прежде чем трогать методы, нужно понять одну вещь, на которой держится половина вопросов про массивы.

В JS всего две категории значений:

| Примитивы                      | Объекты (всё остальное)             |
| number, string, boolean, null, | {}, МАССИВЫ [], функции, Date,      |
| undefined, bigint, symbol      | Map, Set...                         |
| хранятся КАК ЗНАЧЕНИЕ          | хранятся ПО ССЫЛКЕ (адрес в памяти) |
| === сравнивает значения        | === сравнивает АДРЕСА               |

Массив — это НЕ отдельный тип. Это объект с ключами "0", "1", "2" и свойством length. Поэтому typeof [] возвращает "object", а для проверки «это массив?» существует отдельный Array.isArray.

Аналогия: переменная с массивом хранит не сам массив, а АДРЕС квартиры, где он лежит. Две квартиры с одинаковой мебелью в разных домах — это всё равно два разных адреса. А === спрашивает не «одинаковая ли мебель?», а «это один и тот же адрес?».

Из этого следует и второе: многие методы «возвращают новый массив» (map, filter, slice, toSorted...). Новый массив = новая квартира. Но если в старой стояли объекты, в новую переносят не копии объектов, а их АДРЕСА. Это называется shallow copy (поверхностная копия).
`,
      examples: [
        {
          explain: 'Сначала убедимся, что массив — это объект. Сравним typeof у разных значений.',
          code: `console.log('typeof 5:', typeof 5);
console.log("typeof 'hi':", typeof 'hi');
console.log('typeof { a: 1 }:', typeof { a: 1 });
console.log('typeof [1, 2]:', typeof [1, 2]);
console.log('Array.isArray([1, 2]):', Array.isArray([1, 2]));`,
          why: 'Для массива typeof говорит "object": массив — это объект. Отличить массив от обычного объекта может только Array.isArray.',
        },
        {
          explain: 'Примитивы сравниваются ПО ЗНАЧЕНИЮ. Две переменные с числом 5:',
          code: `const x = 5;
const y = 5;
console.log('x === y:', x === y);`,
          why: 'Сравниваются сами числа: 5 и 5 одинаковые → true. Со строками так же: "hi" === "hi" → true.',
        },
        {
          explain:
            'А теперь две переменные с ОДИНАКОВЫМИ массивами. Содержимое совпадает до последнего элемента. Что скажет ===?',
          code: `const a = [1, 2];
const b = [1, 2];
console.log('a === b:', a === b);`,
          why: 'Каждый литерал [1, 2] создаёт НОВЫЙ объект в памяти. a хранит один адрес, b — другой. === сравнивает адреса → false. Содержимое никто не проверяет.',
        },
        {
          explain:
            'Когда === для массивов даёт true? Когда это ОДИН И ТОТ ЖЕ массив. Присвоим c = a и изменим массив через c.',
          code: `const a = [1, 2];
const c = a;
console.log('c === a:', c === a);
c.push(3);
console.log('a after c.push(3):', a);`,
          why: 'const c = a копирует АДРЕС, а не массив. Теперь a и c указывают на одну квартиру → true. Поэтому push через c виден и через a: это один и тот же массив под двумя именами.',
        },
        {
          explain:
            '🪤 Теперь ловушка в том виде, в каком её любят давать на собесе: без переменных, просто два литерала. Глаза видят одинаковые цифры и кричат «true!»...',
          code: `console.log([1, 2] === [1, 2]);`,
          typecheck: 'and-run',
          why: 'Это ровно тот же случай, что с a и b, только без имён: каждый литерал [1, 2] создаёт свой массив по своему адресу. Цифры внутри не важны → false. TS эту ловушку знает и предупреждает прямо в редакторе. Если что-то похожее встретится на собесе — сразу думай «это объекты → сравнение по ссылке».',
        },
        {
          explain: '🪤 Ещё вариант той же ловушки: два пустых массива и нестрогое ==.',
          code: `console.log([] == []);`,
          typecheck: 'and-run',
          why: '== (нестрогое сравнение) тоже сравнивает объекты по ссылке; приведение типов срабатывает, только когда с одной стороны примитив. Два разных пустых массива → false. TS предупреждает и здесь.',
        },
        {
          explain:
            'Как тогда сравнить массивы ПО СОДЕРЖИМОМУ? Быстрый способ для простых данных — сравнить строки JSON.',
          code: `const a = [1, 2];
const b = [1, 2];
console.log(JSON.stringify(a) === JSON.stringify(b));`,
          why: 'JSON.stringify превращает массив в строку "[1,2]", а строки — примитивы, они сравниваются по значению → true. Ограничения: порядок важен, а undefined, функции, Map и Set теряются. Надёжный вариант — написать deepEqual (это задача в уроке 04) или взять lodash isEqual.',
        },
        {
          explain:
            'Зачем всё это фронтендеру? React решает, перерисовывать ли компонент, сравнивая СТАРЫЙ и НОВЫЙ state по ссылке (Object.is(prev, next), по сути то же, что ===). Сымитируем два варианта обновления списка.',
          code: `const prevState = [1, 2];

// ❌ Bad: mutate the same array and "set" it
prevState.push(3);
const badNext = prevState;
console.log('mutated → React sees a change?', badNext !== prevState);

// ✅ Good: create a NEW array
const goodNext = [...prevState, 4];
console.log('new array → React sees a change?', goodNext !== prevState);`,
          why: 'В первом случае данные изменились, но адрес остался тем же → React считает, что ничего не поменялось, и НЕ перерисовывает компонент. Классический баг «я же добавил элемент, почему список не обновился?!». Во втором случае адрес новый → React видит изменение. Отсюда правило: state в React обновляют только иммутабельно — map, filter, spread, toSorted, а не push, splice, sort.',
        },
        {
          explain:
            'Сделаем копию через filter (пропускаем всё) и проверим: это тот же массив? А объект внутри — тот же?',
          code: `const copy = users.filter(() => true);
console.log('copy === users:', copy === users);
console.log('copy[0] === users[0]:', copy[0] === users[0]);`,
          why: 'Квартира (массив) новая → false. Но объект пользователя внутри — тот же самый, перенесли только его адрес → true. Если сделать copy[0].name = "X", то и users[0].name станет "X". Это главный источник багов «я же скопировал массив, почему поменялся оригинал?!».',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'map — преобразовать каждый элемент',
      intro: `
arr.map(callback) — проходит по массиву и для КАЖДОГО элемента вызывает callback. Всё, что callback вернул, складывается в НОВЫЙ массив.

Сигнатура колбэка: (value, index, array) => newValue
Возвращает: новый массив ТОЙ ЖЕ ДЛИНЫ (всегда! 1 элемент на входе → 1 на выходе).
Мутирует: нет.

Когда использовать: когда нужно «превратить» каждый элемент во что-то другое — числа в строки, объекты в их имена, данные из API в формат для UI.
Когда НЕ использовать: если результат тебе не нужен (просто «сделать что-то для каждого») — тогда forEach или for...of. И если нужно отбросить часть элементов — это filter (или flatMap).
`,
      examples: [
        {
          explain: 'Самый простой пример: удвоим каждое число.',
          code: `console.log([1, 2, 3].map((n) => n * 2));`,
          why: 'Колбэк вызвался 3 раза: для 1, 2 и 3. Его результаты 2, 4, 6 сложились в новый массив той же длины.',
        },
        {
          explain: 'Убедимся, что исходный массив не изменился и что результат — другой массив.',
          code: `const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2);
console.log('nums:', nums);
console.log('doubled:', doubled);
console.log('same array?', nums === doubled);`,
          why: 'map НЕ мутирует: nums остался [1, 2, 3]. doubled — новый массив по новому адресу, поэтому false.',
        },
        {
          explain: 'Вытащим из массива объектов только имена — самый частый кейс в реальном коде.',
          code: `console.log(users.map((user) => user.name));`,
          why: 'Каждый объект превратился в строку. Длина результата = длине users (4).',
        },
        {
          explain: 'Колбэк получает ещё и index вторым аргументом. Пронумеруем элементы.',
          code: `console.log(['a', 'b', 'c'].map((letter, index) => index + ':' + letter));`,
          why: 'Второй параметр колбэка — индекс текущего элемента (0, 1, 2). Третий (редко нужен) — сам массив.',
        },
        {
          explain:
            'Как «изменить» объекты, не ломая оригинал? Возвращаем НОВЫЙ объект через spread. Сделаем всех на год старше.',
          code: `const older = users.map((u) => ({ ...u, age: u.age + 1 }));
console.log('older[0].age:', older[0].age);
console.log('users[0].age:', users[0].age);
console.log('same object?', older[0] === users[0]);`,
          why: '{ ...u, age: ... } создаёт новый объект: копирует все поля u и перезаписывает age. Оригинал не тронут. Это стандартный паттерн для React state / Redux. Обрати внимание на круглые скобки вокруг { } — без них стрелка решит, что { } это тело функции, а не объект.',
        },
        {
          explain:
            'Ловушка №1: забыть return. Если тело стрелки в фигурных скобках, return обязателен.',
          code: `console.log([1, 2, 3].map((n) => { n * 2; }));`,
          bareValueIsTheBug: true,
          why: 'Внутри { } выражение n * 2 вычисляется и выбрасывается, функция ничего не возвращает → undefined. Отсюда [undefined, undefined, undefined]. Фикс: (n) => n * 2 или (n) => { return n * 2; }.',
        },
        {
          explain: 'Ловушка №2, классика собесов: map(parseInt).',
          code: `console.log(['1', '2', '3'].map(parseInt));`,
          why: 'map передаёт в колбэк ТРИ аргумента: (value, index, array). parseInt принимает (string, radix), где radix — система счисления. Получаются вызовы: parseInt("1", 0) → 1 (0 значит «по умолчанию»), parseInt("2", 1) → NaN (системы с основанием 1 не бывает), parseInt("3", 2) → NaN (в двоичной нет цифры 3). Фикс: .map(Number) или .map((s) => parseInt(s, 10)).',
        },
        {
          explain: 'Правильный вариант того же самого.',
          code: `console.log(['1', '2', '3'].map(Number));`,
          why: 'Number принимает один аргумент и игнорирует лишние (index, array), поэтому всё работает.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'filter — оставить только подходящие',
      intro: `
arr.filter(callback) — вызывает callback для каждого элемента. Если callback вернул truthy-значение — элемент попадает в результат, если falsy — нет.

Сигнатура колбэка: (value, index, array) => boolean (точнее truthy/falsy)
Возвращает: НОВЫЙ массив, длина от 0 до исходной. Элементы те же самые (по ссылке), не копии.
Мутирует: нет.
Если ничего не подошло — вернётся пустой массив [], а НЕ undefined/null.

Напоминание, что такое falsy: false, 0, -0, 0n, '' (пустая строка), null, undefined, NaN. Всё остальное — truthy (включая '0', 'false', [] и {}!).
`,
      examples: [
        {
          explain: 'Оставим только активных пользователей.',
          code: `console.log(users.filter((u) => u.active).map((u) => u.name));`,
          why: 'filter оставил объекты с active: true (Ann, Cid, Dan), а map вытащил имена. filter + map — самая частая связка.',
        },
        {
          explain: 'Только чётные числа.',
          code: `console.log([1, 2, 3, 4, 5, 6].filter((n) => n % 2 === 0));`,
          why: 'n % 2 — остаток от деления на 2. Для чётных он 0, поэтому n % 2 === 0 → true.',
        },
        {
          explain: 'Что если ничего не подошло?',
          code: `console.log(users.filter((u) => u.age > 100));`,
          why: 'Пустой массив, а не undefined. Это удобно: на результате можно сразу вызывать .map, .length и т.д. без проверок.',
        },
        {
          explain: 'Трюк: filter(Boolean) выкидывает все falsy-значения.',
          code: `console.log([0, 1, '', 'hi', null, undefined, NaN, 'ok'].filter(Boolean));`,
          why: 'Boolean — это функция, превращающая значение в true/false. Для 0, "", null, undefined, NaN она вернёт false — они отброшены. Осторожно: 0 тоже выкинется! Если 0 — валидное значение, пиши явно: .filter((x) => x != null).',
        },
        {
          explain: 'Удалить элемент по id иммутабельно (как в React) — это тоже filter.',
          code: `console.log(users.filter((u) => u.id !== 2).map((u) => u.id));`,
          why: 'Оставляем всех, у кого id НЕ 2. Исходный users не тронут — мы получили новый массив без Bob.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'reduce — свернуть массив в ОДНО значение',
      intro: `
arr.reduce(callback, initialValue) — самый мощный и самый «страшный» метод. Он проходит по массиву и накапливает результат в аккумуляторе (acc).

Сигнатура колбэка: (acc, value, index, array) => newAcc
Как работает:
1. acc = initialValue.
2. Для каждого элемента: acc = callback(acc, элемент).
3. Возвращается финальный acc.

Возвращает: ОДНО значение ЛЮБОГО типа — число, строку, объект, Map, даже другой массив.
Мутирует: нет (сам массив). Но если acc — объект и ты его мутируешь внутри колбэка, это нормально: это твой собственный объект.

Правило №1: ВСЕГДА передавай initialValue. Без него первым acc станет первый элемент массива, а на пустом массиве reduce упадёт с TypeError.
Правило №2: ВСЕГДА возвращай acc из колбэка. Забыл return → в следующей итерации acc станет undefined.

На собесе reduce любят, потому что через него можно выразить почти всё: map, filter, groupBy, sum, max...
`,
      examples: [
        {
          explain: 'Сумма чисел. Распишем по шагам, что происходит.',
          code: `console.log([1, 2, 3, 4].reduce((acc, n) => acc + n, 0));`,
          why: 'Шаги: acc=0 (initialValue) → 0+1=1 → 1+2=3 → 3+3=6 → 6+4=10. Последний acc (10) — результат.',
        },
        {
          explain: 'Посмотрим на шаги своими глазами: залогируем acc и n на каждой итерации.',
          code: `const total = [1, 2, 3].reduce((acc, n) => {
  console.log('acc =', acc, ' n =', n, ' → returns', acc + n);
  return acc + n;
}, 0);
console.log('result:', total);`,
          why: 'Видно, что на каждом шаге acc — это то, что вернул предыдущий вызов колбэка.',
        },
        {
          explain:
            'Максимальный возраст. initialValue = -Infinity, чтобы любой возраст был больше.',
          code: `console.log(users.reduce((max, u) => (u.age > max ? u.age : max), -Infinity));`,
          why: 'acc здесь — «максимум на данный момент». Если текущий возраст больше — он становится новым максимумом. (То же самое короче: Math.max(...users.map((u) => u.age)).)',
        },
        {
          explain:
            'reduce может вернуть ОБЪЕКТ. Посчитаем, сколько пользователей каждого возраста.',
          code: `// {} as Record<...>: the start value is empty, so we tell TS what it will hold
const result = users.reduce((acc, u) => {
  acc[u.age] = (acc[u.age] ?? 0) + 1;
  return acc;
}, {} as Record<number, number>);
console.log(result);`,
          why: 'Стартуем с пустого объекта {}. Для каждого пользователя: берём текущий счётчик (или 0, если его ещё нет — это делает ?? 0) и прибавляем 1. ВАЖНО: return acc в конце, иначе следующая итерация получит undefined.',
        },
        {
          explain: 'Группировка: { active: [...имена], inactive: [...имена] }.',
          code: `const result = users.reduce(
  (acc, u) => {
    const key = u.active ? 'active' : 'inactive';
    acc[key].push(u.name);
    return acc;
  },
  // a bare [] is typed never[]: the casts say what each array will hold
  { active: [] as string[], inactive: [] as string[] },
);
console.log(result);`,
          why: 'acc — объект с двумя массивами. Каждого пользователя кладём в нужный. Для такого есть и встроенный Object.groupBy (урок 04), но на собесе часто просят написать руками.',
        },
        {
          explain: 'Что будет без initialValue?',
          code: `console.log([5, 6, 7].reduce((acc, n) => acc + n));`,
          why: 'Работает: acc стартует с первого элемента (5), и обход начинается со второго: 5+6=11 → 11+7=18. Но это ловушка — см. следующий пример.',
        },
        {
          explain: 'Без initialValue на ПУСТОМ массиве:',
          code: `// [] as number[]: an empty array of numbers (a bare [] would be never[])
console.log(([] as number[]).reduce((acc, n) => acc + n));`,
          why: 'Взять «первый элемент» как стартовый acc нельзя — его нет. Поэтому TypeError. С initialValue ([].reduce(fn, 0)) результат был бы просто 0. Вывод: всегда передавай initialValue.',
        },
        {
          explain: 'Тип initialValue определяет тип результата. Начнём со строки:',
          code: `const result = [1, 2, 3].reduce((acc, n) => acc + n, '');
console.log(result, typeof result);`,
          why: 'acc — строка, поэтому + склеивает строки: "" + 1 = "1", "1" + 2 = "12", "12" + 3 = "123". Популярный вопрос на внимательность.',
        },
        {
          explain: 'reduceRight — то же самое, но справа налево.',
          code: `console.log(['a', 'b', 'c'].reduceRight((acc, s) => acc + s, ''));`,
          why: 'Обход идёт с конца: "" + "c" → "c" + "b" → "cb" + "a" = "cba". Применяется редко, например в функции compose.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'forEach и for...of — просто пройтись',
      intro: `
arr.forEach(callback) — вызывает callback для каждого элемента. И всё.
Возвращает: ВСЕГДА undefined. Поэтому его нельзя «чейнить» (.forEach(...).map(...) — ошибка).
Мутирует: сам по себе нет, но обычно внутри делают side effects (лог, запись в DOM, push в другой массив).

Ограничения forEach:
- нельзя остановить: break/continue не работают, return лишь выходит из текущего вызова колбэка;
- не ждёт async-колбэки (подробно в уроке 06).

for (const item of arr) — обычный цикл по значениям. Умеет break, continue, await. Если тебе не нужен новый массив — for...of часто лучше, чем forEach.

Правило выбора: нужен новый массив → map/filter. Нужно одно значение → reduce/find/some. Нужно просто «что-то сделать» → for...of (или forEach).
`,
      examples: [
        {
          explain: 'Что возвращает forEach?',
          code: `console.log([1, 2, 3].forEach((n) => n * 2));`,
          why: 'Всегда undefined. Результаты колбэка игнорируются. Частая ошибка новичков — писать const doubled = arr.forEach(...) вместо map.',
        },
        {
          explain:
            'forEach подходит для side effects — например, собрать что-то во внешний массив.',
          code: `const names: string[] = [];
users.forEach((u) => names.push(u.name.toUpperCase()));
console.log(names);`,
          why: 'Работает, но это по сути переизобретённый map. Идиоматично: const names = users.map((u) => u.name.toUpperCase()).',
        },
        {
          explain: 'Нужно остановиться на первом найденном? for...of + break.',
          code: `for (const u of users) {
  console.log('checking', u.name);
  if (u.age > 40) {
    console.log('found:', u.name);
    break;
  }
}`,
          why: 'После Cid цикл остановился, Dan даже не проверялся. С forEach так нельзя. (Для «найти первый» есть ещё find — следующая секция.)',
        },
        {
          explain: 'Нужен индекс в for...of? Используй entries() + деструктуризацию.',
          code: `for (const [i, u] of users.slice(0, 2).entries()) {
  console.log(i, u.name);
}`,
          why: 'entries() даёт пары [index, value]. [i, u] — деструктуризация массива (урок 03).',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Поиск: find, findIndex, findLast, includes, indexOf, some, every',
      intro: `
Все эти методы НЕ мутируют. Разница — в том, что они возвращают:

| Метод             | Возвращает                          | Если не найдено |
| find(fn)          | первый ЭЛЕМЕНТ, где fn вернула true | undefined       |
| findLast(fn)      | последний такой элемент (ES2023)    | undefined       |
| findIndex(fn)     | ИНДЕКС первого подходящего          | -1              |
| findLastIndex(fn) | индекс последнего подходящего       | -1              |
| includes(value)   | true/false — есть ли такое ЗНАЧЕНИЕ | false           |
| indexOf(value)    | индекс значения                     | -1              |
| some(fn)          | true, если ХОТЯ БЫ ОДИН подходит    | false           |
| every(fn)         | true, если ВСЕ подходят             | true (!) на []  |

find/findIndex/some/every принимают ФУНКЦИЮ-условие. includes/indexOf принимают ЗНАЧЕНИЕ и сравнивают его через === (почти — см. NaN).

Все они останавливаются, как только ответ известен (short-circuit): find — на первом совпадении, some — на первом true, every — на первом false.
`,
      examples: [
        {
          explain: 'find вернёт первого пользователя 25 лет — сам объект.',
          code: `console.log(users.find((u) => u.age === 25));`,
          why: 'Bob и Dan оба 25, но find останавливается на ПЕРВОМ совпадении (Bob). Возвращается сам объект (по ссылке, не копия).',
        },
        {
          explain: 'findLast — то же, но ищет с конца.',
          code: `console.log(users.findLast((u) => u.age === 25)?.name);`,
          why: 'Последний 25-летний — Dan. ?.name — optional chaining: если бы findLast вернул undefined, мы получили бы undefined вместо ошибки «Cannot read properties of undefined».',
        },
        {
          explain: 'find, когда ничего не нашлось.',
          code: `console.log(users.find((u) => u.name === 'Zoe'));`,
          why: 'undefined. Поэтому результат find почти всегда надо проверять (или использовать ?.). TS это знает и типизирует результат как User | undefined.',
        },
        {
          explain:
            'findIndex — индекс вместо элемента. Нужен, например, чтобы потом заменить элемент.',
          code: `console.log(users.findIndex((u) => u.name === 'Cid'));
console.log(users.findIndex((u) => u.name === 'Zoe'));`,
          why: 'Cid лежит на позиции 2. Не найдено → -1 (не undefined!). Типичный баг: if (index) ... — индекс 0 falsy, а -1 truthy. Правильно: if (index !== -1).',
        },
        {
          explain: 'includes vs indexOf: в чём разница? Проверим на NaN.',
          code: `console.log('includes:', [NaN].includes(NaN));
console.log('indexOf:', [NaN].indexOf(NaN));`,
          why: 'indexOf сравнивает строго через ===, а NaN === NaN — false (NaN не равен даже сам себе). includes использует алгоритм SameValueZero, в котором NaN равен NaN. Поэтому для проверки «есть ли значение» предпочитай includes.',
        },
        {
          explain: 'includes с объектами:',
          code: `console.log([{ id: 1 }].includes({ id: 1 }));`,
          why: 'Объекты сравниваются по ССЫЛКЕ. { id: 1 } в скобках includes — это новый объект с новым адресом, а в массиве лежит другой адрес. Чтобы искать по содержимому, используй some: arr.some((x) => x.id === 1).',
        },
        {
          explain: 'some — есть ли хоть один неактивный?',
          code: `console.log(users.some((u) => !u.active));`,
          why: 'Bob неактивен → true. some остановился на Bob и дальше не проверял.',
        },
        {
          explain: 'every — все ли совершеннолетние?',
          code: `console.log(users.every((u) => u.age >= 18));`,
          why: 'Все проходят условие → true. Если бы хоть один не прошёл, every сразу вернул бы false.',
        },
        {
          explain: 'Ловушка: some и every на ПУСТОМ массиве.',
          code: `console.log('[].some:', [].some(() => true));
console.log('[].every:', [].every(() => false));`,
          why: 'some на [] → false (нет ни одного элемента, значит и подходящего нет). every на [] → true, даже если условие всегда false! Логика: «нет ни одного элемента, который НЕ прошёл бы проверку» (vacuous truth). Это частый вопрос на собесе и частый баг: «все задачи выполнены?» на пустом списке → true.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'slice, concat, at, join — кусочки и склейка',
      intro: `
slice(start, end) — вырезает КОПИЮ куска [start, end). end НЕ включается. Отрицательные индексы считаются с конца. Без аргументов — копия всего массива.
Мутирует: НЕТ. (Не путать со splice, который мутирует! Мнемоника: sPlice = Plus side effects.)

concat(...items) — новый массив: исходный + аргументы (массивы раскрываются на один уровень). Аналог [...a, ...b].

at(index) — элемент по индексу, поддерживает отрицательные: at(-1) — последний. Обычные квадратные скобки arr[-1] вернут undefined.

join(separator = ',') — склеивает элементы в СТРОКУ.
`,
      examples: [
        {
          explain: 'slice(1, 3): с индекса 1 до 3 (не включая 3).',
          code: `console.log(['a', 'b', 'c', 'd', 'e'].slice(1, 3));`,
          why: 'Индексы 1 и 2 → b, c. Индекс 3 (d) не включается: интервал полуоткрытый [1, 3). Длина результата = end - start = 2.',
        },
        {
          explain: 'Отрицательный индекс: последние два элемента.',
          code: `console.log(['a', 'b', 'c', 'd', 'e'].slice(-2));`,
          why: '-2 значит «length - 2» = 3. slice(3) → d, e. Без end — до конца массива.',
        },
        {
          explain: 'slice() без аргументов — классический способ сделать shallow copy.',
          code: `const original = [1, 2, 3];
const copy = original.slice();
copy.push(4);
console.log('original:', original);
console.log('copy:', copy);`,
          why: 'Копия — отдельный массив по своему адресу, push в неё не трогает оригинал. Современная альтернатива: [...original].',
        },
        {
          explain: 'concat раскрывает массивы-аргументы на один уровень.',
          code: `// (number | number[])[]: the array mixes numbers and arrays — TS must know that
const arr: (number | number[])[] = [1];
console.log(arr.concat(2, [3, 4], [[5]]));`,
          why: '2 добавилось как есть, [3, 4] раскрылся в 3 и 4, а [[5]] раскрылся только на один уровень → остался [5].',
        },
        {
          explain: 'at(-1) против [-1].',
          code: `const letters = ['a', 'b', 'c'];
console.log('at(-1):', letters.at(-1));
console.log('[-1]:', letters[-1]);
console.log('[length - 1]:', letters[letters.length - 1]);`,
          why: 'В JS arr[-1] — это не «с конца», а обращение к свойству с именем "-1", которого нет → undefined. at() появился в ES2022 специально для этого.',
        },
        {
          explain: 'join склеивает в строку.',
          code: `console.log(users.map((u) => u.name).join(', '));
console.log([1, 2, 3].join());
console.log([1, null, undefined, 2].join('-'));`,
          why: 'По умолчанию разделитель — запятая без пробела. null и undefined превращаются в пустые строки, поэтому "1---2".',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'flat и flatMap — работа с вложенными массивами',
      intro: `
flat(depth = 1) — «расплющивает» вложенные массивы на depth уровней. flat(Infinity) — до конца.
Возвращает новый массив, не мутирует.

flatMap(callback) = map(callback) + flat(1). Колбэк может вернуть массив из 0, 1 или N элементов — они все «вольются» в результат. Поэтому flatMap умеет сразу и фильтровать (вернуть []), и размножать (вернуть [a, b]), и преобразовывать.
`,
      examples: [
        {
          explain: 'flat() по умолчанию раскрывает только ОДИН уровень.',
          code: `console.log([1, [2, [3, [4]]]].flat());`,
          why: 'Раскрылся внешний [2, [...]] → 2 и [3, [4]]. Глубже flat(1) не идёт.',
        },
        {
          explain: 'flat(Infinity) раскрывает всё.',
          code: `console.log([1, [2, [3, [4]]]].flat(Infinity));`,
          why: 'Infinity = «сколько угодно уровней». Задача «напиши flat без flat» — классика собеса (она есть в упражнениях).',
        },
        {
          explain: 'flatMap: разбить предложения на слова.',
          code: `console.log(['hello world', 'hi there'].flatMap((s) => s.split(' ')));`,
          why: 'map дал бы [["hello", "world"], ["hi", "there"]] — массив массивов. flatMap сразу расплющил на один уровень.',
        },
        {
          explain: 'flatMap как filter + map за один проход: только чётные, умноженные на 10.',
          code: `console.log([1, 2, 3, 4].flatMap((n) => (n % 2 === 0 ? [n * 10] : [])));`,
          why: 'Для нечётных вернули [] — пустой массив «вливается» как ничего, элемент исчез. Для чётных [n * 10] — один элемент.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: '⚠️ МУТИРУЮЩИЕ методы: push, pop, shift, unshift, splice, sort, reverse, fill',
      intro: `
Эти методы меняют массив НА МЕСТЕ. В React state, Redux и вообще в функциональном стиле их нельзя применять к исходным данным (только к своей копии).

| Метод                        | Что делает                  | Возвращает                 |
| push(...items)               | добавить в конец            | НОВУЮ ДЛИНУ (не массив!)   |
| pop()                        | удалить последний           | удалённый элемент          |
| unshift(...items)            | добавить в начало           | новую длину                |
| shift()                      | удалить первый              | удалённый элемент          |
| splice(start, count, ...add) | удалить/вставить где угодно | МАССИВ удалённых элементов |
| sort(compareFn?)             | отсортировать               | ТОТ ЖЕ массив (ссылку)     |
| reverse()                    | развернуть                  | тот же массив              |
| fill(value, start?, end?)    | заполнить значением         | тот же массив              |

Производительность: push/pop — O(1). shift/unshift — O(n), потому что сдвигают все индексы.
`,
      examples: [
        {
          explain: 'Что возвращают push/pop/shift/unshift? Следи за массивом.',
          code: `const arr = [1, 2, 3];
console.log('push(4) returns', arr.push(4), '→ arr', [...arr]);
console.log('pop() returns', arr.pop(), '→ arr', [...arr]);
console.log('shift() returns', arr.shift(), '→ arr', [...arr]);
console.log('unshift(0) returns', arr.unshift(0), '→ arr', [...arr]);`,
          why: 'push/unshift возвращают НОВУЮ ДЛИНУ — частый вопрос на собесе (и баг: const newArr = arr.push(x) → newArr это число). pop/shift возвращают удалённый элемент. [...arr] в логах — чтобы показать снимок массива на этот момент.',
        },
        {
          explain: 'splice(start, deleteCount) — удалить элементы. Возвращает удалённые.',
          code: `const letters = ['a', 'b', 'c', 'd', 'e'];
const removed = letters.splice(1, 2);
console.log('removed:', removed);
console.log('letters now:', letters);`,
          why: 'С индекса 1 удалили 2 элемента (b, c). splice вернул их массивом, а сам letters изменился. Сравни со slice(1, 3) — тот вернул бы [b, c], но оригинал бы не тронул.',
        },
        {
          explain: 'splice со вставкой: deleteCount = 0 — ничего не удаляем, только вставляем.',
          code: `const letters = ['a', 'd'];
letters.splice(1, 0, 'b', 'c');
console.log(letters);`,
          why: 'С позиции 1 удалили 0 элементов и вставили b и c. Получилось вставить в середину.',
        },
        {
          explain: 'splice с заменой: удалить 1 и вставить на его место 2 новых.',
          code: `const letters = ['a', 'X', 'd'];
const removed = letters.splice(1, 1, 'b', 'c');
console.log('removed:', removed, ' letters:', letters);`,
          why: 'Один и тот же метод умеет удалять, вставлять и заменять — всё зависит от аргументов.',
        },
        {
          explain: '🔥 Главная ловушка sort: что будет без компаратора?',
          code: `console.log([10, 1, 5, 100, 25].sort());`,
          why: 'Без функции сравнения sort превращает элементы в СТРОКИ и сравнивает их посимвольно, как в словаре: "1" < "10" < "100" < "25" < "5". Поэтому для чисел ВСЕГДА передавай компаратор.',
        },
        {
          explain: 'Компаратор (a, b) => a - b: сортировка чисел по возрастанию.',
          code: `console.log([10, 1, 5, 100, 25].sort((a, b) => a - b));`,
          why: 'Правило компаратора: вернул < 0 → a ставится раньше b; > 0 → b раньше a; 0 → порядок не важен. a - b < 0, когда a меньше, значит меньшие идут первыми.',
        },
        {
          explain: 'По убыванию — меняем местами: b - a.',
          code: `console.log([10, 1, 5, 100, 25].sort((a, b) => b - a));`,
          why: 'Теперь отрицательное значение получается, когда b меньше a, то есть большие идут первыми.',
        },
        {
          explain:
            'Строки сортируем через localeCompare (правильно работает с регистром, акцентами, кириллицей).',
          code: `console.log(['éclair', 'banana', 'Apple', 'cherry'].sort((a, b) => a.localeCompare(b)));`,
          why: 'localeCompare возвращает отрицательное/0/положительное число — ровно то, что ждёт sort. Без него "Apple" (заглавная) и "éclair" (с акцентом) встали бы не туда.',
        },
        {
          explain: 'Сортировка по двум ключам: сначала по возрасту, при равном — по имени.',
          code: `const result = users
  .slice()
  .sort((a, b) => a.age - b.age || a.name.localeCompare(b.name))
  .map((u) => u.age + ' ' + u.name);
console.log(result);`,
          why: 'Если a.age - b.age === 0 (возраст равный), то || переходит ко второму сравнению по имени. .slice() перед sort — чтобы не мутировать общий users (sort мутирует!).',
        },
        {
          explain: 'sort возвращает ТОТ ЖЕ массив. Проверим.',
          code: `const nums = [3, 1, 2];
const sorted = nums.sort();
console.log('sorted === nums:', sorted === nums);
console.log('nums:', nums);`,
          why: 'Это не копия, а тот же массив, уже отсортированный на месте. Ловушка: const sorted = props.items.sort() в React — ты только что мутировал props.',
        },
        {
          explain: 'Ловушка fill с объектами/массивами.',
          code: `const grid = new Array(3).fill([]);
grid[0].push('x');
console.log(grid);`,
          why: 'fill кладёт ОДНО И ТО ЖЕ значение во все ячейки. Для объекта это одна и та же ссылка: все три ячейки указывают на один массив. Push в «первый» виден во всех.',
        },
        {
          explain:
            'Правильно: Array.from с фабрикой, которая создаёт НОВЫЙ массив для каждой ячейки.',
          code: `// [] as string[]: each cell starts empty and will hold strings
const grid = Array.from({ length: 3 }, () => [] as string[]);
grid[0].push('x');
console.log(grid);`,
          why: 'Колбэк Array.from вызывается для каждой ячейки отдельно, поэтому каждый [] — новый.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'ES2023: иммутабельные двойники toSorted, toReversed, toSpliced, with',
      intro: `
В 2023 году в язык добавили версии мутирующих методов, которые возвращают НОВЫЙ массив и не трогают оригинал:

| Мутирует   | Не мутирует (ES2023) |
| sort()     | toSorted()           |
| reverse()  | toReversed()         |
| splice()   | toSpliced()          |
| arr[i] = v | arr.with(i, v)       |

Это идеально для React state: больше не нужно писать [...arr].sort(...).
Работают в Node 20+ и всех современных браузерах.
`,
      examples: [
        {
          explain: 'Все четыре метода на одном массиве — и проверим, что оригинал цел.',
          code: `const original = [3, 1, 2];
console.log('toSorted():', original.toSorted());
console.log('toReversed():', original.toReversed());
console.log('toSpliced(0, 1):', original.toSpliced(0, 1));
console.log('with(0, 99):', original.with(0, 99));
console.log('original:', original);`,
          why: 'Каждый вызов вернул новый массив, original остался [3, 1, 2]. Компаратор для toSorted такой же, как для sort.',
        },
        {
          explain:
            'React-стиль: отсортировать пользователей по имени для рендера, не трогая state.',
          code: `console.log(users.toSorted((a, b) => b.name.localeCompare(a.name)).map((u) => u.name));`,
          why: 'Сортировка по убыванию имени (b перед a). users при этом не изменился — можно спокойно использовать в рендере.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Создание массивов: Array.from, Array.of, spread, Array.isArray',
      intro: `
Array.from(iterableOrArrayLike, mapFn?) — превращает в массив всё, что можно перебрать: строки, Set, Map, NodeList, arguments, и даже «объект с length». Второй аргумент — map-функция.

Array.of(...items) — массив из аргументов.
new Array(n) — массив из n ПУСТЫХ слотов («дырок»). Дырки — особое состояние: map/forEach их пропускают.
[...iterable] — spread, современная замена Array.from для iterable.
Array.isArray(x) — надёжная проверка на массив (typeof [] возвращает "object").
`,
      examples: [
        {
          explain: 'Сгенерировать массив [0, 1, 4, 9, 16] (квадраты индексов).',
          code: `console.log(Array.from({ length: 5 }, (_, i) => i * i));`,
          why: '{ length: 5 } — «array-like» объект. Array.from создаёт 5 ячеек и для каждой вызывает колбэк (value, index). value здесь undefined, поэтому его называют _ (договорённость «не используется»).',
        },
        {
          explain: 'Строка → массив символов, Set → массив.',
          code: `console.log(Array.from('hey'));
console.log(Array.from(new Set([1, 1, 2, 3, 3])));
console.log([...new Set(['a', 'b', 'a'])]);`,
          why: 'Строка и Set — iterable. Комбинация new Set + spread — стандартный способ убрать дубликаты.',
        },
        {
          explain: 'Ловушка: new Array(3) создаёт «дырки», и map их пропускает.',
          code: `console.log(new Array(3).map(() => 0));`,
          why: 'Дырки ≠ undefined. map пропускает пустые слоты, поэтому результат — снова 3 пустых слота. Фикс: Array.from({ length: 3 }, () => 0) или new Array(3).fill(0).',
        },
        {
          explain: 'Array.of vs new Array с одним числом.',
          code: `console.log('new Array(3):', new Array(3));
console.log('Array.of(3):', Array.of(3));`,
          why: 'new Array с ОДНИМ числовым аргументом создаёт массив такой длины, а не массив с этим числом. Array.of всегда кладёт аргументы как элементы.',
        },
        {
          explain: 'Как проверить, что значение — массив?',
          code: `console.log('typeof []:', typeof []);
console.log('Array.isArray([]):', Array.isArray([]));
console.log('Array.isArray({ length: 0 }):', Array.isArray({ length: 0 }));`,
          why: 'typeof для массивов возвращает "object" (массив — это объект). Поэтому только Array.isArray.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      title: 'Цепочки (chaining) и производительность',
      intro: `
Методы, возвращающие массив, можно соединять в цепочку. Читается сверху вниз как конвейер: отфильтровать → отсортировать → преобразовать → склеить.

Про производительность: каждый шаг цепочки — отдельный проход по массиву и новый промежуточный массив. Для данных в UI (десятки–тысячи элементов) это неважно, читаемость важнее. Для сотен тысяч элементов в горячем коде — один reduce или for...of будет быстрее.

На собесе хорошо звучит фраза: «сначала пишу читаемо через цепочку, оптимизирую в один проход, только если профайлер показал проблему».
`,
      examples: [
        {
          explain: 'Отчёт: активные пользователи, от старших к младшим, в формате "Имя (возраст)".',
          code: `const result = users
  .filter((u) => u.active)
  .toSorted((a, b) => b.age - a.age)
  .map((u) => u.name + ' (' + u.age + ')')
  .join(', ');
console.log(result);`,
          why: 'Каждый шаг получает результат предыдущего. filter → 3 пользователя, toSorted → по убыванию возраста, map → строки, join → одна строка.',
        },
        {
          explain: 'То же самое за один проход через reduce — для сравнения читаемости.',
          code: `// [] as string[]: the start value is empty and will collect names
console.log(users.reduce((acc, u) => (u.active ? [...acc, u.name] : acc), [] as string[]));`,
          why: 'Работает (filter+map за один проход), но читается хуже. Плюс [...acc, x] на каждом шаге копирует массив — для больших данных это даже медленнее. Вывод: reduce хорош для «свернуть в одно значение», а не как замена filter+map.',
        },
        {
          explain: 'Ловушка Math.max со spread на пустом массиве.',
          code: `console.log(Math.max(...[3, 7, 2]));
console.log(Math.max(...[]));`,
          why: 'Math.max() без аргументов возвращает -Infinity (это «нейтральный элемент» для максимума). Проверяй массив на пустоту. И ещё: spread очень большого массива (сотни тысяч элементов) может упасть с RangeError — там нужен reduce.',
        },
      ],
    },
  ],
  outro: `
Шпаргалка «какой метод выбрать»:
- Преобразовать каждый элемент → map
- Оставить часть → filter
- Свернуть в одно значение (сумма, объект, группировка) → reduce
- Найти один элемент → find / findLast (индекс → findIndex)
- Проверить наличие значения → includes; по условию → some
- Проверить, что все подходят → every (помни: на [] → true)
- Отсортировать без мутации → toSorted; с мутацией → sort (числа — всегда с компаратором!)
- Удалить по индексу без мутации → toSpliced / filter; с мутацией → splice
- Кусок массива → slice (не мутирует), не путать со splice (мутирует)
- Вложенные массивы → flat / flatMap
- Просто пройтись с side effects → for...of (умеет break и await)

Дальше:
1. Пролистай src/01-arrays/README.md — там карточка по каждому методу.
2. Открой src/01-arrays/exercises.ts и запусти: npm run test:watch -- 01-arrays
`,
});
