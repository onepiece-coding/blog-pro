import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IComment } from "@/lib/types";

import api from "@/services/api-service";

type TQuerySchema = {
  pageNumber: number;
};

type TResponse = {
  comments: IComment[];
  totalPages: number;
};

const getAllComments = createAsyncThunk(
  "comments/getAllComments",
  async (querySchema: TQuerySchema, thunk) => {
    const { signal, fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.get<TResponse>("/comments", {
        params: querySchema,
        signal,
      });

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get all comments:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getAllComments;
