/**
 * @file src/components/common/heading/heading.test.tsx
 *
 * Heading is a pure presentational component with no Router or Redux
 * dependencies — plain render() is sufficient throughout.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Heading from "@/components/common/heading";

// ─────────────────────────────────────────────────────────────────────────────
// HEADING
// ─────────────────────────────────────────────────────────────────────────────

describe("Heading", () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  describe("🧱 Rendering", () => {
    it("renders an h1 element", () => {
      /**
       * Heading always renders an h1 — this is its core contract.
       * Querying by role: heading + level:1 confirms the real HTML element
       * is used, not a styled div. Changing to h2 would break this test
       * and force a deliberate decision.
       */
      render(<Heading id="test-heading" title="Hello World" />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("renders the provided title text inside the heading", () => {
      /**
       * The title prop is the visible text — the most important piece of
       * content the component delivers. A wrong or missing title silently
       * breaks both UX and SEO.
       */
      render(<Heading id="test-heading" title="Sign Up To Your Account" />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Sign Up To Your Account",
      );
    });

    it("applies the provided id attribute to the h1 element", () => {
      /**
       * The id is used externally via aria-labelledby to associate the heading with a region landmark.
       * If the id is dropped or wrong, the accessible name of the landmark breaks silently —
       * screen readers announce "region" instead of the heading text.
       */
      render(<Heading id="register-heading" title="Some Title" />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
        "id",
        "register-heading",
      );
    });

    it("does NOT apply the visually-hidden class by default (srOnly defaults to false)", () => {
      /**
       * When srOnly is omitted, the heading should be fully visible — it's
       * the primary page title and must render for sighted users too.
       */
      render(<Heading id="test-heading" title="Visible Heading" />);

      expect(screen.getByRole("heading", { level: 1 })).not.toHaveClass(
        "visually-hidden",
      );
    });

    it("applies the 'visually-hidden' class when srOnly is true", () => {
      /**
       * srOnly={true} hides the heading visually while keeping it in the
       * accessibility tree. This is the correct pattern for providing
       * screen-reader context without affecting visual design.
       * The class name "visually-hidden" is Bootstrap's standard utility.
       */
      render(<Heading id="test-heading" title="Screen Reader Only" srOnly />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
        "visually-hidden",
      );
    });

    it("heading remains in the accessibility tree when srOnly is true", () => {
      /**
       * visually-hidden hides with CSS (clip/overflow), not display:none or visibility:hidden.
       * The element must still be findable by role so screen readers can announce it.
       * If it were truly hidden from the a11y tree, getByRole would throw.
       */
      render(<Heading id="sr-heading" title="SR Only Heading" srOnly />);

      // getByRole would throw if the element were hidden from the a11y tree
      expect(
        screen.getByRole("heading", { level: 1, name: /sr only heading/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  describe("♿ Accessibility", () => {
    it("heading is findable by its text via getByRole — confirming accessible name", () => {
      /**
       * RTL's getByRole name option matches the accessible name of the element.
       * For headings this is their text content.
       * Passing means the heading's content is properly exposed to the accessibility tree.
       */
      render(<Heading id="a11y-heading" title="Accessible Heading Text" />);

      expect(
        screen.getByRole("heading", { name: /accessible heading text/i }),
      ).toBeInTheDocument();
    });

    it("id and title are independently settable for correct aria-labelledby wiring", () => {
      /**
       * Consumers of this component write aria-labelledby="some-id" on a parent landmark.
       * The id must match exactly.
       * This test renders with a specific id and confirms it's applied,
       * documenting the correct usage pattern.
       */
      render(<Heading id="hero-heading" title="Hero Section" />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveAttribute("id", "hero-heading");
      expect(heading).toHaveTextContent("Hero Section");
    });
  });

  // ── Edge Cases ───────────────────────────────────────────────────────────

  describe("🧩 Edge Cases", () => {
    it("renders without crashing when title is an empty string", () => {
      /**
       * An empty title is semantically poor but must not crash the component.
       * Empty headings can occur from misconfigured CMS data.
       */
      expect(() =>
        render(<Heading id="empty-heading" title="" />),
      ).not.toThrow();

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("");
    });

    it("renders a very long title without throwing", () => {
      /**
       * No character limit is enforced at this component level.
       * Long strings from external data sources must not break the render.
       */
      const longTitle = "Very Long Title ".repeat(50).trim();

      expect(() =>
        render(<Heading id="long-heading" title={longTitle} />),
      ).not.toThrow();
    });

    it("does not apply 'visually-hidden' when srOnly is explicitly false", () => {
      /**
       * Explicitly passing srOnly={false} must produce the same result as
       * omitting the prop (the default). Guards against accidental
       * negation bugs in the className logic.
       */
      render(
        <Heading id="test-heading" title="Explicit False" srOnly={false} />,
      );

      expect(screen.getByRole("heading", { level: 1 })).not.toHaveClass(
        "visually-hidden",
      );
    });

    it("does not leave a trailing space in className when srOnly is false", () => {
      /**
       * The component builds className via template literal + .trim().
       * Without .trim(), a falsy srOnly would produce className="heading " (trailing space).
       * While harmless in browsers, it's untidy and can cause issues with strict className matchers.
       * This confirms .trim() is working.
       */
      render(<Heading id="test-heading" title="No Trailing Space" />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.className).not.toMatch(/\s$/);
    });
  });
});
