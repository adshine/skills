import * as React from "react"
import { CodeIcon, MoonIcon, SunIcon } from "lucide-react"
import { cn } from "cn"

import { CodeBlock } from "@/docs/blocks/CodeBlock"

/** Remove shared leading indentation and blank edges from a template string. */
export function dedent(s: string) {
  const lines = s.replace(/^\n+|\s+$/g, "").split("\n")
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length))
  return lines.map((l) => l.slice(indent)).join("\n")
}

/**
 * Raw HTML rendered exactly as a client site would, using components.css,
 * with behavior from components.js wired up after it mounts.
 */
export function Html({ code, className }: { code: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (ref.current) window.DS?.enhance(ref.current)
  }, [code])
  return <div ref={ref} className={cn("contents", className)} dangerouslySetInnerHTML={{ __html: dedent(code) }} />
}

/**
 * Live example: plain HTML on a neutral stage, with its own light/dark switch
 * and the exact markup to copy. The code shown is the code rendered.
 */
export function Example({
  html,
  title,
  align = "center",
  stage = "default",
  defaultShowCode = false,
}: {
  html: string
  title?: string
  align?: "center" | "start" | "stretch"
  stage?: "default" | "narrow"
  defaultShowCode?: boolean
}) {
  const [dark, setDark] = React.useState(false)
  const [showCode, setShowCode] = React.useState(defaultShowCode)
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border bg-card">
      <div className={cn(dark && "dark")}>
        <div
          className={cn(
            "doc-stage flex min-h-36 flex-wrap gap-3 bg-background p-6 text-foreground sm:p-10",
            align === "center" && "items-center justify-center",
            align === "start" && "items-start justify-start",
            align === "stretch" && "flex-col items-stretch"
          )}
        >
          {stage === "narrow" ? (
            <div className="mx-auto grid w-full max-w-sm gap-4">
              <Html code={html} />
            </div>
          ) : (
            <Html code={html} />
          )}
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-t bg-muted/40 px-3 py-1.5">
        <span className="truncate text-xs text-muted-foreground">{title}</span>
        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Show example in light mode" : "Show example in dark mode"}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShowCode((s) => !s)}
            aria-expanded={showCode}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <CodeIcon className="size-4" /> {showCode ? "Hide HTML" : "Show HTML"}
          </button>
        </span>
      </figcaption>
      {showCode && (
        <div className="border-t">
          <CodeBlock code={dedent(html)} lang="html" />
        </div>
      )}
    </figure>
  )
}
