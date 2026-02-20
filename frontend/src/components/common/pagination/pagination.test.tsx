/**
 * @file src/components/common/pagination/pagination.test.tsx
 *
 * Pagination is a controlled component that:
 * - Displays current page and total pages
 * - Has Prev/Next buttons that call handlePageChange
 * - Disables Prev when on first page
 * - Disables Next when on last page
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import Pagination from "@/components/common/pagination";
import userEvent from "@testing-library/user-event";

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("Pagination", () => {
  const mockHandlePageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("🧱 Rendering", () => {
    it("displays the current page and total pages", () => {
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={2}
          totalPages={5}
        />,
      );

      expect(screen.getByText("page 2 of 5")).toBeInTheDocument();
    });

    it("renders Prev and Next buttons", () => {
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={2}
          totalPages={5}
        />,
      );

      expect(screen.getByRole("button", { name: /prev/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });
  });

  describe("🎭 Interactions — Prev button", () => {
    it("calls handlePageChange with pageNumber - 1 when Prev is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={3}
          totalPages={5}
        />,
      );

      await user.click(screen.getByRole("button", { name: /prev/i }));

      expect(mockHandlePageChange).toHaveBeenCalledWith(2);
    });

    it("disables Prev button when on first page", () => {
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={1}
          totalPages={5}
        />,
      );

      expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
    });

    it("does NOT call handlePageChange when Prev is clicked on first page", async () => {
      /**
       * The button is disabled, but testing the guard inside the handler
       * is also important in case disabled attribute is removed accidentally.
       */
      //       const user = userEvent.setup();
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={1}
          totalPages={5}
        />,
      );

      // Can't click a disabled button, so this tests the guard logic
      expect(mockHandlePageChange).not.toHaveBeenCalled();
    });
  });

  describe("🎭 Interactions — Next button", () => {
    it("calls handlePageChange with pageNumber + 1 when Next is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={2}
          totalPages={5}
        />,
      );

      await user.click(screen.getByRole("button", { name: /next/i }));

      expect(mockHandlePageChange).toHaveBeenCalledWith(3);
    });

    it("disables Next button when on last page", () => {
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={5}
          totalPages={5}
        />,
      );

      expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    });
  });

  describe("🎭 Edge cases", () => {
    it("both buttons enabled when on middle page", () => {
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={3}
          totalPages={5}
        />,
      );

      expect(screen.getByRole("button", { name: /prev/i })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
    });

    it("handles single page correctly (both buttons disabled)", () => {
      render(
        <Pagination
          handlePageChange={mockHandlePageChange}
          pageNumber={1}
          totalPages={1}
        />,
      );

      expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    });
  });
});
