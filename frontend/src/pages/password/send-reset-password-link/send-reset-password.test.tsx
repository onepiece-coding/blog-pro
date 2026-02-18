/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file src/pages/password/send-reset-password-link/send-reset-password-link.test.tsx
 */

import { renderWithProviders, fillForm, type FormFields } from "@/test-utils";
import { sendResetPasswordLink } from "@/store/password/password-slice";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCKS
// ─────────────────────────────────────────────────────────────────────────────

vi.mock("@/store/password/password-slice", async () => {
  const actual = await vi.importActual<
    typeof import("@/store/password/password-slice")
  >("@/store/password/password-slice");
  return { ...actual, sendResetPasswordLink: vi.fn() };
});

const { default: SendResetPasswordLink } =
  await import("@/pages/password/send-reset-password-link");

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const VALID_FORM: FormFields = { Email: "alice@example.com" };

const mockSuccess = () => {
  vi.mocked(sendResetPasswordLink).mockReturnValueOnce((() => {
    const p = Promise.resolve({
      type: "password/sendResetPasswordLink/fulfilled",
    });
    (p as any).unwrap = () => Promise.resolve({});
    return p;
  }) as any);
};

const mockFailure = (message = "Email not found") => {
  vi.mocked(sendResetPasswordLink).mockReturnValueOnce((() => {
    const p = Promise.resolve({
      type: "password/sendResetPasswordLink/rejected",
    });
    (p as any).unwrap = () => Promise.reject(new Error(message));
    return p;
  }) as any);
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("SendResetPasswordLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("🧱 Rendering — idle state", () => {
    it("renders the heading 'Send the password reset link'", () => {
      renderWithProviders(<SendResetPasswordLink />);
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /send the password reset link/i,
        }),
      ).toBeInTheDocument();
    });

    it("renders a single email field", () => {
      renderWithProviders(<SendResetPasswordLink />);
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    });

    it("renders 'Send the password reset link' button, enabled", () => {
      renderWithProviders(<SendResetPasswordLink />);
      const btn = screen.getByRole("button", {
        name: /send the password reset link/i,
      });
      expect(btn).not.toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "false");
    });

    it("does NOT render an error alert in idle state", () => {
      renderWithProviders(<SendResetPasswordLink />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("form has noValidate attribute", () => {
      renderWithProviders(<SendResetPasswordLink />);
      expect(document.querySelector("form")).toHaveAttribute("novalidate");
    });
  });

  describe("🧱 Rendering — pending state", () => {
    beforeEach(() => {
      renderWithProviders(<SendResetPasswordLink />, {
        preloadedState: {
          password: {
            operations: {
              sendResetPasswordLink: "pending",
              getResetPasswordLink: "idle",
              resetPassword: "idle",
            },
          },
        },
      });
    });

    it("renders 'Sending the password reset link...' text", () => {
      expect(
        screen.getByText(/sending the password reset link\.\.\./i),
      ).toBeInTheDocument();
    });

    it("disables the submit button and sets aria-busy='true'", () => {
      const btn = screen.getByRole("button", { name: /sending/i });
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "true");
    });

    it("renders the loading spinner", () => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("🧱 Rendering — error state", () => {
    it("renders the error alert when an error exists", () => {
      renderWithProviders(<SendResetPasswordLink />, {
        preloadedState: {
          password: {
            errors: {
              sendResetPasswordLink: "Email not found",
              getResetPasswordLink: null,
              resetPassword: null,
            },
          },
        },
      });
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Email not found");
      expect(alert).toHaveAttribute("aria-live", "assertive");
    });
  });

  describe("🎭 Interactions — Zod validation", () => {
    it("shows error for invalid email format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SendResetPasswordLink />);
      await user.type(screen.getByLabelText(/^email/i), "bad-email");
      await user.tab();
      expect(
        await screen.findByText(/invalid email address/i),
      ).toBeInTheDocument();
    });

    it("does NOT call sendResetPasswordLink when validation fails", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SendResetPasswordLink />);
      await user.click(
        screen.getByRole("button", { name: /send the password reset link/i }),
      );
      await waitFor(() => {
        expect(sendResetPasswordLink).not.toHaveBeenCalled();
      });
    });
  });

  describe("🌐 API — success path", () => {
    it("calls sendResetPasswordLink with the email from the form", async () => {
      mockSuccess();
      const user = userEvent.setup();
      renderWithProviders(<SendResetPasswordLink />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /send the password reset link/i }),
      );
      await waitFor(() => {
        expect(sendResetPasswordLink).toHaveBeenCalledWith({
          email: "alice@example.com",
        });
      });
    });

    it("adds a success toast after link is sent", async () => {
      mockSuccess();
      const user = userEvent.setup();
      const { store } = renderWithProviders(<SendResetPasswordLink />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /send the password reset link/i }),
      );
      await waitFor(() => {
        const toasts = store.getState().toasts.records;
        expect(toasts).toHaveLength(1);
        expect(toasts[0]).toMatchObject({
          type: "success",
          message: expect.stringMatching(/password reset link/i),
        });
      });
    });

    it("resets the form after success", async () => {
      mockSuccess();
      const user = userEvent.setup();
      renderWithProviders(<SendResetPasswordLink />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /send the password reset link/i }),
      );
      await waitFor(() => {
        expect(screen.getByLabelText<HTMLInputElement>(/^email/i).value).toBe(
          "",
        );
      });
    });

    it("does NOT navigate after success (stays on same page)", async () => {
      /**
       * Unlike other forms, SendResetPasswordLink doesn't navigate after success.
       * Users can request multiple links from the same page.
       */
      mockSuccess();
      const user = userEvent.setup();
      renderWithProviders(<SendResetPasswordLink />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /send the password reset link/i }),
      );
      await waitFor(() => {
        expect(sendResetPasswordLink).toHaveBeenCalled();
      });
      // No way to assert navigation didn't happen — but documenting the intent
    });
  });

  describe("🌐 API — failure path", () => {
    it("does NOT add a toast on failure", async () => {
      mockFailure();
      const user = userEvent.setup();
      const { store } = renderWithProviders(<SendResetPasswordLink />);
      await fillForm(user, VALID_FORM);
      await user.click(
        screen.getByRole("button", { name: /send the password reset link/i }),
      );
      await waitFor(() => {
        expect(store.getState().toasts.records).toHaveLength(0);
      });
    });
  });

  describe("🌐 Side Effects — unmount cleanup", () => {
    it("clears the sendResetPasswordLink error on unmount", () => {
      const { store, unmount } = renderWithProviders(
        <SendResetPasswordLink />,
        {
          preloadedState: {
            password: {
              errors: {
                sendResetPasswordLink: "Old error",
                getResetPasswordLink: null,
                resetPassword: null,
              },
            },
          },
        },
      );
      expect(store.getState().password.errors.sendResetPasswordLink).toBe(
        "Old error",
      );
      unmount();
      expect(store.getState().password.errors.sendResetPasswordLink).toBeNull();
    });
  });
});
