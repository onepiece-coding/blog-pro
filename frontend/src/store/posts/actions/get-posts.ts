/**
 * @file src/store/posts/actions/get-posts.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IPost } from "@/lib/types";

import api from "@/services/api-service";

type TQuerySchema = {
  pageNumber: number;
  text: string;
  category: string;
};

type TResponse = {
  posts: IPost[];
  totalPages: number;
};

const getPosts = createAsyncThunk(
  "posts/getPosts",
  async (querySchema: TQuerySchema, thunk) => {
    const { signal, fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.get<TResponse>("/posts", {
        params: querySchema,
        signal,
      });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Posts:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getPosts;
