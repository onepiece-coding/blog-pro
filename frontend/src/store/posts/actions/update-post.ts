/**
 * @file src/store/posts/actions/update-post.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IPost } from "@/lib/types";

import api from "@/services/api-service";

type TBody = Partial<Record<string, string>>;

const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, body }: { postId: string; body: TBody }, thunk) => {
    console.log(postId, body);

    const { fulfillWithValue, rejectWithValue } = thunk;

    try {
      const response = await api.patch<IPost>(`/posts/${postId}`, body);
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Post:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updatePost;
