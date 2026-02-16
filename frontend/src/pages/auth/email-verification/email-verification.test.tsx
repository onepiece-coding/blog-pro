/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file src/pages/auth/email-verification/email-verification.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { emailVerification } from "@/store/auth/auth-slice";
import { renderWithProviders } from "@/test-utils";
import { screen } from "@testing-library/react";
import { useParams } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useParams provides userId and token from the URL.
 * We mock it with vi.fn() so each test can supply different param
 * combinations (valid, missing userId, missing token, both missing).
 */
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useParams: vi.fn(() => ({
      userId: "user-abc-123",
      token: "verification-token-xyz",
    })),
  };
});

/**
 * emailVerification is the async thunk that hits the verification API.
 * We mock it to return a thunk (function) so RTK's serialization
 * middleware never inspects it, and we can control resolve/reject per test.
 *
 * The returned thunk must also have an `.abort()` method — the component
 * stores the dispatch result and calls `promise.abort()` on cleanup.
 */
vi.mock("@/store/auth/auth-slice", async () => {
  const actual = await vi.importActual<
    typeof import("@/store/auth/auth-slice")
  >("@/store/auth/auth-slice");
  return { ...actual, emailVerification: vi.fn() };
});

/**
 * LottieHandler renders SVG assets that Vitest/jsdom can't process.
 * We stub it at its module path so Loading's import picks up the stub.
 * Mocking the barrel export (@/components/feedback) doesn't work because
 * Loading imports LottieHandler via a relative path: "../lottie-handler".
 */
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

const { default: EmailVerification } =
  await import("@/pages/auth/email-verification");

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default mock: thunk that hangs (never resolves/rejects).
 * Used for tests that inspect the pending state.
 * Also exposes abort as a vi.fn() so cleanup tests can assert on it.
 */
const mockVerificationPending = () => {
  const abortMock = vi.fn();
  vi.mocked(emailVerification).mockReturnValueOnce((() => {
    const p = new Promise(() => {}); // never resolves
    (p as any).abort = abortMock;
    return p;
  }) as any);
  return { abortMock };
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

describe("EmailVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({
      userId: "user-abc-123",
      token: "verification-token-xyz",
    });
    // Default mock: dispatches but hangs (pending state)
    mockVerificationPending();
  });

  // ── Initial dispatch ──────────────────────────────────────────────────────

  describe("🌐 Side Effects — dispatch on mount", () => {
    it("dispatches emailVerification with userId and token from URL params", () => {
      /**
       * The entire purpose of this component is to trigger the verification
       * thunk with the URL params as soon as it mounts. If this call doesn't
       * happen, no verification occurs and the user's email stays unverified.
       */
      renderWithProviders(<EmailVerification />);

      expect(emailVerification).toHaveBeenCalledWith({
        userId: "user-abc-123",
        token: "verification-token-xyz",
      });
      expect(emailVerification).toHaveBeenCalledTimes(1);
    });

    it("does NOT dispatch emailVerification when userId is missing", () => {
      /**
       * The component guards: if (!userId || !token) return.
       * A missing param means the URL is malformed — dispatching with
       * undefined would send a broken API request.
       */
      vi.mocked(useParams).mockReturnValue({ userId: undefined, token: "tok" });

      renderWithProviders(<EmailVerification />);

      expect(emailVerification).not.toHaveBeenCalled();
    });

    it("does NOT dispatch emailVerification when token is missing", () => {
      vi.mocked(useParams).mockReturnValue({
        userId: "user-abc-123",
        token: undefined,
      });

      renderWithProviders(<EmailVerification />);

      expect(emailVerification).not.toHaveBeenCalled();
    });

    it("does NOT dispatch when both userId and token are missing", () => {
      vi.mocked(useParams).mockReturnValue({
        userId: undefined,
        token: undefined,
      });

      renderWithProviders(<EmailVerification />);

      expect(emailVerification).not.toHaveBeenCalled();
    });
  });

  // ── Rendering — pending state ─────────────────────────────────────────────

  describe("🧱 Rendering — status='pending'", () => {
    it("renders the loading spinner while verification is in progress", () => {
      /**
       * The preloadedState sets status to "pending" so the Loading component
       * renders its spinner branch. The spinner gives users feedback that
       * something is happening after they click the verification link.
       */
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "pending",
              register: "idle",
              login: "idle",
            },
          },
        },
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("does NOT render the success lottie while pending", () => {
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "pending",
              register: "idle",
              login: "idle",
            },
          },
        },
      });

      expect(screen.queryByTestId("lottie-handler")).not.toBeInTheDocument();
    });

    it("container has aria-busy='true' while pending", () => {
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "pending",
              register: "idle",
              login: "idle",
            },
          },
        },
      });

      // The Loading wrapper sets aria-busy
      expect(
        screen.getByRole("region").querySelector("[aria-busy]"),
      ).toHaveAttribute("aria-busy", "true");
    });
  });

  // ── Rendering — succeeded state ───────────────────────────────────────────

  describe("🧱 Rendering — status='succeeded'", () => {
    it("renders the success lottie with correct message when verification succeeds", () => {
      /**
       * The success state shows a LottieHandler with type="lottie-success".
       * We assert on data-type and the message text to confirm the right
       * variant is rendered with the right copy.
       */
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "succeeded",
              register: "idle",
              login: "idle",
            },
          },
        },
      });

      const lottie = screen.getByTestId("lottie-handler");
      expect(lottie).toBeInTheDocument();
      expect(lottie).toHaveAttribute("data-type", "lottie-success");
      expect(lottie).toHaveTextContent(
        "Your account has been verified successfully",
      );
    });

    it("renders the correct success title", () => {
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "succeeded",
              register: "idle",
              login: "idle",
            },
          },
        },
      });

      expect(screen.getByTestId("lottie-handler")).toHaveAttribute(
        "data-title",
        "Email Verification Success",
      );
    });

    it("does NOT render the spinner on success", () => {
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "succeeded",
              register: "idle",
              login: "idle",
            },
          },
        },
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  // ── Rendering — failed state ──────────────────────────────────────────────

  describe("🧱 Rendering — status='failed'", () => {
    it("renders the error lottie with the error message when verification fails", () => {
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "failed",
              register: "idle",
              login: "idle",
            },
            errors: {
              emailVerification: "Token has expired",
              register: null,
              login: null,
            },
          },
        },
      });

      const lottie = screen.getByTestId("lottie-handler");
      expect(lottie).toHaveAttribute("data-type", "lottie-error");
      expect(lottie).toHaveTextContent("Token has expired");
    });

    it("renders the 'Unknown error' fallback when error is null but status is failed", () => {
      /**
       * This mirrors Loading's own fallback — `error ?? "Unknown error"`.
       * Guards against a blank error state that would show an empty lottie.
       */
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "failed",
              register: "idle",
              login: "idle",
            },
            errors: { emailVerification: null, register: null, login: null },
          },
        },
      });

      expect(screen.getByTestId("lottie-handler")).toHaveTextContent(
        "Unknown error",
      );
    });

    it("does NOT render the spinner on failure", () => {
      renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "failed",
              register: "idle",
              login: "idle",
            },
            errors: { emailVerification: "Error", register: null, login: null },
          },
        },
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  describe("♿ Accessibility", () => {
    it("renders the region landmark with aria-labelledby pointing to the heading", () => {
      /**
       * The section has aria-labelledby="email-verification-heading".
       * Screen reader users can jump to this landmark and have it announced
       * as "Email Verification region" for context.
       */
      renderWithProviders(<EmailVerification />);

      expect(
        screen.getByRole("region", { name: /email verification/i }),
      ).toBeInTheDocument();
    });

    it("heading is visually hidden but present in the accessibility tree (srOnly)", () => {
      /**
       * Heading srOnly={true} hides it visually but keeps it in the a11y
       * tree for the aria-labelledby reference to work. getByRole confirms
       * it's accessible. queryByText with visible matcher would miss it —
       * we use getByRole to prove it's in the a11y tree.
       */
      renderWithProviders(<EmailVerification />);

      const heading = screen.getByRole("heading", {
        level: 1,
        name: /email verification/i,
      });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("visually-hidden");
    });
  });

  // ── Unmount cleanup ───────────────────────────────────────────────────────

  describe("🌐 Side Effects — unmount cleanup", () => {
    it("clears the emailVerification error in the store when unmounted", () => {
      /**
       * clearAuthError("emailVerification") is dispatched in the useEffect cleanup.
       * If the user navigates away and back, the stale error from
       * the previous visit must not be shown on re-mount.
       */
      const { store, unmount } = renderWithProviders(<EmailVerification />, {
        preloadedState: {
          auth: {
            operations: {
              emailVerification: "failed",
              register: "idle",
              login: "idle",
            },
            errors: {
              emailVerification: "Previous error",
              register: null,
              login: null,
            },
          },
        },
      });

      expect(store.getState().auth.errors.emailVerification).toBe(
        "Previous error",
      );

      unmount();

      expect(store.getState().auth.errors.emailVerification).toBeNull();
    });

    it("does NOT call promise.abort() when userId was missing (no dispatch happened)", () => {
      /**
       * When the guard condition (!userId || !token) early-returns,
       * no thunk is dispatched and no promise is stored. The cleanup
       * function must handle this gracefully — no abort() call and no crash.
       */
      vi.mocked(useParams).mockReturnValue({
        userId: undefined,
        token: "tok",
      });

      // No mock needed — emailVerification won't be called
      const { unmount } = renderWithProviders(<EmailVerification />);

      // Should not throw
      expect(() => unmount()).not.toThrow();
      expect(emailVerification).not.toHaveBeenCalled();
    });
  });
});
