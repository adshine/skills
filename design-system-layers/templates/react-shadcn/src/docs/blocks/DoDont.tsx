import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"
import { cn } from "cn"

export function DoDont({ children }: { children: React.ReactNode }) {
  return <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">{children}</div>
}

function Card({
  kind,
  children,
  caption,
}: {
  kind: "do" | "dont"
  children: React.ReactNode
  caption: React.ReactNode
}) {
  const isDo = kind === "do"
  return (
    <figure className="overflow-hidden rounded-xl border bg-card">
      <div className="flex min-h-36 flex-wrap items-center justify-center gap-3 bg-background p-6">
        {children}
      </div>
      <figcaption
        className={cn(
          "border-t-4 px-4 py-3 text-sm",
          isDo ? "border-t-primary" : "border-t-destructive"
        )}
      >
        <span
          className={cn(
            "mb-1 flex items-center gap-1.5 font-semibold",
            isDo ? "text-primary" : "text-destructive"
          )}
        >
          {isDo ? <CheckIcon className="size-4" /> : <XIcon className="size-4" />}
          {isDo ? "Do" : "Don't"}
        </span>
        <span className="text-muted-foreground">{caption}</span>
      </figcaption>
    </figure>
  )
}

export const Do = (p: { children: React.ReactNode; caption: React.ReactNode }) => <Card kind="do" {...p} />
export const Dont = (p: { children: React.ReactNode; caption: React.ReactNode }) => <Card kind="dont" {...p} />
