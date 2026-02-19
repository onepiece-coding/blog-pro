/**
 * @file src/store/posts/actions/create-post.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type TFormData = FormData;

const createPost = createAsyncThunk(
  "posts/createPost",
  async (formData: TFormData, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.post("/posts", formData);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Create Post:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default createPost;
