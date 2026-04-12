import jsonExport from "jsonexport/dist";
import { difference, union } from "lodash";
import {
  downloadCSV,
  type Identifier,
  useListContext,
  useLocaleState,
  type Exporter,
  type RaRecord,
} from "ra-core";
import { type MouseEvent, useCallback, useRef } from "react";
import { Link } from "react-router";
import { Clock, Tag, TrendingUp } from "lucide-react";

import { BulkActionsToolbar } from "@/components/admin/bulk-actions-toolbar";
import { BulkExportButton } from "@/components/admin/bulk-export-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SelectAllButton } from "@/components/admin/select-all-button";
import { SortButton } from "@/components/admin/sort-button";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { TopToolbar } from "@/components/atomic-crm/layout/TopToolbar";
import { ResponsiveFilters } from "@/components/atomic-crm/misc/ResponsiveFilters";
import { formatRelativeDate } from "@/components/atomic-crm/misc/RelativeDate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const pagination = (
  <ListPagination rowsPerPageOptions={[10, 25, 50, 100, 200]} />
);

const exporter: Exporter<RaRecord> = async (records) =>
  jsonExport(records, {}, (_err: unknown, csv: string) => {
    downloadCSV(csv, "customers");
  });

function FilterBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="flex flex-row items-center gap-2 font-bold text-sm">
        {icon}
        {title}
      </h3>
      <div className="flex md:flex-col flex-wrap items-start gap-1 md:gap-0 pl-0 md:pl-1">
        {children}
      </div>
    </div>
  );
}

function CustomerListFilters() {
  const isMobile = useIsMobile();

  return (
    <ResponsiveFilters
      searchInput={{
        placeholder: "Search name, email…",
      }}
    >
      <FilterBlock title="Joined" icon={<Clock className="size-4" />}>
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label="Today"
          value={{ customer_joined: "today" }}
          size={isMobile ? "lg" : undefined}
        />
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label="This week"
          value={{ customer_joined: "this_week" }}
          size={isMobile ? "lg" : undefined}
        />
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label="Before this week"
          value={{ customer_joined: "before_this_week" }}
          size={isMobile ? "lg" : undefined}
        />
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label="Before this month"
          value={{ customer_joined: "before_this_month" }}
          size={isMobile ? "lg" : undefined}
        />
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label="Before last month"
          value={{ customer_joined: "before_last_month" }}
          size={isMobile ? "lg" : undefined}
        />
      </FilterBlock>

      <FilterBlock title="Account" icon={<TrendingUp className="size-4" />}>
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label={
            <span className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-emerald-500"
                aria-hidden
              />
              Active
            </span>
          }
          value={{ is_active: true }}
          size={isMobile ? "lg" : undefined}
        />
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label={
            <span className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-zinc-400"
                aria-hidden
              />
              Inactive
            </span>
          }
          value={{ is_active: false }}
          size={isMobile ? "lg" : undefined}
        />
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label={
            <span className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-sky-500"
                aria-hidden
              />
              Verified email
            </span>
          }
          value={{ is_verified: true }}
          size={isMobile ? "lg" : undefined}
        />
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label={
            <span className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-amber-500"
                aria-hidden
              />
              Paid
            </span>
          }
          value={{ is_paid: true }}
          size={isMobile ? "lg" : undefined}
        />
      </FilterBlock>

      <FilterBlock title="Segments" icon={<Tag className="size-4" />}>
        <ToggleFilterButton
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label={
            <Badge variant="secondary" className="font-normal">
              Health assessment done
            </Badge>
          }
          value={{ has_completed_health_assessment: true }}
          size={isMobile ? "lg" : undefined}
        />
      </FilterBlock>
    </ResponsiveFilters>
  );
}

function customerInitials(r: RaRecord): string {
  const f = String(r.first_name ?? "").trim();
  const l = String(r.last_name ?? "").trim();
  const e = String(r.email ?? "").trim();
  if (f || l) {
    return `${f.charAt(0)}${l.charAt(0) || f.charAt(1) || ""}`.toUpperCase();
  }
  if (e) return e.slice(0, 2).toUpperCase();
  return "?";
}

function avatarHue(id: Identifier): string {
  const n = typeof id === "number" ? id : parseInt(String(id), 10) || 0;
  const hue = (n * 47) % 360;
  return `hsl(${hue} 42% 42%)`;
}

function CustomerStatusDot({ record }: { record: RaRecord }) {
  const active = Boolean(record.is_active);
  const verified = Boolean(record.is_verified);
  return (
    <span
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-background",
        active
          ? verified
            ? "bg-sky-500 ring-sky-500/30"
            : "bg-emerald-500 ring-emerald-500/30"
          : "bg-zinc-400 ring-zinc-400/20",
      )}
      title={active ? (verified ? "Active · verified" : "Active") : "Inactive"}
    />
  );
}

function CustomerListRows() {
  const {
    data: rows,
    error,
    isPending,
    onToggleItem,
    onSelect,
    selectedIds,
  } = useListContext<RaRecord>();
  const lastSelected = useRef<Identifier | null>(null);

  const handleToggleItem = useCallback(
    (id: Identifier, event: MouseEvent) => {
      if (!rows) return;
      const ids = rows.map((r) => r.id);
      const lastSelectedIndex = lastSelected.current
        ? ids.indexOf(lastSelected.current)
        : -1;

      if (event.shiftKey && lastSelectedIndex !== -1) {
        const index = ids.indexOf(id);
        const idsBetweenSelections = ids.slice(
          Math.min(lastSelectedIndex, index),
          Math.max(lastSelectedIndex, index) + 1,
        );
        const idsSel = selectedIds ?? [];
        const isClickedItemSelected = idsSel.includes(id);
        const newSelectedIds = isClickedItemSelected
          ? difference(idsSel, idsBetweenSelections)
          : union(idsSel, idsBetweenSelections);
        onSelect?.(newSelectedIds);
      } else {
        onToggleItem(id);
      }
      lastSelected.current = id;
    },
    [rows, selectedIds, onSelect, onToggleItem],
  );

  if (isPending) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }
  if (error) {
    return null;
  }

  const list = rows ?? [];

  return (
    <div className="md:divide-y">
      {list.map((record) => (
        <div
          key={String(record.id)}
          className="flex flex-row items-center pl-2 pr-4 py-2 hover:bg-muted/80 transition-colors first:rounded-t-xl last:rounded-b-xl"
        >
          <button
            type="button"
            className="px-3 py-3 flex items-center cursor-pointer rounded-md hover:bg-muted/60"
            onClick={(e) => handleToggleItem(record.id, e)}
          >
            <Checkbox
              className="cursor-pointer pointer-events-none"
              checked={(selectedIds ?? []).includes(record.id)}
            />
          </button>
          <Link
            to={`/customers/${record.id}/show`}
            className="flex flex-1 min-w-0 flex-row gap-4 items-center"
          >
            <Avatar className="size-10 shrink-0">
              <AvatarFallback
                className="text-sm font-medium text-white"
                style={{ backgroundColor: avatarHue(record.id) }}
              >
                {customerInitials(record)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {[record.first_name, record.last_name]
                  .filter(Boolean)
                  .join(" ") ||
                  record.username ||
                  record.email ||
                  `User #${record.id}`}
              </div>
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1 gap-y-1">
                <span className="truncate">
                  {record.email ? String(record.email) : "—"}
                  {record.country ? ` · ${String(record.country)}` : ""}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {record.is_verified ? (
                  <Badge variant="secondary" className="text-xs font-normal">
                    verified
                  </Badge>
                ) : null}
                {record.is_paid ? (
                  <Badge variant="secondary" className="text-xs font-normal">
                    paid
                  </Badge>
                ) : null}
                {record.has_completed_health_assessment ? (
                  <Badge variant="secondary" className="text-xs font-normal">
                    health
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="text-right ml-2 shrink-0 flex flex-col items-end gap-1">
              {record.created_at ? (
                <div className="text-sm text-muted-foreground max-w-[11rem] sm:max-w-none">
                  Joined <RelativeJoined date={String(record.created_at)} />
                </div>
              ) : null}
              <CustomerStatusDot record={record} />
            </div>
          </Link>
        </div>
      ))}
      {list.length === 0 && (
        <div className="p-6 text-sm text-muted-foreground">
          No customers match these filters.
        </div>
      )}
    </div>
  );
}

function RelativeJoined({ date }: { date: string }) {
  const [locale = "en"] = useLocaleState();
  return <>{formatRelativeDate(date, locale)}</>;
}

const CustomerListActions = () => (
  <TopToolbar>
    <SortButton fields={["created_at", "email", "username", "first_name"]} />
    <ExportButton exporter={exporter} />
  </TopToolbar>
);

function CustomerListLayout() {
  const { data, isPending, filterValues } = useListContext<RaRecord>();
  const hasFilters =
    filterValues != null && Object.keys(filterValues).length > 0;

  if (isPending) {
    return (
      <div className="flex flex-row gap-8">
        <div className="w-52 min-w-52 hidden md:block" />
        <Skeleton className="h-96 flex-1 rounded-xl" />
      </div>
    );
  }

  if (!data?.length && !hasFilters) {
    return (
      <p className="text-muted-foreground">
        No customers yet, or the list could not be loaded.
      </p>
    );
  }

  return (
    <div className="flex flex-row gap-6 lg:gap-8">
      <CustomerListFilters />
      <div className="w-full min-w-0 flex flex-col gap-4">
        <Card className="py-0 overflow-hidden shadow-sm">
          <CustomerListRows />
        </Card>
      </div>
      <BulkActionsToolbar>
        <SelectAllButton />
        <BulkExportButton />
      </BulkActionsToolbar>
    </div>
  );
}

export function CustomerList() {
  return (
    <List
      title={false}
      actions={<CustomerListActions />}
      pagination={pagination}
      perPage={25}
      sort={{ field: "created_at", order: "DESC" }}
      exporter={exporter}
    >
      <CustomerListLayout />
    </List>
  );
}
