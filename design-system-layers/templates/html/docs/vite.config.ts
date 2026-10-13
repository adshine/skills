import { resolve } from "node:path"
import mdx from "@mdx-js/rollup"
import rehypeShiki from "@shikijs/rehype"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import rehypeSlug from "rehype-slug"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"
import { defineConfig } from "vite"

// The docs read the real deliverable files one folder up (theme.css, brand.css,
// components.css, components.js), so the docs and the shipped CSS never drift.
export default defineConfig({
  // Relative asset paths so the built docs work from any folder or static host.
  base: "./",
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [
          remarkGfm,
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
        ],
        rehypePlugins: [
          rehypeSlug,
          [rehypeShiki, { themes: { light: "github-light", dark: "github-dark" } }],
        ],
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
      "@ds": resolve(import.meta.dirname, ".."),
    },
  },
  server: { fs: { allow: [".."] } },
})
