/**
 * @file src/store/password/actions/get-reset-password-link.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type TAuthInfo = {
  userId: string;
  token: string;
};

const getResetPasswordLink = createAsyncThunk(
  "auth/getResetPasswordLink",
  async (authInfo: TAuthInfo, thunk) => {
    const { rejectWithValue, signal } = thunk;
    try {
      await api.get(
        `/password/reset-password/${authInfo.userId}/${authInfo.token}`,
        { signal },
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Reset Password Link:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getResetPasswordLink;
