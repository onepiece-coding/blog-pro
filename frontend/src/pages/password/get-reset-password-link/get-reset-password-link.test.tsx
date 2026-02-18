/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file src/pages/password/get-reset-password-link/get-reset-password-link.test.tsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getResetPasswordLink } from "@/store/password/password-slice";
import { screen, act } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { useParams } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCKS
// ─────────────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(() => ({ userId: "user-abc", token: "token-xyz" })),
  };
});

vi.mock("@/store/password/password-slice", async () => {
  const actual = await vi.importActual<
    typeof import("@/store/password/password-slice")
  >("@/store/password/password-slice");
  return { ...actual, getResetPasswordLink: vi.fn() };
});

vi.mock("@/components/feedback/lottie-handler", () => ({
  default: ({
    type,
    message,
    title,
  }: {
    type: string;
    message: string;
    title: string;
  }) => (
    <div data-testid="lottie-handler" data-type={type} data-title={title}>
      {message}
    </div>
  ),
}));

const { default: GetResetPasswordLink } =
  await import("@/pages/password/get-reset-password-link");

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const mockSuccess = () => {
  vi.mocked(getResetPasswordLink).mockReturnValueOnce((() => {
    const p = Promise.resolve({
      type: "password/getResetPasswordLink/fulfilled",
    });
    (p as any).unwrap = () => Promise.resolve({});
    return p;
  }) as any);
};

/* const mockFailure = (message = "Invalid link") => {
  vi.mocked(getResetPasswordLink).mockReturnValueOnce((() => {
    const p = Promise.resolve({
      type: "password/getResetPasswordLink/rejected",
    });
    (p as any).unwrap = () => Promise.reject(new Error(message));
    return p;
  }) as any);
}; */

const mockPending = () => {
  vi.mocked(getResetPasswordLink).mockReturnValueOnce((() => {
    const p = new Promise(() => {}); // never resolves
    (p as any).unwrap = () => new Promise(() => {}); // also hangs
    return p;
  }) as any);
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("GetResetPasswordLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({
      userId: "user-abc",
      token: "token-xyz",
    });
    mockPending(); // default: hangs in pending
  });

  describe("🌐 Side Effects — dispatch on mount", () => {
    it("dispatches getResetPasswordLink with userId and token from URL params", () => {
      renderWithProviders(<GetResetPasswordLink />);
      expect(getResetPasswordLink).toHaveBeenCalledWith({
        userId: "user-abc",
        token: "token-xyz",
      });
      expect(getResetPasswordLink).toHaveBeenCalledTimes(1);
    });

    it("does NOT dispatch when userId is missing", () => {
      vi.mocked(useParams).mockReturnValue({ userId: undefined, token: "tok" });
      renderWithProviders(<GetResetPasswordLink />);
      expect(getResetPasswordLink).not.toHaveBeenCalled();
    });

    it("does NOT dispatch when token is missing", () => {
      vi.mocked(useParams).mockReturnValue({
        userId: "user-abc",
        token: undefined,
      });
      renderWithProviders(<GetResetPasswordLink />);
      expect(getResetPasswordLink).not.toHaveBeenCalled();
    });
  });

  describe("🧱 Rendering — pending state", () => {
    it("renders the loading spinner while verification is in progress", () => {
      renderWithProviders(<GetResetPasswordLink />, {
        preloadedState: {
          password: {
            operations: {
              getResetPasswordLink: "pending",
              resetPassword: "idle",
              sendResetPasswordLink: "idle",
            },
          },
        },
      });
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("🧱 Rendering — succeeded state", () => {
    it("renders the success lottie with correct message when link is valid", () => {
      renderWithProviders(<GetResetPasswordLink />, {
        preloadedState: {
          password: {
            operations: {
              getResetPasswordLink: "succeeded",
              resetPassword: "idle",
              sendResetPasswordLink: "idle",
            },
          },
        },
      });
      const lottie = screen.getByTestId("lottie-handler");
      expect(lottie).toHaveAttribute("data-type", "lottie-success");
      expect(lottie).toHaveTextContent(
        "Used url has been verified successfully",
      );
    });
  });

  describe("🧱 Rendering — failed state", () => {
    it("renders the error lottie when link verification fails", () => {
      renderWithProviders(<GetResetPasswordLink />, {
        preloadedState: {
          password: {
            operations: {
              getResetPasswordLink: "failed",
              resetPassword: "idle",
              sendResetPasswordLink: "idle",
            },
            errors: {
              getResetPasswordLink: "Invalid or expired link",
              resetPassword: null,
              sendResetPasswordLink: null,
            },
          },
        },
      });
      const lottie = screen.getByTestId("lottie-handler");
      expect(lottie).toHaveAttribute("data-type", "lottie-error");
      expect(lottie).toHaveTextContent("Invalid or expired link");
    });
  });

  describe("♿ Accessibility", () => {
    it("renders a region landmark labelled by the heading", () => {
      renderWithProviders(<GetResetPasswordLink />);
      expect(
        screen.getByRole("region", { name: /get the password reset link/i }),
      ).toBeInTheDocument();
    });

    it("heading is visually hidden but in the accessibility tree (srOnly)", () => {
      renderWithProviders(<GetResetPasswordLink />);
      const heading = screen.getByRole("heading", {
        level: 1,
        name: /get the password reset link/i,
      });
      expect(heading).toHaveClass("visually-hidden");
    });
  });

  describe("🌐 Side Effects — delayed navigation after success", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("does NOT navigate before 3 seconds have elapsed", async () => {
      vi.mocked(getResetPasswordLink).mockClear();
      mockSuccess();

      renderWithProviders(<GetResetPasswordLink />);

      await act(async () => {
        await Promise.resolve();
      });

      // Advance only 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("clears the timeout when the component unmounts before navigation", async () => {
      /**
       * The cleanup function calls clearTimeout(timeoutId) to prevent
       * navigation after unmount. This avoids a React warning about
       * calling navigate on an unmounted component.
       */
      vi.mocked(getResetPasswordLink).mockClear();
      mockSuccess();

      const { unmount } = renderWithProviders(<GetResetPasswordLink />);

      // Flush microtasks so the timeout is registered
      await act(async () => {
        await Promise.resolve();
      });

      // Unmount before the 3-second timeout fires
      unmount();

      // Advance past the timeout
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });

      // Navigation should NOT have happened
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("🌐 Side Effects — unmount cleanup", () => {
    it("clears the getResetPasswordLink error on unmount", () => {
      const { store, unmount } = renderWithProviders(<GetResetPasswordLink />, {
        preloadedState: {
          password: {
            errors: {
              getResetPasswordLink: "Old error",
              resetPassword: null,
              sendResetPasswordLink: null,
            },
          },
        },
      });
      expect(store.getState().password.errors.getResetPasswordLink).toBe(
        "Old error",
      );
      unmount();
      expect(store.getState().password.errors.getResetPasswordLink).toBeNull();
    });
  });
});
