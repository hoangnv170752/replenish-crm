export type NutrStats = Record<string, number>;

export const nutrStatKeys: { key: string; label: string }[] = [
  { key: "users_total", label: "Users (total)" },
  { key: "users_active", label: "Users (active)" },
  { key: "users_verified", label: "Users (verified)" },
  { key: "support_sessions_open", label: "Open support sessions" },
  { key: "subscriptions_active", label: "Active subscriptions" },
  { key: "scans_last_24h", label: "Scans (24h)" },
  { key: "reviews_total", label: "Reviews (total)" },
  { key: "companion_conversations_active", label: "Companion conversations" },
];
