import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IUser } from "@/lib/types";

import api from "@/services/api-service";

type TQuerySchema = {
  pageNumber: number;
  username: string;
};

type TResponse = {
  users: IUser[];
  totalPages: number;
};

const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (querySchema: TQuerySchema, thunk) => {
    const { fulfillWithValue, rejectWithValue, signal } = thunk;
    try {
      const response = await api.get<TResponse>(`/users/profile`, {
        params: querySchema,
        signal,
      });

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get All Users:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getAllUsers;
