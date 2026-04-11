import { useQuery } from "@tanstack/react-query";
import { useDataProvider } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { NutrCrmDataProvider } from "@/components/atomic-crm/providers/nutr-api";

import { NutrDashboardCharts } from "./NutrDashboardCharts";
import type { NutrStats } from "./nutrDashboardStats";
import { nutrStatKeys } from "./nutrDashboardStats";

export const NutrDashboard = () => {
  const dataProvider = useDataProvider<NutrCrmDataProvider>();
  const { data, isPending, error } = useQuery({
    queryKey: ["nutr-admin-stats"],
    queryFn: () => dataProvider.getNutrStats() as Promise<NutrStats>,
  });

  if (isPending) {
    return <p className="text-muted-foreground">Loading overview…</p>;
  }
  if (error) {
    return (
      <p className="text-destructive">
        Could not load stats. Check your admin key and API availability.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {nutrStatKeys.map(({ key, label }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {data?.[key] ?? "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <NutrDashboardCharts data={data} />
    </div>
  );
};
