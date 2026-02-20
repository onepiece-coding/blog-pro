/**
 * @file src/components/common/grid-list/grid-list.test.tsx
 *
 * GridList is a generic presentation component that:
 * - Takes an array of records (must have _id)
 * - Takes a renderItem function to render each record
 * - Shows LottieHandler with "No posts to show!" when empty
 * - Renders items in Bootstrap grid (Row > Col)
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import GridList from "@/components/common/grid-list";

// Stub LottieHandler to avoid SVG loading in tests
vi.mock("@/components/feedback/lottie-handler", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="lottie-empty">{message}</div>
  ),
}));

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("GridList", () => {
  const mockRecords = [
    { _id: "1", name: "Item 1" },
    { _id: "2", name: "Item 2" },
    { _id: "3", name: "Item 3" },
  ];

  const renderItem = (record: { _id: string; name: string }) => (
    <div data-testid={`item-${record._id}`}>{record.name}</div>
  );

  describe("🧱 Rendering — with records", () => {
    it("renders each record using the renderItem function", () => {
      render(<GridList records={mockRecords} renderItem={renderItem} />);

      expect(screen.getByTestId("item-1")).toHaveTextContent("Item 1");
      expect(screen.getByTestId("item-2")).toHaveTextContent("Item 2");
      expect(screen.getByTestId("item-3")).toHaveTextContent("Item 3");
    });

    it("renders the correct number of items", () => {
      render(<GridList records={mockRecords} renderItem={renderItem} />);

      expect(screen.getAllByTestId(/item-/)).toHaveLength(3);
    });

    it("does NOT render the empty state when records exist", () => {
      render(<GridList records={mockRecords} renderItem={renderItem} />);

      expect(screen.queryByTestId("lottie-empty")).not.toBeInTheDocument();
    });
  });

  describe("🧱 Rendering — empty state", () => {
    it("renders LottieHandler with 'No posts to show!' when records is empty", () => {
      render(<GridList records={[]} renderItem={renderItem} />);

      const lottie = screen.getByTestId("lottie-empty");
      expect(lottie).toBeInTheDocument();
      expect(lottie).toHaveTextContent("No posts to show!");
    });

    it("does NOT render any items when records is empty", () => {
      render(<GridList records={[]} renderItem={renderItem} />);

      expect(screen.queryByTestId(/item-/)).not.toBeInTheDocument();
    });
  });

  describe("🎭 Generic type support", () => {
    it("works with different record shapes as long as they have _id", () => {
      const posts = [
        { _id: "p1", title: "Post 1", content: "Content 1" },
        { _id: "p2", title: "Post 2", content: "Content 2" },
      ];

      render(
        <GridList
          records={posts}
          renderItem={(post) => <div data-testid={post._id}>{post.title}</div>}
        />,
      );

      expect(screen.getByTestId("p1")).toHaveTextContent("Post 1");
      expect(screen.getByTestId("p2")).toHaveTextContent("Post 2");
    });
  });
});
