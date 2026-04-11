import { getNutrApiBaseUrl, getStoredAdminApiKey } from "./storage";

export class NutrApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "NutrApiError";
    this.status = status;
  }
}

export async function nutrFetchJson<T>(
  path: string,
  init?: RequestInit & { adminKey?: string },
): Promise<T> {
  const base = getNutrApiBaseUrl();
  if (!base) {
    throw new NutrApiError("API base URL is not configured", 0);
  }
  const key = init?.adminKey ?? getStoredAdminApiKey();
  if (!key) {
    throw new NutrApiError("Admin API key is missing", 401);
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-Admin-API-Key", key);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let message = res.statusText || `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") message = body.detail;
      else if (Array.isArray(body?.detail))
        message = body.detail.map((d: { msg?: string }) => d.msg).join("; ");
    } catch {
      // ignore
    }
    throw new NutrApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
