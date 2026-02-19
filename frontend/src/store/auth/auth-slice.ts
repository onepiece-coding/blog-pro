/**
 * @file src/store/auth/auth-slice.ts
 */

import { updateProfilePhoto, updateUserProfile } from "../users/users-slice";
import { TokenService, UserService } from "@/services/auth-service";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type IUser, type TStatus } from "@/lib/types";

import emailVerification from "./actions/email-verification";
import registerUser from "./actions/register-user";
import loginUser from "./actions/login-user";
import { handlePending, handleRejected } from "@/lib/utils";

interface IAuthState {
  operations: {
    emailVerification: TStatus;
    register: TStatus;
    login: TStatus;
  };

  errors: {
    emailVerification: string | null;
    register: string | null;
    login: string | null;
  };

  accessToken: string | null;
  user: IUser | null;
}

const initialState: IAuthState = {
  operations: {
    emailVerification: "idle",
    register: "idle",
    login: "idle",
  },
  errors: {
    emailVerification: null,
    register: null,
    login: null,
  },
  // Populating from services ONCE on startup
  accessToken: TokenService.getToken(),
  user: UserService.getUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (
      state,
      action: PayloadAction<keyof IAuthState["errors"]>,
    ) => {
      state.errors[action.payload] = null;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;

      TokenService.removeToken();
      UserService.removeUser();

      Object.keys(state.operations).forEach((key) => {
        state.operations[key as keyof typeof state.operations] = "idle";
      });
      Object.keys(state.errors).forEach((key) => {
        state.errors[key as keyof typeof state.errors] = null;
      });
    },
  },
  extraReducers: (builder) => {
    // Register User
    builder.addCase(registerUser.pending, (state) => {
      handlePending(state, "register");
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.operations.register = "succeeded";
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      handleRejected(state, "register", action);
    });

    // Login User
    builder.addCase(loginUser.pending, (state) => {
      handlePending(state, "login");
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.operations.login = "succeeded";

      state.accessToken = action.payload.token;
      state.user = action.payload.user;

      TokenService.setToken(action.payload.token);
      UserService.setUser(action.payload.user);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      handleRejected(state, "login", action);
    });

    // Email Verification
    builder.addCase(emailVerification.pending, (state) => {
      handlePending(state, "emailVerification");
    });
    builder.addCase(emailVerification.fulfilled, (state) => {
      state.operations.emailVerification = "succeeded";
    });
    builder.addCase(emailVerification.rejected, (state, action) => {
      handleRejected(state, "emailVerification", action);
    });

    // Listen for the user update from the other slice
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      // action.payload is the IUser returned by your thunk
      state.user = action.payload;
    });

    builder.addCase(updateProfilePhoto.fulfilled, (state, action) => {
      if (state.user) {
        state.user.profilePhoto = action.payload.profilePhoto;
        UserService.setUser(state.user); // Keep localStorage in sync
      }
    });
  },
});

export const { clearAuthError, logout } = authSlice.actions;

export { emailVerification, registerUser, loginUser };

export default authSlice.reducer;
