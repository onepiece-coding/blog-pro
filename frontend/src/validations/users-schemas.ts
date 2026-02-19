/**
 * @file src/validations/users-schemas.ts
 */

import z from "zod";

const updateUserProfileSchema = z
  .object({
    username: z.preprocess(
      // preprocess => before validation
      (val) => (val === null || val === "" ? undefined : val),
      z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Username can only contain letters, numbers, and underscores",
        )
        .optional(),
    ),

    bio: z.preprocess(
      (val) => (val === null || val === "" ? undefined : val),
      z
        .string()
        .trim()
        .min(10, "Bio must be at least 10 characters")
        .max(30, "Bio must be less than 30 characters")
        .optional(),
    ),

    password: z.preprocess(
      (val) => (val === null || val === "" ? undefined : val),
      z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain uppercase, lowercase, and number",
        )
        .optional(),
    ),

    confirmPassword: z.preprocess(
      (val) => (val === null || val === "" ? undefined : val),
      z.string().optional(),
    ),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Password and Confirm Password does not match",
    path: ["confirmPassword"],
  });

type TUpdateUserProfileSchema = z.infer<typeof updateUserProfileSchema>;
type TUpdateUserOutput = z.output<typeof updateUserProfileSchema>;
type TUpdateUserInput = z.input<typeof updateUserProfileSchema>;

export {
  updateUserProfileSchema,
  type TUpdateUserProfileSchema,
  type TUpdateUserInput,
  type TUpdateUserOutput,
};
