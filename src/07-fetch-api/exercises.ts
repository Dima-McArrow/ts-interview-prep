/**
 * EXERCISES 07 — FETCH API
 * Watch mode: npm run test:watch -- 07-fetch
 *
 * Tests replace global `fetch` with the mock server from mock-api.ts
 * (read its header to see all routes). Use plain `fetch(...)` with relative
 * URLs like '/users/1' — exactly as you would in a browser app.
 *
 * PART 1 — QUIZ: replace each TODO with the exact value the snippet produces.
 *   Each question has a "Concept" line: which idea it checks + the lesson section.
 * PART 2 — TASKS: replace `return todo();` with your implementation.
 *   Each task has a "How to think" block: a step-by-step plan WITHOUT the code.
 *
 * Detailed explanations of every answer: solutions/07-fetch-api.ts
 */
import { TODO, todo } from '../_utils/todo';
import { HttpError } from './http-error';
import type { User } from './mock-api';

export { HttpError };

// ===========================================================================
// PART 1 — QUIZ: "What is the result?"
// ===========================================================================
export const quiz = {
  // Q1.  await fetch('/users/999').then(() => 'resolved', () => 'rejected')   // 404 route
  // Concept: fetch does NOT reject on HTTP errors (lesson §2).
  q1: TODO,

  // Q2.  (await fetch('/users/999')).ok
  // Concept: res.ok (lesson §1, §2).
  q2: TODO,

  // Q3.  new Response(null, { status: 299 }).ok
  // Concept: the exact range of res.ok (lesson §1).
  q3: TODO,

  // Q4.  const res = await fetch('/users/1');
  //      await res.json();
  //      await res.json().then(() => 'ok', (e) => e.name)
  // Concept: the body can be read only once (lesson §4).
  q4: TODO,

  // Q5.  await new Request('https://x.test', { method: 'POST', body: { a: 1 } }).text()
  // Concept: body must be a string — objects get String()-ed (lesson §5).
  q5: TODO,

  // Q6.  new URLSearchParams({ q: 'a b', n: '1' }).toString()
  // Concept: URLSearchParams encoding (lesson §6).
  q6: TODO,

  // Q7.  const c = new AbortController();
  //      c.abort();
  //      await fetch('/users', { signal: c.signal }).catch((e) => e.name)
  // Concept: aborting before the request even starts (lesson §8).
  q7: TODO,

  // Q8.  await fetch('/slow', { signal: AbortSignal.timeout(10) }).catch((e) => e.name)
  // Concept: AbortSignal.timeout error name (lesson §8).
  q8: TODO,

  // Q9.  await new Response(null, { status: 204 }).text()
  // Concept: 204 has no body (lesson §4).
  q9: TODO,

  // Q10. await new Response('oops').json().catch((e) => e.name)
  // Concept: json() on a non-JSON body (lesson §4).
  q10: TODO,

  // Q11. await fetch('/offline').then(() => 'resolved', (e) => e.name)
  // Concept: network failure → reject with TypeError (lesson §2).
  q11: TODO,

  // Q12. new URL('/api/v1?x=1', 'https://site.com/old/path').href
  // Concept: absolute path in new URL(path, base) (lesson §6).
  q12: TODO,
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. GET JSON with proper error handling.
 * - on 2xx → return parsed JSON
 * - otherwise → throw new HttpError(status, parsedBodyOrNull)
 * getJSON<User>('/users/1') → { id: 1, ... };   getJSON('/users/999') → throws HttpError(404, { error: ... })
 *
 * How to think:
 *  1. const res = await fetch(url, init).
 *  2. !res.ok → read the error body (it may not be JSON → .catch(() => null)),
 *     then throw new HttpError(res.status, body).
 *  3. Otherwise return res.json() (cast to Promise<T> — TS can't know the server's shape).
 *  This helper is the foundation for T3, T4, T5, T8, T9 — reuse it!
 */
export async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  return todo();
}

/**
 * T2. Build a URL with query params; skip params that are undefined or null.
 * buildUrl('https://api.test', '/items', { page: 2, q: 'a b', tag: undefined })
 *   → 'https://api.test/items?page=2&q=a+b'
 *
 * How to think:
 *  1. const url = new URL(path, base).
 *  2. For each [key, value] of Object.entries(params): skip undefined and null
 *     (NOT all falsy — false and 0 are valid values, the test checks `flag=false`).
 *  3. url.searchParams.set(key, String(value)) — encoding is handled for you.
 *  4. return url.toString().
 */
export function buildUrl(
  base: string,
  path: string,
  params: Record<string, string | number | boolean | undefined | null> = {},
): string {
  return todo();
}

/**
 * T3. POST /users with a JSON body; return the created user.
 * Must send header 'Content-Type: application/json'.
 * Server answers 400 when name is missing → throw HttpError (reuse getJSON!).
 *
 * How to think:
 *  1. getJSON<User>('/users', { method: 'POST', headers: {...}, body: ... }).
 *  2. headers: { 'Content-Type': 'application/json' }.
 *  3. body: JSON.stringify(data) — a STRING (the test checks typeof body === 'string').
 */
export async function createUser(data: { name?: string; email?: string }): Promise<User> {
  return todo();
}

/**
 * T4. Fetch JSON, but give up after `ms` milliseconds.
 * On timeout reject with Error(`Request timed out after ${ms}ms`).
 *
 * How to think:
 *  1. Pass signal: AbortSignal.timeout(ms) to fetch (via getJSON's init).
 *  2. Wrap in try { return await ... } catch (error) { ... }.
 *  3. If the error is a DOMException named 'TimeoutError' → throw your friendly Error.
 *     Any other error → re-throw it unchanged (don't hide real problems!).
 *  Manual alternative: new AbortController() + setTimeout(() => controller.abort(), ms).
 */
export async function fetchWithTimeout<T>(url: string, ms: number): Promise<T> {
  return todo();
}

/**
 * T5. Load several users IN PARALLEL; skip the ones that are not found (404).
 * Other errors (500, network) must still be thrown.
 * getUsers([1, 999, 2]) → [user1, user2]
 *
 * How to think:
 *  1. Parallel → Promise.all(ids.map(...)).
 *  2. Each request: getJSON(...).catch((e) => ...):
 *       HttpError with status 404 → return null (marker "skip me")
 *       anything else             → throw e (so Promise.all rejects)
 *  3. Filter out the nulls. TS tip: .filter((u): u is User => u !== null).
 */
export async function getUsers(ids: number[]): Promise<User[]> {
  return todo();
}

/**
 * T6. Retry on network errors, 429 and 5xx. Do NOT retry other 4xx.
 * Return the final Response (whatever it is) after at most `retries` RE-tries
 * (so at most retries + 1 calls). If the last attempt is a network error, rethrow it.
 * fetchWithRetry('/flaky', 3) → 200 (third call)
 * fetchWithRetry('/users/999', 3) → 404 after ONE call
 *
 * How to think:
 *  1. Loop attempt = 0, 1, 2, ... ; isLast = attempt >= retries.
 *  2. try: const res = await fetch(url).
 *     retriable = status 429 or >= 500. If NOT retriable or isLast → return res.
 *  3. catch (network error): if isLast → throw; otherwise continue the loop.
 *  4. (In real code: await a backoff delay before the next attempt. Tests don't need it.)
 */
export async function fetchWithRetry(url: string, retries: number): Promise<Response> {
  return todo();
}

/**
 * T7. Parse a response body smartly:
 *  - 204 or empty body           → null
 *  - content-type includes json  → parsed JSON
 *  - otherwise                   → text
 *
 * How to think:
 *  1. status 204 → return null immediately.
 *  2. const text = await res.text() — read the stream ONCE.
 *  3. Empty text → null.
 *  4. content-type contains 'json' (it may be 'application/json; charset=utf-8'!) →
 *     JSON.parse(text). Otherwise → return text.
 */
export async function parseBody(res: Response): Promise<unknown> {
  return todo();
}

/**
 * T8. Pagination: GET /items?page=1, then follow `nextPage` until it's null.
 * Return all items concatenated. Pages must be loaded one after another.
 * fetchAllItems() → [1, 2, 3, 4, 5, 6, 7, 8, 9]
 *
 * How to think:
 *  1. let page: number | null = 1; const all = [].
 *  2. while (page !== null): GET /items?page=page → { items, nextPage }.
 *  3. all.push(...items); page = nextPage.
 *  Sequential by nature: you only know the next page number after loading the current one.
 */
export async function fetchAllItems(): Promise<number[]> {
  return todo();
}

/**
 * T9. Small API client: prefixes baseUrl, adds 'Authorization: Bearer <token>',
 * sends/parses JSON, throws HttpError on non-2xx.
 * const api = createApiClient('https://api.test', 'secret');
 * await api.get('/echo-headers') → { headers: { authorization: 'Bearer secret', ... } }
 * await api.post('/users', { name: 'X' }) → created user
 *
 * How to think:
 *  1. One private request<T>(path, init) function inside the closure:
 *     URL = new URL(path, baseUrl); headers = { Authorization: 'Bearer ' + token,
 *     plus 'Content-Type: application/json' when there is a body, plus init.headers }.
 *     Then call getJSON (it already throws HttpError on non-2xx).
 *  2. get = (path) => request(path).
 *  3. post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }).
 *  The token lives in the closure — callers never pass it again.
 */
export function createApiClient(
  baseUrl: string,
  token: string,
): {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body: unknown) => Promise<T>;
} {
  return todo();
}

/**
 * T10. ★ "Latest wins" search: every new call aborts the previous in-flight request.
 * - The aborted call's promise rejects with an error whose name is 'AbortError'.
 * - The latest call resolves with the `results` array from GET /search?q=<query>.
 * const search = createSearch();
 * search('r');  search('re')  → first rejects (AbortError), second → ['re-1', 're-2']
 *
 * How to think:
 *  1. Closure state: `let controller: AbortController | null = null`.
 *  2. On each call: controller?.abort() (cancel the previous request),
 *     then controller = new AbortController().
 *  3. getJSON('/search?q=' + encodeURIComponent(query), { signal: controller.signal })
 *     and return data.results.
 *  4. Don't catch the AbortError — the test expects the old call to REJECT with it.
 */
export function createSearch(): (query: string) => Promise<string[]> {
  return todo();
}
