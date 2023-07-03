import { defineCollection, z } from "astro:content";

const tutorial = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    index: z.number(),
  }),
});
const docs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    since: z
      .string()
      .regex(/\d+\.\d+\.\d+/)
      .optional(),
  }),
});

export const collections = { tutorial, docs };
