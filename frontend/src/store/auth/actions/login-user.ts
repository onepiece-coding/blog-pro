/**
 * @file src/store/auth/actions/login-user.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import type { TLoginSchema } from "@/validations";
import { axiosErrorHandler } from "@/lib/utils";
import type { IUser } from "@/lib/types";

import api from "@/services/api-service";

type TFormData = TLoginSchema;

type TResponse = {
  token: string;
  user: IUser;
};

const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData: TFormData, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.post<TResponse>("/auth/login", formData);
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Login User:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default loginUser;
