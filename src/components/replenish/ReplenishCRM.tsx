import { useEffect } from "react";
import { Admin } from "@/components/admin/admin";
import { Resource, localStorageStore } from "ra-core";

import {
  getNutrAuthProvider,
  getNutrDataProvider,
} from "@/components/atomic-crm/providers/nutr-api";
import {
  getStoredAdminApiKey,
  setStoredAdminApiKey,
} from "@/components/atomic-crm/providers/nutr-api/storage";
import {
  CONFIGURATION_STORE_KEY,
  type ConfigurationContextValue,
} from "@/components/atomic-crm/root/ConfigurationContext";
import { defaultConfiguration } from "@/components/atomic-crm/root/defaultConfiguration";

import { NutrDashboard } from "./NutrDashboard";
import { NutrLayout } from "./NutrLayout";
import { NutrLoginPage } from "./NutrLoginPage";
import {
  customers,
  payments,
  reviews,
  scans,
  subscription_plans,
  subscriptions,
  support_sessions,
} from "./replenishResources";

const store = localStorageStore(undefined, "replenish-crm");
const dataProvider = getNutrDataProvider();
const authProvider = getNutrAuthProvider();

if (typeof window !== "undefined") {
  const envKey = import.meta.env.VITE_NUTR_ADMIN_API_KEY;
  if (typeof envKey === "string" && envKey.trim() && !getStoredAdminApiKey()) {
    setStoredAdminApiKey(envKey.trim());
  }
}

export const ReplenishCRM = () => {
  useEffect(() => {
    const prev =
      store.getItem(CONFIGURATION_STORE_KEY) ??
      ({} as ConfigurationContextValue);
    store.setItem(CONFIGURATION_STORE_KEY, {
      ...defaultConfiguration,
      ...prev,
      title: "Replenish NutrAI",
    } satisfies ConfigurationContextValue);
  }, []);

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      layout={NutrLayout}
      loginPage={NutrLoginPage}
      dashboard={NutrDashboard}
      store={store}
      requireAuth
      disableTelemetry
      title="Replenish NutrAI"
    >
      <Resource name="customers" {...customers} />
      <Resource name="support_sessions" {...support_sessions} />
      <Resource name="subscriptions" {...subscriptions} />
      <Resource name="payments" {...payments} />
      <Resource name="subscription_plans" {...subscription_plans} />
      <Resource name="scans" {...scans} />
      <Resource name="reviews" {...reviews} />
    </Admin>
  );
};
