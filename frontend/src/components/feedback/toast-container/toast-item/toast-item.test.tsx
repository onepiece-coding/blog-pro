/**
 * @file src/components/feedback/toast-container/toast-item/toast-item.test.tsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, act, fireEvent } from "@testing-library/react";
import { renderWithStore, makeToast } from "@/test-utils";

import ToastContainer from "@/components/feedback/toast-container";

// ─────────────────────────────────────────────────────────────────────────────
// TOAST ITEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ToastItem is imported via ToastContainer. We can also test it in isolation
 * by rendering ToastContainer with a single pre-loaded toast.
 *
 * Timer tests use vi.useFakeTimers() to control setInterval and setTimeout
 * without waiting 4+ seconds in real time.
 */

describe("ToastItem", () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  describe("🧱 Rendering", () => {
    it("renders the toast message", () => {
      renderWithStore(<ToastContainer position="bottom-right" />, {
        preloadedState: {
          toasts: { records: [makeToast({ message: "Hello toast!" })] },
        },
      });

      expect(screen.getByText("Hello toast!")).toBeInTheDocument();
    });

    it("renders the close button", () => {
      /**
       * The close button is the manual dismiss affordance. It must always
       * be present for users who want to clear a toast before it auto-dismisses.
       */
      renderWithStore(<ToastContainer position="bottom-right" />, {
        preloadedState: {
          toasts: { records: [makeToast()] },
        },
      });

      expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
    });

    it("renders the progress bar span", () => {
      /**
       * The progress bar is the visual timer indicator. It starts at 0%
       * width and grows to 100% over 4000ms.
       */
      const { container } = renderWithStore(
        <ToastContainer position="bottom-right" />,
        {
          preloadedState: {
            toasts: { records: [makeToast()] },
          },
        },
      );

      expect(container.querySelector(".placeholder")).toBeInTheDocument();
    });

    it("applies the correct Bootstrap alert variant class", () => {
      /**
       * The toast type maps to Bootstrap's alert-{type} class.
       * "alert-danger" for errors, "alert-success" for confirmations etc.
       */
      const { container } = renderWithStore(
        <ToastContainer position="bottom-right" />,
        {
          preloadedState: {
            toasts: { records: [makeToast({ type: "danger" })] },
          },
        },
      );

      expect(container.querySelector(".alert-danger")).toBeInTheDocument();
    });
  });

  // ── Manual close ─────────────────────────────────────────────────────────

  describe("🎭 Interactions — manual close", () => {
    /**
     * WHY fireEvent INSTEAD OF userEvent HERE:
     *
     * userEvent.setup() creates internal setTimeout calls at instantiation.
     * When vi.useFakeTimers() is already active, those internal timers are
     * fake and interfere with manual timer advancement, causing deadlocks.
     *
     * fireEvent.click() is fully synchronous — no internal timers — making
     * it the correct tool when fake timers are in play. We only use userEvent
     * in tests where real timers run (rendering, hover interactions, etc.).
     */

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("dispatches removeToast after clicking the close button", async () => {
      /**
       * Clicking close triggers setIsExiting(true) then a 400ms setTimeout
       * before dispatch(removeToast(id)). We advance fake timers past 400ms
       * to flush the setTimeout and let the Redux action fire.
       *
       * await act(async () => ...) is required — advanceTimersByTime flushes
       * timers synchronously but the resulting state updates and promise
       * resolutions need the microtask queue to drain, which only happens
       * inside an async act() boundary.
       */
      const { store } = renderWithStore(
        <ToastContainer position="bottom-right" />,
        {
          preloadedState: {
            toasts: {
              records: [makeToast({ id: "close-me", message: "Close this" })],
            },
          },
        },
      );

      expect(store.getState().toasts.records).toHaveLength(1);

      // fireEvent is synchronous — safe with fake timers
      fireEvent.click(screen.getByRole("button"));

      // Flush the 400ms animation setTimeout + drain microtasks
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(store.getState().toasts.records).toHaveLength(0);
    });

    it("removes the toast from the DOM after close button click and animation", async () => {
      /**
       * End-to-end: click → setIsExiting → 400ms setTimeout → removeToast
       * dispatch → re-render → DOM cleared.
       */
      renderWithStore(<ToastContainer position="bottom-right" />, {
        preloadedState: {
          toasts: {
            records: [makeToast({ id: "dom-close", message: "Disappear!" })],
          },
        },
      });

      expect(screen.getByText("Disappear!")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button"));

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.queryByText("Disappear!")).not.toBeInTheDocument();
    });
  });

  // ── Auto-dismiss ──────────────────────────────────────────────────────────

  describe("🌐 Side Effects — auto-dismiss timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("does NOT dismiss before the full 4000ms has elapsed", async () => {
      /**
       * Verifies the timer runs for the full duration. An off-by-one in
       * the interval or progress comparison could cause premature dismissal.
       */
      const { store } = renderWithStore(
        <ToastContainer position="bottom-right" />,
        {
          preloadedState: {
            toasts: {
              records: [makeToast({ id: "no-early-dismiss" })],
            },
          },
        },
      );

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(store.getState().toasts.records).toHaveLength(1);
    });
  });

  // ── Hover pause ───────────────────────────────────────────────────────────

  describe("🎭 Interactions — hover pause", () => {
    /**
     * Hover tests use fireEvent.mouseEnter / fireEvent.mouseLeave.
     * These fire the events the component listens to (onMouseEnter /
     * onMouseLeave) synchronously, without userEvent's internal timer
     * overhead that conflicts with fake timers.
     */

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("pauses the auto-dismiss timer on mouseenter", async () => {
      /**
       * mouseEnter toggles pauseProgressBarIndicator to true, making the
       * interval callback a no-op. After what would normally be enough time
       * to auto-dismiss, the toast must still be in the store.
       */
      const { store } = renderWithStore(
        <ToastContainer position="bottom-right" />,
        {
          preloadedState: {
            toasts: { records: [makeToast({ id: "hover-pause" })] },
          },
        },
      );

      const toastEl = screen
        .getByText("Test notification message")
        .closest(".alert") as HTMLElement;

      // Fire mouseEnter synchronously to pause the timer
      fireEvent.mouseEnter(toastEl);

      // Advance well past the normal auto-dismiss window
      await act(async () => {
        vi.advanceTimersByTime(6000);
      });

      // Toast must still be present — timer was paused
      expect(store.getState().toasts.records).toHaveLength(1);
    });
  });
});
