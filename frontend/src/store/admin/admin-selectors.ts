import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectAdminState = (state: RootState) => state.admin;

export const selectGetAllInfoStatus = createSelector(
  [selectAdminState],
  (users) => users.operations.getAllInfo,
);

export const selectGetAllInfoError = createSelector(
  [selectAdminState],
  (users) => users.errors.getAllInfo,
);

export const selectGetAllInfoRecord = createSelector(
  [selectAdminState],
  (users) => users.allInfo,
);
