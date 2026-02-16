import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId: string, thunk) => {
    const { rejectWithValue } = thunk;

    try {
      await api.delete(`/posts/${postId}`);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete Post:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default deletePost;
