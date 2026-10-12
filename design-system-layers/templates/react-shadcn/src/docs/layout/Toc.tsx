import * as React from "react"
import { cn } from "cn"
import { useLocation } from "react-router"

type Heading = { id: string; text: string; level: number }

/** "On this page": built from the rendered h2/h3 so it follows tabs and edits. */
export function Toc() {
  const location = useLocation()
  const [headings, setHeadings] = React.useState<Heading[]>([])
  const [active, setActive] = React.useState<string>("")

  React.useEffect(() => {
    const article = document.querySelector("[data-doc-article]")
    if (!article) return
    const collect = () =>
      setHeadings(
        [...article.querySelectorAll<HTMLElement>("h2[id], h3[id]")]
          .filter((h) => h.offsetParent !== null)
          .map((h) => ({
            id: h.id,
            text: h.textContent ?? "",
            level: h.tagName === "H2" ? 2 : 3,
          }))
      )
    collect()
    const mo = new MutationObserver(collect)
    mo.observe(article, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "data-state"] })
    return () => mo.disconnect()
  }, [location.pathname, location.search])

  React.useEffect(() => {
    if (!headings.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [headings])

  if (headings.length < 2) return null
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        On this page
      </p>
      <ul className="space-y-1.5 border-l">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${location.pathname}${location.search}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                setActive(h.id)
              }}
              className={cn(
                "-ml-px block border-l border-transparent py-0.5 text-muted-foreground transition-colors hover:text-foreground",
                h.level === 3 ? "pl-6" : "pl-3",
                active === h.id && "border-primary font-medium text-foreground"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
