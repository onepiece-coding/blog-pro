/**
 * @file src/store/users/actions/delete-user-profile.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const deleteUserProfile = createAsyncThunk(
  "users/deleteUserProfile",
  async (userId: string, thunk) => {
    const { rejectWithValue } = thunk;

    try {
      await api.delete(`/users/profile/${userId}`);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete User Profile:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default deleteUserProfile;
