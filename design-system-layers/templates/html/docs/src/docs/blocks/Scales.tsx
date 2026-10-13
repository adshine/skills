import * as React from "react"

export type TypeRole = { name: string; className: string; usage: string; sample?: string }

/** Type scale with live computed size, line height and weight. */
export function TypeScale({ roles, sample = "Book your next appointment" }: { roles: TypeRole[]; sample?: string }) {
  const refs = React.useRef<(HTMLSpanElement | null)[]>([])
  const [metrics, setMetrics] = React.useState<string[]>([])
  React.useEffect(() => {
    setMetrics(
      refs.current.map((el) => {
        if (!el) return ""
        const s = getComputedStyle(el)
        const px = parseFloat(s.fontSize)
        const lh = s.lineHeight === "normal" ? "normal" : `${parseFloat(s.lineHeight)}px`
        return `${px}px / ${lh} · ${s.fontWeight}`
      })
    )
  }, [roles])
  return (
    <div className="not-prose my-6 divide-y rounded-xl border">
      {roles.map((r, i) => (
        <div key={r.name} className="grid gap-2 p-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{r.name}</p>
            <p className="font-mono text-[0.6875rem] text-muted-foreground">{metrics[i]}</p>
            <code className="block font-mono text-[0.6875rem] break-words text-muted-foreground">{r.className}</code>
          </div>
          <div className="min-w-0 space-y-1">
            <span ref={(el) => { refs.current[i] = el }} className={`block truncate ${r.className}`}>
              {r.sample ?? sample}
            </span>
            <p className="text-sm text-muted-foreground">{r.usage}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Corner radius steps. `radius` is a CSS value, usually a multiple of var(--radius). */
export function RadiusScale({ steps }: { steps: { name: string; radius: string; usage: string }[] }) {
  return (
    <div className="not-prose my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((s) => (
        <div key={s.name} className="space-y-3 rounded-xl border p-4">
          <div className="h-20 border-2 border-primary/60 bg-primary/10" style={{ borderRadius: s.radius }} />
          <div>
            <p className="text-sm font-semibold">{s.name}</p>
            <code className="font-mono text-[0.6875rem] text-muted-foreground">{s.radius}</code>
            <p className="mt-1 text-sm text-muted-foreground">{s.usage}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SpacingScale({ steps = [1, 2, 3, 4, 6, 8, 10, 12, 16] }: { steps?: number[] }) {
  return (
    <div className="not-prose my-6 divide-y rounded-xl border">
      {steps.map((n) => (
        <div key={n} className="flex items-center gap-4 px-5 py-3">
          <code className="w-12 font-mono text-xs">{n}</code>
          <span className="w-16 font-mono text-xs text-muted-foreground">{n * 4}px</span>
          <span className="h-4 rounded-sm bg-primary/70" style={{ width: `${n * 4}px` }} />
        </div>
      ))}
    </div>
  )
}
