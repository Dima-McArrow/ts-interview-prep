/**
 * A tiny in-memory "server" + fetch replacement, so lessons and tests work offline
 * and deterministically. It uses the REAL Request/Response classes built into Node,
 * so everything you learn here works exactly the same with the real fetch.
 *
 * Base URL: https://api.test
 *
 *   GET    /users              → 200 User[]
 *   GET    /users/:id          → 200 User | 404 { error }
 *   POST   /users              → 201 User (echo + id), 400 if name is missing
 *   GET    /items?page=N       → 200 { items: number[], nextPage: number | null } (3 pages)
 *   GET    /search?q=...       → 200 { q, results } (delay depends on query length)
 *   GET    /slow               → 200 after 300ms
 *   GET    /broken             → 500
 *   GET    /empty              → 204 (no body)
 *   GET    /text               → 200 text/plain
 *   GET    /flaky              → 503 twice, then 200 (per mock instance)
 *   GET    /offline            → network error (fetch rejects with TypeError)
 *   GET    /echo-headers       → 200 { headers } (echoes request headers back)
 */

export const BASE_URL = 'https://api.test';

export type User = { id: number; name: string; email: string };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** Waits `ms`, but rejects immediately with signal.reason if the signal aborts. */
function wait(ms: number, signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

export function createMockFetch(options: { latencyMs?: number } = {}): typeof fetch {
  const { latencyMs = 5 } = options;
  const users: User[] = [
    { id: 1, name: 'Leanne', email: 'leanne@test.dev' },
    { id: 2, name: 'Ervin', email: 'ervin@test.dev' },
    { id: 3, name: 'Clementine', email: 'clem@test.dev' },
  ];
  let flakyCalls = 0;

  async function handle(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === 'GET' && path === '/users') return json(users);

    const userMatch = path.match(/^\/users\/(\d+)$/);
    if (req.method === 'GET' && userMatch) {
      const user = users.find((u) => u.id === Number(userMatch[1]));
      return user ? json(user) : json({ error: 'User not found' }, 404);
    }

    if (req.method === 'POST' && path === '/users') {
      // Partial<User>: the client may send any subset of fields (or junk), so nothing is
      // assumed present — the next line checks `name` before using it.
      const body = (await req.json()) as Partial<User>;
      if (!body.name) return json({ error: 'name is required' }, 400);
      return json({ id: 100 + users.length, ...body }, 201);
    }

    if (path === '/items') {
      const page = Number(url.searchParams.get('page') ?? 1);
      const items = [1, 2, 3].map((n) => (page - 1) * 3 + n);
      return json({ items, nextPage: page < 3 ? page + 1 : null });
    }

    if (path === '/search') {
      const q = url.searchParams.get('q') ?? '';
      // Shorter queries are SLOWER — this creates the classic race condition.
      await wait(Math.max(10, 60 - q.length * 20), req.signal);
      return json({ q, results: [`${q}-1`, `${q}-2`] });
    }

    if (path === '/slow') {
      await wait(300, req.signal);
      return json({ slow: true });
    }

    if (path === '/broken') return json({ error: 'Internal Server Error' }, 500);
    if (path === '/empty') return new Response(null, { status: 204 });
    if (path === '/text') {
      return new Response('plain text body', { headers: { 'content-type': 'text/plain' } });
    }

    if (path === '/flaky') {
      flakyCalls++;
      return flakyCalls <= 2 ? json({ error: 'Service Unavailable' }, 503) : json({ ok: true });
    }

    if (path === '/offline') throw new TypeError('fetch failed');

    if (path === '/echo-headers') return json({ headers: Object.fromEntries(req.headers) });

    return json({ error: `No route ${req.method} ${path}` }, 404);
  }

  const mockFetch = async (
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    // Relative URLs ("/users") are resolved against the fake base URL.
    const url =
      typeof input === 'string' && input.startsWith('/') ? new URL(input, BASE_URL) : input;
    const req = new Request(url, { ...init, signal });
    await wait(latencyMs, signal); // simulate network latency (abortable)
    return handle(req);
  };

  return mockFetch as typeof fetch;
}

/** Replaces the global fetch with the mock. Returns a function that restores it. */
export function installMockFetch(options?: { latencyMs?: number }): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = createMockFetch(options);
  return () => {
    globalThis.fetch = original;
  };
}
