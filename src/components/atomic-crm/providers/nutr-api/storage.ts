const ADMIN_KEY = "replenish_nutr_admin_api_key";
const API_BASE_KEY = "replenish_nutr_api_base_url";

export function getStoredAdminApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_KEY) ?? "";
}

export function setStoredAdminApiKey(key: string) {
  localStorage.setItem(ADMIN_KEY, key);
}

export function clearStoredAdminApiKey() {
  localStorage.removeItem(ADMIN_KEY);
}

export function getStoredApiBaseUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_BASE_KEY) ?? "";
}

export function setStoredApiBaseUrl(url: string) {
  localStorage.setItem(API_BASE_KEY, url.replace(/\/$/, ""));
}

export function clearStoredApiBaseUrl() {
  localStorage.removeItem(API_BASE_KEY);
}

export function getNutrApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_NUTR_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return getStoredApiBaseUrl().replace(/\/$/, "");
}
