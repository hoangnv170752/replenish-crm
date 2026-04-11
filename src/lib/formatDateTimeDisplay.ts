import { format, isValid } from "date-fns";

/** Fixed CRM display: `yyyy/MM/dd HH:mm:ss` (24-hour). */
export const DATETIME_DISPLAY_PATTERN = "yyyy/MM/dd HH:mm:ss";

export function formatDateTimeDisplay(value: unknown): string {
  if (value == null || value === "") return "";
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : undefined;
  if (!date || !isValid(date)) return "";
  return format(date, DATETIME_DISPLAY_PATTERN);
}
