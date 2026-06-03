import { ApiError } from "@/types";

/**
 * API base URL strategy:
 * - Browser (client): use "" (empty string) → requests go to /api/v1/... on localhost:3000
 *   which Next.js rewrites proxy to localhost:8000.  This avoids all browser CORS issues.
 * - Server (SSR): use the full backend URL for server-side fetches.
 */
const API_BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : "";

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}/api/v1${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000); // 15s timeout

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      signal: controller.signal,
      ...options,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    const error: ApiError = {
      message: isAbort
        ? "Request timed out. Is the backend running on port 8000?"
        : `Network error: ${(err as Error)?.message ?? "Failed to fetch"}. Is the backend running?`,
      status: 0,
    };
    throw error;
  }

  clearTimeout(timeoutId);

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.detail ?? JSON.stringify(body);
    } catch {
      detail = response.statusText;
    }
    const error: ApiError = {
      message: `API error ${response.status}: ${detail}`,
      status: response.status,
      detail,
    };
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

export const apiGet = <T>(path: string) => apiFetch<T>(path);

export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(path: string) =>
  apiFetch<T>(path, { method: "DELETE" });
