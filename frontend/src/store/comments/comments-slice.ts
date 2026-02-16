import { isString, type IComment, type TStatus } from "@/lib/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import getAllComments from "./actions/get-all-comments";
import createComment from "./actions/create-comment";
import updateComment from "./actions/update-comment";
import deleteComment from "./actions/delete-comment";
import { handlePending, handleRejected } from "@/lib/utils";

interface ICommentsState {
  operations: {
    createOrUpdateComment: TStatus;
    getAllComments: TStatus;
  };

  errors: {
    createOrUpdateComment: null | string;
    getAllComments: null | string;
    deleteComment: null | string;
  };

  records: IComment[];
  totalPages: number;
}

const initialState: ICommentsState = {
  operations: {
    createOrUpdateComment: "idle",
    getAllComments: "idle",
  },
  errors: {
    createOrUpdateComment: null,
    getAllComments: null,
    deleteComment: null,
  },
  records: [],
  totalPages: 0,
};

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentsError: (
      state,
      action: PayloadAction<keyof ICommentsState["errors"]>,
    ) => {
      state.errors[action.payload] = null;
    },
    commentsCleanUp: (state) => {
      state.totalPages = 0;
      state.records = [];
    },
  },
  extraReducers: (builder) => {
    // Create Comment
    builder.addCase(createComment.pending, (state) => {
      handlePending(state, "createOrUpdateComment");
    });
    builder.addCase(createComment.fulfilled, (state) => {
      state.operations.createOrUpdateComment = "succeeded";
    });
    builder.addCase(createComment.rejected, (state, action) => {
      handleRejected(state, "createOrUpdateComment", action);
    });

    // Update Comment
    builder.addCase(updateComment.pending, (state) => {
      handlePending(state, "createOrUpdateComment");
    });
    builder.addCase(updateComment.fulfilled, (state) => {
      state.operations.createOrUpdateComment = "succeeded";
    });
    builder.addCase(updateComment.rejected, (state, action) => {
      handleRejected(state, "createOrUpdateComment", action);
    });

    // Delete Comment
    builder.addCase(deleteComment.pending, (state) => {
      state.errors["deleteComment"] = null;
    });
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      state.records = state.records.filter(
        (record) => record._id !== action.meta.arg,
      );
    });
    builder.addCase(deleteComment.rejected, (state, action) => {
      if (isString(action.payload)) {
        state.errors["deleteComment"] = action.payload;
      }
    });

    // Get All Comments
    builder.addCase(getAllComments.pending, (state) => {
      handlePending(state, "getAllComments");
    });
    builder.addCase(getAllComments.fulfilled, (state, action) => {
      state.operations.getAllComments = "succeeded";
      state.records = action.payload.comments;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(getAllComments.rejected, (state, action) => {
      handleRejected(state, "getAllComments", action);
    });
  },
});

export const { clearCommentsError, commentsCleanUp } = commentsSlice.actions;

export { createComment, updateComment, deleteComment, getAllComments };

export default commentsSlice.reducer;
