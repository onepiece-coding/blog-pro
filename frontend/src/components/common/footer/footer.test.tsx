/**
 * @file src/components/common/footer/footer.test.tsx
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Footer from "@/components/common/footer";

/**
 * Footer has no Redux state and no React Router dependencies,
 * so we use RTL's plain render() directly — no renderWithProviders needed.
 * This keeps the tests minimal and makes it explicit that Footer is a
 * fully self-contained presentational component.
 */

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

describe("Footer", () => {
  // ── Rendering — default props ─────────────────────────────────────────────

  describe("🧱 Rendering — default props", () => {
    it("renders the contentinfo landmark", () => {
      /**
       * The <footer> element with role="contentinfo" is a named ARIA landmark.
       * Screen reader users rely on it to jump directly to footer content.
       * Its absence means they must read through the entire page to reach it.
       */
      render(<Footer />);

      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("renders the copyright symbol", () => {
      /**
       * The © symbol is a legally significant marker.
       * Its absence could be a legal oversight in a production application.
       * We assert on the symbol directly rather than the full string to keep the test resilient to year changes.
       */
      render(<Footer />);

      expect(screen.getByRole("contentinfo")).toHaveTextContent("©");
    });

    it("renders the current year by default", () => {
      /**
       * The default copyrightYear is new Date().getFullYear() — it must
       * match the actual current year at test runtime, not a hardcoded value.
       * Hardcoding 2024 here would cause a false failure every January 1st.
       */
      render(<Footer />);

      const currentYear = new Date().getFullYear().toString();
      expect(screen.getByRole("contentinfo")).toHaveTextContent(currentYear);
    });

    it("renders the default company name 'Blog Pro'", () => {
      render(<Footer />);

      expect(screen.getByRole("contentinfo")).toHaveTextContent("Blog Pro");
    });

    it("renders the full default copyright string", () => {
      /**
       * Verifies that the year, company name, and static text are all
       * assembled correctly in the final output.
       * A formatting regression (e.g., missing space or period) would be caught here.
       */
      render(<Footer />);

      const currentYear = new Date().getFullYear();
      expect(screen.getByRole("contentinfo")).toHaveTextContent(
        `© ${currentYear} Blog Pro. All rights reserved.`,
      );
    });
  });

  // ── Rendering — custom props ──────────────────────────────────────────────

  describe("🧱 Rendering — custom props", () => {
    it("renders a custom copyrightYear when provided", () => {
      /**
       * A hardcoded historical year (e.g., the founding year of the company)
       * is a valid use case. The component must accept and display it faithfully.
       */
      render(<Footer copyrightYear={2020} />);

      expect(screen.getByRole("contentinfo")).toHaveTextContent("2020");
    });

    it("does not render the current year when a custom copyrightYear is provided", () => {
      /**
       * Guards against the scenario where both the custom year and the
       * default year appear simultaneously in the rendered output.
       */
      const currentYear = new Date().getFullYear();

      render(<Footer copyrightYear={2020} />);

      // Only relevant if the current year differs from 2020
      if (currentYear !== 2020) {
        expect(screen.getByRole("contentinfo")).not.toHaveTextContent(
          currentYear.toString(),
        );
      }
    });

    it("renders a custom companyName when provided", () => {
      render(<Footer companyName="Acme Corp" />);

      expect(screen.getByRole("contentinfo")).toHaveTextContent("Acme Corp");
    });

    it("renders both custom copyrightYear and companyName simultaneously", () => {
      /**
       * Both props are independent — providing both must produce the correct
       * combined output with no prop interference.
       */
      render(<Footer copyrightYear={2021} companyName="My Company" />);

      expect(screen.getByRole("contentinfo")).toHaveTextContent(
        "© 2021 My Company. All rights reserved.",
      );
    });

    it("renders the full copyright string with custom values correctly formatted", () => {
      /**
       * Tests the assembled output in full — year, name, and static suffix
       * must be in the right order with correct spacing and punctuation.
       */
      render(<Footer copyrightYear={2019} companyName="Test Corp" />);

      expect(screen.getByRole("contentinfo")).toHaveTextContent(
        "© 2019 Test Corp. All rights reserved.",
      );
    });
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  describe("♿ Accessibility", () => {
    it("uses the native <footer> element, which maps to role='contentinfo'", () => {
      /**
       * Native HTML elements carry implicit ARIA roles. Using <footer> is
       * preferable to <div role="contentinfo"> because it also conveys
       * semantic meaning to non-ARIA-aware tools (e.g., RSS readers, search
       * engines). This test confirms the role is present, implying the
       * correct element is used.
       */
      render(<Footer />);

      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("there is exactly one contentinfo landmark on the page", () => {
      /**
       * WCAG requires that contentinfo (footer) appears only once per page.
       * Multiple footers would confuse assistive technologies and violate
       * the landmark uniqueness requirement.
       */
      render(<Footer />);

      expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    });

    it("copyright text is readable as a single coherent string", () => {
      /**
       * The paragraph must not be split across multiple elements in a way
       * that breaks the reading flow for screen readers. toHaveTextContent
       * concatenates text from child nodes, so this confirms the full
       * message reads as one continuous sentence.
       */
      render(<Footer copyrightYear={2024} companyName="Blog Pro" />);

      const footer = screen.getByRole("contentinfo");
      expect(footer.textContent?.trim()).toBe(
        "© 2024 Blog Pro. All rights reserved.",
      );
    });
  });

  // ── Edge Cases ───────────────────────────────────────────────────────────

  describe("🧩 Edge Cases", () => {
    it("renders year 0 correctly — does NOT fall back to current year", () => {
      /**
       * 0 is falsy in JavaScript, but it is NOT undefined. The default prop
       * only activates for undefined. Passing copyrightYear={0} must display
       * "0", not the current year. This documents the current behaviour and
       * guards against accidental falsy-checking in future changes.
       */
      render(<Footer copyrightYear={0} />);

      expect(screen.getByRole("contentinfo")).toHaveTextContent("0");
    });

    it("renders an empty companyName string without crashing", () => {
      /**
       * An empty string is not undefined — default prop does not activate.
       * The component must render without throwing even though the result
       * looks like "© 2024 . All rights reserved."
       */
      expect(() => render(<Footer companyName="" />)).not.toThrow();
    });

    it("renders a very long company name without throwing", () => {
      /**
       * No truncation or character limit is enforced at the component level.
       * The component must accept any string length without crashing —
       * layout concerns are left to CSS.
       */
      const longName = "A".repeat(300);

      expect(() => render(<Footer companyName={longName} />)).not.toThrow();
      expect(screen.getByRole("contentinfo")).toHaveTextContent(longName);
    });

    it("renders a far-future year without throwing", () => {
      /**
       * Year values are not validated. A far-future year (e.g., from a
       * misconfigured CMS) should render as-is rather than crash.
       */
      expect(() => render(<Footer copyrightYear={9999} />)).not.toThrow();
      expect(screen.getByRole("contentinfo")).toHaveTextContent("9999");
    });
  });
});
