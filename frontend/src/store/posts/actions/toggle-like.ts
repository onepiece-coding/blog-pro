import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IPost } from "@/lib/types";

import api from "@/services/api-service";

const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId: string, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.patch<IPost>("/posts/like/" + postId);
      return fulfillWithValue(response.data.likes);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Toggle Like:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default toggleLike;
