import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IUser } from "@/lib/types";

import api from "@/services/api-service";

type TBody = Partial<Record<string, string>>;

const updateUserProfile = createAsyncThunk(
  "users/updateUserProfile",
  async ({ userId, body }: { userId: string; body: TBody }, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;

    try {
      const response = await api.patch<IUser>(`/users/profile/${userId}`, body);
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update User Profile:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updateUserProfile;
