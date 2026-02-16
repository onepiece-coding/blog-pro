/**
 * @file src/store/toasts/toasts-selectors.ts
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectToastsState = (state: RootState) => state.toasts;

export const selectToasts = createSelector(
  [selectToastsState],
  (toasts) => toasts.records,
);
