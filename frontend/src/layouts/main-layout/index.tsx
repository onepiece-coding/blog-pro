/**
 * @file src/layouts/main-layout/index.tsx
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Outlet, useNavigate } from "react-router-dom";
import { ToastContainer } from "@/components/feedback";
import { logout } from "@/store/auth/auth-slice";
import {
  selectIsAuthenticated,
  selectCurrentUser,
} from "@/store/auth/auth-selectors";
import {
  UnauthenticatedNavItems,
  AuthenticatedNavItems,
  Footer,
  Navbar,
} from "@/components/common";

import styles from "./styles.module.css";

const { container, wrapper } = styles;

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <div className={container}>
      <ToastContainer position="bottom-right" />
      <Navbar>
        {isAuthenticated ? (
          <AuthenticatedNavItems
            handleLogout={handleLogout}
            username={currentUser?.username}
            isAdmin={currentUser?.isAdmin}
            userId={currentUser?._id}
          />
        ) : (
          <UnauthenticatedNavItems />
        )}
      </Navbar>
      <main className={wrapper}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
