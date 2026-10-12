import * as React from "react"
import { MenuIcon, MoonIcon, SunIcon, XIcon } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Search } from "@/docs/layout/Search"
import { Sidebar } from "@/docs/layout/Sidebar"
import { site } from "@/docs/site.config"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export function DocsLayout() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const location = useLocation()

  React.useEffect(() => {
    window.scrollTo({ top: 0 })
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-svh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-4 px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </Button>
          <Link to="/" className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-[calc(var(--radius)*0.8)] bg-primary font-heading text-sm font-bold text-primary-foreground"
            >
              {site.name.slice(0, 1)}
            </span>
            <span className="font-heading font-semibold tracking-tight">{site.name}</span>
            <span className="hidden text-muted-foreground sm:inline">Design System</span>
          </Link>
          <span className="hidden rounded-full border px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground md:inline">
            v{site.version}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <Search />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[90rem] px-4 lg:px-8">
        <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-60 shrink-0 overflow-y-auto py-8 pr-6 lg:block">
          <Sidebar />
        </aside>
        {menuOpen && (
          <div className="fixed inset-x-0 top-16 bottom-0 z-20 overflow-y-auto bg-background px-4 py-6 lg:hidden">
            <div className="mb-6 sm:hidden">
              <Search />
            </div>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        )}
        <main id="main" className="min-w-0 flex-1 lg:border-l lg:pl-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
