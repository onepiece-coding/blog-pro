/**
 * @file src/store/posts/posts-slice.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isString, type IComment, type IPost, type TStatus } from "@/lib/types";

import createPost from "./actions/create-post";
import getPosts from "./actions/get-posts";
import getSinglePost from "./actions/get-single-post";
import updatePostImage from "./actions/update-post-image";
import deletePost from "./actions/delete-post";
import toggleLike from "./actions/toggle-like";
import updatePost from "./actions/update-post";
import getPostComments from "./actions/get-post-comments";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../comments/comments-slice";
import { handlePending, handleRejected } from "@/lib/utils";

interface IPostsState {
  operations: {
    deletePost: null | string;
    getPostComments: TStatus;
    updatePostImage: TStatus;
    getSinglePost: TStatus;
    updatePost: TStatus;
    createPost: TStatus;
    toggleLike: TStatus;
    getPosts: TStatus;
  };

  errors: {
    getPostComments: null | string;
    updatePostImage: null | string;
    getSinglePost: null | string;
    updatePost: null | string;
    createPost: null | string;
    deletePost: null | string;
    toggleLike: null | string;
    getPosts: null | string;
  };

  totalPages: number;
  records: IPost[];

  record: null | IPost;

  postComments: IComment[];
}

const initialState: IPostsState = {
  operations: {
    getPostComments: "idle",
    updatePostImage: "idle",
    getSinglePost: "idle",
    updatePost: "idle",
    createPost: "idle",
    deletePost: null,
    toggleLike: "idle",
    getPosts: "idle",
  },
  errors: {
    getPostComments: null,
    updatePostImage: null,
    getSinglePost: null,
    updatePost: null,
    createPost: null,
    deletePost: null,
    toggleLike: null,
    getPosts: null,
  },
  totalPages: 0,
  records: [],
  record: null,
  postComments: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostsError: (
      state,
      action: PayloadAction<keyof IPostsState["errors"]>,
    ) => {
      state.errors[action.payload] = null;
    },
    postsCleanUp: (state) => {
      state.postComments = [];
      state.totalPages = 0;
      state.record = null;
      state.records = [];
    },
  },
  extraReducers: (builder) => {
    // Create Post
    builder.addCase(createPost.pending, (state) => {
      handlePending(state, "createPost");
    });
    builder.addCase(createPost.fulfilled, (state) => {
      state.operations.createPost = "succeeded";
    });
    builder.addCase(createPost.rejected, (state, action) => {
      handleRejected(state, "createPost", action);
    });

    // Get Posts
    builder.addCase(getPosts.pending, (state) => {
      handlePending(state, "getPosts");
    });
    builder.addCase(getPosts.fulfilled, (state, action) => {
      state.operations.getPosts = "succeeded";
      state.records = action.payload.posts;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(getPosts.rejected, (state, action) => {
      handleRejected(state, "getPosts", action);
    });

    // Get Single Post
    builder.addCase(getSinglePost.pending, (state) => {
      handlePending(state, "getSinglePost");
    });
    builder.addCase(getSinglePost.fulfilled, (state, action) => {
      state.operations.getSinglePost = "succeeded";
      state.record = action.payload;
    });
    builder.addCase(getSinglePost.rejected, (state, action) => {
      handleRejected(state, "getSinglePost", action);
    });

    // Update Post Image
    builder.addCase(updatePostImage.pending, (state) => {
      handlePending(state, "updatePostImage");
    });
    builder.addCase(updatePostImage.fulfilled, (state, action) => {
      state.operations.updatePostImage = "succeeded";
      state.record = action.payload;
    });
    builder.addCase(updatePostImage.rejected, (state, action) => {
      handleRejected(state, "updatePostImage", action);
    });

    // Delete Post
    builder.addCase(deletePost.pending, (state, action) => {
      state.operations.deletePost = action.meta.arg;
      state.errors.deletePost = null;
    });
    builder.addCase(deletePost.fulfilled, (state, action) => {
      state.operations.deletePost = null;
      state.records = state.records.filter(
        (record) => record._id !== action.meta.arg,
      );
    });
    builder.addCase(deletePost.rejected, (state, action) => {
      state.operations.deletePost = null;
      if (isString(action.payload)) {
        state.errors["deletePost"] = action.payload;
      }
    });

    // Toggle Like
    builder.addCase(toggleLike.pending, (state) => {
      handlePending(state, "toggleLike");
    });
    builder.addCase(toggleLike.fulfilled, (state, action) => {
      state.operations.toggleLike = "succeeded";
      if (state.record) {
        state.record.likes = action.payload;
      }
    });
    builder.addCase(toggleLike.rejected, (state, action) => {
      handleRejected(state, "toggleLike", action);
    });

    // Update Post
    builder.addCase(updatePost.pending, (state) => {
      handlePending(state, "updatePost");
    });
    builder.addCase(updatePost.fulfilled, (state, action) => {
      state.operations.updatePost = "succeeded";
      state.record = action.payload;
    });
    builder.addCase(updatePost.rejected, (state, action) => {
      handleRejected(state, "updatePost", action);
    });

    // Get Post Comments
    builder.addCase(getPostComments.pending, (state) => {
      handlePending(state, "getPostComments");
    });
    builder.addCase(getPostComments.fulfilled, (state, action) => {
      state.operations.getPostComments = "succeeded";
      state.postComments = action.payload;
    });
    builder.addCase(getPostComments.rejected, (state, action) => {
      handleRejected(state, "getPostComments", action);
    });

    builder.addCase(createComment.fulfilled, (state, action) => {
      state.postComments.unshift(action.payload);
    });

    builder.addCase(updateComment.fulfilled, (state, action) => {
      const { commentId } = action.meta.arg;
      const target = state.postComments.findIndex(
        (postComment) => postComment._id === commentId,
      );
      state.postComments.splice(target, 1, action.payload);
    });

    builder.addCase(deleteComment.fulfilled, (state, action) => {
      const commentId = action.meta.arg;

      state.postComments = state.postComments.filter(
        (postComment) => postComment._id !== commentId,
      );
    });
  },
});

export const { clearPostsError, postsCleanUp } = postsSlice.actions;

export {
  createPost,
  getPosts,
  getSinglePost,
  updatePostImage,
  deletePost,
  toggleLike,
  updatePost,
  getPostComments,
};

export default postsSlice.reducer;
