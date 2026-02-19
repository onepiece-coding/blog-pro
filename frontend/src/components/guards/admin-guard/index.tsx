/**
 * @file src/components/guards/admin-guard/index.tsx
 */

import {
  selectIsAdmin,
  selectIsAuthenticated,
} from "@/store/auth/auth-selectors";
import { useAppSelector } from "@/store/hooks";
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminGuard;
