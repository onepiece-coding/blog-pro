import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { ICategory } from "@/lib/types";

import api from "@/services/api-service";

type TQuerySchema = {
  pageNumber?: number;
  search?: string;
};

type TResponse = {
  categories: ICategory[];
  totalPages: number;
};

const getAllCategories = createAsyncThunk(
  "categories/getAllCategories",
  async (querySchema: TQuerySchema, thunk) => {
    const { signal, fulfillWithValue, rejectWithValue } = thunk;

    try {
      const response = await api.get<TResponse>(`/categories`, {
        params: {
          pageNumber: querySchema.pageNumber || 1,
          search: querySchema.search || "",
        },
        signal,
      });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get All Categories:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getAllCategories;
