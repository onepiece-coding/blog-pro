import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CanActivate, AdminGuard } from "@/components/guards";
import { WithSuspense } from "./with-suspense.component";
import { lazy } from "react";

const EmailVerification = lazy(() => import("@/pages/auth/email-verification"));
const ManageUsers = lazy(() => import("@/pages/admin-dashboard/manage-users"));
const ManagePosts = lazy(() => import("@/pages/admin-dashboard/manage-posts"));
const ResetPassword = lazy(() => import("@/pages/password/reset-password"));
const DashboardLayout = lazy(() => import("@/layouts/dashboard-layout"));
const RegisterUser = lazy(() => import("@/pages/auth/register-user"));
const PostDetails = lazy(() => import("@/pages/posts/post-details"));
const UserProfile = lazy(() => import("@/pages/users/user-profile"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const CreatePost = lazy(() => import("@/pages/posts/create-post"));
const UpdatePost = lazy(() => import("@/pages/posts/update-post"));
const ErrorElement = lazy(() => import("@/pages/error-element"));
const PostsList = lazy(() => import("@/pages/posts/posts-list"));
const LoginUser = lazy(() => import("@/pages/auth/login-user"));
const MainLayout = lazy(() => import("@/layouts/main-layout"));
const SendResetPasswordLink = lazy(
  () => import("@/pages/password/send-reset-password-link"),
);
const ManageCategories = lazy(
  () => import("@/pages/admin-dashboard/manage-categories"),
);
const GetResetPasswordLink = lazy(
  () => import("@/pages/password/get-reset-password-link"),
);
const ManageComments = lazy(
  () => import("@/pages/admin-dashboard/manage-comments"),
);
const Comments = lazy(() => import("@/pages/comments"));
const HomePage = lazy(() => import("@/pages/home"));
const UpdateUserProfile = lazy(
  () => import("@/pages/users/update-user-profile"),
);

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <WithSuspense forMainLayout={true}>
        <MainLayout />
      </WithSuspense>
    ),
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: (
          <WithSuspense>
            <HomePage />
          </WithSuspense>
        ),
      },
      {
        path: "auth/register",
        element: (
          <WithSuspense>
            <RegisterUser />
          </WithSuspense>
        ),
      },
      {
        path: "auth/login",
        element: (
          <WithSuspense>
            <LoginUser />
          </WithSuspense>
        ),
      },
      {
        path: "users/:userId/verify/:token",
        element: (
          <WithSuspense>
            <EmailVerification />
          </WithSuspense>
        ),
      },
      {
        path: "password/send-reset-password-link",
        element: (
          <WithSuspense>
            <SendResetPasswordLink />
          </WithSuspense>
        ),
      },
      {
        path: `reset-password/:userId/:token`,
        element: (
          <WithSuspense>
            <GetResetPasswordLink />
          </WithSuspense>
        ),
      },
      {
        path: `/password/reset-password/:userId/:token`,
        element: (
          <WithSuspense>
            <ResetPassword />
          </WithSuspense>
        ),
      },
      {
        path: "posts/posts-list",
        element: (
          <WithSuspense>
            <PostsList />
          </WithSuspense>
        ),
      },
      {
        path: "posts/:postId/post-details",
        element: (
          <WithSuspense>
            <PostDetails />
          </WithSuspense>
        ),
      },
      {
        path: "posts/:postId/post-comments",
        element: (
          <WithSuspense>
            <Comments />
          </WithSuspense>
        ),
      },
      {
        path: "users/:userId/user-profile",
        element: (
          <WithSuspense>
            <UserProfile />
          </WithSuspense>
        ),
      },
      {
        element: <CanActivate />,
        children: [
          {
            path: "posts/create-post",
            element: (
              <WithSuspense>
                <CreatePost />
              </WithSuspense>
            ),
          },
          {
            path: "users/:userId/update-user-profile",
            element: (
              <WithSuspense>
                <UpdateUserProfile />
              </WithSuspense>
            ),
          },
          {
            path: "posts/:postId/update-post",
            element: (
              <WithSuspense>
                <UpdatePost />
              </WithSuspense>
            ),
          },
        ],
      },
      {
        element: <AdminGuard />,
        children: [
          {
            path: "admin-dashboard",
            element: (
              <WithSuspense>
                <DashboardLayout />
              </WithSuspense>
            ),
            children: [
              {
                index: true,
                element: (
                  <WithSuspense>
                    <AdminDashboard />
                  </WithSuspense>
                ),
              },
              {
                path: "manage-users",
                element: (
                  <WithSuspense>
                    <ManageUsers />
                  </WithSuspense>
                ),
              },
              {
                path: "manage-categories",
                element: (
                  <WithSuspense>
                    <ManageCategories />
                  </WithSuspense>
                ),
              },
              {
                path: "manage-posts",
                element: (
                  <WithSuspense>
                    <ManagePosts />
                  </WithSuspense>
                ),
              },
              {
                path: "manage-comments",
                element: (
                  <WithSuspense>
                    <ManageComments />
                  </WithSuspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={routes} />;
};

export default AppRouter;
