/**
 * @file src/components/common/navbar/navbar-items/index.tsx
 */

import { Nav, NavDropdown } from "react-bootstrap";
import { NavLink } from "react-router-dom";

interface AuthenticatedNavItemsProps {
  handleLogout: () => void;
  username?: string;
  isAdmin?: boolean;
  userId?: string;
}

export const UnauthenticatedNavItems = () => (
  <>
    <Nav.Link as={NavLink} to={"/auth/register"}>
      Register
    </Nav.Link>
    <Nav.Link as={NavLink} to={"/auth/login"}>
      Login
    </Nav.Link>
  </>
);

export const AuthenticatedNavItems = ({
  handleLogout,
  username,
  isAdmin,
  userId,
}: AuthenticatedNavItemsProps) => (
  <>
    <NavDropdown
      title={`Welcome ${username || "Guest"}`}
      id="basic-nav-dropdown"
    >
      {isAdmin ? (
        <NavDropdown.Item as={NavLink} to={"/admin-dashboard"} end>
          Admin Dashboard
        </NavDropdown.Item>
      ) : (
        <NavDropdown.Item as={NavLink} to={"/posts/create-post"} end>
          Create Post
        </NavDropdown.Item>
      )}
      <NavDropdown.Item
        to={`/users/${userId}/user-profile`}
        disabled={!userId}
        as={NavLink}
        end
      >
        User Profile
      </NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item as="button" onClick={handleLogout}>
        Logout
      </NavDropdown.Item>
    </NavDropdown>
  </>
);
