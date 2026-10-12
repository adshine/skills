import { cn } from "cn"

import type { Status } from "@/docs/pages"

const LABELS: Record<Status, string> = {
  stable: "Stable",
  beta: "Beta",
  draft: "Draft",
  deprecated: "Deprecated",
}

const STYLES: Record<Status, string> = {
  stable: "border-primary/30 bg-primary/10 text-primary",
  beta: "border-border bg-secondary text-secondary-foreground",
  draft: "border-border bg-muted text-muted-foreground",
  deprecated: "border-destructive/30 bg-destructive/10 text-destructive",
}

export function StatusBadge({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {LABELS[status]}
    </span>
  )
}
