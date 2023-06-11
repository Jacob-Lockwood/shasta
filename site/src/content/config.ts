import { defineCollection, z } from "astro:content";

const tutorial = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    index: z.number(),
  }),
});

export const collections = { tutorial };
