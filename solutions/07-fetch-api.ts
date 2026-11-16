/**
 * SOLUTIONS 07 — FETCH API (with detailed explanations)
 * Open only after you tried yourself :)
 *
 * Format for every task: solution → WHY it works → alternatives / pitfalls.
 */
import { HttpError } from '../src/07-fetch-api/http-error';
import type { User } from '../src/07-fetch-api/mock-api';

export { HttpError };

// ===========================================================================
// PART 1 — QUIZ ANSWERS
// ===========================================================================
export const quiz = {
  // Q1: 'resolved'
  // The server answered (with 404), so the fetch promise FULFILLS. fetch only rejects on
  // network errors, CORS blocks and aborts.
  q1: 'resolved',

  // Q2: false
  // 404 is outside 200–299.
  q2: false,

  // Q3: true
  // ok is true for ANY status from 200 to 299 inclusive.
  q3: true,

  // Q4: 'TypeError'
  // The body is a stream; the first json() consumed it. A second read throws
  // TypeError: Body is unusable. Use res.clone() BEFORE reading if you need it twice.
  q4: 'TypeError',

  // Q5: '[object Object]'
  // A plain object is not a valid body type, so it's converted with String(obj).
  // Always JSON.stringify objects.
  q5: '[object Object]',

  // Q6: 'q=a+b&n=1'
  // URLSearchParams uses form encoding: a space becomes '+'. Order = insertion order.
  q6: 'q=a+b&n=1',

  // Q7: 'AbortError'
  // An already-aborted signal makes fetch reject immediately with an AbortError DOMException.
  q7: 'AbortError',

  // Q8: 'TimeoutError'
  // AbortSignal.timeout aborts with a DOMException named TimeoutError (not AbortError),
  // which lets you tell "timed out" apart from "cancelled by the user".
  q8: 'TimeoutError',

  // Q9: ''
  // 204 means "no content": text() of an empty body is an empty string.
  q9: '',

  // Q10: 'SyntaxError'
  // json() runs JSON.parse on the body; 'oops' isn't valid JSON.
  q10: 'SyntaxError',

  // Q11: 'TypeError'
  // A network failure rejects with TypeError ("fetch failed" in Node,
  // "Failed to fetch" in Chrome). CORS blocks look exactly the same in the browser.
  q11: 'TypeError',

  // Q12: 'https://site.com/api/v1?x=1'
  // A path starting with '/' replaces the WHOLE path of the base URL.
  q12: 'https://site.com/api/v1?x=1',
};

// ===========================================================================
// PART 2 — TASKS
// ===========================================================================

/**
 * T1. getJSON
 * WHY: fetch resolves for any HTTP status, so we check res.ok ourselves and turn non-2xx
 * into an exception that carries the status and the server's error body.
 * `.catch(() => null)` — error bodies are not always JSON (e.g. an HTML 502 page).
 * `as Promise<T>` — TS can't verify the server's response shape. In production, validate
 * it (zod) instead of trusting the cast (see lesson 08).
 */
export async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new HttpError(res.status, body);
  }
  return res.json() as Promise<T>;
}

/**
 * T2. buildUrl
 * WHY: URL + searchParams handle encoding (spaces, &, unicode) correctly.
 * We skip only undefined/null, so false and 0 are still sent.
 */
export function buildUrl(
  base: string,
  path: string,
  params: Record<string, string | number | boolean | undefined | null> = {},
): string {
  const url = new URL(path, base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * T3. createUser
 * WHY: reusing getJSON gives us the res.ok check and HttpError for free (400 → throws).
 * Content-Type tells the server how to parse the body; JSON.stringify makes it a string.
 */
export async function createUser(data: { name?: string; email?: string }): Promise<User> {
  return getJSON<User>('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * T4. fetchWithTimeout
 * WHY: AbortSignal.timeout(ms) actually CANCELS the request (unlike a Promise.race timeout,
 * which only stops waiting). We translate TimeoutError into a friendly message and
 * re-throw everything else unchanged.
 * `{ cause: error }` keeps the original TimeoutError inside the new one (error.cause),
 * so a debugger or log still shows what really happened.
 * `return await` is essential: without await, the rejection would escape the try/catch.
 */
export async function fetchWithTimeout<T>(url: string, ms: number): Promise<T> {
  try {
    return await getJSON<T>(url, { signal: AbortSignal.timeout(ms) });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error(`Request timed out after ${ms}ms`, { cause: error });
    }
    throw error;
  }
}

/**
 * T5. getUsers
 * WHY: all requests start at once (map + Promise.all). Each one handles ITS OWN 404 by
 * returning null, so one missing user doesn't fail the whole batch. Other errors are
 * re-thrown → Promise.all rejects, as required.
 * The type-guard filter removes nulls and narrows the array type to User[].
 * Alternative: Promise.allSettled + inspect reasons (but then you'd swallow 500s too
 * unless you check them explicitly).
 */
export async function getUsers(ids: number[]): Promise<User[]> {
  const results = await Promise.all(
    ids.map((id) =>
      getJSON<User>(`/users/${id}`).catch((error: unknown) => {
        if (error instanceof HttpError && error.status === 404) return null;
        throw error;
      }),
    ),
  );
  return results.filter((user): user is User => user !== null);
}

/**
 * T6. fetchWithRetry
 * WHY: we retry only what can succeed next time — network errors, 429, 5xx.
 * A 4xx means the request itself is wrong; retrying just wastes time.
 * The loop makes at most retries + 1 calls; on the last attempt we return / throw whatever
 * we got.
 * Production additions: exponential backoff + jitter, honor the Retry-After header,
 * and only retry idempotent methods (GET/PUT/DELETE) automatically — not POST.
 */
export async function fetchWithRetry(url: string, retries: number): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const isLast = attempt >= retries;
    try {
      const res = await fetch(url);
      const retriable = res.status === 429 || res.status >= 500;
      if (!retriable || isLast) return res;
    } catch (error) {
      if (isLast) throw error;
    }
  }
}

/**
 * T7. parseBody
 * WHY: reading text() once avoids the "body already used" problem and lets us decide
 * how to parse AFTER we've seen the content. `includes('json')` also matches
 * 'application/json; charset=utf-8' and 'application/problem+json'.
 */
export async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  const isJson = res.headers.get('content-type')?.includes('json') ?? false;
  return isJson ? JSON.parse(text) : text;
}

/**
 * T8. fetchAllItems
 * WHY: cursor/page-based pagination is inherently sequential — the next page number comes
 * from the current response. We loop until nextPage is null.
 * For "page count known up front" APIs you could fetch pages in parallel instead.
 */
export async function fetchAllItems(): Promise<number[]> {
  const all: number[] = [];
  let page: number | null = 1;
  while (page !== null) {
    const data: { items: number[]; nextPage: number | null } = await getJSON(`/items?page=${page}`);
    all.push(...data.items);
    page = data.nextPage;
  }
  return all;
}

/**
 * T9. createApiClient
 * WHY: a closure holds baseUrl and token; one private `request` function adds common
 * headers and reuses getJSON for error handling. Callers get a tiny, typed API.
 * `...init.headers` last lets a specific call override defaults.
 * Real-world additions: refresh token on 401, base timeout, request/response logging.
 */
export function createApiClient(baseUrl: string, token: string) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    return getJSON<T>(new URL(path, baseUrl).toString(), {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  }
  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  };
}

/**
 * T10. createSearch ("latest wins")
 * WHY: the closure remembers the controller of the in-flight request. A new call aborts it,
 * so the old promise rejects with AbortError and its (stale) result can never reach the UI.
 * This is exactly the cleanup you write in useEffect:
 *   useEffect(() => { const c = new AbortController(); load(q, c.signal); return () => c.abort(); }, [q]);
 */
export function createSearch(): (query: string) => Promise<string[]> {
  let controller: AbortController | null = null;
  return async (query) => {
    controller?.abort();
    controller = new AbortController();
    const data = await getJSON<{ results: string[] }>(`/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    return data.results;
  };
}
