/**
 * @file src/validations/categories-schemas.ts
 */

import z from "zod";

const createCategorySchema = z.object({
  title: z.string().trim().min(1, "Title is required").describe("Title"),
});

type TCreateCategorySchema = z.infer<typeof createCategorySchema>;

export { createCategorySchema, type TCreateCategorySchema };
