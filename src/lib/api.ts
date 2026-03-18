const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:3001/api/v1";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown; authToken?: string | null },
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  console.log(url, "url");

  const headers = new Headers(init?.headers);

  if (init?.authToken) {
    headers.set("Authorization", `Bearer ${init.authToken}`);
  }

  let body = init?.body;
  if (init && "json" in init) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }

  const response = await fetch(url, { ...init, headers, body });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as any).message)
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}
