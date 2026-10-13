import * as React from "react"
import { SearchIcon } from "lucide-react"
import { cn } from "cn"
import { useNavigate } from "react-router"

import { pages, SECTIONS } from "@/docs/pages"

/** Command-style search over every page, built on the native dialog element. */
export function Search() {
  const ref = React.useRef<HTMLDialogElement>(null)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const navigate = useNavigate()
  const listId = React.useId()

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = pages.map((p) => ({
      page: p,
      section: SECTIONS.find((s) => s.id === p.section)!.title,
      text: `${p.frontmatter.title} ${p.frontmatter.description ?? ""} ${(p.frontmatter.keywords ?? []).join(" ")}`.toLowerCase(),
    }))
    if (!q) return all
    return all
      .filter((r) => q.split(/\s+/).every((w) => r.text.includes(w)))
      .sort((a, b) => Number(!a.page.frontmatter.title.toLowerCase().includes(q)) - Number(!b.page.frontmatter.title.toLowerCase().includes(q)))
  }, [query])

  const open = React.useCallback(() => {
    setQuery("")
    setActive(0)
    ref.current?.showModal()
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (ref.current?.open) ref.current.close()
        else open()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const go = (path: string) => {
    ref.current?.close()
    navigate(path)
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="btn btn--outline h-9 w-full justify-start gap-2 px-3 font-normal text-muted-foreground sm:w-64"
      >
        <SearchIcon className="size-4" />
        <span className="flex-1 text-left">Search docs</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[0.6875rem] sm:inline">Ctrl K</kbd>
      </button>
      <dialog
        ref={ref}
        aria-label="Search documentation"
        onClick={(e) => e.target === ref.current && ref.current.close()}
        className="dialog mt-[12vh] w-[min(36rem,calc(100%-2rem))] p-0"
      >
        <div className="flex items-center gap-2 border-b px-4">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, results.length - 1))
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              } else if (e.key === "Enter" && results[active]) {
                e.preventDefault()
                go(results[active].page.path)
              }
            }}
            placeholder="Search foundations, components, patterns..."
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul id={listId} role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing found.</li>}
          {results.map((r, i) => (
            <li
              key={r.page.path}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => go(r.page.path)}
              className={cn("flex cursor-pointer items-baseline gap-2 rounded-md px-3 py-2 text-sm", i === active && "bg-accent text-accent-foreground")}
            >
              <span className="shrink-0 font-medium">{r.page.frontmatter.title}</span>
              <span className="truncate text-xs text-muted-foreground">{r.section}</span>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  )
}
