/**
 * @file src/store/users/users-slice.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isString, type IUser, type TStatus } from "@/lib/types";

import updateProfilePhoto from "./actions/update-profile-photo";
import updateUserProfile from "./actions/update-user-profile";
import deleteUserProfile from "./actions/delete-user-profile";
import getUserProfile from "./actions/get-user-profile";
import { UserService } from "@/services/auth-service";
import getAllUsers from "./actions/get-all-users";
import { handlePending, handleRejected } from "@/lib/utils";

interface IUsersState {
  operations: {
    deleteUserProfile: string | null;
    updateProfilePhoto: TStatus;
    updateUserProfile: TStatus;
    getUserProfile: TStatus;
    getAllUsers: TStatus;
  };

  errors: {
    updateProfilePhoto: null | string;
    updateUserProfile: null | string;
    deleteUserProfile: null | string;
    getUserProfile: null | string;
    getAllUsers: null | string;
  };

  user: null | IUser;

  totalPages: number;
  records: IUser[];
}

const initialState: IUsersState = {
  operations: {
    updateProfilePhoto: "idle",
    updateUserProfile: "idle",
    deleteUserProfile: null,
    getUserProfile: "idle",
    getAllUsers: "idle",
  },
  errors: {
    updateProfilePhoto: null,
    updateUserProfile: null,
    deleteUserProfile: null,
    getUserProfile: null,
    getAllUsers: null,
  },
  user: null,
  totalPages: 0,
  records: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (
      state,
      action: PayloadAction<keyof IUsersState["errors"]>,
    ) => {
      state.errors[action.payload] = null;
    },
    usersCleanUp: (state) => {
      state.totalPages = 0;
      state.records = [];
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    // Get User Profile
    builder.addCase(getUserProfile.pending, (state) => {
      handlePending<
        IUsersState,
        keyof IUsersState["operations"] & keyof IUsersState["errors"]
      >(state, "getUserProfile");
    });
    builder.addCase(getUserProfile.fulfilled, (state, action) => {
      state.operations.getUserProfile = "succeeded";
      state.user = action.payload;
    });
    builder.addCase(getUserProfile.rejected, (state, action) => {
      handleRejected<
        IUsersState,
        keyof IUsersState["operations"] & keyof IUsersState["errors"]
      >(state, "getUserProfile", action);
    });

    // Update User Profile
    builder.addCase(updateUserProfile.pending, (state) => {
      handlePending(state, "updateUserProfile");
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.operations.updateUserProfile = "succeeded";
      state.user = action.payload;
      UserService.setUser(action.payload);
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      handleRejected(state, "updateUserProfile", action);
    });

    // Update Profile Photo
    builder.addCase(updateProfilePhoto.pending, (state) => {
      handlePending(state, "updateProfilePhoto");
    });
    builder.addCase(updateProfilePhoto.fulfilled, (state, action) => {
      state.operations.updateProfilePhoto = "succeeded";
      if (state.user) {
        state.user.profilePhoto = action.payload.profilePhoto;
      }
    });
    builder.addCase(updateProfilePhoto.rejected, (state, action) => {
      handleRejected(state, "updateProfilePhoto", action);
    });

    // Delete User Profile
    builder.addCase(deleteUserProfile.pending, (state, action) => {
      state.operations.deleteUserProfile = action.meta.arg;
      state.errors.deleteUserProfile = null;
    });
    builder.addCase(deleteUserProfile.fulfilled, (state, action) => {
      state.operations.deleteUserProfile = null;
      state.records = state.records.filter(
        (record) => record._id !== action.meta.arg,
      );
    });
    builder.addCase(deleteUserProfile.rejected, (state, action) => {
      state.operations.deleteUserProfile = null;
      if (isString(action.payload)) {
        state.errors["deleteUserProfile"] = action.payload;
      }
    });

    // Get All Users
    builder.addCase(getAllUsers.pending, (state) => {
      handlePending(state, "getAllUsers");
    });
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.operations.getAllUsers = "succeeded";
      state.totalPages = action.payload.totalPages;
      state.records = action.payload.users;
    });
    builder.addCase(getAllUsers.rejected, (state, action) => {
      handleRejected(state, "getAllUsers", action);
    });
  },
});

export const { clearUsersError, usersCleanUp } = usersSlice.actions;

export {
  getUserProfile,
  updateUserProfile,
  updateProfilePhoto,
  deleteUserProfile,
  getAllUsers,
};

export default usersSlice.reducer;
