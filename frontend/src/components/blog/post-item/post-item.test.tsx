/**
 * @file src/components/blog/post-item/post-item.test.tsx
 *
 * PostItem is a presentational Card component that:
 * - Displays post image, title (clamped to 1 line), description (clamped to 3 lines)
 * - Has "Read More" button linking to /posts/{_id}/post-details
 * - Uses Bootstrap Card.Img, Card.Title, Card.Text, Card.Body
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { makePost } from "@/test-utils";

import PostItem from "@/components/blog/post-item";
import styles from "./styles.module.css";

const { clampText, clampTitle1Line, clampDescription3Lines } = styles;

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("PostItem", () => {
  const mockPost = makePost({
    _id: "post-123",
    title: "Amazing Blog Post Title",
    description:
      "This is a very interesting blog post description that talks about many things.",
    image: { url: "https://example.com/image.jpg", publicId: "img-123" },
  });

  /**
   * PostItem uses <Link>, so we must wrap it in MemoryRouter.
   */
  const renderPostItem = (post = mockPost) => {
    return render(
      <MemoryRouter>
        <PostItem {...post} />
      </MemoryRouter>,
    );
  };

  describe("🧱 Rendering", () => {
    it("renders the post image with correct src and alt", () => {
      renderPostItem();

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
      expect(img).toHaveAttribute("alt", "Amazing Blog Post Title");
    });

    it("renders the post title", () => {
      renderPostItem();

      expect(screen.getByText("Amazing Blog Post Title")).toBeInTheDocument();
    });

    it("renders the post description", () => {
      renderPostItem();

      expect(
        screen.getByText(/this is a very interesting blog post description/i),
      ).toBeInTheDocument();
    });

    it("renders 'Read More' button as a link", () => {
      renderPostItem();

      const readMore = screen.getByRole("link", { name: /read more/i });
      expect(readMore).toBeInTheDocument();
      expect(readMore).toHaveAttribute("href", "/posts/post-123/post-details");
    });
  });

  describe("🎨 CSS classes", () => {
    it("applies clampText and clampTitle1Line classes to the title", () => {
      renderPostItem();

      const title = screen.getByText("Amazing Blog Post Title");
      expect(title).toHaveClass(clampText);
      expect(title).toHaveClass(clampTitle1Line);
    });

    it("applies clampText and clampDescription3Lines classes to the description", () => {
      renderPostItem();

      const description = screen.getByText(/this is a very interesting/i);
      expect(description).toHaveClass(clampText);
      expect(description).toHaveClass(clampDescription3Lines);
    });
  });

  describe("🎭 Dynamic content", () => {
    it("renders different posts correctly", () => {
      const customPost = makePost({
        _id: "post-999",
        title: "Different Title",
        description: "Different description",
        image: { url: "https://example.com/other.jpg", publicId: "img-999" },
      });

      renderPostItem(customPost);

      expect(screen.getByText("Different Title")).toBeInTheDocument();
      expect(screen.getByText("Different description")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /read more/i })).toHaveAttribute(
        "href",
        "/posts/post-999/post-details",
      );
    });

    it("handles long titles by clamping them", () => {
      /**
       * CSS clamping isn't testable in JSDOM, but we can verify the class is applied.
       * Visual regression tests would catch actual overflow.
       */
      const longTitlePost = makePost({
        title:
          "This is an extremely long title that should be clamped to a single line when rendered in the UI",
      });

      renderPostItem(longTitlePost);

      const title = screen.getByText(/this is an extremely long title/i);
      expect(title).toHaveClass(clampTitle1Line);
    });
  });
});
