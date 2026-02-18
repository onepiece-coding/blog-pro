/**
 * @file src/store/password/password-selectors.ts
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectPasswordState = (state: RootState) => state.password;

export const selectSendResetPasswordLinkStatus = createSelector(
  [selectPasswordState],
  (auth) => auth.operations.sendResetPasswordLink,
);

export const selectSendResetPasswordLinkError = createSelector(
  [selectPasswordState],
  (auth) => auth.errors.sendResetPasswordLink,
);

export const selectGetResetPasswordLinkStatus = createSelector(
  [selectPasswordState],
  (auth) => auth.operations.getResetPasswordLink,
);

export const selectGetResetPasswordLinkError = createSelector(
  [selectPasswordState],
  (auth) => auth.errors.getResetPasswordLink,
);

export const selectResetPasswordStatus = createSelector(
  [selectPasswordState],
  (auth) => auth.operations.resetPassword,
);

export const selectResetPasswordError = createSelector(
  [selectPasswordState],
  (auth) => auth.errors.resetPassword,
);
