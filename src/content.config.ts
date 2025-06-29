import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const organisations = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/organisation",
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
  }),
});

const regions = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/region",
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
  }),
});

export const collections = { organisations, regions };
