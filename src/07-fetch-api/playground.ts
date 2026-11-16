/**
 * PLAYGROUND 07 — REAL NETWORK
 * Run: npm run playground
 *
 * Same ideas as lesson.ts, but against a real public fake API:
 * https://jsonplaceholder.typicode.com  (no auth, writes are faked by the server).
 * Feel free to edit and experiment here — this file has no tests.
 */
import { section, show } from '../_utils/log';

const API = 'https://jsonplaceholder.typicode.com';

type Post = { userId: number; id: number; title: string; body: string };
type Comment = { postId: number; id: number; email: string; body: string };

class HttpError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(8000), // never hang forever
  });
  if (!res.ok) throw new HttpError(res.status);
  // TS can't know what the server sends: with Node's types res.json() is Promise<unknown>
  // (Promise<any> in browser types). The cast is a promise from US, not a check — in
  // production validate the shape (e.g. with zod).
  return res.json() as Promise<T>;
}

async function main() {
  section('1. GET one resource');
  const post = await getJSON<Post>('/posts/1');
  show('post.title', post.title);

  section('2. GET with query params');
  const url = new URL(`${API}/comments`);
  url.searchParams.set('postId', '1');
  // Same trust as in getJSON: we assume the API returns Comment[] (it's not validated).
  const comments = (await (await fetch(url)).json()) as Comment[];
  show('comments for post 1', comments.length);
  show('first comment email', comments[0]?.email);

  section('3. 404 does not throw by itself');
  const missing = await fetch(`${API}/posts/99999`);
  show('status / ok', `${missing.status} / ${missing.ok}`);

  section('4. POST JSON (the server fakes the insert)');
  const created = await getJSON<Post>('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ title: 'Hello', body: 'From ts-interview-prep', userId: 1 }),
  });
  show('created', created);

  section('5. PATCH & DELETE');
  const patched = await getJSON<Post>('/posts/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'patched title' }),
  });
  show('patched.title', patched.title);
  const del = await fetch(`${API}/posts/1`, { method: 'DELETE' });
  show('DELETE status', del.status);

  section('6. Parallel: a user + their posts + their todos');
  const [user, posts, todos] = await Promise.all([
    getJSON<{ name: string }>('/users/1'),
    getJSON<Post[]>('/posts?userId=1'),
    getJSON<{ completed: boolean }[]>('/todos?userId=1'),
  ]);
  show('user.name', user.name);
  show('posts count', posts.length);
  show('completed todos', todos.filter((t) => t.completed).length);

  section('7. Abort a request');
  const controller = new AbortController();
  const pending = fetch(`${API}/photos`, { signal: controller.signal });
  controller.abort();
  show(
    'aborted →',
    await pending.then(
      () => 'finished',
      (e: unknown) => (e instanceof Error ? e.name : String(e)),
    ),
  );

  section('8. Your turn ✍️');
  // Ideas:
  //  - Fetch /users, then for each user fetch their posts with mapLimit (module 06), limit 3.
  //  - Build a Map<userId, postCount> from /posts (module 02).
  //  - Find the user with the most completed todos (Object.groupBy + reduce).
}

main().catch((e: unknown) => {
  const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  console.error(`\n❌ ${message}`);
  console.error('   No internet? Use lesson.ts — it works offline with a mock server.');
  process.exitCode = 1;
});
