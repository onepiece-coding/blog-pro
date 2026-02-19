/**
 * @file src/store/password/actions/send-reset-password-link.ts
 */

import type { TSendResetPasswordLinkSchema } from "@/validations";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type TFormData = TSendResetPasswordLinkSchema;

const sendResetPasswordLink = createAsyncThunk(
  "auth/sendResetPasswordLink",
  async (formData: TFormData, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.post("/password/reset-password-link", formData);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Forgot Password:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default sendResetPasswordLink;
