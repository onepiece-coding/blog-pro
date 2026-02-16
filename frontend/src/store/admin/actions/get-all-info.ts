import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IInfo } from "@/lib/types";

import api from "@/services/api-service";

const getAllInfo = createAsyncThunk("admin/getAllInfo", async (_, thunk) => {
  const { fulfillWithValue, rejectWithValue, signal } = thunk;
  try {
    const response = await api.get<IInfo>(`/admin/info`, {
      signal,
    });

    return fulfillWithValue(response.data);
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Get All Info:", error);
    }
    return rejectWithValue(axiosErrorHandler(error));
  }
});

export default getAllInfo;
