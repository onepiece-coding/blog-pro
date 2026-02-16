import type { TRegisterSchema } from "@/validations";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type TFormData = Omit<TRegisterSchema, "confirmPassword">;

const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData: TFormData, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.post("/auth/register", formData);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Register User:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default registerUser;
