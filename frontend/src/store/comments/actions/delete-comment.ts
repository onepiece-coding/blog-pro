import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId: string, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.delete("/comments/" + commentId);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete Comment:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default deleteComment;
