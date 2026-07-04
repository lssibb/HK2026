/**
 * Thin fetch wrapper for the Go backend. Base URL comes from VITE_API_URL,
 * which must be the backend ORIGIN without the /api prefix (e.g.
 * "http://localhost:8080") — the "/api" segment is added here. When unset it
 * falls back to same-origin "/api" (works with the Vite dev proxy and with a
 * Go server that also serves the built SPA).
 */

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function url(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}/api/v1${p}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      message = body.error ?? body.message ?? message;
    } catch {
      /* non-JSON error body — keep the status line */
    }
    throw new ApiError(res.status, message);
  }

  // Tolerate an empty body on any 2xx (not just 204), so success never throws.
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// PATCH: send `null` for fields explicitly set to `undefined` so the backend
// clears them (mirrors localStorage, where an undefined field is dropped).
const nullifyUndefined = (_key: string, value: unknown) =>
  value === undefined ? null : value;

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body ?? {}, nullifyUndefined),
    }),
  del: (path: string) => request<void>(path, { method: "DELETE" }),
};
