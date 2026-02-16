import { selectIsAuthenticated } from "@/store/auth/auth-selectors";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

const CanActivate = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const location = useLocation(); // Capture where they were trying to go

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to={"/auth/login"}
      state={{ from: location }} // Pass the original destination
      replace
    />
  );
};

export default CanActivate;
