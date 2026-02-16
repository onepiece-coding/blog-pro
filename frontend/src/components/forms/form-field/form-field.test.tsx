/**
 * @file src/components/forms/form-field/form-field.test.tsx
 *
 * FormField is a controlled component that requires a real RHF context.
 * We wrap it in a minimal <form> with useForm() rather than mocking the control prop —
 * mocking React Hook Form internals is brittle and defeats the purpose of testing the integration.
 */

import { render, screen, waitFor } from "@testing-library/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { describe, it, expect, vi } from "vitest";
import { useForm } from "react-hook-form";

import FormField from "@/components/forms/form-field";
import userEvent from "@testing-library/user-event";
import z from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// TEST HARNESS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Minimal Zod schema for the harness form.
 * Extended per test group to trigger different validation paths.
 */
const defaultSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

type DefaultFields = z.infer<typeof defaultSchema>;

interface HarnessProps {
  name?: keyof DefaultFields;
  label?: string;
  type?: string;
  srOnly?: boolean;
  placeholder?: string;
  ariaDescribedBy?: string;
  as?: "input" | "textarea";
  onSubmit?: (data: DefaultFields) => void;
}

/**
 * Minimal form wrapper that provides a real RHF context.
 * All props flow through to FormField so individual tests control behaviour.
 */
const FormHarness = ({
  name = "username",
  label = "Username",
  type = "text",
  srOnly = false,
  placeholder,
  ariaDescribedBy,
  as = "input",
  onSubmit = vi.fn(),
}: HarnessProps) => {
  const { control, handleSubmit } = useForm<DefaultFields>({
    resolver: zodResolver(defaultSchema),
    mode: "onTouched",
    defaultValues: { username: "", email: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        formId="test-form"
        control={control}
        label={label}
        name={name}
        type={type}
        srOnly={srOnly}
        placeholder={placeholder}
        ariaDescribedBy={ariaDescribedBy}
        as={as}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FORM FIELD TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("FormField", () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  describe("🧱 Rendering — default state", () => {
    it("renders an input with the correct id derived from formId and name", () => {
      /**
       * The id is generated as `${formId}__${name}`.
       * The label's htmlFor must match this exactly for the label/input association to work.
       * A mismatch silently breaks screen reader label announcement.
       */
      render(<FormHarness />);

      expect(
        screen.getByRole("textbox", { name: /username/i }),
      ).toHaveAttribute("id", "test-form__username");
    });

    it("renders a visible label associated with the input", () => {
      /**
       * getByLabelText proves the label is programmatically associated
       * with the input — not just visually near it. This is the RTL way
       * of asserting accessible label association.
       */
      render(<FormHarness label="Username" name="username" />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it("renders the input with the correct type", () => {
      render(<FormHarness type="email" name="email" label="Email" />);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
    });

    it("renders with the provided placeholder", () => {
      render(<FormHarness placeholder="Enter your username" />);

      expect(
        screen.getByPlaceholderText("Enter your username"),
      ).toBeInTheDocument();
    });

    it("falls back to label text as placeholder when no placeholder is provided", () => {
      /**
       * `placeholder={placeholder ?? label}` means the label doubles as the
       * placeholder. This documents and protects that behaviour.
       */
      render(<FormHarness label="Username" />);

      expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    });

    it("does NOT show the error message in valid state", () => {
      render(<FormHarness />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does NOT apply aria-invalid in valid state", () => {
      render(<FormHarness />);

      expect(screen.getByLabelText(/username/i)).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    });
  });

  // ── Label visibility (srOnly) ─────────────────────────────────────────────

  describe("🧱 Rendering — srOnly label", () => {
    it("applies visually-hidden class to the label when srOnly is true", () => {
      /**
       * srOnly hides the label visually while keeping it in the a11y tree.
       * It's used when the input's context makes its purpose obvious
       * visually (e.g., inline search box) but the label is still needed
       * for screen readers.
       */
      render(<FormHarness srOnly />);

      const label = screen.getByText(/username/i);
      expect(label).toHaveClass("visually-hidden");
    });

    it("does NOT apply visually-hidden when srOnly is false (default)", () => {
      render(<FormHarness srOnly={false} />);

      const label = screen.getByText(/username/i);
      expect(label).not.toHaveClass("visually-hidden");
    });

    it("input is still accessible by label when srOnly is true", () => {
      /**
       * visually-hidden uses CSS to hide — not display:none. The label
       * must remain in the accessibility tree for getByLabelText to work.
       */
      render(<FormHarness srOnly />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });
  });

  // ── Textarea rendering ────────────────────────────────────────────────────

  describe("🧱 Rendering — as='textarea'", () => {
    it("renders a textarea element when as='textarea'", () => {
      /**
       * The `as` prop switches the underlying form control.
       * The accessible role of a textarea is still "textbox".
       * what changes is the HTML element and its multi-line behaviour.
       */
      render(<FormHarness as="textarea" />);

      const input = screen.getByLabelText(/username/i);
      expect(input.tagName.toLowerCase()).toBe("textarea");
    });
  });

  // ── Validation states ─────────────────────────────────────────────────────

  describe("🎭 Interactions — validation and error display", () => {
    it("shows the validation error message after blur on an invalid field", async () => {
      /**
       * mode:"onTouched" means errors appear after blur, not on keystroke.
       * This tests the full path: blur → RHF validates → Zod returns error → FormField renders the feedback element.
       */
      const user = userEvent.setup();
      render(<FormHarness />);

      const input = screen.getByLabelText(/username/i);
      await user.type(input, "ab"); // too short
      await user.tab();

      expect(
        await screen.findByText(/at least 3 characters/i),
      ).toBeInTheDocument();
    });

    it("error message has role='alert' so screen readers announce it immediately", async () => {
      /**
       * role="alert" maps to aria-live="assertive". When the error element
       * appears in the DOM, screen readers interrupt to announce it — giving
       * users immediate feedback without polling.
       */
      const user = userEvent.setup();
      render(<FormHarness />);

      await user.type(screen.getByLabelText(/username/i), "ab");
      await user.tab();

      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });

    it("sets aria-invalid='true' on the input when it has an error", async () => {
      /**
       * aria-invalid is the machine-readable signal to assistive tech that
       * the field is in an error state. It complements the visual red border
       * (isInvalid) for users who cannot perceive colour.
       */
      const user = userEvent.setup();
      render(<FormHarness />);

      await user.type(screen.getByLabelText(/username/i), "ab");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toHaveAttribute(
          "aria-invalid",
          "true",
        );
      });
    });

    it("sets aria-describedby to the errorId when the field is invalid", async () => {
      /**
       * aria-describedby="${inputId}-error" connects the input to its error message.
       * so screen readers read the error alongside the label when the user focuses the field.
       * The errorId is `${formId}__${name}-error`.
       */
      const user = userEvent.setup();
      render(<FormHarness />);

      await user.type(screen.getByLabelText(/username/i), "ab");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toHaveAttribute(
          "aria-describedby",
          expect.stringContaining("test-form__username-error"),
        );
      });
    });

    it("error message element has the correct errorId", async () => {
      /**
       * The feedback element's id must match what aria-describedby points to.
       * A mismatch means the association exists in the attribute but the
       * referenced element doesn't exist — screen readers silently skip it.
       */
      const user = userEvent.setup();
      render(<FormHarness />);

      await user.type(screen.getByLabelText(/username/i), "ab");
      await user.tab();

      const error = await screen.findByRole("alert");
      expect(error).toHaveAttribute("id", "test-form__username-error");
    });

    it("clears the error and resets aria-invalid after valid input is entered", async () => {
      /**
       * Errors must clear as soon as the field becomes valid —
       * not persist until the next form submission.
       */
      const user = userEvent.setup();
      render(<FormHarness />);

      const input = screen.getByLabelText(/username/i);

      await user.type(input, "ab");
      await user.tab();
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      await user.clear(input);
      await user.type(input, "validuser");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(input).toHaveAttribute("aria-invalid", "false");
      });
    });

    it("includes ariaDescribedBy prop in aria-describedby when field is valid", () => {
      /**
       * When provided, ariaDescribedBy should be present in aria-describedby
       * regardless of validation state — it might point to a hint paragraph.
       */
      render(<FormHarness ariaDescribedBy="username-hint" />);

      expect(screen.getByLabelText(/username/i)).toHaveAttribute(
        "aria-describedby",
        "username-hint",
      );
    });

    it("includes both errorId and ariaDescribedBy in aria-describedby when field is invalid", async () => {
      /**
       * When invalid, aria-describedby must contain BOTH the errorId AND
       * the external hint id — not replace one with the other. This ensures
       * the screen reader announces both the error and the hint.
       */
      const user = userEvent.setup();
      render(<FormHarness ariaDescribedBy="username-hint" />);

      await user.type(screen.getByLabelText(/username/i), "ab");
      await user.tab();

      await waitFor(() => {
        const describedBy = screen
          .getByLabelText(/username/i)
          .getAttribute("aria-describedby");
        expect(describedBy).toContain("test-form__username-error");
        expect(describedBy).toContain("username-hint");
      });
    });
  });

  // ── Interactions — typing ─────────────────────────────────────────────────

  describe("🎭 Interactions — user input", () => {
    it("updates the input value as the user types", async () => {
      /**
       * Confirms the RHF Controller wires onChange correctly to the input.
       * If the onChange handler is broken, the input would appear frozen.
       */
      const user = userEvent.setup();
      render(<FormHarness />);

      const input = screen.getByLabelText(/username/i);
      await user.type(input, "hello");

      expect(input).toHaveValue("hello");
    });

    it("clears the input value when the user clears it", async () => {
      const user = userEvent.setup();
      render(<FormHarness />);

      const input = screen.getByLabelText(/username/i);
      await user.type(input, "hello");
      await user.clear(input);

      expect(input).toHaveValue("");
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  describe("♿ Accessibility", () => {
    it("input is keyboard-focusable via Tab", async () => {
      const user = userEvent.setup();
      render(<FormHarness />);

      await user.tab();

      expect(screen.getByLabelText(/username/i)).toHaveFocus();
    });
  });
});
