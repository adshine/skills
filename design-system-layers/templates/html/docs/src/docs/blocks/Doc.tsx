import * as React from "react"
import { AlertTriangleIcon, InfoIcon, LightbulbIcon } from "lucide-react"
import { cn } from "cn"
import { Link, useSearchParams } from "react-router"

import { StatusBadge } from "@/docs/blocks/StatusBadge"
import { pagesIn, type SectionId } from "@/docs/pages"

export function Callout({
  kind = "note",
  title,
  children,
}: {
  kind?: "note" | "tip" | "warning"
  title?: string
  children: React.ReactNode
}) {
  const Icon = kind === "warning" ? AlertTriangleIcon : kind === "tip" ? LightbulbIcon : InfoIcon
  return (
    <div
      className={cn(
        "not-prose my-6 flex gap-3 rounded-xl border p-4 text-sm",
        kind === "warning" && "border-destructive/30 bg-destructive/5",
        kind === "tip" && "border-primary/25 bg-primary/5",
        kind === "note" && "bg-muted/50"
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", kind === "warning" ? "text-destructive" : kind === "tip" ? "text-primary" : "text-muted-foreground")} />
      <div className="space-y-1 [&_p]:leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-foreground/85">{children}</div>
      </div>
    </div>
  )
}

export type Prop = { name: string; type: string; default?: string; description: string }

export function PropsTable({ props }: { props: Prop[] }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Prop</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Default</th>
            <th className="px-4 py-2.5 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name} className="border-t align-top">
              <td className="px-4 py-3"><code className="font-mono text-xs font-semibold">{p.name}</code></td>
              <td className="px-4 py-3"><code className="font-mono text-xs text-primary">{p.type}</code></td>
              <td className="px-4 py-3"><code className="font-mono text-xs text-muted-foreground">{p.default ?? "-"}</code></td>
              <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Numbered anatomy: put <Marker n={1} /> next to parts inside the preview. */
export function Anatomy({ children, parts }: { children: React.ReactNode; parts: string[] }) {
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border">
      <div className="flex min-h-40 items-center justify-center bg-background p-10">{children}</div>
      <figcaption className="border-t bg-muted/40 px-5 py-4">
        <ol className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {parts.map((p, i) => (
            <li key={p} className="flex items-center gap-2.5">
              <Marker n={i + 1} />
              {p}
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}

export function Marker({ n }: { n: number }) {
  return (
    <span className="inline-grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-[0.6875rem] font-semibold text-background">
      {n}
    </span>
  )
}

/** Page-level tabs (Usage, Code, Accessibility), synced to ?tab= so links can target a tab. */
export function DocTabs({ children }: { children: React.ReactNode }) {
  const tabs = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ label: string; children: React.ReactNode }>[]
  const [params, setParams] = useSearchParams()
  const ids = tabs.map((t) => t.props.label.toLowerCase().replace(/\s+/g, "-"))
  const current = ids.includes(params.get("tab") ?? "") ? params.get("tab")! : ids[0]
  return (
    <div className="my-2">
      <div role="tablist" aria-label="Page sections" className="not-prose sticky top-16 z-10 -mx-1 mb-8 flex gap-1 overflow-x-auto border-b bg-background/90 px-1 backdrop-blur">
        {tabs.map((t, i) => (
          <button
            key={ids[i]}
            role="tab"
            type="button"
            aria-selected={current === ids[i]}
            onClick={() => setParams((p) => { p.set("tab", ids[i]); return p }, { replace: true })}
            className={cn(
              "-mb-px border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
              current === ids[i] && "border-primary text-foreground"
            )}
          >
            {t.props.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={ids[i]} role="tabpanel" hidden={current !== ids[i]}>
          {current === ids[i] && t.props.children}
        </div>
      ))}
    </div>
  )
}

export function DocTab({ children }: { label: string; children: React.ReactNode }) {
  return <>{children}</>
}

/** Card grid of every page in a section, e.g. the components overview. */
export function SectionGrid({ section, exclude = [] }: { section: SectionId; exclude?: string[] }) {
  const items = pagesIn(section).filter((p) => !exclude.includes(p.slug))
  return (
    <div className="not-prose my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <Link
          key={p.path}
          to={p.path}
          className="group flex flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="font-semibold group-hover:text-primary">{p.frontmatter.title}</span>
            {p.frontmatter.status && p.frontmatter.status !== "stable" && <StatusBadge status={p.frontmatter.status} />}
          </span>
          <span className="text-sm text-muted-foreground">{p.frontmatter.description}</span>
        </Link>
      ))}
    </div>
  )
}
