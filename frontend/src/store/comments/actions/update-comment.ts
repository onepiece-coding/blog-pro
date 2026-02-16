import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IComment } from "@/lib/types";

import api from "@/services/api-service";

const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, text }: { commentId: string; text: string }, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.patch<IComment>("/comments/" + commentId, {
        text,
      });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Comment:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updateComment;
