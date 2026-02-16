/**
 * @file src/components/feedback/toast-container/toast-container.test.tsx
 *
 * ToastContainer reads from the Redux store via selectToasts.
 * ToastItem manages its own timer logic — we control time with vi.useFakeTimers.
 *
 * NOTE on fake timers + userEvent:
 * userEvent.setup() must be called BEFORE vi.useFakeTimers() installs,
 * OR you must pass { advanceTimers: vi.advanceTimersByTime } to userEvent.setup().
 * Both patterns are shown below depending on context.
 */

import { removeToast } from "@/store/toasts/toasts-slice";
import { renderWithStore, makeToast } from "@/test-utils";
import { screen, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import ToastContainer from "@/components/feedback/toast-container";

// ─────────────────────────────────────────────────────────────────────────────
// TOAST CONTAINER
// ─────────────────────────────────────────────────────────────────────────────

describe("ToastContainer", () => {
  describe("🧱 Rendering", () => {
    it("renders nothing when the toasts store is empty", () => {
      /**
       * An empty toasts array must produce no toast items.
       * Rendering a ghost toast (with empty content) would be a confusing visual artefact.
       */
      const { container } = renderWithStore(
        <ToastContainer position="bottom-right" />,
        { preloadedState: { toasts: { records: [] } } },
      );

      // The container div exists but has no toast children
      expect(container.querySelectorAll(".alert")).toHaveLength(0);
    });

    it("renders one toast item per record in the store", () => {
      /**
       * Each record in toasts.records must produce exactly one toast.
       * A 1:1 mapping ensures no duplicates and no missed toasts.
       */
      renderWithStore(<ToastContainer position="bottom-right" />, {
        preloadedState: {
          toasts: {
            records: [
              makeToast({ id: "t1", message: "First" }),
              makeToast({ id: "t2", message: "Second" }),
            ],
          },
        },
      });

      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });

    it("renders the toast message text", () => {
      renderWithStore(<ToastContainer position="bottom-right" />, {
        preloadedState: {
          toasts: { records: [makeToast({ message: "Profile saved!" })] },
        },
      });

      expect(screen.getByText("Profile saved!")).toBeInTheDocument();
    });

    it("renders the toast title when provided", () => {
      renderWithStore(<ToastContainer position="bottom-right" />, {
        preloadedState: {
          toasts: {
            records: [makeToast({ title: "Success", message: "Done!" })],
          },
        },
      });

      expect(screen.getByText("Success")).toBeInTheDocument();
    });

    it("falls back to the type as the title when title is null", () => {
      /**
       * The reducer sets title = payload.title || payload.type.
       * When title is null, the type ("success", "danger" etc.) is used.
       * This ensures the heading is never empty.
       */
      renderWithStore(<ToastContainer position="bottom-right" />, {
        preloadedState: {
          toasts: {
            records: [makeToast({ title: null, type: "success" })],
          },
        },
      });

      // The Toast component renders title || type
      expect(screen.getByText("success")).toBeInTheDocument();
    });

    it("applies the correct CSS position class based on the position prop", () => {
      /**
       * The container's visual placement is entirely driven by the position
       * prop via CSS modules. The class name must contain the position value
       * so the CSS rule targets it.
       */
      const { container } = renderWithStore(
        <ToastContainer position="top-left" />,
        { preloadedState: { toasts: { records: [] } } },
      );

      // CSS modules generate a class that includes the position key
      const wrapper = container.firstChild as HTMLElement;
      const classNames = wrapper.className;
      expect(classNames).toMatch(/top-left/);
    });
  });

  // ── Store integration ─────────────────────────────────────────────────────

  describe("🗃️ Redux State", () => {
    it("removing a record from the store removes the toast from the DOM", () => {
      /**
       * Tests the reactive connection: when removeToast is dispatched, the
       * selector re-runs, the component re-renders, and the toast disappears.
       */
      const { store } = renderWithStore(
        <ToastContainer position="bottom-right" />,
        {
          preloadedState: {
            toasts: {
              records: [
                makeToast({ id: "removable-toast", message: "Remove me" }),
              ],
            },
          },
        },
      );

      expect(screen.getByText("Remove me")).toBeInTheDocument();

      act(() => {
        store.dispatch(removeToast("removable-toast"));
      });

      expect(screen.queryByText("Remove me")).not.toBeInTheDocument();
    });

    it("adding a new record to the store renders a new toast", () => {
      /**
       * Tests the addToast → re-render pipeline. Confirms the selector
       * correctly reflects store additions in the UI.
       */
      const { store } = renderWithStore(
        <ToastContainer position="bottom-right" />,
        { preloadedState: { toasts: { records: [] } } },
      );

      act(() => {
        store.dispatch({
          type: "toasts/addToast",
          payload: { type: "primary", message: "Newly added toast" },
        });
      });

      expect(screen.getByText("Newly added toast")).toBeInTheDocument();
    });
  });
});
