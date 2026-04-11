import { ResponsiveBar } from "@nivo/bar";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { nutrStatKeys } from "./nutrDashboardStats";

type Stats = Record<string, number>;

const axisMuted = {
  ticks: { text: { fill: "var(--color-muted-foreground)" } },
  legend: { text: { fill: "var(--color-muted-foreground)" } },
};

const barColors = [
  "#6366f1",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#ca8a04",
];

function buildAllMetricsData(stats: Stats | undefined) {
  return nutrStatKeys.map(({ key, label }) => ({
    metric: label,
    value: typeof stats?.[key] === "number" ? stats[key] : 0,
  }));
}

function buildUsersData(stats: Stats | undefined) {
  return [
    { segment: "Total", value: stats?.users_total ?? 0 },
    { segment: "Active", value: stats?.users_active ?? 0 },
    { segment: "Verified", value: stats?.users_verified ?? 0 },
  ];
}

type NutrDashboardChartsProps = {
  data: Stats | undefined;
};

export function NutrDashboardCharts({ data }: NutrDashboardChartsProps) {
  const allMetrics = useMemo(() => buildAllMetricsData(data), [data]);
  const usersOnly = useMemo(() => buildUsersData(data), [data]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold tracking-tight text-muted-foreground">
        Charts
      </h3>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">All metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[min(420px,55vh)] w-full min-h-[280px]">
              <ResponsiveBar
                data={allMetrics}
                keys={["value"]}
                indexBy="metric"
                layout="horizontal"
                margin={{ top: 8, right: 24, bottom: 40, left: 168 }}
                padding={0.35}
                valueScale={{ type: "linear", min: 0 }}
                colors={(bar) => barColors[bar.index % barColors.length]}
                borderRadius={4}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 8,
                  style: axisMuted,
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 8,
                  style: axisMuted,
                }}
                enableLabel={true}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="#fafafa"
                theme={{
                  tooltip: {
                    container: {
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      fontSize: 12,
                      borderRadius: 6,
                    },
                  },
                }}
                role="application"
                ariaLabel="Admin metrics bar chart"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[min(320px,40vh)] w-full min-h-[220px]">
              <ResponsiveBar
                data={usersOnly}
                keys={["value"]}
                indexBy="segment"
                margin={{ top: 24, right: 16, bottom: 48, left: 48 }}
                padding={0.3}
                valueScale={{ type: "linear", min: 0 }}
                colors={["#6366f1"]}
                borderRadius={6}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 8,
                  style: axisMuted,
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 8,
                  style: axisMuted,
                }}
                enableLabel={true}
                labelTextColor="#fafafa"
                theme={{
                  tooltip: {
                    container: {
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      fontSize: 12,
                      borderRadius: 6,
                    },
                  },
                }}
                role="application"
                ariaLabel="Users breakdown bar chart"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
