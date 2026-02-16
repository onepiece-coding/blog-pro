import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectUsersState = (state: RootState) => state.users;

export const selectGetUserProfileStatus = createSelector(
  [selectUsersState],
  (users) => users.operations.getUserProfile,
);

export const selectGetUserProfileError = createSelector(
  [selectUsersState],
  (users) => users.errors.getUserProfile,
);

export const selectGetUserProfileUser = createSelector(
  [selectUsersState],
  (users) => {
    return users.user;
  },
);

export const selectUpdateUserProfileStatus = createSelector(
  [selectUsersState],
  (users) => {
    return users.operations.updateUserProfile;
  },
);

export const selectUpdateUserProfileError = createSelector(
  [selectUsersState],
  (users) => {
    return users.errors.updateUserProfile;
  },
);

export const selectUpdateProfilePhotoStatus = createSelector(
  [selectUsersState],
  (users) => {
    return users.operations.updateProfilePhoto;
  },
);

export const selectUpdateProfilePhotoError = createSelector(
  [selectUsersState],
  (users) => {
    return users.errors.updateProfilePhoto;
  },
);

export const selectDeleteUserProfileStatus = createSelector(
  [selectUsersState],
  (users) => {
    return users.operations.deleteUserProfile;
  },
);

export const selectDeleteUserProfileError = createSelector(
  [selectUsersState],
  (users) => {
    return users.errors.deleteUserProfile;
  },
);

export const selectGetAllUsersStatus = createSelector(
  [selectUsersState],
  (users) => {
    return users.operations.getAllUsers;
  },
);

export const selectGetAllUsersError = createSelector(
  [selectUsersState],
  (users) => {
    return users.errors.getAllUsers;
  },
);

export const selectGetAllUsersTotalPages = createSelector(
  [selectUsersState],
  (users) => {
    return users.totalPages;
  },
);

export const selectGetAllUsersRecords = createSelector(
  [selectUsersState],
  (users) => {
    return users.records;
  },
);
