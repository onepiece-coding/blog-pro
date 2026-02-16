/**
 * @file src/components/common/navbar/navbar.test.tsx
 */

import { renderWithProviders } from "@/test-utils";
import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import userEvent from "@testing-library/user-event";
import Navbar from "@/components/common/navbar";

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR SHELL
// ─────────────────────────────────────────────────────────────────────────────

describe("Navbar — shell component", () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  describe("🧱 Rendering", () => {
    it("renders the default brand text 'Blog Pro' when no brandText prop is supplied", () => {
      renderWithProviders(
        <Navbar>
          <span>child</span>
        </Navbar>,
      );

      expect(
        screen.getByRole("link", { name: /navigate to blog pro homepage/i }),
      ).toHaveTextContent("Blog Pro");
    });

    it("renders a custom brandText when one is supplied", () => {
      renderWithProviders(
        <Navbar brandText="My Custom Blog">
          <span>child</span>
        </Navbar>,
      );

      expect(
        screen.getByRole("link", { name: /navigate to blog pro homepage/i }),
      ).toHaveTextContent("My Custom Blog");
    });

    it("renders children inside the nav", () => {
      /**
       * The Navbar is a slot-based layout component.
       * Its only job regarding children is to render them.
       * This confirms the slot works.
       */
      renderWithProviders(
        <Navbar>
          <button>Test Child</button>
        </Navbar>,
      );

      expect(
        screen.getByRole("button", { name: /test child/i }),
      ).toBeInTheDocument();
    });

    it("renders the <nav> landmark element for screen readers", () => {
      /**
       * The component passes `role="navigation"` and `as="nav"` to Bootstrap.
       * Screen readers use this landmark to let users jump directly to the
       * navigation — losing it would be a significant a11y regression.
       */
      renderWithProviders(
        <Navbar>
          <span>child</span>
        </Navbar>,
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("applies the accessible label 'Main navigation' to the nav landmark", () => {
      /**
       * Pages with multiple nav landmarks (e.g., sidebar + header) require
       * distinct aria-labels so assistive tech can differentiate them.
       */
      renderWithProviders(
        <Navbar>
          <span>child</span>
        </Navbar>,
      );

      expect(
        screen.getByRole("navigation", { name: /main navigation/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Routing ──────────────────────────────────────────────────────────────

  describe("🔀 Routing", () => {
    it("brand link points to '/'", () => {
      /**
       * The brand is the universal 'take me home' affordance.
       * A broken href here would leave users stranded on deep pages with no escape hatch.
       */
      renderWithProviders(
        <Navbar>
          <span>child</span>
        </Navbar>,
      );

      expect(
        screen.getByRole("link", { name: /navigate to blog pro homepage/i }),
      ).toHaveAttribute("href", "/");
    });
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  describe("♿ Accessibility", () => {
    it("brand link has a descriptive aria-label for screen readers", () => {
      /**
       * 'Blog Pro' alone is a poor link description.
       * 'Navigate to Blog Pro homepage' tells a screen-reader user exactly where they'll land.
       */
      renderWithProviders(
        <Navbar>
          <span>child</span>
        </Navbar>,
      );

      const brandLink = screen.getByRole("link", {
        name: /navigate to blog pro homepage/i,
      });
      expect(brandLink).toHaveAttribute(
        "aria-label",
        "Navigate to Blog Pro homepage",
      );
    });

    it("brand link is keyboard-focusable", async () => {
      /**
       * Keyboard users navigate with Tab.
       * The brand link must be in the natural tab order.
       * So they can reach it without assistive shortcuts.
       */
      const user = userEvent.setup();

      renderWithProviders(
        <Navbar>
          <span>child</span>
        </Navbar>,
      );

      await user.tab();
      expect(
        screen.getByRole("link", { name: /navigate to blog pro homepage/i }),
      ).toHaveFocus();
    });
  });

  // ── Edge Cases ───────────────────────────────────────────────────────────

  describe("🧩 Edge Cases", () => {
    it("renders correctly when brandText is an empty string (does NOT fall back to default)", () => {
      /**
       * `brandText=""` is not undefined — the default prop only fires for undefined.
       * This documents the *current* (possibly unintended) behavior so any future fix is a deliberate, tested change.
       */
      renderWithProviders(
        <Navbar brandText="">
          <span>child</span>
        </Navbar>,
      );

      const brand = screen.getByRole("link", {
        name: /navigate to blog pro homepage/i,
      });
      expect(brand).toBeInTheDocument();
      expect(brand).toHaveTextContent("");
    });

    it("renders correctly with no children (empty nav)", () => {
      /**
       * Guards against crashes when the parent conditionally renders nothing.
       * The shell should never throw just because its slot is empty.
       */
      expect(() => renderWithProviders(<Navbar>{null}</Navbar>)).not.toThrow();
    });
  });
});
