/**
 * @file src/validations/password-schemas.ts
 */

import z from "zod";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number",
      ),

    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Password and Confirm Password does not match",
    path: ["confirmPassword"],
  });

type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

const sendResetPasswordLinkSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
});

type TSendResetPasswordLinkSchema = z.infer<typeof sendResetPasswordLinkSchema>;

export {
  resetPasswordSchema,
  type TResetPasswordSchema,
  sendResetPasswordLinkSchema,
  type TSendResetPasswordLinkSchema,
};
