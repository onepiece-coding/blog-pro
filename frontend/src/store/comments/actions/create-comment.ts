/**
 * @file src/store/comments/actions/create-comment.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IComment } from "@/lib/types";

import api from "@/services/api-service";

const createComment = createAsyncThunk(
  "comments/createComment",
  async ({ postId, text }: { postId: string; text: string }, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.post<IComment>("/comments", { postId, text });
      console.log(response.data);

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Create Comment:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default createComment;
