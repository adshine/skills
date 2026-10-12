import { ArrowRightIcon, BlocksIcon, LayersIcon, RouteIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { pagesIn, type SectionId } from "@/docs/pages"
import { site } from "@/docs/site.config"

const LAYERS: { id: SectionId; title: string; body: string; Icon: typeof LayersIcon }[] = [
  {
    id: "foundations",
    title: "Foundations",
    body: "Color, type, shape, spacing and motion, with the reasoning behind every rule.",
    Icon: LayersIcon,
  },
  {
    id: "components",
    title: "Components",
    body: "Accessible building blocks with live examples, code to copy and usage guidance.",
    Icon: BlocksIcon,
  },
  {
    id: "patterns",
    title: "Patterns",
    body: "How components come together to solve the jobs people come to the product for.",
    Icon: RouteIcon,
  },
]

export function Home() {
  const first = (id: SectionId) => pagesIn(id)[0]?.path ?? "/"
  return (
    <div className="max-w-5xl py-14">
      <section className="space-y-6">
        <p className="text-sm font-medium text-primary">{site.name} Design System · v{site.version}</p>
        <h1 className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
          {site.tagline}
        </h1>
        <p className="max-w-2xl text-lg text-pretty text-muted-foreground">{site.description}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button size="lg" asChild>
            <Link to={first("getting-started")}>
              Get started <ArrowRightIcon />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={first("components")}>Browse components</Link>
          </Button>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {LAYERS.map(({ id, title, body, Icon }) => (
          <Link
            key={id}
            to={first(id)}
            className="group flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <Icon className="size-5" />
            </span>
            <span className="space-y-1.5">
              <span className="flex items-center gap-2 font-heading text-lg font-semibold">
                {title}
                <ArrowRightIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <span className="block text-sm text-muted-foreground">{body}</span>
            </span>
            <span className="mt-auto text-xs text-muted-foreground">{pagesIn(id).length} {pagesIn(id).length === 1 ? "page" : "pages"}</span>
          </Link>
        ))}
      </section>

      <section className="mt-16 grid gap-8 rounded-2xl border bg-muted/30 p-8 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">For developers</h2>
          <p className="text-sm text-muted-foreground">
            Components live in <code className="font-mono text-xs">src/components/ui</code> and read only the theme
            variables, so the brand comes through everywhere.
          </p>
          <Link to="/getting-started/developers" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Developer guide <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">For designers</h2>
          <p className="text-sm text-muted-foreground">
            Start from the principles and foundations, then reuse patterns before inventing new screens.
          </p>
          <Link to="/getting-started/principles" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Design principles <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
