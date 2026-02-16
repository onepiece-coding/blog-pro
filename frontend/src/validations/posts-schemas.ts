import z from "zod";

const MAX_FILE_SIZE = 1000000; // 1MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Post title must be at least 2 characters")
    .max(200, "Post title must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Post description must be at least 10 characters"),
  categoryId: z
    .string()
    .min(1, "Please select a category")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Category selection"),
  image: z
    .any()
    .refine((file) => file instanceof File, "Post image is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 1MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
});

type TCreatePostSchema = z.infer<typeof createPostSchema>;

const updatePostSchema = z.object({
  title: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z
      .string()
      .trim()
      .min(2, "Post title must be at least 2 characters")
      .max(200, "Post title must be less than 200 characters")
      .optional(),
  ),
  description: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z
      .string()
      .trim()
      .min(10, "Post description must be at least 10 characters")
      .optional(),
  ),
  categoryId: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z
      .string()
      .min(1, "Please select a category")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Category selection")
      .optional(),
  ),
});

type TUpdatePostSchema = z.infer<typeof updatePostSchema>;
type TUpdatePostOutput = z.output<typeof updatePostSchema>;
type TUpdatePostInput = z.input<typeof updatePostSchema>;

const filtrationSchema = z.object({
  category: z.string().optional(),
});

type TFiltrationSchema = z.infer<typeof filtrationSchema>;

export {
  createPostSchema,
  type TCreatePostSchema,
  updatePostSchema,
  type TUpdatePostSchema,
  type TUpdatePostOutput,
  type TUpdatePostInput,
  filtrationSchema,
  type TFiltrationSchema,
};
