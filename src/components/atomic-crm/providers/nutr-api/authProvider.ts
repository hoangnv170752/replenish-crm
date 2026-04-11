import type { AuthProvider, UserIdentity } from "ra-core";
import { nutrFetchJson } from "./http";
import {
  clearStoredAdminApiKey,
  clearStoredApiBaseUrl,
  getNutrApiBaseUrl,
  getStoredAdminApiKey,
  setStoredAdminApiKey,
  setStoredApiBaseUrl,
} from "./storage";

export type NutrLoginParams = {
  adminApiKey: string;
  apiBaseUrl?: string;
};

export const getNutrAuthProvider = (): AuthProvider => ({
  login: async (params: NutrLoginParams) => {
    const adminApiKey = params?.adminApiKey?.trim();
    if (!adminApiKey) throw new Error("Admin API key is required");

    const rawBase = params?.apiBaseUrl?.trim() || getNutrApiBaseUrl();
    if (!rawBase) {
      throw new Error(
        "API base URL is required (enter it above or set VITE_NUTR_API_URL)",
      );
    }
    const base = rawBase.replace(/\/$/, "");
    setStoredApiBaseUrl(base);
    setStoredAdminApiKey(adminApiKey);

    await nutrFetchJson("/api/v1/admin/stats", { adminKey: adminApiKey });
  },

  logout: async () => {
    clearStoredAdminApiKey();
    clearStoredApiBaseUrl();
  },

  checkError: () => Promise.resolve(),

  checkAuth: async () => {
    const key = getStoredAdminApiKey();
    if (!key) throw new Error("Not authenticated");
    await nutrFetchJson("/api/v1/admin/stats");
  },

  getPermissions: () => Promise.resolve({ admin: true }),

  getIdentity: async (): Promise<UserIdentity> => ({
    id: "nutr-admin",
    fullName: "Admin",
  }),
});
