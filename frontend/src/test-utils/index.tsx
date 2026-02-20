/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file src/test-utils/index.tsx
 *
 * Central test utilities for the entire project.
 *
 * ── What lives here ────────────────────────────────────────────────────────
 *
 *  STORE FACTORIES
 *  • makeAuthState        — build a partial auth slice state (safe defaults)
 *  • makeToastsState      — build a partial toasts slice state (safe defaults)
 *  • makePasswordState    — build a partial password slice state (safe defaults)
 *  • makePostsState       — build a partial posts slice state (safe defaults)
 *  • makeCategoriesState  — build a partial categories slice state (safe defaults)
 *  • buildStore           — create a real Redux store with all 5 slices
 *
 *  RENDER HELPERS
 *  • renderWithProviders  — render inside <Provider> + <MemoryRouter>
 *                           returns { store, ...RTL queries }
 *  • renderWithStore      — render inside <Provider> only (no Router)
 *                           for components that don't use React Router
 *
 *  FIXTURES
 *  • makeUser()           — factory for fully type-compliant IUser objects
 *  • regularUser          — standard non-admin user (alice)
 *  • adminUser            — standard admin user (bob)
 *  • makeToast()          — factory for fully type-compliant IToast objects
 *  • makePost()           — factory for post objects
 *  • makeCategory()       — factory for category objects
 *
 *  FORM HELPERS
 *  • fillForm()           — fill multiple RHF-controlled fields by label
 *
 * ── Design decisions ───────────────────────────────────────────────────────
 *
 *  1. Real reducers, not mocked dispatch.
 *     configureStore with preloadedState keeps selectors honest.
 *     A broken selector breaks the test — that's the desired behaviour.
 *
 *  2. Auth, toasts, password, posts, and categories are registered by default.
 *     Any component in the tree that reads from these slices works without
 *     extra configuration. extraReducers handles future slices.
 *
 *  3. renderWithProviders always returns `store`.
 *     Tests that need to read state or spy on dispatch after interactions
 *     can do so without re-creating the store themselves.
 *
 *  4. Fixtures use the full interface types — no `as Type` casting.
 *     TypeScript surfaces any future interface changes at compile time.
 */

import React from "react";
import {
  render,
  type RenderOptions as RTLRenderOptions,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { configureStore, type Reducer } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import categoriesReducer from "@/store/categories/categories-slice";
import toastsReducer from "@/store/toasts/toasts-slice";
import passwordReducer from "@/store/password/password-slice";
import postsReducer from "@/store/posts/posts-slice";
import authReducer from "@/store/auth/auth-slice";
import type { RootState } from "@/store";
import type { IToast, IUser } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Partial preloaded state accepted by buildStore.
 * Auth, toasts, password, posts, and categories are registered by default.
 */
export interface PreloadedTestState {
  auth?: Partial<RootState["auth"]>;
  toasts?: Partial<RootState["toasts"]>;
  password?: Partial<RootState["password"]>;
  posts?: Partial<RootState["posts"]>;
  categories?: Partial<RootState["categories"]>;
  // Add more slices as needed:
  // users?: Partial<RootState["users"]>;
  // comments?: Partial<RootState["comments"]>;
}

/**
 * Options for renderWithProviders.
 */
export interface RenderWithProvidersOptions extends Omit<
  RTLRenderOptions,
  "wrapper"
> {
  /** Partial Redux state to pre-load into the test store. */
  preloadedState?: PreloadedTestState;
  /**
   * Initial route for MemoryRouter.
   * Defaults to "/" — set this to test active NavLink styles or
   * route-dependent rendering.
   */
  initialRoute?: string;
  /**
   * Additional slice reducers to register beyond auth + toasts.
   *
   * @example
   * renderWithProviders(<PostsList />, {
   *   extraReducers: { posts: postsReducer },
   *   preloadedState: { posts: { items: mockPosts } },
   * })
   */
  extraReducers?: Record<string, Reducer>;
}

/**
 * RTL render result augmented with the live store reference.
 */
export type RenderWithProvidersResult = ReturnType<typeof render> & {
  store: ReturnType<typeof buildStore>;
};

// ─────────────────────────────────────────────────────────────────────────────
// STORE FACTORIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a fully-typed auth slice state with safe idle/null defaults.
 * Pass only the fields you care about — the rest stay at initial state.
 *
 * @example
 * makeAuthState({ user: regularUser, accessToken: "token-abc" })
 * makeAuthState({ operations: { register: "pending" } })
 */
export const makeAuthState = (
  overrides: Partial<RootState["auth"]> = {},
): RootState["auth"] => ({
  operations: { emailVerification: "idle", register: "idle", login: "idle" },
  errors: { emailVerification: null, register: null, login: null },
  accessToken: null,
  user: null,
  ...overrides,
});

/**
 * Build a fully-typed toasts slice state with safe defaults.
 * Pass an array of IToast records to pre-populate the store.
 *
 * @example
 * makeToastsState({ records: [makeToast({ message: "Saved!" })] })
 */
export const makeToastsState = (
  overrides: Partial<RootState["toasts"]> = {},
): RootState["toasts"] => ({
  records: [],
  ...overrides,
});

/**
 * Build a fully-typed password slice state with safe idle/null defaults.
 * Pass only the fields you care about — the rest stay at initial state.
 *
 * @example
 * makePasswordState({ operations: { resetPassword: "pending" } })
 * makePasswordState({ errors: { sendResetPasswordLink: "Email not found" } })
 */
export const makePasswordState = (
  overrides: Partial<RootState["password"]> = {},
): RootState["password"] => ({
  operations: {
    sendResetPasswordLink: "idle",
    getResetPasswordLink: "idle",
    resetPassword: "idle",
  },
  errors: {
    sendResetPasswordLink: null,
    getResetPasswordLink: null,
    resetPassword: null,
  },
  ...overrides,
});

/**
 * Build a fully-typed posts slice state with safe defaults.
 *
 * @example
 * makePostsState({ operations: { createPost: "pending" } })
 * makePostsState({ records: [mockPost] })
 * makePostsState({ record: mockPost })
 */
export const makePostsState = (
  overrides: Partial<RootState["posts"]> = {},
): RootState["posts"] => ({
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
  ...overrides,
});

/**
 * Build a fully-typed categories slice state with safe defaults.
 *
 * @example
 * makeCategoriesState({ records: [mockCategory] })
 * makeCategoriesState({ operations: { getAllCategories: "pending" } })
 */
export const makeCategoriesState = (
  overrides: Partial<RootState["categories"]> = {},
): RootState["categories"] => ({
  operations: {
    getAllCategories: "idle",
    createCategory: "idle",
    deleteCategory: null,
  },
  errors: {
    getAllCategories: null,
    createCategory: null,
    deleteCategory: null,
  },
  totalPages: 0,
  records: [],
  ...overrides,
});

/**
 * Create a real Redux store pre-loaded with test state.
 * Registers auth, toasts, password, posts, and categories by default.
 *
 * @example
 * const store = buildStore({ auth: { user: regularUser } });
 * const store = buildStore({ posts: { records: [mockPost] } });
 * const store = buildStore({ categories: { records: [mockCategory] } });
 */
export const buildStore = (
  preloadedState: PreloadedTestState = {},
  extraReducers: Record<string, Reducer> = {},
) => {
  const {
    auth: authOverrides = {},
    toasts: toastsOverrides = {},
    password: passwordOverrides = {},
    posts: postsOverrides = {},
    categories: categoriesOverrides = {},
    ...otherSlices
  } = preloadedState;

  return configureStore({
    reducer: {
      auth: authReducer,
      toasts: toastsReducer,
      password: passwordReducer,
      posts: postsReducer,
      categories: categoriesReducer,
      ...extraReducers,
    },
    preloadedState: {
      auth: makeAuthState(authOverrides),
      toasts: makeToastsState(toastsOverrides),
      password: makePasswordState(passwordOverrides),
      posts: makePostsState(postsOverrides),
      categories: makeCategoriesState(categoriesOverrides),
      ...Object.fromEntries(
        Object.entries(otherSlices).filter(([key]) => key in extraReducers),
      ),
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// RENDER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render a component inside both a Redux <Provider> and <MemoryRouter>.
 *
 * Use this for any component that reads from the Redux store OR uses
 * React Router hooks/components (Link, NavLink, useNavigate, etc.).
 *
 * @example — basic
 * renderWithProviders(<Navbar>…</Navbar>);
 *
 * @example — authenticated user
 * renderWithProviders(<Navbar>…</Navbar>, {
 *   preloadedState: { auth: { user: regularUser, accessToken: "tok" } },
 * });
 *
 * @example — pre-populated toasts
 * renderWithProviders(<ToastContainer position="bottom-right" />, {
 *   preloadedState: { toasts: { records: [makeToast()] } },
 * });
 *
 * @example — specific active route
 * renderWithProviders(<UnauthenticatedNavItems />, {
 *   initialRoute: "/auth/login",
 * });
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    initialRoute = "/",
    extraReducers = {},
    ...rtlOptions
  }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult => {
  const store = buildStore(preloadedState, extraReducers);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...rtlOptions }),
  };
};

/**
 * Render a component inside a Redux <Provider> only — no Router.
 *
 * Use for components that read from the store but have NO React Router
 * dependencies. Avoids "You should not use <Link> outside a <Router>" errors
 * for genuinely non-routed components.
 *
 * @example
 * renderWithStore(<ToastContainer position="bottom-right" />, {
 *   preloadedState: { toasts: { records: [makeToast()] } },
 * });
 */
export const renderWithStore = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    extraReducers = {},
    ...rtlOptions
  }: Omit<RenderWithProvidersOptions, "initialRoute"> = {},
): RenderWithProvidersResult => {
  const store = buildStore(preloadedState, extraReducers);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...rtlOptions }),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// USER FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory for one-off IUser objects.
 * Merges overrides on top of a sensible base — specify only what differs.
 *
 * @example
 * const adminAlice = makeUser({ isAdmin: true });
 * const userWithPosts = makeUser({ posts: [mockPost] });
 */
export const makeUser = (overrides: Partial<IUser> = {}): IUser => ({
  _id: "user-123",
  username: "alice",
  email: "alice@example.com",
  isAdmin: false,
  profilePhoto: { publicId: null, url: "" },
  createdAt: "2024-01-01T00:00:00.000Z",
  posts: [],
  bio: "",
  ...overrides,
});

/** Standard non-admin user. Use as the default authenticated state. */
export const regularUser: IUser = makeUser();

/** Standard admin user. Use to test admin-only rendering paths. */
export const adminUser: IUser = makeUser({
  _id: "admin-456",
  username: "bob",
  isAdmin: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// TOAST FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory for fully type-compliant IToast objects.
 * Provides a stable UUID so tests can reference toast.id without randomness.
 *
 * @example
 * makeToast({ type: "success", message: "Saved!" })
 * makeToast({ type: "danger", title: "Error", message: "Not found" })
 */
export const makeToast = (overrides: Partial<IToast> = {}): IToast => ({
  id: "toast-test-id-001",
  type: "primary",
  title: null,
  message: "Test notification message",
  ...overrides,
});

/**
 * Create a mock post fixture for testing.
 *
 * @example
 * makePost({ title: "My Post", user: makeUser() })
 */
export const makePost = (overrides: Partial<any> = {}): any => ({
  _id: "post-test-123",
  title: "Test Post Title",
  description: "Test post description content",
  image: { url: "https://example.com/post.jpg", publicId: "post-img-123" },
  user: makeUser(),
  categoryId: { _id: "cat-123", title: "Technology" },
  likes: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create a mock category fixture for testing.
 *
 * @example
 * makeCategory({ title: "Sports" })
 */
export const makeCategory = (overrides: Partial<any> = {}): any => ({
  _id: "cat-test-123",
  title: "Test Category",
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// FORM HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type-safe map of field label → value for fillForm.
 * Keys are matched against getByLabelText — use the visible label text.
 */
export type FormFields = Record<string, string>;

/**
 * Fill multiple RHF-controlled form fields in sequence using userEvent.
 *
 * Looks up each field by its accessible label text (getByLabelText).
 * Clears the field before typing so prior values don't bleed in.
 *
 * @example
 * const user = userEvent.setup();
 * await fillForm(user, {
 *   Username: "alice123",
 *   Email: "alice@example.com",
 *   Password: "Secret1!",
 *   "Confirm Password": "Secret1!",
 * });
 */
export const fillForm = async (
  user: ReturnType<typeof import("@testing-library/user-event").default.setup>,
  fields: FormFields,
): Promise<void> => {
  const { screen } = await import("@testing-library/react");

  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(label);
    await user.clear(input);
    await user.type(input, value);
  }
};
