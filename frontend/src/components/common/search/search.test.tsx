/**
 * @file src/components/common/search/search.test.tsx
 *
 * Search is a controlled form component that:
 * - Has a single text input (FormField with RHF)
 * - Has Submit button (magnifying glass icon)
 * - Has Clear button (X icon) that resets form and calls handleSearchChange("")
 * - Calls handleSearchChange with trimmed search term on submit
 * - Label is srOnly (visually hidden but accessible)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import Search from "@/components/common/search";

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("Search", () => {
  const mockHandleSearchChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("🧱 Rendering", () => {
    it("renders the search input with accessible label", () => {
      render(
        <Search
          handleSearchChange={mockHandleSearchChange}
          label="Search Posts"
        />,
      );

      expect(screen.getByLabelText("Search Posts")).toBeInTheDocument();
    });

    it("label is visually hidden (srOnly)", () => {
      render(
        <Search
          handleSearchChange={mockHandleSearchChange}
          label="Search Term"
        />,
      );

      const label = document.querySelector('label[for="search-form__search"]');
      expect(label).toHaveClass("visually-hidden");
    });

    it("renders Submit button", () => {
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      // Submit button has type="submit", can find by role
      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find(
        (btn) => btn.getAttribute("type") === "submit",
      );
      expect(submitBtn).toBeInTheDocument();
    });

    it("renders Clear button", () => {
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      // Clear button has type="button" and variant="danger"
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2); // Clear + Submit
    });

    it("form has noValidate attribute", () => {
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      expect(document.querySelector("form")).toHaveAttribute("novalidate");
    });
  });

  describe("🎭 Interactions — Submit", () => {
    it("calls handleSearchChange with input value when form is submitted", async () => {
      const user = userEvent.setup();
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      await user.type(screen.getByLabelText("Search"), "test query");

      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find(
        (btn) => btn.getAttribute("type") === "submit",
      )!;
      await user.click(submitBtn);

      expect(mockHandleSearchChange).toHaveBeenCalledWith("test query");
    });

    it("trims whitespace from search term before calling handler", async () => {
      /**
       * Zod schema uses .trim() to remove leading/trailing spaces.
       * This prevents accidental whitespace-only searches.
       */
      const user = userEvent.setup();
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      await user.type(screen.getByLabelText("Search"), "  trimmed  ");

      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find(
        (btn) => btn.getAttribute("type") === "submit",
      )!;
      await user.click(submitBtn);

      expect(mockHandleSearchChange).toHaveBeenCalledWith("trimmed");
    });

    it("calls handleSearchChange with empty string when submitting empty input", async () => {
      const user = userEvent.setup();
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find(
        (btn) => btn.getAttribute("type") === "submit",
      )!;
      await user.click(submitBtn);

      expect(mockHandleSearchChange).toHaveBeenCalledWith("");
    });
  });

  describe("🎭 Interactions — Clear", () => {
    it("calls handleSearchChange with empty string when Clear is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      await user.type(screen.getByLabelText("Search"), "test query");

      const buttons = screen.getAllByRole("button");
      const clearBtn = buttons.find(
        (btn) => btn.getAttribute("type") === "button",
      )!;
      await user.click(clearBtn);

      expect(mockHandleSearchChange).toHaveBeenCalledWith("");
    });

    it("resets the input field when Clear is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      const input = screen.getByLabelText<HTMLInputElement>("Search");
      await user.type(input, "test query");
      expect(input.value).toBe("test query");

      const buttons = screen.getAllByRole("button");
      const clearBtn = buttons.find(
        (btn) => btn.getAttribute("type") === "button",
      )!;
      await user.click(clearBtn);

      expect(input.value).toBe("");
    });
  });

  describe("🎭 Form validation", () => {
    it("field is optional — submitting empty is valid", async () => {
      /**
       * searchSchema uses z.string().trim().optional()
       * Empty searches are allowed (returns all results).
       */
      const user = userEvent.setup();
      render(
        <Search handleSearchChange={mockHandleSearchChange} label="Search" />,
      );

      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find(
        (btn) => btn.getAttribute("type") === "submit",
      )!;
      await user.click(submitBtn);

      expect(mockHandleSearchChange).toHaveBeenCalledTimes(1);
    });
  });
});
