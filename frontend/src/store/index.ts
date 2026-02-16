import { configureStore } from "@reduxjs/toolkit";

import CategoriesReducer from "./categories/categories-slice";
import CommentsReducer from "./comments/comments-slice";
import PasswordReducer from "./password/password-slice";
import ToastsReducer from "./toasts/toasts-slice";
import PostsReducer from "./posts/posts-slice";
import UsersReducer from "./users/users-slice";
import AdminReducer from "./admin/admin-slice";
import AuthReducer from "./auth/auth-slice";

const store = configureStore({
  reducer: {
    categories: CategoriesReducer,
    comments: CommentsReducer,
    password: PasswordReducer,
    toasts: ToastsReducer,
    posts: PostsReducer,
    users: UsersReducer,
    admin: AdminReducer,
    auth: AuthReducer,
  },
});

export { store };

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {categories: CategoriesReducer, products: ProductsReducer}
export type AppDispatch = typeof store.dispatch;
