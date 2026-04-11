import type { HTMLAttributes } from "react";
import { genericMemo, useFieldValue, useTranslate } from "ra-core";

import type { FieldProps } from "@/lib/field.type";
import { isValid } from "date-fns";

import { formatDateTimeDisplay } from "@/lib/formatDateTimeDisplay";

const DateFieldImpl = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
>(
  inProps: DateFieldProps<RecordType>,
) => {
  const {
    empty,
    transform = defaultTransform,
    source,
    record,
    defaultValue,
    ...rest
  } = inProps;
  const translate = useTranslate();

  const value = useFieldValue({ source, record, defaultValue });
  if (value == null || value === "") {
    if (!empty) {
      return null;
    }

    return (
      <span {...rest}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const date = transform(value);
  const dateString = date && isValid(date) ? formatDateTimeDisplay(date) : "";

  return <span {...rest}>{dateString}</span>;
};
DateFieldImpl.displayName = "DateFieldImpl";

/**
 * Displays a date/time as `yyyy/MM/dd HH:mm:ss` (24-hour, local timezone).
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datefield/ DateField documentation}
 */
export const DateField = genericMemo(DateFieldImpl);

export interface DateFieldProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {
  /** Ignored; format is fixed yyyy/MM/dd HH:mm:ss */
  locales?: Intl.LocalesArgument;
  /** Ignored; format is fixed yyyy/MM/dd HH:mm:ss */
  options?: Intl.DateTimeFormatOptions;
  /** Ignored; format is fixed yyyy/MM/dd HH:mm:ss */
  showTime?: boolean;
  /** Ignored; format is fixed yyyy/MM/dd HH:mm:ss */
  showDate?: boolean;
  transform?: (value: unknown) => Date;
}

const defaultTransform = (value: unknown) =>
  value instanceof Date
    ? value
    : typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : undefined;
