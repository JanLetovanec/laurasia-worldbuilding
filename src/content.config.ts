import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content",
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
  })
})

export const collections = { articles };
