import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HttpError,
  buildUrl,
  createApiClient,
  createSearch,
  createUser,
  fetchAllItems,
  fetchWithRetry,
  fetchWithTimeout,
  getJSON,
  getUsers,
  parseBody,
  quiz,
} from './exercises';
import { defineQuiz } from '../_utils/quiz';
import { createMockFetch } from './mock-api';

/** Each test gets a fresh mock server, wrapped in a spy to count calls. */
let fetchSpy: ReturnType<typeof vi.fn<typeof fetch>>;
beforeEach(() => {
  fetchSpy = vi.fn(createMockFetch());
  vi.stubGlobal('fetch', fetchSpy);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

/** A rejection reason is `unknown`: narrow it before reading `.name`. */
const errorName = (e: unknown) => (e instanceof Error ? e.name : String(e));

const expected: Record<keyof typeof quiz, () => Promise<unknown> | unknown> = {
  q1: () =>
    fetch('/users/999').then(
      () => 'resolved',
      () => 'rejected',
    ),
  q2: async () => (await fetch('/users/999')).ok,
  q3: () => new Response(null, { status: 299 }).ok,
  q4: async () => {
    const res = await fetch('/users/1');
    await res.json();
    return res.json().then(() => 'ok', errorName);
  },
  // The quiz asks what a plain object in `body` turns into ("[object Object]").
  // TS rejects an object there (body must be a string/FormData/Blob...), so the double cast
  // only lets us run this deliberate bug and see what plain JS would send.
  q5: () =>
    new Request('https://x.test', { method: 'POST', body: { a: 1 } as unknown as string }).text(),
  q6: () => new URLSearchParams({ q: 'a b', n: '1' }).toString(),
  q7: async () => {
    const c = new AbortController();
    c.abort();
    return fetch('/users', { signal: c.signal }).catch(errorName);
  },
  q8: () => fetch('/slow', { signal: AbortSignal.timeout(10) }).catch(errorName),
  q9: () => new Response(null, { status: 204 }).text(),
  q10: () => new Response('oops').json().catch(errorName),
  q11: () => fetch('/offline').then(() => 'resolved', errorName),
  q12: () => new URL('/api/v1?x=1', 'https://site.com/old/path').href,
};

// The quiz uses the mock fetch too (installed by the top-level beforeEach).
defineQuiz('07 fetch · Part 1 — Quiz', quiz, expected);

describe('07 fetch · Part 2 — Tasks', () => {
  it('T1 getJSON', async () => {
    await expect(getJSON('/users/1')).resolves.toMatchObject({ id: 1, name: 'Leanne' });
    const error = await getJSON('/users/999').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    // Safe cast: the line above already checked it at runtime. TS just can't see that
    // expect(...).toBeInstanceOf narrows the type, so we tell it explicitly.
    expect((error as HttpError).status).toBe(404);
    expect((error as HttpError).body).toEqual({ error: 'User not found' });
  });

  it('T2 buildUrl', () => {
    expect(buildUrl('https://api.test', '/items', { page: 2, q: 'a b', tag: undefined })).toBe(
      'https://api.test/items?page=2&q=a+b',
    );
    expect(buildUrl('https://api.test', '/users')).toBe('https://api.test/users');
    expect(buildUrl('https://api.test', '/x', { flag: false, nothing: null })).toBe(
      'https://api.test/x?flag=false',
    );
  });

  it('T3 createUser', async () => {
    const user = await createUser({ name: 'Dima', email: 'd@test.dev' });
    expect(user).toMatchObject({ name: 'Dima', email: 'd@test.dev' });
    expect(typeof user.id).toBe('number');

    const [, init] = fetchSpy.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json');
    expect(typeof init?.body, 'body must be a JSON string').toBe('string');

    await expect(createUser({})).rejects.toBeInstanceOf(HttpError);
  });

  it('T4 fetchWithTimeout', async () => {
    await expect(fetchWithTimeout('/users/1', 200)).resolves.toMatchObject({ id: 1 });
    await expect(fetchWithTimeout('/slow', 20)).rejects.toThrow('Request timed out after 20ms');
  });

  it('T5 getUsers (parallel, skip 404)', async () => {
    const users = await getUsers([1, 999, 2]);
    expect(users.map((u) => u.id)).toEqual([1, 2]);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('T5 getUsers starts all requests at once', async () => {
    const promise = getUsers([1, 2, 3]);
    promise.catch(() => {}); // avoid an "unhandled rejection" if the expect below fails first
    await Promise.resolve(); // let the function start
    expect(fetchSpy, 'all fetches should start before any finishes').toHaveBeenCalledTimes(3);
    await promise;
  });

  it('T6 fetchWithRetry', async () => {
    const ok = await fetchWithRetry('/flaky', 3);
    expect(ok.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    fetchSpy.mockClear();
    const notFound = await fetchWithRetry('/users/999', 3);
    expect(notFound.status).toBe(404);
    expect(fetchSpy, '4xx must not be retried').toHaveBeenCalledTimes(1);

    fetchSpy.mockClear();
    const broken = await fetchWithRetry('/broken', 2);
    expect(broken.status).toBe(500);
    expect(fetchSpy, '1 call + 2 retries').toHaveBeenCalledTimes(3);

    fetchSpy.mockClear();
    await expect(fetchWithRetry('/offline', 1)).rejects.toThrow('fetch failed');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('T7 parseBody', async () => {
    expect(await parseBody(new Response(null, { status: 204 }))).toBeNull();
    expect(await parseBody(new Response(''))).toBeNull();
    expect(
      await parseBody(
        new Response('{"a":1}', { headers: { 'content-type': 'application/json; charset=utf-8' } }),
      ),
    ).toEqual({ a: 1 });
    expect(
      await parseBody(new Response('hello', { headers: { 'content-type': 'text/plain' } })),
    ).toBe('hello');
  });

  it('T8 fetchAllItems', async () => {
    expect(await fetchAllItems()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('T9 createApiClient', async () => {
    const api = createApiClient('https://api.test', 'secret');
    const echoed = await api.get<{ headers: Record<string, string> }>('/echo-headers');
    expect(echoed.headers.authorization).toBe('Bearer secret');

    const created = await api.post<{ name: string }>('/users', { name: 'X' });
    expect(created.name).toBe('X');

    await expect(api.get('/users/999')).rejects.toBeInstanceOf(HttpError);
  });

  it('T10 createSearch (latest wins)', async () => {
    const search = createSearch();
    const first = search('r');
    const second = search('re');
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).resolves.toEqual(['re-1', 're-2']);
    // A new search after the previous finished works normally.
    await expect(search('x')).resolves.toEqual(['x-1', 'x-2']);
  });
});
