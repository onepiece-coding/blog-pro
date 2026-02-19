/**
 * @file src/store/categories/categories-selecotrs.ts
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectCategoriesState = (state: RootState) => state.categories;

export const selectGetAllCategoriesStatus = createSelector(
  [selectCategoriesState],
  (categories) => categories.operations.getAllCategories,
);

export const selectGetAllCategoriesError = createSelector(
  [selectCategoriesState],
  (categories) => categories.errors.getAllCategories,
);

export const selectGetAllCategoriesRecords = createSelector(
  [selectCategoriesState],
  (categories) => categories.records,
);

export const selectGetAllCategoriesTotalPages = createSelector(
  [selectCategoriesState],
  (categories) => categories.totalPages,
);

export const selectCreateCategoryStatus = createSelector(
  [selectCategoriesState],
  (categories) => categories.operations.createCategory,
);

export const selectCreateCategoryError = createSelector(
  [selectCategoriesState],
  (categories) => categories.errors.createCategory,
);

export const selectDeleteCategoryStatus = createSelector(
  [selectCategoriesState],
  (categories) => categories.operations.deleteCategory,
);

export const selectDeleteCategoryError = createSelector(
  [selectCategoriesState],
  (categories) => categories.errors.deleteCategory,
);
