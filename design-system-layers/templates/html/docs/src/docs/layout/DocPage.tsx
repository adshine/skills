import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon } from "lucide-react"
import { Link, Navigate, useLocation } from "react-router"
import { MDXProvider } from "@mdx-js/react"

import { mdxComponents } from "@/docs/mdx-components"
import { StatusBadge } from "@/docs/blocks/StatusBadge"
import { Toc } from "@/docs/layout/Toc"
import { findPage, pages, SECTIONS } from "@/docs/pages"
import { site } from "@/docs/site.config"

export function DocPage() {
  const { pathname } = useLocation()
  const page = findPage(pathname)
  if (!page) return <Navigate to="/" replace />

  const { frontmatter: fm, Component } = page
  const i = pages.indexOf(page)
  const prev = pages[i - 1]
  const next = pages[i + 1]
  const section = SECTIONS.find((s) => s.id === page.section)!

  return (
    <div className="flex gap-12 py-10">
      <article data-doc-article className="min-w-0 max-w-3xl flex-1">
        <header className="mb-10 space-y-4 border-b pb-8">
          <p className="text-sm font-medium text-primary">{section.title}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance">
              {fm.title}
            </h1>
            {fm.status && <StatusBadge status={fm.status} />}
          </div>
          {fm.description && (
            <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
              {fm.description}
            </p>
          )}
          {(fm.source || fm.figma || site.repoUrl || fm.updated) && (
            <div className="flex flex-wrap gap-4 pt-1 text-sm">
              {fm.updated && (
                <span className="text-muted-foreground">
                  Last updated {new Date(fm.updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                </span>
              )}
              {fm.source && (
                <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={fm.source}>
                  Source <ExternalLinkIcon className="size-3.5" />
                </a>
              )}
              {fm.figma && (
                <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={fm.figma}>
                  Figma <ExternalLinkIcon className="size-3.5" />
                </a>
              )}
              {site.repoUrl && (
                <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={`${site.repoUrl}/blob/main/${page.file}`}>
                  Edit this page <ExternalLinkIcon className="size-3.5" />
                </a>
              )}
            </div>
          )}
        </header>

        <div className="doc-prose">
          <MDXProvider components={mdxComponents}>
            <Component />
          </MDXProvider>
        </div>

        {fm.changes && fm.changes.length > 0 && (
          <section className="mt-16">
            <h2 id="changelog" className="font-heading text-xl font-semibold">Changelog</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Version</th>
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {fm.changes.map((c) => (
                    <tr key={c.version + c.note} className="border-t align-top">
                      <td className="px-4 py-3 font-mono text-xs">{c.version}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{c.date ?? "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 px-5 py-4 text-sm">
          <span className="text-muted-foreground">Was this page helpful? Something missing or wrong?</span>
          {site.repoUrl ? (
            <a className="font-medium text-primary" href={`${site.repoUrl}/issues/new?title=${encodeURIComponent(`Docs: ${fm.title}`)}`}>
              Give feedback
            </a>
          ) : (
            <Link className="font-medium text-primary" to="/resources/contributing">How to give feedback</Link>
          )}
        </div>

        <nav aria-label="Previous and next" className="mt-8 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link to={prev.path} className="group rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-accent/50">
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeftIcon className="size-3" /> Previous</span>
              <span className="mt-1 block font-medium">{prev.frontmatter.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link to={next.path} className="group rounded-xl border p-4 text-right transition-colors hover:border-primary/40 hover:bg-accent/50">
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">Next <ArrowRightIcon className="size-3" /></span>
              <span className="mt-1 block font-medium">{next.frontmatter.title}</span>
            </Link>
          )}
        </nav>
      </article>
      <aside className="sticky top-24 hidden h-fit w-52 shrink-0 xl:block">
        <Toc />
      </aside>
    </div>
  )
}
