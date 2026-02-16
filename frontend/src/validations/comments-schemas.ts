import z from "zod";

const commentsSchema = z.object({
  text: z.string().trim().min(1, "Comment text is required!"),
});

type TCommentsSchema = z.infer<typeof commentsSchema>;

export { commentsSchema, type TCommentsSchema };
