import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IPost } from "@/lib/types";

import api from "@/services/api-service";

const updatePostImage = createAsyncThunk(
  "posts/updatePostImage",
  async (
    { formData, postId }: { formData: FormData; postId: string },
    thunk,
  ) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.patch<IPost>(
        `/posts/update-image/${postId}`,
        formData,
      );
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Post Image:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updatePostImage;
