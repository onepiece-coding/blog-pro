import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IPost } from "@/lib/types";

import api from "@/services/api-service";

const getSinglePost = createAsyncThunk(
  "posts/getSinglePost",
  async (postId: string, thunk) => {
    const { signal, fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.get<IPost>("/posts/" + postId, { signal });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Single Post:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getSinglePost;
