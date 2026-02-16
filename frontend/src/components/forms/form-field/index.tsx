/**
 * @file src/components/forms/form-field/index.tsx
 */

import type { ComponentPropsWithoutRef } from "react";
import { Form } from "react-bootstrap";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues | undefined = undefined,
> {
  type?: ComponentPropsWithoutRef<"input">["type"];
  control: Control<TFieldValues, unknown, TTransformedValues>;
  name: TName;
  as?: "input" | "textarea";
  ariaDescribedBy?: string;
  placeholder?: string;
  className?: string;
  srOnly?: boolean;
  formId: string;
  label: string;
}

const FormField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  className = "mb-3",
  ariaDescribedBy,
  srOnly = false,
  type = "text",
  as = "input",
  placeholder,
  control,
  formId,
  label,
  name,
}: FormFieldProps<TFieldValues, TName, TTransformedValues>) => {
  const inputId = `${formId}__${name}`;
  const errorId = `${inputId}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, ...field }, fieldState }) => (
        <Form.Group className={className}>
          <Form.Label
            htmlFor={inputId}
            className={srOnly ? "visually-hidden" : ""}
          >
            {label}
          </Form.Label>
          <Form.Control
            as={as}
            placeholder={placeholder ?? label}
            aria-invalid={fieldState.invalid}
            isInvalid={fieldState.invalid}
            aria-describedby={
              fieldState.invalid
                ? `${errorId} ${ariaDescribedBy ?? ""}`.trim()
                : ariaDescribedBy
            }
            id={inputId}
            type={type}
            {...field}
            // Special handling for files
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (type === "file") {
                const file = e.target.files?.[0];
                onChange(file); // Pass the File object to RHF
              } else {
                onChange(e); // Standard behavior
              }
            }}
            // File inputs cannot have a 'value' prop for security
            value={type === "file" ? undefined : value}
          />
          {fieldState.invalid && (
            <Form.Control.Feedback
              type="invalid"
              id={errorId}
              role="alert" // Screen readers announce errors immediately
            >
              {fieldState.error?.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      )}
    />
  );
};

export default FormField;
