// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkToc from "remark-toc";
import remarkRelink from "./src/plugins/remarkRelink.js";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  markdown: {
    remarkPlugins: [[remarkToc, {heading: 'contents', maxDepth: 4}], remarkRelink,]
  }
});