import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  site: "https://jacobofbrooklyn.github.io",
  base: "/shasta",
  integrations: [tailwind(), mdx(), solidJs()],
});
