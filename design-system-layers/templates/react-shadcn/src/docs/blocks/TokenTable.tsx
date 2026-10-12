import * as React from "react"

import { CopyButton } from "@/docs/blocks/CodeBlock"
import { contrast, readVar } from "@/docs/blocks/tokens"

export type ColorToken = {
  /** CSS variable without the leading dashes, e.g. "primary". */
  name: string
  /** Paired text color for the contrast check, e.g. "primary-foreground". */
  on?: string
  usage: string
}

function Swatch({ value }: { value: string }) {
  return (
    <span
      className="inline-block size-6 shrink-0 rounded-md border shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)]"
      style={{ background: value }}
    />
  )
}

function Ratio({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground">n/a</span>
  const pass = value >= 4.5 ? "AA" : value >= 3 ? "AA large" : "Fail"
  return (
    <span className="whitespace-nowrap">
      {value.toFixed(1)}:1{" "}
      <span className={pass === "Fail" ? "text-destructive" : "text-muted-foreground"}>{pass}</span>
    </span>
  )
}

export function TokenTable({ tokens }: { tokens: ColorToken[] }) {
  const [rows, setRows] = React.useState<
    (ColorToken & { light: string; dark: string; cl: number | null; cd: number | null })[]
  >([])
  React.useEffect(() => {
    setRows(
      tokens.map((t) => {
        const light = readVar(t.name, false)
        const dark = readVar(t.name, true)
        return {
          ...t,
          light,
          dark,
          cl: t.on ? contrast(light, readVar(t.on, false)) : null,
          cd: t.on ? contrast(dark, readVar(t.on, true)) : null,
        }
      })
    )
  }, [tokens])
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Token</th>
            <th className="px-4 py-2.5 font-medium">Light</th>
            <th className="px-4 py-2.5 font-medium">Dark</th>
            <th className="px-4 py-2.5 font-medium">Text contrast</th>
            <th className="px-4 py-2.5 font-medium">Use for</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t align-top">
              <td className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <code className="font-mono text-xs">--{r.name}</code>
                  <CopyButton text={`var(--${r.name})`} className="size-6" />
                </span>
                <code className="font-mono text-[0.6875rem] text-muted-foreground">bg-{r.name}</code>
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2"><Swatch value={r.light} /><code className="font-mono text-xs">{r.light}</code></span>
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2"><Swatch value={r.dark} /><code className="font-mono text-xs">{r.dark}</code></span>
              </td>
              <td className="px-4 py-3 text-xs">
                {r.on ? (
                  <span className="grid gap-0.5">
                    <span>Light <Ratio value={r.cl} /></span>
                    <span>Dark <Ratio value={r.cd} /></span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">n/a</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Big pairs of fill + text color, the way people actually see them. */
export function ColorPairs({ pairs }: { pairs: { bg: string; fg: string; label: string }[] }) {
  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {pairs.map((p) => (
        <div
          key={p.bg}
          className="flex h-28 flex-col justify-between rounded-xl border p-4"
          style={{ background: `var(--${p.bg})`, color: `var(--${p.fg})` }}
        >
          <span className="text-sm font-semibold">{p.label}</span>
          <code className="font-mono text-xs opacity-80">--{p.bg} / --{p.fg}</code>
        </div>
      ))}
    </div>
  )
}
