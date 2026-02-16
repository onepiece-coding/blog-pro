/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file src/pages/auth/login-user/login-user.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { loginUser } from "@/store/auth/auth-slice";
import { useLocation } from "react-router-dom";
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
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to} />
    ),
    /**
     * useLocation is mocked with vi.fn() so each test can call
     * vi.mocked(useLocation).mockReturnValue({ state: { email: "..." } })
     * to simulate different navigation states without a real router.
     */
    useLocation: vi.fn(() => ({ state: null, pathname: "/auth/login" })),
  };
});

/**
 * loginUser returns a thunk (function) not a plain object.
 * Plain objects with `unwrap: vi.fn()` trigger RTK's serialization middleware warning.
 * Thunks bypass that check entirely.
 */
vi.mock("@/store/auth/auth-slice", async () => {
  const actual = await vi.importActual<
    typeof import("@/store/auth/auth-slice")
  >("@/store/auth/auth-slice");
  return { ...actual, loginUser: vi.fn() };
});

const { default: LoginUser } = await import("@/pages/auth/login-user");

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const VALID_FORM: FormFields = {
  Email: "alice@example.com",
  Password: "Secret1!",
};

const mockLoginSuccess = () => {
  vi.mocked(loginUser).mockReturnValueOnce((() => {
    const p = Promise.resolve({ type: "auth/loginUser/fulfilled" });
    (p as any).unwrap = () => Promise.resolve({});
    return p;
  }) as any);
};

const mockLoginFailure = (message = "Invalid credentials") => {
  vi.mocked(loginUser).mockReturnValueOnce((() => {
    const p = Promise.resolve({ type: "auth/loginUser/rejected" });
    (p as any).unwrap = () => Promise.reject(new Error(message));
    return p;
  }) as any);
};

/** Simulate navigating from registration with a pre-filled email. */
const withPrefilledEmail = (email: string) => {
  vi.mocked(useLocation).mockReturnValue({
    state: { email },
    pathname: "/auth/login",
  } as any);
};

/** Simulate a route-guard redirect: user tried to visit `from` before logging in. */
const withRedirectFrom = (from: string) => {
  vi.mocked(useLocation).mockReturnValue({
    state: { from },
    pathname: "/auth/login",
  } as any);
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("LoginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLocation).mockReturnValue({
      state: null,
      pathname: "/auth/login",
    } as any);
  });

  // ── Redirect — already authenticated ─────────────────────────────────────

  describe("🔀 Routing — authenticated redirect", () => {
    it("redirects to '/' when user is already authenticated", () => {
      renderWithProviders(<LoginUser />, {
        preloadedState: { auth: { user: makeUser(), accessToken: "tok" } },
      });

      expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/");
    });

    it("renders the form when user is unauthenticated", () => {
      renderWithProviders(<LoginUser />);

      expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /log in/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Rendering — idle state ────────────────────────────────────────────────

  describe("🧱 Rendering — idle state", () => {
    it("renders the heading 'Sign In To Your Account'", () => {
      renderWithProviders(<LoginUser />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /sign in to your account/i,
        }),
      ).toBeInTheDocument();
    });

    it("renders email and password fields with accessible labels", () => {
      /**
       * getByLabelText confirms both the label exists AND it's programmatically
       * associated with its input — a pure visual label would fail this.
       */
      renderWithProviders(<LoginUser />);

      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    });

    it("renders only two fields (email and password — not username or confirmPassword)", () => {
      /**
       * Guards against accidentally copying RegisterUser's extra fields.
       * password inputs have role="textbox" in some browsers — we query
       * by label instead to stay implementation-agnostic.
       */
      renderWithProviders(<LoginUser />);

      const formGroups = document.querySelectorAll(".mb-3"); // FormField className default
      expect(formGroups).toHaveLength(2);
    });

    it("renders 'Log in' submit button, enabled, with aria-busy='false'", () => {
      renderWithProviders(<LoginUser />);

      const btn = screen.getByRole("button", { name: /log in/i });
      expect(btn).not.toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "false");
    });

    it("does NOT render an error alert in idle state", () => {
      renderWithProviders(<LoginUser />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("renders a region landmark labelled by the heading", () => {
      renderWithProviders(<LoginUser />);

      expect(
        screen.getByRole("region", { name: /sign in to your account/i }),
      ).toBeInTheDocument();
    });

    it("renders 'Forgot password?' link pointing to the reset route", () => {
      renderWithProviders(<LoginUser />);

      expect(
        screen.getByRole("link", { name: /reset your password/i }),
      ).toHaveAttribute("href", "/password/send-reset-password-link");
    });

    it("form has noValidate attribute", () => {
      renderWithProviders(<LoginUser />);

      expect(document.querySelector("form")).toHaveAttribute("novalidate");
    });
  });

  // ── Pre-filled email from location state ──────────────────────────────────

  describe("🧱 Rendering — pre-filled email from location.state", () => {
    it("pre-fills the email field when location.state.email is set", () => {
      /**
       * After registration, navigate() is called with state: { email }.
       * LoginUser reads this from useLocation().state to save the user
       * from re-typing their email. This is a UX quality-of-life feature
       * that must work correctly.
       */
      withPrefilledEmail("alice@example.com");
      renderWithProviders(<LoginUser />);

      expect(screen.getByLabelText<HTMLInputElement>(/^email/i).value).toBe(
        "alice@example.com",
      );
    });

    it("email field is empty when state is null (direct navigation)", () => {
      renderWithProviders(<LoginUser />);

      expect(screen.getByLabelText<HTMLInputElement>(/^email/i).value).toBe("");
    });

    it("email field is empty when state.from is set but state.email is absent", () => {
      /**
       * Route-guard redirects set state.from but not state.email.
       * The optional chain `state?.email ?? ""` must handle this without
       * crashing or showing "undefined" in the input.
       */
      withRedirectFrom("/dashboard");
      renderWithProviders(<LoginUser />);

      expect(screen.getByLabelText<HTMLInputElement>(/^email/i).value).toBe("");
    });
  });

  // ── Rendering — pending state ─────────────────────────────────────────────

  describe("🧱 Rendering — pending state", () => {
    beforeEach(() => {
      renderWithProviders(<LoginUser />, {
        preloadedState: {
          auth: {
            operations: {
              login: "pending",
              register: "idle",
              emailVerification: "idle",
            },
          },
        },
      });
    });

    it("renders 'Logging in...' text", () => {
      expect(screen.getByText(/logging in\.\.\./i)).toBeInTheDocument();
    });

    it("disables the submit button", () => {
      expect(
        screen.getByRole("button", { name: /logging in/i }),
      ).toBeDisabled();
    });

    it("sets aria-busy='true' on the submit button", () => {
      expect(
        screen.getByRole("button", { name: /logging in/i }),
      ).toHaveAttribute("aria-busy", "true");
    });

    it("renders the loading spinner with role='status'", () => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  // ── Rendering — error state ───────────────────────────────────────────────

  describe("🧱 Rendering — error state", () => {
    it("renders the error alert with the server message", () => {
      renderWithProviders(<LoginUser />, {
        preloadedState: {
          auth: {
            errors: {
              login: "Invalid email or password",
              register: null,
              emailVerification: null,
            },
          },
        },
      });

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Invalid email or password");
    });

    it("error alert has aria-live='assertive'", () => {
      renderWithProviders(<LoginUser />, {
        preloadedState: {
          auth: {
            errors: { login: "Error", register: null, emailVerification: null },
          },
        },
      });

      expect(screen.getByRole("alert")).toHaveAttribute(
        "aria-live",
        "assertive",
      );
    });

    it("does NOT render the alert when error is null", () => {
      renderWithProviders(<LoginUser />, {
        preloadedState: {
          auth: {
            errors: { login: null, register: null, emailVerification: null },
          },
        },
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  // ── Zod validation ────────────────────────────────────────────────────────

  describe("🎭 Interactions — Zod validation (onTouched)", () => {
    it("shows error for invalid email format after blur", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await user.type(screen.getByLabelText(/^email/i), "not-an-email");
      await user.tab();

      expect(
        await screen.findByText(/invalid email address/i),
      ).toBeInTheDocument();
    });

    it("shows error when password is empty after blur", async () => {
      /**
       * loginSchema uses z.string().trim().min(1) for password.
       * An empty/whitespace password must be caught before any network call.
       */
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await user.click(screen.getByLabelText(/^password/i));
      await user.tab(); // blur without typing

      expect(await screen.findByText(/password required/i)).toBeInTheDocument();
    });

    it("clears the validation error once the user corrects the field", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      const emailInput = screen.getByLabelText(/^email/i);
      await user.type(emailInput, "bad");
      await user.tab();
      expect(
        await screen.findByText(/invalid email address/i),
      ).toBeInTheDocument();

      await user.clear(emailInput);
      await user.type(emailInput, "good@example.com");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid email address/i),
        ).not.toBeInTheDocument();
      });
    });

    it("does NOT call loginUser when validation fails", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(loginUser).not.toHaveBeenCalled();
      });
    });
  });

  // ── Success path ──────────────────────────────────────────────────────────

  describe("🌐 API — success path", () => {
    it("calls loginUser with email and password from the form", async () => {
      mockLoginSuccess();
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith({
          email: "alice@example.com",
          password: "Secret1!",
        });
      });
    });

    it("adds a success toast to the store after login", async () => {
      /**
       * Assert on store state, not on mocked addToast — tests the full
       * dispatch → reducer → state pipeline honestly.
       */
      mockLoginSuccess();
      const user = userEvent.setup();
      const { store } = renderWithProviders(<LoginUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        const toasts = store.getState().toasts.records;
        expect(toasts).toHaveLength(1);
        expect(toasts[0]).toMatchObject({
          type: "success",
          message: expect.stringMatching(/successful login/i),
        });
      });
    });

    it("navigates to '/' (default from) with replace:true after success", async () => {
      /**
       * When state.from is not set, `from` defaults to "/". The user is
       * sent home after login.
       */
      mockLoginSuccess();
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      });
    });

    it("navigates to the 'from' route when location.state.from is set", async () => {
      /**
       * A route guard sets state.from = "/dashboard" before redirecting to
       * login. After successful login, the user should be sent to /dashboard,
       * not the homepage. This is the core of the protected-route pattern.
       */
      mockLoginSuccess();
      withRedirectFrom("/dashboard");
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
          replace: true,
        });
      });
    });

    it("resets the form fields after successful login", async () => {
      mockLoginSuccess();
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(screen.getByLabelText<HTMLInputElement>(/^email/i).value).toBe(
          "",
        );
      });
    });
  });

  // ── Failure path ──────────────────────────────────────────────────────────

  describe("🌐 API — failure path", () => {
    it("does NOT navigate on login failure", async () => {
      mockLoginFailure();
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("does NOT add a toast on failure", async () => {
      mockLoginFailure();
      const user = userEvent.setup();
      const { store } = renderWithProviders(<LoginUser />);

      await fillForm(user, VALID_FORM);
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(store.getState().toasts.records).toHaveLength(0);
      });
    });

    it("does NOT move focus after failure (unlike RegisterUser)", async () => {
      /**
       * LoginUser's catch block only logs in development — it does NOT call setFocus().
       * This is intentional and different from RegisterUser.
       * Focus remains on the submit button after a failed login attempt.
       * Documenting this distinguishes the two components' behaviour clearly.
       */
      mockLoginFailure();
      const user = userEvent.setup();
      renderWithProviders(<LoginUser />);

      await fillForm(user, VALID_FORM);
      const submitBtn = screen.getByRole("button", { name: /log in/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      // Focus stays on submit button (last interacted element)
      expect(submitBtn).toHaveFocus();
    });
  });

  // ── Unmount cleanup ───────────────────────────────────────────────────────

  describe("🌐 Side Effects — unmount cleanup", () => {
    it("clears the login error in the store when the component unmounts", () => {
      /**
       * clearAuthError("login") is dispatched in the useEffect cleanup.
       * We seed the error into preloadedState and assert it's null after
       * unmount — testing observable state, not dispatch internals.
       */
      const { store, unmount } = renderWithProviders(<LoginUser />, {
        preloadedState: {
          auth: {
            errors: {
              login: "Previous error",
              register: null,
              emailVerification: null,
            },
          },
        },
      });

      expect(store.getState().auth.errors.login).toBe("Previous error");
      unmount();
      expect(store.getState().auth.errors.login).toBeNull();
    });
  });
});
