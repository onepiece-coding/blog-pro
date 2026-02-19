/**
 * @file src/store/categories/actions/delete-category.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId: string, thunk) => {
    const { rejectWithValue } = thunk;

    try {
      await api.delete(`/categories/${categoryId}`);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete Category:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default deleteCategory;
