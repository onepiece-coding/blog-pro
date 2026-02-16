import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isString, type ICategory, type TStatus } from "@/lib/types";

import getAllCategories from "./actions/get-all-categories";
import createCategory from "./actions/create-category";
import deleteCategory from "./actions/delete-category";
import { handlePending, handleRejected } from "@/lib/utils";

interface ICategoriesState {
  operations: {
    getAllCategories: TStatus;
    createCategory: TStatus;
    deleteCategory: string | null;
  };

  errors: {
    getAllCategories: null | string;
    createCategory: null | string;
    deleteCategory: null | string;
  };

  totalPages: number;
  records: ICategory[];
}

const initialState: ICategoriesState = {
  operations: {
    getAllCategories: "idle",
    createCategory: "idle",
    deleteCategory: null,
  },
  errors: {
    getAllCategories: null,
    createCategory: null,
    deleteCategory: null,
  },
  totalPages: 0,
  records: [],
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoriesError: (
      state,
      action: PayloadAction<keyof ICategoriesState["errors"]>,
    ) => {
      state.errors[action.payload] = null;
    },
    categoriesCleanUp: (state) => {
      state.totalPages = 0;
      state.records = [];
    },
  },
  extraReducers: (builder) => {
    // Get All Categories
    builder.addCase(getAllCategories.pending, (state) => {
      handlePending(state, "getAllCategories");
    });
    builder.addCase(getAllCategories.fulfilled, (state, action) => {
      const { categories, totalPages } = action.payload;
      const { pageNumber } = action.meta.arg; // Get pageNumber from the thunk argument

      if (pageNumber === 1) {
        // If it's a new search or the first page, replace the records
        state.records = categories;
      } else {
        // If it's a "load more" action, append unique records only
        const existingIds = new Set(state.records.map((r) => r._id));
        const uniqueNewCategories = categories.filter(
          (c) => !existingIds.has(c._id),
        );

        state.records = [...state.records, ...uniqueNewCategories];
      }

      state.operations.getAllCategories = "succeeded";
      state.totalPages = totalPages;
    });
    builder.addCase(getAllCategories.rejected, (state, action) => {
      handleRejected(state, "getAllCategories", action);
    });

    // Create Category
    builder.addCase(createCategory.pending, (state) => {
      handlePending(state, "createCategory");
    });
    builder.addCase(createCategory.fulfilled, (state) => {
      state.operations.createCategory = "succeeded";
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      handleRejected(state, "createCategory", action);
    });

    // Delete Category
    builder.addCase(deleteCategory.pending, (state, action) => {
      state.operations.deleteCategory = action.meta.arg;
      state.errors["deleteCategory"] = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.operations.deleteCategory = null;
      state.records = state.records.filter(
        (record) => record._id !== action.meta.arg,
      );
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.operations.deleteCategory = null;
      if (isString(action.payload)) {
        state.errors["deleteCategory"] = action.payload;
      }
    });
  },
});

export const { clearCategoriesError, categoriesCleanUp } =
  categoriesSlice.actions;

export { getAllCategories, createCategory, deleteCategory };

export default categoriesSlice.reducer;
