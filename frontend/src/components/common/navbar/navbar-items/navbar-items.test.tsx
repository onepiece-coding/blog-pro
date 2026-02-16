/**
 * @file src/components/common/navbar/navbar-items/navbar-items.test.tsx
 */

import { renderWithProviders, regularUser, adminUser } from "@/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  UnauthenticatedNavItems,
  AuthenticatedNavItems,
} from "@/components/common/navbar/navbar-items";
import { screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import Navbar from "@/components/common/navbar";

// ───────────────────────────────────────────────────────────────────────────
// 1. UNAUTHENTICATED NAV ITEMS
// ───────────────────────────────────────────────────────────────────────────

describe("UnauthenticatedNavItems", () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  describe("🧱 Rendering", () => {
    it("renders a Register link", () => {
      /**
       * Register is the primary CTA for new visitors.
       * Its absence would silently block user acquisition with no error thrown.
       */
      renderWithProviders(<UnauthenticatedNavItems />);

      expect(
        screen.getByRole("link", { name: /register/i }),
      ).toBeInTheDocument();
    });

    it("renders a Login link", () => {
      /**
       * Login is the entry point for returning users.
       * Missing it forces them to navigate manually — a severe UX and conversion problem.
       */
      renderWithProviders(<UnauthenticatedNavItems />);

      expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    });

    it("renders exactly two navigation links", () => {
      /**
       * Prevents accidental duplication or silent removal of links — both
       * scenarios should require intentional test updates.
       */
      renderWithProviders(<UnauthenticatedNavItems />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);
    });
  });

  // ── Routing ──────────────────────────────────────────────────────────────

  describe("🔀 Routing", () => {
    it("Register link points to '/auth/register'", () => {
      renderWithProviders(<UnauthenticatedNavItems />);
      expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute(
        "href",
        "/auth/register",
      );
    });

    it("Login link points to '/auth/login'", () => {
      renderWithProviders(<UnauthenticatedNavItems />);
      expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
        "href",
        "/auth/login",
      );
    });

    it("Register link receives the 'active' class when the current route is /auth/register", () => {
      /**
       * React Router's NavLink adds 'active' to the current route.
       * Verifying this confirms NavLink (not plain Link) is used,
       * which matters because users need visual feedback about where they are.
       */
      renderWithProviders(<UnauthenticatedNavItems />, {
        initialRoute: "/auth/register",
      });

      expect(screen.getByRole("link", { name: /register/i })).toHaveClass(
        "active",
      );
    });

    it("Login link receives the 'active' class when the current route is /auth/login", () => {
      renderWithProviders(<UnauthenticatedNavItems />, {
        initialRoute: "/auth/login",
      });

      expect(screen.getByRole("link", { name: /login/i })).toHaveClass(
        "active",
      );
    });
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  describe("♿ Accessibility", () => {
    it("both links are keyboard-navigable in order (Register then Login)", async () => {
      /**
       * DOM order determines tab order for links.
       * Register appearing before Login is the natural reading flow —
       * reversing them would confuse keyboard users.
       */
      const user = userEvent.setup();

      renderWithProviders(
        <Navbar>
          <UnauthenticatedNavItems />
        </Navbar>,
      );

      // First tab hits brand, second hits Register, third hits Login
      await user.tab(); // brand
      await user.tab(); // register
      expect(screen.getByRole("link", { name: /register/i })).toHaveFocus();

      await user.tab(); // login
      expect(screen.getByRole("link", { name: /login/i })).toHaveFocus();
    });
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. AUTHENTICATED NAV ITEMS — REGULAR USER
// ───────────────────────────────────────────────────────────────────────────

describe("AuthenticatedNavItems — regular user (isAdmin: false)", () => {
  const defaultProps = {
    handleLogout: vi.fn(),
    userId: regularUser._id,
    username: regularUser.username,
    isAdmin: regularUser.isAdmin,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  describe("🧱 Rendering", () => {
    it("renders a dropdown toggle with the username greeting", () => {
      /**
       * The greeting is personalised and forms the only visible nav item for authenticated users.
       * Getting the username wrong here is a trust issue.
       */
      renderWithProviders(<AuthenticatedNavItems {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /welcome alice/i }),
      ).toBeInTheDocument();
    });

    it("shows 'Create Post' (not 'Admin Dashboard') for non-admin users", async () => {
      /**
       * The whole point of the isAdmin branch is that regular users should
       * never see or access admin routes. This is a security-adjacent test.
       */
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));

      expect(
        await screen.findByRole("link", { name: /create post/i }),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: /admin dashboard/i }),
      ).not.toBeInTheDocument();
    });

    it("shows 'User Profile' link for regular users", async () => {
      /**
       * Every authenticated user must be able to reach their profile.
       * Its absence would make account management inaccessible via the nav.
       */
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));

      expect(
        await screen.findByRole("link", { name: /user profile/i }),
      ).toBeInTheDocument();
    });

    it("shows a Logout button inside the dropdown", async () => {
      /**
       * Logout is a critical security affordance.
       * It must always be present and accessible without navigating away.
       */
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));

      expect(
        await screen.findByRole("button", { name: /logout/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Routing ──────────────────────────────────────────────────────────────

  describe("🔀 Routing", () => {
    it("Create Post link points to '/posts/create-post'", async () => {
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: /welcome alice/i }));

      expect(
        await screen.findByRole("link", { name: /create post/i }),
      ).toHaveAttribute("href", "/posts/create-post");
    });

    it("User Profile link points to the correct user-specific URL", async () => {
      /**
       * The profile URL is user-specific — it must embed the correct userId.
       * A wrong or missing userId would route the user to a 404 or someone else's profile.
       */
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: /welcome alice/i }));

      expect(
        await screen.findByRole("link", { name: /user profile/i }),
      ).toHaveAttribute("href", `/users/${regularUser._id}/user-profile`);
    });
  });

  // ── Interactions ─────────────────────────────────────────────────────────

  describe("🎭 Interactions", () => {
    it("calls handleLogout when the Logout button is clicked", async () => {
      /**
       * The most critical interaction in the entire nav.
       * If handleLogout is not called the user's session persists indefinitely
       * after clicking 'Logout', which is a security vulnerability.
       */
      const handleLogout = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(
        <AuthenticatedNavItems {...defaultProps} handleLogout={handleLogout} />,
      );

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));
      await user.click(await screen.findByRole("button", { name: /logout/i }));

      expect(handleLogout).toHaveBeenCalledTimes(1);
    });

    it("does not call handleLogout when a nav link (not logout) is clicked", async () => {
      /**
       * Guards against event bubbling or wiring mistakes where any dropdown
       * interaction accidentally triggers logout.
       */
      const handleLogout = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(
        <AuthenticatedNavItems {...defaultProps} handleLogout={handleLogout} />,
      );

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));
      await user.click(
        await screen.findByRole("link", { name: /create post/i }),
      );

      expect(handleLogout).not.toHaveBeenCalled();
    });
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. AUTHENTICATED NAV ITEMS — ADMIN USER
// ───────────────────────────────────────────────────────────────────────────

describe("AuthenticatedNavItems — admin user (isAdmin: true)", () => {
  const adminProps = {
    handleLogout: vi.fn(),
    userId: adminUser._id,
    username: adminUser.username,
    isAdmin: adminUser.isAdmin,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  describe("🧱 Rendering", () => {
    it("shows 'Admin Dashboard' (not 'Create Post') for admin users", async () => {
      /**
       * Admin users have a fundamentally different workflow.
       * They manage the platform rather than creating content.
       * Showing them 'Create Post' would be misleading and hiding
       * 'Admin Dashboard' would break their workflow.
       */
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...adminProps} />);
      await user.click(screen.getByRole("button", { name: /welcome bob/i }));

      expect(
        await screen.findByRole("link", { name: /admin dashboard/i }),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: /create post/i }),
      ).not.toBeInTheDocument();
    });

    it("still shows 'User Profile' and 'Logout' for admin users", async () => {
      /**
       * Admins are users too — they still need profile access and the ability to log out.
       * These should not be conditionally hidden for admins.
       */
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...adminProps} />);
      await user.click(screen.getByRole("button", { name: /welcome bob/i }));

      expect(
        await screen.findByRole("link", { name: /user profile/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /logout/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Routing ──────────────────────────────────────────────────────────────

  describe("🔀 Routing", () => {
    it("Admin Dashboard link points to '/admin-dashboard'", async () => {
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...adminProps} />);
      await user.click(screen.getByRole("button", { name: /welcome bob/i }));

      expect(
        await screen.findByRole("link", { name: /admin dashboard/i }),
      ).toHaveAttribute("href", "/admin-dashboard");
    });

    it("User Profile link uses the admin's userId in the URL", async () => {
      /**
       * Admin and regular user profile URLs must be distinct.
       * Using a hardcoded or wrong userId would route admins to a regular
       * user's profile page.
       */
      const user = userEvent.setup();

      renderWithProviders(<AuthenticatedNavItems {...adminProps} />);
      await user.click(screen.getByRole("button", { name: /welcome bob/i }));

      expect(
        await screen.findByRole("link", { name: /user profile/i }),
      ).toHaveAttribute("href", `/users/${adminUser._id}/user-profile`);
    });
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. AUTHENTICATED NAV ITEMS — EDGE CASES (undefined props)
// ───────────────────────────────────────────────────────────────────────────

describe("AuthenticatedNavItems — edge cases with undefined props", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("🧩 Edge Cases", () => {
    it("renders 'Welcome Guest' when username is not provided", () => {
      /**
       * The component guards against undefined via `username || "Guest"`.
       * This verifies the fallback renders correctly with no crash.
       * "Welcome Guest" is a safe, user-friendly default when the store
       * hasn't hydrated the user object yet.
       */
      renderWithProviders(
        <AuthenticatedNavItems
          handleLogout={vi.fn()}
          username={undefined}
          userId="user-123"
          isAdmin={false}
        />,
      );

      expect(
        screen.getByRole("button", { name: /welcome guest/i }),
      ).toBeInTheDocument();
    });

    it("disables the User Profile link when userId is not provided", async () => {
      /**
       * The component applies `disabled={!userId}` to the profile NavDropdown.Item.
       * A missing userId must produce a DISABLED link — not a broken
       * '/users/undefined/user-profile' URL that silently 404s.
       *
       * Bootstrap's NavDropdown.Item with disabled={true} renders an anchor
       * with aria-disabled="true", which is the correct semantic pattern for
       * an unavailable navigation option.
       */
      const user = userEvent.setup();

      renderWithProviders(
        <AuthenticatedNavItems
          handleLogout={vi.fn()}
          userId={undefined}
          username="alice"
          isAdmin={false}
        />,
      );

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));

      const profileLink = await screen.findByRole("link", {
        name: /user profile/i,
      });

      expect(profileLink).toHaveAttribute("aria-disabled", "true");
    });

    it("defaults to the regular user branch (Create Post) when isAdmin is undefined", async () => {
      /**
       * `undefined` is falsy, so the component correctly falls back to the
       * regular user path. This is the *safe* default — it's better to
       * accidentally show 'Create Post' to an admin than to show 'Admin
       * Dashboard' to a regular user.
       */
      const user = userEvent.setup();

      renderWithProviders(
        <AuthenticatedNavItems
          handleLogout={vi.fn()}
          isAdmin={undefined}
          userId="user-123"
          username="alice"
        />,
      );

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));

      expect(
        await screen.findByRole("link", { name: /create post/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /admin dashboard/i }),
      ).not.toBeInTheDocument();
    });
  });
});
