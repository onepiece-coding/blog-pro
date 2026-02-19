/**
 * @file src/store/users/actions/get-user-profile.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { IUser } from "@/lib/types";

import api from "@/services/api-service";

const getUserProfile = createAsyncThunk(
  "users/getUserProfile",
  async (userId: string, thunk) => {
    const { fulfillWithValue, rejectWithValue, signal } = thunk;
    try {
      const response = await api.get<IUser>(`/users/profile/${userId}`, {
        signal,
      });

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get User Profile:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getUserProfile;
