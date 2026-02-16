import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IComment } from "@/lib/types";

import api from "@/services/api-service";

const getPostComments = createAsyncThunk(
  "posts/getPostComments",
  async (postId: string, thunk) => {
    const { signal, fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.get<IComment[]>(`/posts/${postId}/comments`, {
        signal,
      });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Post Comments:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getPostComments;
