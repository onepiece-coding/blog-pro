/**
 * @file src/store/posts/posts-selectors.ts
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectPostsState = (state: RootState) => state.posts;

export const selectCreatePostStatus = createSelector(
  [selectPostsState],
  (posts) => posts.operations.createPost,
);

export const selectCreatePostError = createSelector(
  [selectPostsState],
  (posts) => posts.errors.createPost,
);

export const selectGetPostsStatus = createSelector(
  [selectPostsState],
  (posts) => posts.operations.getPosts,
);

export const selectGetPostsError = createSelector(
  [selectPostsState],
  (posts) => posts.errors.getPosts,
);

export const selectGetPostsRecords = createSelector(
  [selectPostsState],
  (posts) => posts.records,
);

export const selectGetPostsTotalPages = createSelector(
  [selectPostsState],
  (posts) => posts.totalPages,
);

export const selectGetSinglePostStatus = createSelector(
  [selectPostsState],
  (posts) => posts.operations.getSinglePost,
);

export const selectGetSinglePostError = createSelector(
  [selectPostsState],
  (posts) => posts.errors.getSinglePost,
);

export const selectUpdatePostImageStatus = createSelector(
  [selectPostsState],
  (posts) => posts.operations.updatePostImage,
);

export const selectUpdatePostImageError = createSelector(
  [selectPostsState],
  (posts) => posts.errors.updatePostImage,
);

export const selectDeletePostStatus = createSelector(
  [selectPostsState],
  (posts) => posts.operations.deletePost,
);

export const selectDeletePostError = createSelector(
  [selectPostsState],
  (posts) => posts.errors.deletePost,
);

export const selectToggleLikeStatus = createSelector(
  [selectPostsState],
  (posts) => posts.operations.toggleLike,
);

export const selectToggleLikeError = createSelector(
  [selectPostsState],
  (posts) => posts.errors.toggleLike,
);

export const selectUpdatePostStatus = createSelector(
  [selectPostsState],
  (posts) => posts.operations.updatePost,
);

export const selectUpdatePostError = createSelector(
  [selectPostsState],
  (posts) => posts.errors.updatePost,
);

export const selectGetSinglePostRecord = createSelector(
  [selectPostsState],
  (posts) => posts.record,
);

export const selectGetPostCommentsStatus = createSelector(
  [selectPostsState],
  (posts) => posts.operations.getPostComments,
);

export const selectGetPostCommentsError = createSelector(
  [selectPostsState],
  (posts) => posts.errors.getPostComments,
);

export const selectGetPostCommentsRecords = createSelector(
  [selectPostsState],
  (posts) => posts.postComments,
);
