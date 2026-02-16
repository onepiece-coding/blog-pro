/**
 * @file src/components/feedback/loading/loading.test.tsx
 *
 * Loading is a pure presentational component — no Redux, no Router.
 * Plain render() throughout.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Loading from "@/components/feedback/loading";

// ─────────────────────────────────────────────────────────────────────────────
// LOADING COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

describe("Loading", () => {
  // ── Pending state ─────────────────────────────────────────────────────────

  describe("🧱 Rendering — status='pending'", () => {
    it("renders the spinner when status is pending", () => {
      /**
       * The spinner provides visual feedback that an async operation is in progress.
       * Its role="status" is the accessible equivalent.
       */
      render(
        <Loading status="pending" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("does NOT render children while pending", () => {
      /**
       * Children represent the success content.
       * Showing it before the operation completes would be premature and potentially misleading.
       */
      render(
        <Loading status="pending" error={null}>
          <div>Success content</div>
        </Loading>,
      );

      expect(screen.queryByText("Success content")).not.toBeInTheDocument();
    });

    it("does NOT render an error state while pending", () => {
      render(
        <Loading status="pending" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it("sets aria-busy='true' on the container when pending", () => {
      /**
       * aria-busy signals to screen readers that the region is loading.
       * Without it, a screen reader user gets no indication that content
       * is forthcoming — they might think the page is empty.
       */
      const { container } = render(
        <Loading status="pending" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
    });

    it("container has aria-live='polite'", () => {
      /**
       * aria-live="polite" means updates are announced after the user
       * finishes their current task — appropriate for loading states that
       * don't require immediate attention (unlike errors which use assertive).
       */
      const { container } = render(
        <Loading status="pending" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(container.firstChild).toHaveAttribute("aria-live", "polite");
    });
  });

  // ── Failed state ──────────────────────────────────────────────────────────

  describe("🧱 Rendering — status='failed'", () => {
    it("renders the error message when status is failed", () => {
      /**
       * The error message (from the server or a fallback) must be visible
       * so users understand why their request failed.
       */
      render(
        <Loading status="failed" error="Something went wrong">
          <div>Content</div>
        </Loading>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("renders 'Unknown error' fallback when error is null but status is failed", () => {
      /**
       * `error ?? "Unknown error"` ensures LottieHandler always receives
       * a non-null message even when the error state wasn't populated.
       */
      render(
        <Loading status="failed" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(screen.getByText("Unknown error")).toBeInTheDocument();
    });

    it("does NOT render children when status is failed", () => {
      render(
        <Loading status="failed" error="Error occurred">
          <div>Success content</div>
        </Loading>,
      );

      expect(screen.queryByText("Success content")).not.toBeInTheDocument();
    });

    it("does NOT render the spinner when status is failed", () => {
      render(
        <Loading status="failed" error="Error occurred">
          <div>Content</div>
        </Loading>,
      );

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("sets aria-busy='false' on the container when failed", () => {
      /**
       * Loading is complete (even if it failed) — aria-busy must be false
       * so screen readers don't keep announcing an ongoing operation.
       */
      const { container } = render(
        <Loading status="failed" error="Error">
          <div>Content</div>
        </Loading>,
      );

      expect(container.firstChild).toHaveAttribute("aria-busy", "false");
    });
  });

  // ── Succeeded state ───────────────────────────────────────────────────────

  describe("🧱 Rendering — status='succeeded'", () => {
    it("renders children when status is succeeded", () => {
      /**
       * Children are the success payload — they must appear once the
       * operation completes successfully.
       */
      render(
        <Loading status="succeeded" error={null}>
          <div>Verification success content</div>
        </Loading>,
      );

      expect(
        screen.getByText("Verification success content"),
      ).toBeInTheDocument();
    });

    it("does NOT render the spinner when succeeded", () => {
      render(
        <Loading status="succeeded" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("does NOT render an error state when succeeded", () => {
      render(
        <Loading status="succeeded" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(screen.queryByText("Unknown error")).not.toBeInTheDocument();
    });

    it("sets aria-busy='false' on the container when succeeded", () => {
      const { container } = render(
        <Loading status="succeeded" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(container.firstChild).toHaveAttribute("aria-busy", "false");
    });
  });

  // ── Idle state ────────────────────────────────────────────────────────────

  describe("🧱 Rendering — status='idle'", () => {
    it("renders nothing (no spinner, no error, no children) when status is idle", () => {
      /**
       * Idle is the pre-fetch state. Nothing should render — the component
       * is waiting for the operation to start.
       */
      render(
        <Loading status="idle" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("sets aria-busy='false' when status is idle", () => {
      const { container } = render(
        <Loading status="idle" error={null}>
          <div>Content</div>
        </Loading>,
      );

      expect(container.firstChild).toHaveAttribute("aria-busy", "false");
    });
  });
});
