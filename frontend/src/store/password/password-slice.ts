/**
 * @file src/store/password/password-slice.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { handlePending, handleRejected } from "@/lib/utils";
import { type TStatus } from "@/lib/types";

import sendResetPasswordLink from "./actions/send-reset-password-link";
import getResetPasswordLink from "./actions/get-reset-password-link";
import resetPassword from "./actions/reset-password";

interface IPasswordState {
  operations: {
    sendResetPasswordLink: TStatus;
    getResetPasswordLink: TStatus;
    resetPassword: TStatus;
  };

  errors: {
    sendResetPasswordLink: string | null;
    getResetPasswordLink: string | null;
    resetPassword: string | null;
  };
}

const initialState: IPasswordState = {
  operations: {
    sendResetPasswordLink: "idle",
    getResetPasswordLink: "idle",
    resetPassword: "idle",
  },
  errors: {
    sendResetPasswordLink: null,
    getResetPasswordLink: null,
    resetPassword: null,
  },
};

const passwordSlice = createSlice({
  name: "password",
  initialState,
  reducers: {
    clearPasswordError: (
      state,
      action: PayloadAction<keyof IPasswordState["errors"]>,
    ) => {
      state.errors[action.payload] = null;
    },
  },
  extraReducers: (builder) => {
    // Send Reset Password Link
    builder.addCase(sendResetPasswordLink.pending, (state) => {
      handlePending(state, "sendResetPasswordLink");
    });
    builder.addCase(sendResetPasswordLink.fulfilled, (state) => {
      state.operations.sendResetPasswordLink = "succeeded";
    });
    builder.addCase(sendResetPasswordLink.rejected, (state, action) => {
      handleRejected(state, "sendResetPasswordLink", action);
    });

    // Get Reset Password Link
    builder.addCase(getResetPasswordLink.pending, (state) => {
      handlePending(state, "getResetPasswordLink");
    });
    builder.addCase(getResetPasswordLink.fulfilled, (state) => {
      state.operations.getResetPasswordLink = "succeeded";
    });
    builder.addCase(getResetPasswordLink.rejected, (state, action) => {
      handleRejected(state, "getResetPasswordLink", action);
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      handlePending(state, "resetPassword");
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.operations.resetPassword = "succeeded";
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      handleRejected(state, "resetPassword", action);
    });
  },
});

export const { clearPasswordError } = passwordSlice.actions;

export { sendResetPasswordLink, getResetPasswordLink, resetPassword };

export default passwordSlice.reducer;
