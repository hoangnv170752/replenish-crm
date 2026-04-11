import { useQuery } from "@tanstack/react-query";
import type { RaRecord } from "ra-core";
import { useDataProvider, useRecordContext } from "ra-core";
import {
  DataTable,
  DateField,
  DeleteButton,
  Edit,
  List,
  ListPagination,
  NumberField,
  RecordField,
  SearchInput,
  SelectInput,
  Show,
  SimpleForm,
  TextInput,
} from "@/components/admin";
import { BooleanInput } from "@/components/admin/boolean-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { NutrCrmDataProvider } from "@/components/atomic-crm/providers/nutr-api";

const pagination = (
  <ListPagination rowsPerPageOptions={[10, 25, 50, 100, 200]} />
);

const yn = (v: unknown) => (v ? "Yes" : "No");

const customerRecordRepr = (r: RaRecord) =>
  String(r.email ?? r.username ?? `#${r.id}`);

function CustomerList() {
  return (
    <List
      filters={[<SearchInput source="q" alwaysOn key="q" />]}
      perPage={25}
      pagination={pagination}
      sort={{ field: "created_at", order: "DESC" }}
    >
      <DataTable rowClick="show">
        <DataTable.Col source="id" />
        <DataTable.Col source="email" />
        <DataTable.Col source="username" />
        <DataTable.Col source="first_name" />
        <DataTable.Col source="last_name" />
        <DataTable.Col source="is_active" />
        <DataTable.Col source="is_verified" />
        <DataTable.Col source="is_paid" />
        <DataTable.Col source="country" />
        <DataTable.Col source="created_at">
          <DateField source="created_at" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}

function CompanionStatsCard() {
  const record = useRecordContext();
  const dataProvider = useDataProvider<NutrCrmDataProvider>();
  const id = record?.id;
  const { data, isPending, error } = useQuery({
    queryKey: ["nutr-companion-stats", id],
    queryFn: () => dataProvider.getNutrCompanionStats(id!),
    enabled: id != null,
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">NutrAI Companion</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            Could not load companion stats.
          </p>
        ) : (
          <pre className="text-xs overflow-auto max-h-64 bg-muted p-3 rounded-md">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

function CustomerShow() {
  return (
    <Show>
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <RecordField source="id" field={NumberField} />
          <RecordField source="email" />
          <RecordField source="username" />
          <RecordField source="first_name" />
          <RecordField source="last_name" />
          <RecordField source="is_active" render={(r) => yn(r.is_active)} />
          <RecordField source="is_verified" render={(r) => yn(r.is_verified)} />
          <RecordField
            source="has_completed_health_assessment"
            render={(r) => yn(r.has_completed_health_assessment)}
          />
          <RecordField source="created_at" field={DateField} />
          <RecordField source="updated_at" field={DateField} />
        </div>
        <RecordField
          source="profile"
          render={(r) => (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto max-h-64 bg-muted p-3 rounded-md">
                  {JSON.stringify(r.profile ?? null, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        />
        <RecordField
          source="health_assessment"
          render={(r) => (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Health assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto max-h-64 bg-muted p-3 rounded-md">
                  {JSON.stringify(r.health_assessment ?? null, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        />
        <CompanionStatsCard />
      </div>
    </Show>
  );
}

function CustomerEdit() {
  return (
    <Edit>
      <SimpleForm>
        <BooleanInput source="is_active" />
        <BooleanInput source="is_verified" />
        <BooleanInput source="has_completed_health_assessment" />
      </SimpleForm>
    </Edit>
  );
}

function SupportSessionList() {
  return (
    <List
      filters={[<TextInput source="status" label="Status" key="st" />]}
      perPage={25}
      pagination={pagination}
      sort={{ field: "last_message_at", order: "DESC" }}
    >
      <DataTable rowClick="show">
        <DataTable.Col source="id" />
        <DataTable.Col source="user_email" />
        <DataTable.Col source="status" />
        <DataTable.Col source="priority" />
        <DataTable.Col source="assigned_to" />
        <DataTable.Col source="last_message_at">
          <DateField source="last_message_at" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}

function SupportMessages() {
  const record = useRecordContext();
  const messages = (record?.messages as RaRecord[]) ?? [];
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-lg">Messages</h3>
      <ul className="border rounded-md divide-y max-h-[28rem] overflow-auto">
        {messages.map((m, i) => (
          <li key={String(m.id ?? i)} className="p-3 text-sm">
            <span className="font-medium text-muted-foreground">
              {String(m.sender_type ?? "?")}
            </span>
            {m.sender_name ? (
              <span className="text-muted-foreground">
                {" "}
                ({String(m.sender_name)})
              </span>
            ) : null}
            <p className="mt-1 whitespace-pre-wrap">
              {String(m.message ?? "")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SupportSessionShow() {
  return (
    <Show>
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <RecordField source="id" field={NumberField} />
          <RecordField source="user_id" field={NumberField} />
          <RecordField source="user_email" />
          <RecordField source="status" />
          <RecordField source="subject" />
          <RecordField source="priority" />
          <RecordField source="assigned_to" />
          <RecordField source="started_at" field={DateField} />
          <RecordField source="closed_at" field={DateField} />
          <RecordField source="last_message_at" field={DateField} />
        </div>
        <SupportMessages />
      </div>
    </Show>
  );
}

function SupportSessionEdit() {
  return (
    <Edit>
      <SimpleForm>
        <SelectInput
          source="status"
          choices={[
            { id: "active", name: "active" },
            { id: "closed", name: "closed" },
            { id: "pending", name: "pending" },
          ]}
        />
        <TextInput source="priority" />
        <TextInput source="assigned_to" />
      </SimpleForm>
    </Edit>
  );
}

function SubscriptionList() {
  return (
    <List
      filters={[<TextInput source="status" label="Status" key="st" />]}
      perPage={25}
      pagination={pagination}
      sort={{ field: "created_at", order: "DESC" }}
    >
      <DataTable rowClick="show">
        <DataTable.Col source="id" />
        <DataTable.Col source="user_email" />
        <DataTable.Col source="plan_name" />
        <DataTable.Col source="status" />
        <DataTable.Col source="current_period_end">
          <DateField source="current_period_end" />
        </DataTable.Col>
        <DataTable.Col source="cancel_at_period_end" />
      </DataTable>
    </List>
  );
}

function SubscriptionShow() {
  return (
    <Show>
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <RecordField source="id" field={NumberField} />
        <RecordField source="user_id" field={NumberField} />
        <RecordField source="user_email" />
        <RecordField source="plan_name" />
        <RecordField source="status" />
        <RecordField source="stripe_customer_id" />
        <RecordField source="stripe_subscription_id" />
        <RecordField source="current_period_start" field={DateField} />
        <RecordField source="current_period_end" field={DateField} />
        <RecordField
          source="cancel_at_period_end"
          render={(r) => yn(r.cancel_at_period_end)}
        />
        <RecordField source="created_at" field={DateField} />
      </div>
    </Show>
  );
}

function PaymentList() {
  return (
    <List
      filters={[<TextInput source="status" label="Status" key="st" />]}
      perPage={25}
      pagination={pagination}
      sort={{ field: "created_at", order: "DESC" }}
    >
      <DataTable rowClick="show">
        <DataTable.Col source="id" />
        <DataTable.Col source="user_email" />
        <DataTable.Col source="amount" />
        <DataTable.Col source="currency" />
        <DataTable.Col source="status" />
        <DataTable.Col source="paid_at">
          <DateField source="paid_at" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}

function PaymentShow() {
  return (
    <Show>
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <RecordField source="id" field={NumberField} />
        <RecordField source="user_id" field={NumberField} />
        <RecordField source="user_email" />
        <RecordField source="subscription_id" field={NumberField} />
        <RecordField source="amount" field={NumberField} />
        <RecordField source="currency" />
        <RecordField source="status" />
        <RecordField source="stripe_invoice_id" />
        <RecordField source="paid_at" field={DateField} />
        <RecordField source="created_at" field={DateField} />
      </div>
    </Show>
  );
}

function PlanList() {
  return (
    <List perPage={50} pagination={pagination}>
      <DataTable rowClick="show">
        <DataTable.Col source="id" />
        <DataTable.Col source="name" />
        <DataTable.Col source="amount" />
        <DataTable.Col source="currency" />
        <DataTable.Col source="interval" />
        <DataTable.Col source="stripe_price_id" />
        <DataTable.Col source="is_active" />
      </DataTable>
    </List>
  );
}

function PlanShow() {
  return (
    <Show>
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <RecordField source="id" field={NumberField} />
        <RecordField source="name" />
        <RecordField source="amount" field={NumberField} />
        <RecordField source="currency" />
        <RecordField source="interval" />
        <RecordField source="stripe_price_id" />
        <RecordField source="is_active" render={(r) => yn(r.is_active)} />
      </div>
    </Show>
  );
}

function ScanList() {
  return (
    <List
      filters={[
        <TextInput source="barcode" key="bc" />,
        <TextInput source="user_id" label="User id" key="uid" />,
      ]}
      perPage={25}
      pagination={pagination}
      sort={{ field: "scanned_at", order: "DESC" }}
    >
      <DataTable rowClick="show">
        <DataTable.Col source="id" />
        <DataTable.Col source="user_email" />
        <DataTable.Col source="barcode" />
        <DataTable.Col source="product_name" />
        <DataTable.Col source="brand" />
        <DataTable.Col source="is_verified" />
        <DataTable.Col source="scan_type" />
        <DataTable.Col source="scanned_at">
          <DateField source="scanned_at" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}

function ScanShow() {
  return (
    <Show>
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <RecordField source="id" field={NumberField} />
        <RecordField source="user_id" field={NumberField} />
        <RecordField source="user_email" />
        <RecordField source="barcode" />
        <RecordField source="product_name" />
        <RecordField source="brand" />
        <RecordField source="is_verified" render={(r) => yn(r.is_verified)} />
        <RecordField source="scan_type" />
        <RecordField source="scanned_at" field={DateField} />
      </div>
    </Show>
  );
}

function ReviewList() {
  return (
    <List
      filters={[
        <TextInput source="barcode" key="bc" />,
        <TextInput source="user_id" label="User id" key="uid" />,
      ]}
      perPage={25}
      pagination={pagination}
      sort={{ field: "created_at", order: "DESC" }}
    >
      <DataTable rowClick="show">
        <DataTable.Col source="id" />
        <DataTable.Col source="barcode" />
        <DataTable.Col source="user_email" />
        <DataTable.Col source="rating" />
        <DataTable.Col source="title" />
        <DataTable.Col source="is_verified_purchase" />
        <DataTable.Col source="helpful_count" />
        <DataTable.Col source="created_at">
          <DateField source="created_at" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}

function ReviewShow() {
  return (
    <Show
      actions={
        <div className="flex gap-2">
          <DeleteButton />
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <RecordField source="id" field={NumberField} />
        <RecordField source="barcode" />
        <RecordField source="user_id" field={NumberField} />
        <RecordField source="user_email" />
        <RecordField source="rating" field={NumberField} />
        <RecordField source="title" />
        <RecordField
          source="is_verified_purchase"
          render={(r) => yn(r.is_verified_purchase)}
        />
        <RecordField source="helpful_count" field={NumberField} />
        <RecordField source="created_at" field={DateField} />
        <RecordField
          source="content"
          className="sm:col-span-2"
          render={(r) => (
            <p className="text-sm whitespace-pre-wrap">
              {String(r.content ?? "")}
            </p>
          )}
        />
      </div>
    </Show>
  );
}

export const customers = {
  list: CustomerList,
  show: CustomerShow,
  edit: CustomerEdit,
  recordRepresentation: customerRecordRepr,
};

export const support_sessions = {
  list: SupportSessionList,
  show: SupportSessionShow,
  edit: SupportSessionEdit,
  recordRepresentation: (r: RaRecord) =>
    String(r.subject ?? `Session #${r.id}`),
};

export const subscriptions = {
  list: SubscriptionList,
  show: SubscriptionShow,
  recordRepresentation: (r: RaRecord) =>
    String(r.plan_name ?? r.status ?? `#${r.id}`),
};

export const payments = {
  list: PaymentList,
  show: PaymentShow,
  recordRepresentation: (r: RaRecord) =>
    String(
      r.status ?? (r.amount != null ? `${r.amount} ${r.currency}` : `#${r.id}`),
    ),
};

export const subscription_plans = {
  list: PlanList,
  show: PlanShow,
  recordRepresentation: (r: RaRecord) => String(r.name ?? `#${r.id}`),
};

export const scans = {
  list: ScanList,
  show: ScanShow,
  recordRepresentation: (r: RaRecord) =>
    String(r.product_name ?? r.barcode ?? `#${r.id}`),
};

export const reviews = {
  list: ReviewList,
  show: ReviewShow,
  recordRepresentation: (r: RaRecord) => String(r.title ?? `Review #${r.id}`),
};
