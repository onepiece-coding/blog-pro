/**
 * @file src/store/categories/actions/create-category.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (title: string, thunk) => {
    const { rejectWithValue } = thunk;

    try {
      await api.post(`/categories`, {
        title,
      });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Create Category:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default createCategory;
