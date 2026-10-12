import type { ComponentType } from "react"

export type Status = "stable" | "beta" | "draft" | "deprecated"

export type Frontmatter = {
  title: string
  description?: string
  status?: Status
  order?: number
  /** Shown on component overview cards and in search. */
  keywords?: string[]
  source?: string
  figma?: string
  /** ISO date, shown as "Last updated". */
  updated?: string
  /** Short history shown at the bottom of the page. */
  changes?: { version: string; date?: string; note: string }[]
}

type MdxModule = {
  default: ComponentType<{ components?: Record<string, unknown> }>
  frontmatter?: Frontmatter
}

export const SECTIONS = [
  { id: "getting-started", title: "Getting started" },
  { id: "foundations", title: "Foundations" },
  { id: "components", title: "Components" },
  { id: "patterns", title: "Patterns" },
  { id: "resources", title: "Resources" },
] as const

export type SectionId = (typeof SECTIONS)[number]["id"]

export type Page = {
  path: string
  section: SectionId
  slug: string
  file: string
  frontmatter: Frontmatter
  Component: MdxModule["default"]
}

const modules = import.meta.glob<MdxModule>("./content/**/*.mdx", {
  eager: true,
})

const sectionIndex = (id: string) => SECTIONS.findIndex((s) => s.id === id)

export const pages: Page[] = Object.entries(modules)
  .map(([file, mod]) => {
    const rel = file.replace(/^\.\/content\//, "").replace(/\.mdx$/, "")
    const [section, slug] = rel.split("/") as [SectionId, string]
    const fm = mod.frontmatter ?? { title: slug }
    return {
      path: `/${section}/${slug}`,
      section,
      slug,
      file: `src/docs/content/${rel}.mdx`,
      frontmatter: { ...fm, title: fm.title ?? slug },
      Component: mod.default,
    }
  })
  .filter((p) => sectionIndex(p.section) !== -1)
  .sort(
    (a, b) =>
      sectionIndex(a.section) - sectionIndex(b.section) ||
      (a.frontmatter.order ?? 50) - (b.frontmatter.order ?? 50) ||
      a.frontmatter.title.localeCompare(b.frontmatter.title)
  )

export const pagesIn = (section: SectionId) =>
  pages.filter((p) => p.section === section)

export const findPage = (path: string) => pages.find((p) => p.path === path)
