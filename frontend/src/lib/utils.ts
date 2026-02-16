import type { PayloadAction } from "@reduxjs/toolkit";
import type { TStatus } from "./types";
import { isAxiosError } from "axios";

function axiosErrorHandler(error: unknown) {
  if (isAxiosError(error)) {
    return (
      // error.response?.data ||
      error.response?.data.message || error.message
    );
  }
  return "An unexpected error!";
}

function formatTimeAgo(dateInput: Date | number | string): string {
  const date = new Date(dateInput);

  // 1. Validation: Prevent "Invalid Date" (NaN) from causing RangeError
  if (isNaN(date.getTime())) {
    return "invalid date";
  }

  const now = new Date();
  // 2. Calculation: format() needs the raw number (diff), not the Date
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  // Handle "just now" for very small differences
  if (Math.abs(diffInSeconds) < 60) return "just now";

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds) {
      // 3. Finite Check: Ensure result of division is a valid number
      const value = Math.floor(diffInSeconds / seconds);
      return rtf.format(value, unit);
    }
  }

  return "just now";
}

/**
 * Define a base shape that any state using these helpers must follow.
 * This ensures the state has 'operations' and 'errors' objects.
 */
interface IBaseState {
  operations: Record<string, string | null | TStatus>;
  errors: Record<string, string | null>;
}

/**
 * TState: The full state object (inferred from the slice)
 * K: The specific key being updated (must exist in operations/errors)
 */
const handlePending = <
  TState extends IBaseState,
  K extends keyof TState["operations"] & keyof TState["errors"],
>(
  state: TState,
  key: K,
): void => {
  state.operations[key as string] = "pending";
  state.errors[key as string] = null;
};

const handleRejected = <
  TState extends IBaseState,
  K extends keyof TState["operations"] & keyof TState["errors"],
>(
  state: TState,
  key: K,
  action: PayloadAction<unknown>,
): void => {
  state.operations[key as string] = "failed";

  if (typeof action.payload === "string") {
    state.errors[key as string] = action.payload;
  }
};

export { axiosErrorHandler, formatTimeAgo, handlePending, handleRejected };
