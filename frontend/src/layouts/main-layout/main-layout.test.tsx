/**
 * @file src/layouts/main-layout/main-layout.test.tsx
 */

import { renderWithProviders, regularUser, adminUser } from "@/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCKS
// All vi.mock() calls must be at the top level — before any imports that
// depend on them — because Vitest hoists them to the top of the file.
// ─────────────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    // Outlet renders nothing in tests — we only care about the Navbar
    Outlet: () => <div data-testid="outlet" />,
  };
});

// Stub ToastContainer — no need for its full dependency tree in nav tests
vi.mock("@/components/feedback", () => ({
  ToastContainer: () => null,
}));

// Stub Footer to keep renders lightweight
vi.mock("@/components/common", async () => {
  const actual = await vi.importActual<typeof import("@/components/common")>(
    "@/components/common",
  );
  return {
    ...actual,
    Footer: () => <footer data-testid="footer" />,
  };
});

// Dynamic import AFTER mocks are registered
const { default: MainLayout } = await import("@/layouts/main-layout");

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render MainLayout with a store that needs direct spy access.
 * Used in tests that call vi.spyOn(store, "dispatch") — those tests need
 * to hold a reference to the store BEFORE rendering, which renderWithProviders
 * supports via its returned `store` property.
 */
const renderMainLayout = (preloadedState = {}) => {
  return renderWithProviders(<MainLayout />, { preloadedState });
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("MainLayout — integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Unauthenticated state ─────────────────────────────────────────────

  describe("🗃️ Redux State — unauthenticated", () => {
    it("renders Register and Login links when the user is not logged in", () => {
      /**
       * The most fundamental routing invariant: logged-out users see the
       * sign-up/sign-in affordances. If this fails, guests are stuck.
       */
      renderMainLayout({ auth: { user: null, accessToken: null } });

      expect(
        screen.getByRole("link", { name: /register/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    });

    it("does NOT render the user dropdown when unauthenticated", () => {
      /**
       * Authenticated nav items must be completely absent for guests — not
       * just disabled. Any leak of authenticated UI is a trust/UX failure.
       */
      renderMainLayout({ auth: { user: null, accessToken: null } });

      expect(
        screen.queryByRole("button", { name: /welcome/i }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Authenticated state — regular user ────────────────────────────────

  describe("🗃️ Redux State — authenticated regular user", () => {
    it("renders the username greeting dropdown for authenticated users", () => {
      /**
       * When a user is logged in the entire nav structure changes.
       * This is the entry point to all authenticated navigation.
       */
      renderMainLayout({
        auth: { user: regularUser, accessToken: "fake-token-abc" },
      });

      expect(
        screen.getByRole("button", { name: /welcome alice/i }),
      ).toBeInTheDocument();
    });

    it("does NOT render Register or Login links for authenticated users", () => {
      /**
       * Showing 'Login' to a logged-in user is confusing and could trigger
       * unintended re-authentication flows.
       */
      renderMainLayout({
        auth: { user: regularUser, accessToken: "fake-token-abc" },
      });

      expect(
        screen.queryByRole("link", { name: /register/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /login/i }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Logout flow ───────────────────────────────────────────────────────

  describe("🎭 Interactions — logout flow", () => {
    it("clears auth state and navigates to /auth/login when Logout is clicked", async () => {
      const { store } = renderMainLayout({
        auth: { user: regularUser, accessToken: "fake-token-abc" },
      });

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));
      await user.click(await screen.findByRole("button", { name: /logout/i }));

      // 1. Reducer ran — auth state is cleared
      await waitFor(() => {
        expect(store.getState().auth.user).toBeNull();
        expect(store.getState().auth.accessToken).toBeNull();
      });

      // 2. Navigation happened
      expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it("renders unauthenticated nav items after logout completes", async () => {
      /**
       * After state is cleared the component should re-render with guest nav.
       * This closes the loop — the UI must react to the store change,
       * not just the store change happening in isolation.
       */
      renderMainLayout({
        auth: { user: regularUser, accessToken: "fake-token-abc" },
      });

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /welcome alice/i }));
      await user.click(await screen.findByRole("button", { name: /logout/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /register/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: /login/i }),
        ).toBeInTheDocument();
      });
    });
  });

  // ── Admin user ─────────────────────────────────────────────────────────

  describe("🗃️ Redux State — authenticated admin user", () => {
    it("renders Admin Dashboard link (not Create Post) for admin users", async () => {
      /**
       * The Redux → prop → render pipeline for the admin branch.
       * Verifies that selectIsAdmin correctly flows through MainLayout
       * into AuthenticatedNavItems.
       */
      renderMainLayout({
        auth: { user: adminUser, accessToken: "admin-token-xyz" },
      });

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /welcome bob/i }));

      expect(
        await screen.findByRole("link", { name: /admin dashboard/i }),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: /create post/i }),
      ).not.toBeInTheDocument();
    });
  });
});
