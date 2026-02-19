/**
 * @file src/components/forms/custom-select/index.tsx
 */

import { CloseButton, Form, Spinner } from "react-bootstrap";
import { useRef, useState, type UIEvent } from "react";
import type { TStatus } from "@/lib/types";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import styles from "./styles.module.css";

const { selectContainer, inputWrapper, loader, clearBtn, optionsMenu } = styles;

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues | undefined = undefined,
> {
  control: Control<TFieldValues, unknown, TTransformedValues>;
  handleSearchTermChange: (newText: string) => void;
  handlePageChange: (newPage: number) => void;
  options: SelectOption[];
  placeholder?: string;
  error: null | string;
  pageNumber: number;
  totalPages: number;
  className?: string;
  searchTerm: string;
  srOnly?: boolean;
  status: TStatus;
  formId: string;
  label: string;
  name: TName;
}

const CustomSelect = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  handleSearchTermChange,
  className = "mb-3",
  handlePageChange,
  srOnly = false,
  placeholder,
  pageNumber,
  totalPages,
  searchTerm,
  options,
  control,
  status,
  formId,
  label,
  error,
  name,
}: CustomSelectProps<TFieldValues, TName, TTransformedValues>) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const inputId = `${formId}__${name}`;
  const errorId = `${inputId}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onBlur, onChange, ref }, fieldState }) => {
        const selected = options.find((o) => o.value === value);

        const handleClear = () => {
          handleSearchTermChange(""); // Clear local search state
          onChange(""); // Clear Hook Form state
        };

        const hasMorePages = pageNumber < totalPages;

        const handleScroll = (e: UIEvent<HTMLDivElement>) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

          // Check if we are near the bottom (within 5px) and not already loading
          const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5;

          if (isAtBottom && hasMorePages && status !== "pending") {
            handlePageChange(pageNumber + 1);
          }
        };

        return (
          <Form.Group className={className}>
            <Form.Label
              htmlFor={inputId}
              className={srOnly ? "visually-hidden" : ""}
            >
              {label}
            </Form.Label>
            <div className={selectContainer} tabIndex={0}>
              <div className={inputWrapper}>
                <Form.Control
                  // Show selected label if closed, show query if typing
                  value={isOpen ? searchTerm : selected ? selected.label : ""}
                  onChange={(e) => {
                    handlePageChange(1); // Reset to page 1 on new search
                    handleSearchTermChange(e.target.value);
                  }}
                  isInvalid={status === "failed" || fieldState.invalid}
                  placeholder={placeholder ?? label}
                  onFocus={() => setIsOpen(true)}
                  autoComplete="off"
                  onBlur={() => {
                    setTimeout(() => setIsOpen(false), 200);
                    onBlur();
                  }}
                  id={inputId}
                  type="text"
                  ref={(e) => {
                    ref(e); // Give ref to React Hook Form
                    inputRef.current = e; // Keep a local copy
                  }}
                />
                {status === "pending" ? (
                  <Spinner size="sm" className={loader} />
                ) : value ? (
                  <CloseButton
                    aria-label="Clear selection"
                    onClick={handleClear}
                    className={clearBtn}
                  />
                ) : null}
              </div>
              {isOpen && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  className={optionsMenu}
                  onScroll={handleScroll}
                >
                  <ul className="m-0 p-0" style={{ listStyle: "none" }}>
                    {options.map((opt) => (
                      <li
                        key={opt.value}
                        onMouseDown={() => {
                          onChange(opt.value);
                          inputRef.current?.blur();
                        }}
                      >
                        {opt.label}
                      </li>
                    ))}

                    {status === "pending" && (
                      <li className="text-center" aria-live="polite">
                        <Spinner animation="border" size="sm" />
                      </li>
                    )}

                    {status === "failed" && (
                      <li
                        className="text-center text-danger small"
                        aria-live="polite"
                      >
                        {error}
                      </li>
                    )}

                    {!hasMorePages &&
                      options.length > 0 &&
                      status !== "pending" && (
                        <li
                          className="text-center text-muted small"
                          aria-live="polite"
                        >
                          No more options
                        </li>
                      )}

                    {searchTerm &&
                      options.length <= 0 &&
                      status !== "pending" && (
                        <li
                          className="text-center text-muted small"
                          aria-live="polite"
                        >
                          No options match your search.
                        </li>
                      )}
                  </ul>
                </div>
              )}
            </div>
            {fieldState.invalid && (
              <Form.Control.Feedback
                className="d-block"
                type="invalid"
                id={errorId}
                role="alert"
              >
                {fieldState.error?.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );
      }}
    />
  );
};

export default CustomSelect;
