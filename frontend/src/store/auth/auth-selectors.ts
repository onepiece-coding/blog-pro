import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectAuthState = (state: RootState) => state.auth;

export const selectRegisterStatus = createSelector(
  [selectAuthState],
  (auth) => auth.operations.register,
);

export const selectRegisterError = createSelector(
  [selectAuthState],
  (auth) => auth.errors.register,
);

export const selectLoginStatus = createSelector(
  [selectAuthState],
  (auth) => auth.operations.login,
);

export const selectLoginError = createSelector(
  [selectAuthState],
  (auth) => auth.errors.login,
);

export const selectEmailVerificationStatus = createSelector(
  [selectAuthState],
  (auth) => auth.operations.emailVerification,
);

export const selectEmailVerificationError = createSelector(
  [selectAuthState],
  (auth) => auth.errors.emailVerification,
);

export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user,
);

export const selectIsAuthenticated = createSelector(
  [selectCurrentUser],
  (user) => user !== null,
);

export const selectIsAdmin = createSelector(
  [selectCurrentUser],
  (user) => user?.isAdmin,
);
