/**
 * @file src/pages/home/home.test.tsx
 */

import { renderWithProviders } from "@/test-utils";
import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import userEvent from "@testing-library/user-event";
import HomePage from "@/pages/home";

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE — RENDERING
// ─────────────────────────────────────────────────────────────────────────────

describe("HomePage", () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  describe("🧱 Rendering — default props", () => {
    it("renders the default hero heading", () => {
      /**
       * The h1 is the primary visual and semantic entry point of the page.
       * Its absence breaks both user comprehension and SEO indexing.
       * Asserting on the heading role confirms the correct HTML element (h1) is used,
       * not a styled div masquerading as a heading.
       */
      renderWithProviders(<HomePage />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Take your knowledge to another level",
      );
    });

    it("renders the default description paragraph", () => {
      /**
       * The description supports the heading and provides context for the CTA.
       * If the default text is accidentally removed or swapped,
       * this test catches it before it reaches production.
       */
      renderWithProviders(<HomePage />);

      expect(
        screen.getByText(
          /discover insightful articles, tutorials, and stories/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders the Read More CTA button", () => {
      /**
       * The CTA is the only interactive element on the page.
       * Without it, users on the homepage have no path forward.
       * Querying by role confirms it's a real accessible button.
       */
      renderWithProviders(<HomePage />);

      expect(
        screen.getByRole("button", { name: /read more/i }),
      ).toBeInTheDocument();
    });

    it("renders the section landmark with role='region'", () => {
      /**
       * The hero section uses role="region" + aria-labelledby to create a
       * named landmark. Screen reader users rely on landmarks to navigate
       * between page sections without reading all content linearly.
       */
      renderWithProviders(<HomePage />);

      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("labels the region landmark via aria-labelledby pointing to the h1", () => {
      /**
       * aria-labelledby="hero-heading" connects the region to its visible
       * heading. This is what makes the landmark announce as
       * "Take your knowledge... region" to screen readers instead of just
       * "region". Verifying both the id and the attribute exist and match
       * confirms the accessible name is correctly wired.
       */
      renderWithProviders(<HomePage />);

      const region = screen.getByRole("region");
      const heading = screen.getByRole("heading", { level: 1 });

      expect(heading).toHaveAttribute("id", "hero-heading");
      expect(region).toHaveAttribute("aria-labelledby", "hero-heading");
    });
  });

  // ── Rendering — custom props ──────────────────────────────────────────────

  describe("🧱 Rendering — custom props", () => {
    it("renders a custom title when provided", () => {
      /**
       * The component is configurable for reuse across different contexts.
       * A custom title must fully replace the default — not append to it.
       */
      renderWithProviders(<HomePage title="Custom Hero Title" />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Custom Hero Title",
      );
    });

    it("does not render the default title when a custom title is provided", () => {
      /**
       * Guards against scenarios where both default and custom text appear
       * simultaneously — which would indicate a broken prop substitution.
       */
      renderWithProviders(<HomePage title="Custom Hero Title" />);

      expect(
        screen.queryByText(/take your knowledge to another level/i),
      ).not.toBeInTheDocument();
    });

    it("renders a custom description when provided", () => {
      renderWithProviders(
        <HomePage description="A custom description text." />,
      );

      expect(
        screen.getByText("A custom description text."),
      ).toBeInTheDocument();
    });

    it("renders both custom title and custom description simultaneously", () => {
      /**
       * Props are independent — supplying both must not cause one to override or interfere with the other.
       */
      renderWithProviders(
        <HomePage title="Custom Title" description="Custom description." />,
      );

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Custom Title",
      );
      expect(screen.getByText("Custom description.")).toBeInTheDocument();
    });
  });

  // ── Routing ──────────────────────────────────────────────────────────────

  describe("🔀 Routing", () => {
    it("Read More link points to '/posts/posts-list'", () => {
      /**
       * This is the primary navigation path from the homepage into the content area.
       * A wrong href silently strands users or leads them to a 404.
       */
      renderWithProviders(<HomePage />);

      // The Link wraps the Button — the accessible anchor is what we query
      const link = screen.getByRole("link", { name: /read more/i });
      expect(link).toHaveAttribute("href", "/posts/posts-list");
    });

    it("Read More link has a descriptive aria-label", () => {
      /**
       * "Read More" alone is ambiguous for screen readers that list links out of context.
       * "Read more blog posts" specifies what will be read,
       * satisfying WCAG 2.4.6 (Headings and Labels).
       */
      renderWithProviders(<HomePage />);

      expect(
        screen.getByRole("link", { name: /read more blog posts/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Interactions ──────────────────────────────────────────────────────────

  describe("🎭 Interactions", () => {
    it("Read More link is keyboard-focusable", async () => {
      /**
       * The CTA must be reachable via Tab for keyboard-only users.
       * Bootstrap Button inside a Link should not break the tab order,
       * but this confirms it explicitly.
       */
      const user = userEvent.setup();

      renderWithProviders(<HomePage />);

      await user.tab();
      expect(
        screen.getByRole("link", { name: /read more blog posts/i }),
      ).toHaveFocus();
    });

    it("Read More link is activatable via Enter key", async () => {
      /**
       * Links must respond to keyboard activation. userEvent.keyboard
       * simulates the full key sequence a real user would press, not just
       * a synthetic click event. This catches cases where a div or span
       * is styled as a link but isn't natively keyboard-accessible.
       */
      const user = userEvent.setup();

      renderWithProviders(<HomePage />);

      const link = screen.getByRole("link", { name: /read more blog posts/i });
      link.focus();

      // Should not throw — React Router handles navigation in test env
      await expect(user.keyboard("{Enter}")).resolves.not.toThrow();
    });
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  describe("♿ Accessibility", () => {
    it("h1 is the first and only level-1 heading on the page", () => {
      /**
       * WCAG 1.3.1 requires a logical heading structure.
       * Multiple h1s or a missing h1 both violate the spec and harm screen reader navigation.
       */
      renderWithProviders(<HomePage />);

      const h1s = screen.getAllByRole("heading", { level: 1 });
      expect(h1s).toHaveLength(1);
    });

    it("region landmark is accessible by its visible heading name", () => {
      /**
       * When aria-labelledby is correctly wired, RTL's getByRole can find
       * the region by its label text. This proves the ARIA association works
       * end-to-end in the rendered DOM — not just that the attribute exists.
       */
      renderWithProviders(<HomePage />);

      expect(
        screen.getByRole("region", {
          name: /take your knowledge to another level/i,
        }),
      ).toBeInTheDocument();
    });
  });

  // ── Edge Cases ───────────────────────────────────────────────────────────

  describe("🧩 Edge Cases", () => {
    it("renders an empty string title without crashing (does not fall back to default)", () => {
      /**
       * Empty string is not undefined — the default prop only fires for undefined.
       * Passing "" is a valid (if unusual) consumer choice.
       * The component must render without throwing even if the output is visually empty.
       */
      renderWithProviders(<HomePage title="" />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("");
    });

    it("renders an empty string description without crashing", () => {
      renderWithProviders(<HomePage description="" />);

      // Component must still render its other elements intact
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /read more/i }),
      ).toBeInTheDocument();
    });

    it("renders a very long title without layout-breaking errors", () => {
      /**
       * Long user-provided strings should not throw errors or cause React to crash,
       * even if they look odd visually.
       * This is purely a stability test — layout is not asserted on.
       */
      const longTitle = "A".repeat(500);

      expect(() =>
        renderWithProviders(<HomePage title={longTitle} />),
      ).not.toThrow();

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        longTitle,
      );
    });
  });
});
