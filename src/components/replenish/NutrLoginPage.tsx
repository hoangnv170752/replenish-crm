import { useState } from "react";
import { Form, required, useLogin, useNotify } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";
import { Notification } from "@/components/admin/notification";
import { useConfigurationContext } from "@/components/atomic-crm/root/ConfigurationContext";

import type { NutrLoginParams } from "@/components/atomic-crm/providers/nutr-api/authProvider";
import { getNutrApiBaseUrl } from "@/components/atomic-crm/providers/nutr-api/storage";

export const NutrLoginPage = (props: { redirectTo?: string }) => {
  const { title } = useConfigurationContext();
  const { redirectTo } = props;
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const defaultBase = getNutrApiBaseUrl();

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true);
    const baseTrim =
      values.apiBaseUrl != null ? String(values.apiBaseUrl).trim() : "";
    const payload: NutrLoginParams = {
      adminApiKey: String(values.adminApiKey ?? ""),
      apiBaseUrl: baseTrim || undefined,
    };
    login(payload, redirectTo)
      .then(() => setLoading(false))
      .catch((error: Error | string | undefined) => {
        setLoading(false);
        const message =
          typeof error === "string"
            ? error
            : error && typeof error.message === "string"
              ? error.message
              : "Sign in failed";
        notify(message, { type: "error" });
      });
  };

  return (
    <div className="min-h-screen flex">
      <div className="relative grid w-full lg:grid-cols-2">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            {title}
          </div>
          <p className="relative z-20 mt-4 text-sm text-zinc-300 max-w-sm">
            Sign in with your FastAPI admin key (
            <code className="text-xs">X-Admin-API-Key</code>). API reference:{" "}
            <a
              href="https://nutr-api.onrender.com/docs"
              className="underline text-white"
              target="_blank"
              rel="noreferrer"
            >
              nutr-api.onrender.com/docs
            </a>
          </p>
        </div>
        <div className="flex flex-col justify-center w-full p-4 lg:p-8">
          <div className="w-full space-y-6 lg:mx-auto lg:w-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            </div>
            <Form className="space-y-6" onSubmit={handleSubmit}>
              <TextInput
                label="API base URL"
                source="apiBaseUrl"
                type="url"
                defaultValue={defaultBase || ""}
                helperText="Leave as default when VITE_NUTR_API_URL is set"
              />
              <TextInput
                label="Admin API key"
                source="adminApiKey"
                type="password"
                validate={required()}
              />
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
              >
                Sign in
              </Button>
            </Form>
          </div>
        </div>
      </div>
      <Notification />
    </div>
  );
};
