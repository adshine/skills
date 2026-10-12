import * as React from "react"
import { CodeIcon, MoonIcon, SunIcon } from "lucide-react"
import { cn } from "cn"

import { CodeBlock } from "@/docs/blocks/CodeBlock"

/**
 * Live example: the real component rendered on a neutral stage, with its own
 * light/dark switch and the exact code to copy. Pass the same JSX as `code`.
 */
export function Example({
  children,
  code,
  title,
  align = "center",
  stage = "default",
  defaultShowCode = false,
}: {
  children: React.ReactNode
  code?: string
  title?: string
  align?: "center" | "start" | "stretch"
  stage?: "default" | "phone"
  defaultShowCode?: boolean
}) {
  const [dark, setDark] = React.useState(false)
  const [showCode, setShowCode] = React.useState(defaultShowCode)
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border bg-card">
      <div className={cn(dark && "dark")}>
        <div
          className={cn(
            "doc-stage flex min-h-36 flex-wrap gap-3 bg-background p-8 text-foreground sm:p-10",
            align === "center" && "items-center justify-center",
            align === "start" && "items-start justify-start",
            align === "stretch" && "flex-col items-stretch",
            stage === "phone" && "justify-center"
          )}
        >
          {stage === "phone" ? <div className="w-full max-w-sm">{children}</div> : children}
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-t bg-muted/40 px-3 py-1.5">
        <span className="truncate text-xs text-muted-foreground">{title}</span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Show example in light mode" : "Show example in dark mode"}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </button>
          {code && (
            <button
              type="button"
              onClick={() => setShowCode((s) => !s)}
              aria-expanded={showCode}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <CodeIcon className="size-4" /> {showCode ? "Hide code" : "Show code"}
            </button>
          )}
        </span>
      </figcaption>
      {showCode && code && (
        <div className="border-t">
          <CodeBlock code={code} />
        </div>
      )}
    </figure>
  )
}
