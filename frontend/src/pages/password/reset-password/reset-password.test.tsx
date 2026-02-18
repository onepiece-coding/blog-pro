/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file src/pages/password/reset-password/reset-password.test.tsx
 */

import { renderWithProviders, fillForm, type FormFields } from "@/test-utils";
import { resetPassword } from "@/store/password/password-slice";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { useParams } from "react-router-dom";

import userEvent from "@testing-library/user-event";

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
  return { ...actual, resetPassword: vi.fn() };
});

const { default: ResetPassword } =
  await import("@/pages/password/reset-password");

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const VALID_FORM: FormFields = {
  Password: "NewPass1!",
  "Confirm Password": "NewPass1!",
};

const mockSuccess = () => {
  vi.mocked(resetPassword).mockReturnValueOnce((() => {
    const p = Promise.resolve({ type: "password/resetPassword/fulfilled" });
    (p as any).unwrap = () => Promise.resolve({});
    return p;
  }) as any);
};

const mockFailure = (message = "Token expired") => {
  vi.mocked(resetPassword).mockReturnValueOnce((() => {
    const p = Promise.resolve({ type: "password/resetPassword/rejected" });
    (p as any).unwrap = () => Promise.reject(new Error(message));
    return p;
  }) as any);
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("ResetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({
      userId: "user-abc",
      token: "token-xyz",
    });
  });

  describe("🧱 Rendering — idle state", () => {
    it("renders the heading 'Reset Password'", () => {
      renderWithProviders(<ResetPassword />);
      expect(
        screen.getByRole("heading", { level: 1, name: /reset password/i }),
      ).toBeInTheDocument();
    });

    it("renders password and confirmPassword fields", () => {
      renderWithProviders(<ResetPassword />);
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it("renders 'Reset the password' button, enabled", () => {
      renderWithProviders(<ResetPassword />);
      const btn = screen.getByRole("button", { name: /reset the password/i });
      expect(btn).not.toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "false");
    });

    it("form has noValidate attribute", () => {
      renderWithProviders(<ResetPassword />);
      expect(document.querySelector("form")).toHaveAttribute("novalidate");
    });
  });

  describe("🧱 Rendering — pending state", () => {
    beforeEach(() => {
      renderWithProviders(<ResetPassword />, {
        preloadedState: {
          password: {
            operations: {
              resetPassword: "pending",
              getResetPasswordLink: "idle",
              sendResetPasswordLink: "idle",
            },
          },
        },
      });
    });

    it("renders 'Resetting the password...' text", () => {
      expect(
        screen.getByText(/resetting the password\.\.\./i),
      ).toBeInTheDocument();
    });

    it("disables the submit button and sets aria-busy='true'", () => {
      const btn = screen.getByRole("button", { name: /resetting/i });
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("🧱 Rendering — error state", () => {
    it("renders the error alert", () => {
      renderWithProviders(<ResetPassword />, {
        preloadedState: {
          password: {
            errors: {
              resetPassword: "Token expired",
              getResetPasswordLink: null,
              sendResetPasswordLink: null,
            },
          },
        },
      });
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Token expired");
      expect(alert).toHaveAttribute("aria-live", "assertive");
    });
  });

  describe("🎭 Interactions — Zod validation", () => {
    it("shows error when password is too short (< 8 chars)", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await user.type(screen.getByLabelText(/^password/i), "Short1");
      await user.tab();
      expect(
        await screen.findByText(/at least 8 characters/i),
      ).toBeInTheDocument();
    });

    it("shows error when password lacks complexity", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await user.type(screen.getByLabelText(/^password/i), "alllowercase1");
      await user.tab();
      expect(
        await screen.findByText(/uppercase, lowercase, and number/i),
      ).toBeInTheDocument();
    });

    it("shows error when passwords don't match", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await user.type(screen.getByLabelText(/^password/i), "NewPass1!");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "Different1!",
      );
      await user.tab();
      expect(
        await screen.findByText(
          /password and confirm password does not match/i,
        ),
      ).toBeInTheDocument();
    });

    it("does NOT call resetPassword when validation fails", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        expect(resetPassword).not.toHaveBeenCalled();
      });
    });
  });

  describe("🌐 API — success path", () => {
    it("calls resetPassword with userId, token from params and password from form", async () => {
      mockSuccess();
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith({
          authInfo: { userId: "user-abc", token: "token-xyz" },
          formData: { password: "NewPass1!" },
        });
      });
    });

    it("adds a success toast after reset", async () => {
      mockSuccess();
      const user = userEvent.setup();
      const { store } = renderWithProviders(<ResetPassword />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        const toasts = store.getState().toasts.records;
        expect(toasts).toHaveLength(1);
        expect(toasts[0]).toMatchObject({
          type: "success",
          message: expect.stringMatching(
            "Passsword has been reset successfully, please log in",
          ),
        });
      });
    });

    it("navigates to /auth/login with replace:true after success", async () => {
      mockSuccess();
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          replace: true,
        });
      });
    });

    it("resets the form after success", async () => {
      mockSuccess();
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        expect(
          screen.getByLabelText<HTMLInputElement>(/^password/i).value,
        ).toBe("");
      });
    });
  });

  describe("🌐 API — failure path", () => {
    it("does NOT navigate on failure", async () => {
      mockFailure();
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("does NOT add a toast on failure", async () => {
      mockFailure();
      const user = userEvent.setup();
      const { store } = renderWithProviders(<ResetPassword />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        expect(store.getState().toasts.records).toHaveLength(0);
      });
    });
  });

  describe("🎭 Interactions — missing params guard", () => {
    it("does NOT call resetPassword when userId is missing", async () => {
      /**
       * The component guards inside onSubmit: if (!userId || !token) return.
       * This prevents a broken API call with undefined params.
       */
      vi.mocked(useParams).mockReturnValue({ userId: undefined, token: "tok" });
      mockSuccess();
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        expect(resetPassword).not.toHaveBeenCalled();
      });
    });

    it("does NOT call resetPassword when token is missing", async () => {
      vi.mocked(useParams).mockReturnValue({
        userId: "user-abc",
        token: undefined,
      });
      mockSuccess();
      const user = userEvent.setup();
      renderWithProviders(<ResetPassword />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /reset the password/i }),
      );
      await waitFor(() => {
        expect(resetPassword).not.toHaveBeenCalled();
      });
    });
  });

  describe("🌐 Side Effects — unmount cleanup", () => {
    it("clears the resetPassword error on unmount", () => {
      const { store, unmount } = renderWithProviders(<ResetPassword />, {
        preloadedState: {
          password: {
            errors: {
              resetPassword: "Old error",
              getResetPasswordLink: null,
              sendResetPasswordLink: null,
            },
          },
        },
      });
      expect(store.getState().password.errors.resetPassword).toBe("Old error");
      unmount();
      expect(store.getState().password.errors.resetPassword).toBeNull();
    });
  });
});
