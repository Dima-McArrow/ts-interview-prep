/**
 * Error thrown by our helpers when the server answers with a non-2xx status.
 * Remember: fetch itself does NOT throw on 404/500 — we have to do it ourselves.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown = null,
  ) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}
