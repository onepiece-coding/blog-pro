import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectCommentsState = (state: RootState) => state.comments;

export const selectCreateOrUpdateCommentStatus = createSelector(
  [selectCommentsState],
  (comments) => comments.operations.createOrUpdateComment,
);

export const selectCreateOrUpdateCommentError = createSelector(
  [selectCommentsState],
  (comments) => comments.errors.createOrUpdateComment,
);

export const selectDeleteCommentError = createSelector(
  [selectCommentsState],
  (comments) => comments.errors.deleteComment,
);

export const selectGetAllCommentsStatus = createSelector(
  [selectCommentsState],
  (comments) => comments.operations.getAllComments,
);

export const selectGetAllCommentsError = createSelector(
  [selectCommentsState],
  (comments) => comments.errors.getAllComments,
);

export const selectGetAllCommentsTotalPages = createSelector(
  [selectCommentsState],
  (comments) => comments.totalPages,
);

export const selectGetAllCommentsRecords = createSelector(
  [selectCommentsState],
  (comments) => comments.records,
);
