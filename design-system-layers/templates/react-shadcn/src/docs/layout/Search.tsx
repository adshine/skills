import * as React from "react"
import { SearchIcon } from "lucide-react"
import { useNavigate } from "react-router"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { pagesIn, SECTIONS } from "@/docs/pages"

export function Search() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-full justify-start gap-2 rounded-lg px-3 text-muted-foreground sm:w-64"
      >
        <SearchIcon className="size-4" />
        <span className="flex-1 text-left font-normal">Search docs</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[0.6875rem] sm:inline">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search documentation">
        <CommandInput placeholder="Search foundations, components, patterns..." />
        <CommandList>
          <CommandEmpty>Nothing found.</CommandEmpty>
          {SECTIONS.map((s) => {
            const items = pagesIn(s.id)
            if (!items.length) return null
            return (
              <CommandGroup key={s.id} heading={s.title}>
                {items.map((p) => (
                  <CommandItem
                    key={p.path}
                    value={`${p.frontmatter.title} ${p.frontmatter.description ?? ""} ${(p.frontmatter.keywords ?? []).join(" ")}`}
                    onSelect={() => {
                      setOpen(false)
                      navigate(p.path)
                    }}
                  >
                    <span className="font-medium">{p.frontmatter.title}</span>
                    {p.frontmatter.description && (
                      <span className="ml-2 truncate text-xs text-muted-foreground">
                        {p.frontmatter.description}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  )
}
