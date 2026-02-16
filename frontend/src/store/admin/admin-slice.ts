import { createSlice } from "@reduxjs/toolkit";
import { type IInfo, type TStatus } from "@/lib/types";
import { createCategory } from "../categories/categories-slice";
import { deleteUserProfile } from "../users/users-slice";
import { deletePost } from "../posts/posts-slice";

import deleteCategory from "../categories/actions/delete-category";
import getAllInfo from "./actions/get-all-info";
import { deleteComment } from "../comments/comments-slice";
import { handlePending, handleRejected } from "@/lib/utils";

interface IAdminState {
  operations: {
    getAllInfo: TStatus;
  };

  errors: {
    getAllInfo: null | string;
  };

  allInfo: null | IInfo;
}

const initialState: IAdminState = {
  operations: {
    getAllInfo: "idle",
  },
  errors: {
    getAllInfo: null,
  },
  allInfo: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get All Info
    builder.addCase(getAllInfo.pending, (state) => {
      handlePending(state, "getAllInfo");
    });
    builder.addCase(getAllInfo.fulfilled, (state, action) => {
      state.operations.getAllInfo = "succeeded";
      state.allInfo = action.payload;
    });
    builder.addCase(getAllInfo.rejected, (state, action) => {
      handleRejected(state, "getAllInfo", action);
    });

    // Listen for the create category action
    builder.addCase(createCategory.fulfilled, (state) => {
      if (state.allInfo) {
        state.allInfo.categories += 1;
      }
    });

    // Listen for the delete user profile action
    builder.addCase(deleteUserProfile.fulfilled, (state) => {
      if (state.allInfo) {
        state.allInfo.users = Math.max(0, state.allInfo.users - 1);
      }
    });

    // Listen for the delete category action
    builder.addCase(deleteCategory.fulfilled, (state) => {
      if (state.allInfo) {
        state.allInfo.categories = Math.max(0, state.allInfo.categories - 1);
      }
    });

    // Listen for the delete post action
    builder.addCase(deletePost.fulfilled, (state) => {
      if (state.allInfo) {
        state.allInfo.posts = Math.max(0, state.allInfo.posts - 1);
      }
    });

    // Listen for the delete comment action
    builder.addCase(deleteComment.fulfilled, (state) => {
      if (state.allInfo) {
        state.allInfo.comments = Math.max(0, state.allInfo.comments - 1);
      }
    });
  },
});

export { getAllInfo };

export default adminSlice.reducer;
