/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file src/pages/auth/register-user/register-user.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import {
  renderWithProviders,
  makeUser,
  fillForm,
  type FormFields,
} from "@/test-utils";

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
    /**
     * Navigate renders a testid so we can assert the redirect without a
     * full router setup. Checking data-to confirms the correct target route.
     */
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to} />
    ),
  };
});

/**
 * Mock registerUser at the module level.
 *
 * WHY: The thunk makes real HTTP calls. We don't want network I/O in unit
 * tests. We control resolved/rejected value per-test so we can exercise
 * both success and failure paths cleanly.
 *
 * The mock must return an object with `.unwrap()` because the component
 * calls `dispatch(registerUser(...)).unwrap()`. Without it the test throws
 * "Cannot read properties of undefined (reading 'unwrap')".
 *
 * addToast and clearAuthError are NOT mocked — we use the real reducer and
 * assert on store.getState() instead of on dispatch calls. This is more
 * robust and aligns with the RTL philosophy of testing observable outcomes.
 */
vi.mock("@/store/auth/auth-slice", async () => {
  const actual = await vi.importActual<
    typeof import("@/store/auth/auth-slice")
  >("@/store/auth/auth-slice");
  return {
    ...actual,
    registerUser: vi.fn(),
  };
});

import { registerUser } from "@/store/auth/auth-slice";

// Dynamic import AFTER all mocks are registered
const { default: RegisterUser } = await import("@/pages/auth/register-user");

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** A complete valid form submission that passes all Zod rules. */
const VALID_FORM: FormFields = {
  Username: "alice123",
  Email: "alice@example.com",
  Password: "Secret1!",
  "Confirm Password": "Secret1!",
};

/**
 * WHY THUNKS, NOT PLAIN OBJECTS:
 *
 * RTK's serializability middleware inspects every dispatched action object.
 * Returning `{ type: "...", unwrap: vi.fn() }` puts a non-serializable
 * function at `action.unwrap`, which triggers the middleware warning.
 *
 * The fix: make registerUser return a THUNK (a plain function). Redux's
 * thunk middleware intercepts functions before they reach the serialization
 * check and calls them with (dispatch, getState). We attach `.unwrap()`
 * directly to the returned promise — exactly what RTK's real async thunks
 * do — so `dispatch(registerUser(...)).unwrap()` works correctly.
 */

/** Helper: configure registerUser to resolve successfully. */
const mockRegisterSuccess = () => {
  vi.mocked(registerUser).mockReturnValueOnce((() => {
    const promise = Promise.resolve({ type: "auth/registerUser/fulfilled" });
    (promise as any).unwrap = () => Promise.resolve({});
    return promise;
  }) as any);
};

/** Helper: configure registerUser to reject with an error. */
const mockRegisterFailure = (message = "Email is already registered") => {
  vi.mocked(registerUser).mockReturnValueOnce((() => {
    const promise = Promise.resolve({ type: "auth/registerUser/rejected" });
    (promise as any).unwrap = () => Promise.reject(new Error(message));
    return promise;
  }) as any);
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER USER
// ─────────────────────────────────────────────────────────────────────────────

describe("RegisterUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Redirect — already authenticated ─────────────────────────────────────

  describe("🔀 Routing — authenticated redirect", () => {
    it("redirects to '/' when the user is already authenticated", () => {
      /**
       * An already-logged-in user visiting /auth/register must be redirected.
       * Showing them the form is confusing and unnecessary.
       */
      renderWithProviders(<RegisterUser />, {
        preloadedState: {
          auth: { user: makeUser(), accessToken: "token-abc" },
        },
      });

      expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/");
    });

    it("renders the form (does NOT redirect) when the user is unauthenticated", () => {
      renderWithProviders(<RegisterUser />);

      expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create account/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Rendering — idle state ────────────────────────────────────────────────

  describe("🧱 Rendering — idle state", () => {
    it("renders the page heading 'Sign Up To Your Account'", () => {
      renderWithProviders(<RegisterUser />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /sign up to your account/i,
        }),
      ).toBeInTheDocument();
    });

    it("renders all four form fields with correct labels", () => {
      /**
       * All four fields are required. A missing field silently prevents
       * users from completing registration. getByLabelText also verifies
       * each input has an accessible label — no label = inaccessible field.
       */
      renderWithProviders(<RegisterUser />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it("renders the 'Create Account' submit button, enabled", () => {
      renderWithProviders(<RegisterUser />);

      const btn = screen.getByRole("button", { name: /create account/i });
      expect(btn).toBeInTheDocument();
      expect(btn).not.toBeDisabled();
    });

    it("submit button has aria-busy='false' in idle state", () => {
      /**
       * aria-busy should be present as "false" in idle — not absent — so
       * assistive technologies know the button is in a definite non-busy state.
       */
      renderWithProviders(<RegisterUser />);

      expect(
        screen.getByRole("button", { name: /create account/i }),
      ).toHaveAttribute("aria-busy", "false");
    });

    it("does NOT render an error alert in idle state", () => {
      renderWithProviders(<RegisterUser />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("renders the 'Already have an account?' link pointing to /auth/login", () => {
      renderWithProviders(<RegisterUser />);

      expect(
        screen.getByRole("link", { name: /already have an account/i }),
      ).toHaveAttribute("href", "/auth/login");
    });

    it("renders a region landmark labelled by the heading", () => {
      /**
       * role="region" + aria-labelledby creates a named landmark so screen
       * reader users can jump directly to the form via landmark navigation.
       */
      renderWithProviders(<RegisterUser />);

      expect(
        screen.getByRole("region", { name: /sign up to your account/i }),
      ).toBeInTheDocument();
    });

    it("the form has the noValidate attribute", () => {
      /**
       * noValidate disables native browser validation UI. Without it, both
       * the browser's bubbles and RHF's custom messages would appear
       * simultaneously — inconsistent and confusing.
       */
      renderWithProviders(<RegisterUser />);

      expect(document.querySelector("form")).toHaveAttribute("novalidate");
    });
  });

  // ── Rendering — pending state ─────────────────────────────────────────────

  describe("🧱 Rendering — pending state", () => {
    beforeEach(() => {
      renderWithProviders(<RegisterUser />, {
        preloadedState: {
          auth: {
            operations: {
              register: "pending",
              login: "idle",
              emailVerification: "idle",
            },
          },
        },
      });
    });

    it("renders 'Registering...' text", () => {
      expect(screen.getByText(/registering\.\.\./i)).toBeInTheDocument();
    });

    it("disables the submit button", () => {
      /**
       * A disabled button prevents double-submission while the request is
       * in flight, which could otherwise create duplicate accounts.
       */
      expect(
        screen.getByRole("button", { name: /registering/i }),
      ).toBeDisabled();
    });

    it("sets aria-busy='true' on the submit button", () => {
      /**
       * aria-busy communicates to assistive technologies that processing
       * is underway. Without it, screen reader users get no feedback
       * after pressing the button.
       */
      expect(
        screen.getByRole("button", { name: /registering/i }),
      ).toHaveAttribute("aria-busy", "true");
    });

    it("renders the loading spinner with role='status'", () => {
      expect(
        screen.getByRole("status", { name: /registering account/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Rendering — error state ───────────────────────────────────────────────

  describe("🧱 Rendering — error state", () => {
    it("renders the error alert with the server message", () => {
      /**
       * Server errors (e.g. "Email already in use") must be shown to the
       * user. role="alert" + aria-live="assertive" ensures screen readers
       * announce it immediately when it appears.
       */
      renderWithProviders(<RegisterUser />, {
        preloadedState: {
          auth: {
            errors: {
              register: "Email is already registered",
              login: null,
              emailVerification: null,
            },
          },
        },
      });

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Email is already registered");
    });

    it("error alert has aria-live='assertive'", () => {
      renderWithProviders(<RegisterUser />, {
        preloadedState: {
          auth: {
            errors: {
              register: "Email is already registered",
              login: null,
              emailVerification: null,
            },
          },
        },
      });

      expect(screen.getByRole("alert")).toHaveAttribute(
        "aria-live",
        "assertive",
      );
    });

    it("does NOT render the alert when error is null", () => {
      renderWithProviders(<RegisterUser />, {
        preloadedState: {
          auth: {
            errors: {
              register: null,
              login: null,
              emailVerification: null,
            },
          },
        },
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  // ── Zod validation ────────────────────────────────────────────────────────

  describe("🎭 Interactions — Zod validation (onTouched)", () => {
    it("shows error when username is shorter than 3 characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await user.type(screen.getByLabelText(/username/i), "ab");
      await user.tab();

      expect(
        await screen.findByText(/at least 3 characters/i),
      ).toBeInTheDocument();
    });

    it("shows error when username exceeds 20 characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await user.type(screen.getByLabelText(/username/i), "a".repeat(21));
      await user.tab();

      expect(
        await screen.findByText(/less than 20 characters/i),
      ).toBeInTheDocument();
    });

    it("shows error when username contains invalid characters (e.g. '!')", async () => {
      /**
       * The regex /^[a-zA-Z0-9_]+$/ forbids spaces, hyphens, special chars.
       * Usernames must be URL-safe for profile page routing.
       */
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await user.type(screen.getByLabelText(/username/i), "alice!");
      await user.tab();

      expect(
        await screen.findByText(/letters, numbers, and underscores/i),
      ).toBeInTheDocument();
    });

    it("shows error for invalid email format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await user.type(screen.getByLabelText(/^email/i), "not-an-email");
      await user.tab();

      expect(
        await screen.findByText(/invalid email address/i),
      ).toBeInTheDocument();
    });

    it("shows error when password is shorter than 8 characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await user.type(screen.getByLabelText(/^password/i), "Sh0rt");
      await user.tab();

      expect(
        await screen.findByText(/at least 8 characters/i),
      ).toBeInTheDocument();
    });

    it("shows error when password lacks uppercase, lowercase or a digit", async () => {
      /**
       * "alllower1" passes length but has no uppercase — tests the regex
       * independently of the min-length rule.
       */
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await user.type(screen.getByLabelText(/^password/i), "alllower1111");
      await user.tab();

      expect(
        await screen.findByText(/uppercase, lowercase, and number/i),
      ).toBeInTheDocument();
    });

    it("shows error when confirmPassword does not match password", async () => {
      /**
       * The .refine() cross-field rule catches the most common registration
       * mistake before any network call is made.
       */
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await user.type(screen.getByLabelText(/^password/i), "Secret1!");
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

    it("clears the validation error once the user corrects the field", async () => {
      /**
       * Errors must disappear the moment valid input is provided — sticky
       * errors are frustrating and damage trust in the form.
       */
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      const input = screen.getByLabelText(/username/i);
      await user.type(input, "ab");
      await user.tab();
      expect(
        await screen.findByText(/at least 3 characters/i),
      ).toBeInTheDocument();

      await user.clear(input);
      await user.type(input, "validuser");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText(/at least 3 characters/i),
        ).not.toBeInTheDocument();
      });
    });

    it("does NOT call registerUser when form has validation errors", async () => {
      /**
       * RHF + Zod must gate the network call. registerUser must never be
       * called with invalid data regardless of how the submit button is reached.
       */
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(registerUser).not.toHaveBeenCalled();
      });
    });
  });

  // ── Success path ─────────────────────────────────────────────────────────

  describe("🌐 API — success path", () => {
    it("calls registerUser with username, email and password — NOT confirmPassword", async () => {
      /**
       * confirmPassword is a UI-only concern. Sending it to the API would
       * be redundant at best and a security smell at worst.
       */
      mockRegisterSuccess();
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalledWith({
          username: "alice123",
          email: "alice@example.com",
          password: "Secret1!",
        });
      });
    });

    it("adds a success toast to the store after registration", async () => {
      /**
       * We assert on store.getState().toasts.records rather than mocking
       * addToast. This tests the full pipeline: component dispatch →
       * real toasts reducer → state update. If addToast is renamed or the
       * selector changes, this test surfaces it.
       */
      mockRegisterSuccess();
      const user = userEvent.setup();
      const { store } = renderWithProviders(<RegisterUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        const toasts = store.getState().toasts.records;
        expect(toasts).toHaveLength(1);
        expect(toasts[0]).toMatchObject({
          type: "success",
          message: expect.stringMatching(/verification link/i),
        });
      });
    });

    it("navigates to /auth/login with replace:true and email state", async () => {
      /**
       * replace:true prevents back-button return to registration (correct UX).
       * state.email pre-fills the login form — a quality-of-life feature
       * that depends on this exact navigation call shape.
       */
      mockRegisterSuccess();
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          replace: true,
          state: { email: "alice@example.com" },
        });
      });
    });

    it("resets all form fields to empty after successful registration", async () => {
      /**
       * Stale credentials left in inputs after navigation is a security and
       * UX concern — especially if the user presses the back button.
       */
      mockRegisterSuccess();
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByLabelText<HTMLInputElement>(/username/i).value).toBe(
          "",
        );
        expect(screen.getByLabelText<HTMLInputElement>(/^email/i).value).toBe(
          "",
        );
      });
    });
  });

  // ── Failure path ──────────────────────────────────────────────────────────

  describe("🌐 API — failure path", () => {
    it("does NOT navigate on failure", async () => {
      mockRegisterFailure();
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("does NOT add a toast to the store on failure", async () => {
      /**
       * The server error is surfaced via the Redux error state → Alert,
       * not via a toast. Showing a toast on failure would be double-feedback.
       */
      mockRegisterFailure();
      const user = userEvent.setup();
      const { store } = renderWithProviders(<RegisterUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(store.getState().toasts.records).toHaveLength(0);
      });
    });

    it("moves focus to the email field after failure", async () => {
      /**
       * setFocus("email") is an accessibility affordance — keyboard and
       * screen reader users are brought to the most likely field to correct.
       * Without it, focus stays on the submit button after failure.
       */
      mockRegisterFailure();
      const user = userEvent.setup();
      renderWithProviders(<RegisterUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/^email/i)).toHaveFocus();
      });
    });
  });

  // ── Unmount cleanup ───────────────────────────────────────────────────────

  describe("🌐 Side Effects — unmount cleanup", () => {
    it("clears the register error in the store when the component unmounts", () => {
      /**
       * clearAuthError("register") is dispatched by the useEffect cleanup.
       * We assert on store state after unmount — the error must be null —
       * rather than on dispatch calls, consistent with our RTL approach.
       *
       * WHY this matters: without cleanup, navigating away and back while
       * a server error is present would show the stale error on re-mount.
       */
      const { store, unmount } = renderWithProviders(<RegisterUser />, {
        preloadedState: {
          auth: {
            errors: {
              register: "Some previous error",
              login: null,
              emailVerification: null,
            },
          },
        },
      });

      // Error is present before unmount
      expect(store.getState().auth.errors.register).toBe("Some previous error");

      unmount();

      // Cleared after unmount
      expect(store.getState().auth.errors.register).toBeNull();
    });
  });
});
