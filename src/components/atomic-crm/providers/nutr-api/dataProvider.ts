import type {
  DataProvider,
  DeleteParams,
  GetListParams,
  GetManyParams,
  GetOneParams,
  Identifier,
  RaRecord,
  UpdateParams,
} from "ra-core";
import type { ConfigurationContextValue } from "../../root/ConfigurationContext";
import { defaultConfiguration } from "../../root/defaultConfiguration";
import { nutrFetchJson } from "./http";

type AdminUserListResponse = {
  users: RaRecord[];
  pagination: { total: number; limit: number; offset: number };
};

type AdminSupportSessionDetail = {
  session: RaRecord;
  messages: RaRecord[];
};

function toQuery(
  params: Record<string, string | number | boolean | undefined>,
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

const notSupported = (op: string, resource: string): never => {
  throw new Error(`${op} is not supported for resource "${resource}"`);
};

export type NutrCrmDataProvider = DataProvider & {
  getConfiguration(): Promise<ConfigurationContextValue>;
  updateConfiguration(
    c: ConfigurationContextValue,
  ): Promise<ConfigurationContextValue>;
  isInitialized(): Promise<boolean>;
  signUp(): Promise<never>;
  salesCreate(): Promise<never>;
  salesUpdate(): Promise<never>;
  updatePassword(): Promise<never>;
  unarchiveDeal(): Promise<never>;
  mergeContacts(): Promise<never>;
  getNutrStats(): Promise<RaRecord>;
  getNutrCompanionStats(userId: Identifier): Promise<RaRecord>;
};

export function createNutrDataProvider(): NutrCrmDataProvider {
  // Implemented against FastAPI admin routes; ra-core generic DataProvider
  // signatures are satisfied at runtime.
  const dp: any = {
    getList: async (resource: string, params: GetListParams) => {
      const { page = 1, perPage = 25 } = params.pagination ?? {};
      const offset = (page - 1) * perPage;
      const limit = perPage;
      const filter = params.filter ?? {};

      if (resource === "customers") {
        const q = filter.q as string | undefined;
        const is_active =
          filter.is_active === true || filter.is_active === false
            ? filter.is_active
            : (filter.is_active as string | undefined) === "true"
              ? true
              : (filter.is_active as string | undefined) === "false"
                ? false
                : undefined;
        const res = await nutrFetchJson<AdminUserListResponse>(
          `/api/v1/admin/users${toQuery({ q, is_active, limit, offset })}`,
        );
        return { data: res.users, total: res.pagination.total };
      }

      if (resource === "support_sessions") {
        const status = filter.status as string | undefined;
        const data = await nutrFetchJson<RaRecord[]>(
          `/api/v1/admin/support/sessions${toQuery({ status, limit, offset })}`,
        );
        return { data, total: data.length };
      }

      if (resource === "subscriptions") {
        const status = filter.status as string | undefined;
        const data = await nutrFetchJson<RaRecord[]>(
          `/api/v1/admin/subscriptions${toQuery({ status, limit, offset })}`,
        );
        return { data, total: data.length };
      }

      if (resource === "payments") {
        const status = filter.status as string | undefined;
        const data = await nutrFetchJson<RaRecord[]>(
          `/api/v1/admin/payments${toQuery({ status, limit, offset })}`,
        );
        return { data, total: data.length };
      }

      if (resource === "subscription_plans") {
        const data = await nutrFetchJson<RaRecord[]>(
          `/api/v1/admin/subscription-plans`,
        );
        const start = offset;
        const paged = data.slice(start, start + limit);
        return { data: paged, total: data.length };
      }

      if (resource === "scans") {
        const user_idRaw = filter.user_id;
        let user_id: number | undefined;
        if (
          user_idRaw !== undefined &&
          user_idRaw !== "" &&
          user_idRaw != null
        ) {
          const n = Number.parseInt(String(user_idRaw), 10);
          user_id = Number.isFinite(n) ? n : undefined;
        }
        const barcode = filter.barcode as string | undefined;
        const data = await nutrFetchJson<RaRecord[]>(
          `/api/v1/admin/scans${toQuery({ user_id, barcode, limit, offset })}`,
        );
        return { data, total: data.length };
      }

      if (resource === "reviews") {
        const barcode = filter.barcode as string | undefined;
        const user_idRaw = filter.user_id;
        let user_id: number | undefined;
        if (
          user_idRaw !== undefined &&
          user_idRaw !== "" &&
          user_idRaw != null
        ) {
          const n = Number.parseInt(String(user_idRaw), 10);
          user_id = Number.isFinite(n) ? n : undefined;
        }
        const data = await nutrFetchJson<RaRecord[]>(
          `/api/v1/admin/reviews${toQuery({ barcode, user_id, limit, offset })}`,
        );
        return { data, total: data.length };
      }

      throw new Error(`Unknown resource: ${resource}`);
    },

    getOne: async (resource: string, { id }: GetOneParams) => {
      if (resource === "customers") {
        const data = await nutrFetchJson<RaRecord>(`/api/v1/admin/users/${id}`);
        return { data };
      }
      if (resource === "support_sessions") {
        const detail = await nutrFetchJson<AdminSupportSessionDetail>(
          `/api/v1/admin/support/sessions/${id}`,
        );
        const data = { ...detail.session, messages: detail.messages };
        return { data };
      }
      const listResources = [
        "subscriptions",
        "payments",
        "subscription_plans",
        "scans",
        "reviews",
      ] as const;
      if ((listResources as readonly string[]).includes(resource)) {
        const { data, total } = await dp.getList(resource, {
          pagination: { page: 1, perPage: 500 },
          sort: { field: "id", order: "ASC" },
          filter: {},
        });
        void total;
        const row = data.find((r: RaRecord) => String(r.id) === String(id));
        if (!row) throw new Error("Record not found");
        return { data: row };
      }
      throw new Error(`Unknown resource: ${resource}`);
    },

    getMany: async (resource: string, { ids }: GetManyParams) => {
      const rows = await Promise.all(
        ids.map(async (oneId: Identifier) => {
          try {
            const { data } = await dp.getOne(resource, { id: oneId });
            return data;
          } catch {
            return null;
          }
        }),
      );
      return { data: rows.filter(Boolean) as RaRecord[] };
    },

    getManyReference: async () => ({ data: [], total: 0 }),

    create: async (resource: string) => {
      notSupported("create", resource);
    },

    update: async (resource: string, params: UpdateParams) => {
      const { id, data } = params;
      if (resource === "customers") {
        const body = {
          is_active: data.is_active,
          is_verified: data.is_verified,
          has_completed_health_assessment: data.has_completed_health_assessment,
        };
        const row = await nutrFetchJson<RaRecord>(`/api/v1/admin/users/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        return { data: row };
      }
      if (resource === "support_sessions") {
        const body = {
          status: data.status ?? undefined,
          priority: data.priority ?? undefined,
          assigned_to: data.assigned_to ?? undefined,
        };
        const row = await nutrFetchJson<RaRecord>(
          `/api/v1/admin/support/sessions/${id}`,
          { method: "PATCH", body: JSON.stringify(body) },
        );
        return { data: row };
      }
      notSupported("update", resource);
    },

    updateMany: async (resource: string) => {
      notSupported("updateMany", resource);
    },

    delete: async (resource: string, { id }: DeleteParams) => {
      if (resource === "reviews") {
        await nutrFetchJson(`/api/v1/admin/reviews/${id}`, {
          method: "DELETE",
        });
        return { data: { id } as RaRecord };
      }
      notSupported("delete", resource);
    },

    deleteMany: async (resource: string) => {
      notSupported("deleteMany", resource);
    },

    getConfiguration: async () => defaultConfiguration,

    updateConfiguration: async (c: ConfigurationContextValue) => c,

    isInitialized: async () => true,

    signUp: async () => {
      throw new Error("Sign up is not available");
    },

    salesCreate: async () => {
      throw new Error("Not available");
    },

    salesUpdate: async () => {
      throw new Error("Not available");
    },

    updatePassword: async () => {
      throw new Error("Not available");
    },

    unarchiveDeal: async () => {
      throw new Error("Not available");
    },

    mergeContacts: async () => {
      throw new Error("Not available");
    },

    getNutrStats: () => nutrFetchJson(`/api/v1/admin/stats`),

    getNutrCompanionStats: (userId: Identifier) =>
      nutrFetchJson(`/api/v1/admin/companion/users/${userId}/stats`),
  };

  return dp as NutrCrmDataProvider;
}

let singleton: NutrCrmDataProvider | undefined;

export function getNutrDataProvider(): NutrCrmDataProvider {
  if (!singleton) singleton = createNutrDataProvider();
  return singleton;
}
