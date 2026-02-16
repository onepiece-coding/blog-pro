/**
 * @file src/validations/auth-schemas.ts
 */

import z from "zod";

const loginSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),

  password: z.string().trim().min(1, "Password required"),
});

type TLoginSchema = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),

    email: z.email("Invalid email address").trim().toLowerCase(),

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

type TRegisterSchema = z.infer<typeof registerSchema>;

export { loginSchema, type TLoginSchema, registerSchema, type TRegisterSchema };
