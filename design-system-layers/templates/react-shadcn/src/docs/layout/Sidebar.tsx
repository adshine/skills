import { cn } from "cn"
import { NavLink } from "react-router"

import { pagesIn, SECTIONS } from "@/docs/pages"

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation" className="space-y-7 text-sm">
      {SECTIONS.map((section) => {
        const items = pagesIn(section.id)
        if (!items.length) return null
        return (
          <div key={section.id}>
            <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {items.map((p) => (
                <li key={p.path}>
                  <NavLink
                    to={p.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-lg px-3 py-1.5 text-foreground/80 transition-colors hover:bg-accent hover:text-foreground",
                        isActive &&
                          "bg-secondary font-medium text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
                      )
                    }
                  >
                    {p.frontmatter.title}
                    {p.frontmatter.status && p.frontmatter.status !== "stable" && (
                      <span className="text-[0.6875rem] font-normal text-muted-foreground capitalize">
                        {p.frontmatter.status}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
