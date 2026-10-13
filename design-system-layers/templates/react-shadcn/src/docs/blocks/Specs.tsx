import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Live specifications. Renders the real component on a stage, then measures
 * the rendered DOM (getComputedStyle and layout boxes) so the numbers can never
 * drift from the code. Nothing in the table is typed by hand.
 *
 * Usage:
 *   <Specs parts={[{ label: "Container", selector: "[data-slot=button]" }]}>
 *     <Spec label="Default"><Button>Book now</Button></Spec>
 *     <Spec label="Small"><Button size="sm">Book now</Button></Spec>
 *   </Specs>
 *
 * A part with scope "linked" is looked up inside content that a trigger in the
 * specimen points to with aria-controls or aria-describedby (popovers, menus,
 * dialogs, which render in a portal). Scope "document" searches the whole page
 * (toasts). Portal parts that are closed show "Open it to measure" until opened;
 * the last reading is kept after they close.
 */

export type SpecPart = {
  label: string
  selector: string
  scope?: "specimen" | "linked" | "document"
}

type Rgba = { r: number; g: number; b: number; a: number }

type Measure = {
  width: number
  height: number
  minWidth: string
  paddingY: string
  paddingX: string
  border: string
  radius: string
  fontSize: string
  lineHeight: string
  fontWeight: string
  gap: string
  background: string
  text: string
  borderColor: string
  touch: { interactive: boolean; pass: boolean; hit?: string }
}

const COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "signature",
  "signature-foreground",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
]

// Radius tokens are inlined by Tailwind, so read them back from the utility classes themselves.
const RADIUS_CLASSES = ["rounded-xs", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-4xl"]

const TOUCH_MIN = 44

const INTERACTIVE =
  "button, a[href], input, select, textarea, summary, [role=button], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=combobox], [role=gridcell] button, [tabindex]:not([tabindex='-1'])"

/* ---------- color helpers ---------- */

let canvasCtx: CanvasRenderingContext2D | null = null
function ctx() {
  if (!canvasCtx) {
    const c = document.createElement("canvas")
    c.width = c.height = 1
    canvasCtx = c.getContext("2d", { willReadFrequently: true })
  }
  return canvasCtx
}

/** Any CSS color string to rgba, using the browser's own parser. */
function toRgba(input: string): Rgba | null {
  const css = input.trim()
  if (!css || css === "transparent" || css === "none") return { r: 0, g: 0, b: 0, a: 0 }
  let alpha = 1
  let opaque = css
  const legacy = css.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/)
  if (legacy) {
    const a = legacy[4]
    alpha = a === undefined ? 1 : a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a)
    return { r: Math.round(+legacy[1]), g: Math.round(+legacy[2]), b: Math.round(+legacy[3]), a: alpha }
  }
  const slash = css.match(/\/\s*([\d.]+%?)\s*\)$/)
  if (slash) {
    alpha = slash[1].endsWith("%") ? parseFloat(slash[1]) / 100 : parseFloat(slash[1])
    opaque = css.replace(/\s*\/\s*[\d.]+%?\s*\)$/, ")")
  }
  const c = ctx()
  if (!c) return null
  c.fillStyle = "#010203"
  c.fillStyle = opaque
  if (c.fillStyle === "#010203" && !/^#010203$/i.test(opaque)) return null
  c.clearRect(0, 0, 1, 1)
  c.fillRect(0, 0, 1, 1)
  const [r, g, b] = c.getImageData(0, 0, 1, 1).data
  return { r, g, b, a: alpha }
}

const hex = ({ r, g, b }: Rgba) => "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")

function close(a: Rgba, b: Rgba) {
  return Math.abs(a.r - b.r) <= 2 && Math.abs(a.g - b.g) <= 2 && Math.abs(a.b - b.b) <= 2
}

type TokenMap = { colors: { name: string; rgba: Rgba }[]; radii: { name: string; px: number }[] }

function readColors(scope: Element): TokenMap["colors"] {
  const cs = getComputedStyle(scope)
  return COLOR_TOKENS.flatMap((name) => {
    const raw = cs.getPropertyValue(`--${name}`)
    const rgba = raw ? toRgba(raw) : null
    return rgba && rgba.a > 0 ? [{ name, rgba }] : []
  })
}

function readTokens(scope: HTMLElement): TokenMap {
  const colors = readColors(scope)
  const probe = document.createElement("div")
  probe.style.cssText = "position:absolute;visibility:hidden;width:0;height:0;pointer-events:none"
  scope.appendChild(probe)
  const radii = RADIUS_CLASSES.flatMap((name) => {
    probe.className = name
    const px = parseFloat(getComputedStyle(probe).borderTopLeftRadius)
    return px > 0 ? [{ name, px }] : []
  })
  probe.remove()
  return { colors, radii }
}

type ColorKind = "background" | "text" | "border"

/** Several roles can share a value (white is both --card and --primary-foreground), so rank by what the color is used for. */
function rank(name: string, kind: ColorKind, prefer?: string) {
  if (prefer && name === prefer) return 0
  const fg = name.endsWith("foreground")
  if (kind === "text") return fg ? 1 : 2
  if (kind === "border") return ["border", "input", "ring"].includes(name) ? 1 : fg ? 3 : 2
  return fg ? 2 : 1
}

function matchColor(css: string, tokens: TokenMap, kind: ColorKind, prefer?: string) {
  const c = toRgba(css)
  if (!c) return { text: css, token: undefined as string | undefined }
  if (c.a === 0) return { text: "none", token: undefined }
  const match = tokens.colors
    .filter((t) => close(t.rgba, c))
    .sort((a, b) => rank(a.name, kind, prefer) - rank(b.name, kind, prefer))[0]
  const base = match ? `--${match.name} (${hex(match.rgba)})` : hex(c)
  return { text: c.a < 0.995 ? `${base} at ${Math.round(c.a * 100)}%` : base, token: match?.name }
}

/* ---------- box helpers ---------- */

const px = (v: string) => Math.round(parseFloat(v) * 100) / 100
const fmt = (n: number) => `${Math.round(n * 100) / 100}px`

function pair(a: number, b: number, an: string, bn: string) {
  if (a === b) return a === 0 ? "none" : fmt(a)
  return `${an} ${fmt(a)}, ${bn} ${fmt(b)}`
}

function sides(t: number, r: number, b: number, l: number) {
  if (t === r && r === b && b === l) return t === 0 ? "none" : fmt(t)
  if (t === b && l === r) return `${fmt(t)} top and bottom, ${fmt(l)} sides`
  return `top ${fmt(t)}, right ${fmt(r)}, bottom ${fmt(b)}, left ${fmt(l)}`
}

function size(el: Element) {
  if (el instanceof HTMLElement) return { width: el.offsetWidth, height: el.offsetHeight }
  // SVG and other non-HTML nodes: undo any scale transform by using the box from layout.
  const r = el.getBoundingClientRect()
  return { width: r.width, height: r.height }
}

function measure(el: Element, tokens: TokenMap): Measure {
  const cs = getComputedStyle(el)
  const { width, height } = size(el)
  const bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(px)
  const hasBorder = bw.some((n) => n > 0) && cs.borderTopStyle !== "none"
  const radius = px(cs.borderTopLeftRadius)
  const effective = Math.min(radius, width / 2, height / 2)
  let radiusText = radius === 0 ? "none" : fmt(effective)
  if (radius > 0 && radius > Math.min(width, height) / 2 + 0.5) {
    radiusText = `${fmt(effective)}, full`
  } else if (radius > 0) {
    const tok = tokens.radii.find((t) => Math.abs(t.px - radius) < 0.5)
    if (tok) radiusText = `${fmt(radius)} (${tok.name})`
  }
  const gapRow = cs.rowGap
  const gapCol = cs.columnGap
  const display = cs.display
  const layout = /flex|grid/.test(display)
  let gap = "none"
  if (layout) {
    const g = [gapRow, gapCol].map((v) => (v === "normal" ? 0 : px(v)))
    gap = g[0] === g[1] ? (g[0] === 0 ? "none" : fmt(g[0])) : `${fmt(g[0])} rows, ${fmt(g[1])} columns`
  }
  const interactive = el.matches(INTERACTIVE)
  const isSvg = el instanceof SVGElement
  const bg = matchColor(cs.backgroundColor, tokens, "background")
  // Text sits on the nearest painted surface, so prefer that surface's paired foreground role.
  let surface = bg.token
  for (let n = el.parentElement; !surface && n; n = n.parentElement) {
    const c = toRgba(getComputedStyle(n).backgroundColor)
    if (c && c.a > 0) surface = matchColor(getComputedStyle(n).backgroundColor, tokens, "background").token ?? "none"
  }
  // An absolutely positioned ::after with negative insets enlarges the tap area without changing the look.
  let hitW = width
  let hitH = height
  const after = getComputedStyle(el, "::after")
  if (after.content !== "none" && after.position === "absolute") {
    const inset = (v: string) => (v.endsWith("px") ? parseFloat(v) : 0)
    hitW = Math.max(width, width - inset(after.left) - inset(after.right))
    hitH = Math.max(height, height - inset(after.top) - inset(after.bottom))
  }
  return {
    width,
    height,
    minWidth: cs.minWidth === "auto" || cs.minWidth === "0px" ? "none" : cs.minWidth,
    paddingY: pair(px(cs.paddingTop), px(cs.paddingBottom), "top", "bottom"),
    paddingX: pair(px(cs.paddingLeft), px(cs.paddingRight), "left", "right"),
    border: hasBorder ? sides(bw[0], bw[1], bw[2], bw[3]) : "none",
    radius: radiusText,
    fontSize: isSvg ? "none" : cs.fontSize,
    lineHeight: isSvg ? "none" : cs.lineHeight,
    fontWeight: isSvg ? "none" : cs.fontWeight,
    gap,
    background: bg.text,
    text: matchColor(cs.color, tokens, "text", surface && surface !== "none" ? `${surface}-foreground` : undefined).text,
    borderColor: hasBorder ? matchColor(cs.borderTopColor, tokens, "border", bg.token).text : "none",
    touch: { interactive, pass: hitW >= TOUCH_MIN && hitH >= TOUCH_MIN, hit: hitW !== width || hitH !== height ? `${Math.round(hitW)} x ${Math.round(hitH)}px hit area` : undefined },
  }
}

/* ---------- finding targets ---------- */

function linkedRoots(specimen: Element): Element[] {
  const ids = new Set<string>()
  const nodes = [specimen, ...specimen.querySelectorAll("[aria-controls], [aria-describedby]")]
  for (const n of nodes) {
    for (const attr of ["aria-controls", "aria-describedby"]) {
      n.getAttribute(attr)?.split(/\s+/).forEach((id) => id && ids.add(id))
    }
  }
  const roots: Element[] = []
  ids.forEach((id) => {
    const el = document.getElementById(id)
    if (!el || specimen.contains(el)) return
    roots.push(el.closest("[data-radix-popper-content-wrapper]") ?? el)
  })
  return roots
}

function findTarget(specimen: Element, part: SpecPart | null): Element | null {
  if (!part) return specimen.firstElementChild
  const scope = part.scope ?? "specimen"
  if (scope === "document") return document.querySelector(part.selector)
  if (scope === "linked") {
    for (const root of linkedRoots(specimen)) {
      if (root.matches(part.selector)) return root
      const hit = root.querySelector(part.selector)
      if (hit) return hit
    }
    return null
  }
  if (specimen.firstElementChild?.matches(part.selector)) return specimen.firstElementChild
  return specimen.querySelector(part.selector)
}

/**
 * Outermost ancestor of portal content that does not also hold the stage, so the
 * dark toggle can reach it without touching the rest of the page.
 */
function portalRoot(el: Element, stage: Element): HTMLElement | null {
  if (el.contains(stage) || stage.contains(el)) return null
  let n: Element = el
  while (n.parentElement && n.parentElement !== document.body && !n.parentElement.contains(stage)) n = n.parentElement
  return n instanceof HTMLElement ? n : null
}

/* ---------- components ---------- */

/** One specimen on the Specs stage. The label becomes the table column heading. */
export function Spec({ children }: { label: string; className?: string; children: React.ReactNode }) {
  return <>{children}</>
}

type Row = { key: keyof Measure; label: string }

const ROWS: Row[] = [
  { key: "width", label: "Width" },
  { key: "height", label: "Height" },
  { key: "minWidth", label: "Min width" },
  { key: "paddingY", label: "Padding top and bottom" },
  { key: "paddingX", label: "Padding left and right" },
  { key: "gap", label: "Gap" },
  { key: "border", label: "Border width" },
  { key: "radius", label: "Corner radius" },
  { key: "fontSize", label: "Font size" },
  { key: "lineHeight", label: "Line height" },
  { key: "fontWeight", label: "Font weight" },
  { key: "background", label: "Background" },
  { key: "text", label: "Text and icon color" },
  { key: "borderColor", label: "Border color" },
  { key: "touch", label: `Touch target (${TOUCH_MIN} x ${TOUCH_MIN}px)` },
]

export function Specs({
  children,
  parts,
  title,
  minHeight,
  align = "center",
}: {
  children: React.ReactNode
  parts?: SpecPart[]
  title?: string
  /** Extra stage height in px, for open popovers or menus that hang below their trigger. */
  minHeight?: number
  align?: "center" | "start"
}) {
  const [dark, setDark] = React.useState(false)
  const [data, setData] = React.useState<(Measure | null)[][]>([])
  const stageRef = React.useRef<HTMLDivElement>(null)
  // Last reading per mode, so a closed overlay keeps its numbers without mixing light and dark.
  const lastRef = React.useRef<{ light: (Measure | null)[][]; dark: (Measure | null)[][] }>({ light: [], dark: [] })
  const darkRef = React.useRef(dark)
  darkRef.current = dark

  const specimens = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{
    label?: string
    className?: string
    children?: React.ReactNode
  }>[]
  const labels = specimens.map((s, i) => (s.type === Spec && s.props.label) || `Specimen ${i + 1}`)
  const partList: (SpecPart | null)[] = parts?.length ? parts : [null]

  const run = React.useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const tokens = readTokens(stage)
    const wrappers = [...stage.querySelectorAll(":scope > [data-specimen]")]
    const next = partList.map((part, pi) =>
      wrappers.map((w, si) => {
        const el = findTarget(w, part)
        if (el && part && part.scope && part.scope !== "specimen") {
          const root = portalRoot(el, stage)
          if (root) {
            if (darkRef.current) {
              // Same as the page body in dark mode: dark tokens plus the inherited foreground.
              root.classList.add("dark", "text-foreground")
              root.dataset.specsDark = "true"
            } else if (root.dataset.specsDark) {
              root.classList.remove("dark", "text-foreground")
              delete root.dataset.specsDark
            }
          }
        }
        if (el) {
          // Colors resolve against the tokens in effect where the element lives
          // (portal content sits outside the stage), radii against the stage.
          return measure(el, { colors: readColors(el), radii: tokens.radii })
        }
        return lastRef.current[darkRef.current ? "dark" : "light"][pi]?.[si] ?? null
      })
    )
    lastRef.current[darkRef.current ? "dark" : "light"] = next
    setData((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    // partList identity changes each render; its content is stable per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(parts)])

  React.useLayoutEffect(() => {
    run()
  }, [run, dark])

  React.useEffect(() => {
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(run)
    }
    const ro = new ResizeObserver(schedule)
    if (stageRef.current) ro.observe(stageRef.current)
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state", "class", "style"] })
    document.addEventListener("animationend", schedule, true)
    document.addEventListener("transitionend", schedule, true)
    document.fonts?.ready.then(schedule)
    const t = window.setTimeout(schedule, 400)
    return () => {
      document.querySelectorAll<HTMLElement>("[data-specs-dark]").forEach((n) => {
        n.classList.remove("dark", "text-foreground")
        delete n.dataset.specsDark
      })
      cancelAnimationFrame(frame)
      window.clearTimeout(t)
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener("animationend", schedule, true)
      document.removeEventListener("transitionend", schedule, true)
    }
  }, [run])

  const cell = (m: Measure | null, key: Row["key"], part: SpecPart | null): React.ReactNode => {
    if (!m)
      return (
        <span className="text-muted-foreground">
          {part?.scope && part.scope !== "specimen" ? "Open it to measure" : "Not in this specimen"}
        </span>
      )
    if (key === "width" || key === "height") return fmt(m[key])
    if (key === "touch") {
      if (!m.touch.interactive) return <span className="text-muted-foreground">Not interactive</span>
      return m.touch.pass ? (
        <span className="font-medium text-foreground">
          Pass{m.touch.hit && <span className="block text-xs font-normal text-muted-foreground">{m.touch.hit}</span>}
        </span>
      ) : (
        <span className="font-medium text-destructive">Fail</span>
      )
    }
    const value = m[key] as string
    if (key === "background" || key === "text" || key === "borderColor") {
      if (value === "none") return <span className="text-muted-foreground">none</span>
      const swatch = value.match(/#[0-9a-f]{6}/i)?.[0]
      const alpha = value.match(/at (\d+)%$/)?.[1]
      return (
        <span className="inline-flex items-center gap-2">
          {swatch && (
            <span
              aria-hidden
              className="size-3.5 shrink-0 rounded-sm border"
              style={{ backgroundColor: swatch, opacity: alpha ? Number(alpha) / 100 : 1 }}
            />
          )}
          <span className="font-mono text-xs leading-tight whitespace-nowrap">
            {value.replace(/ \(#[0-9a-f]{6}\)/i, "")}
            {value.startsWith("--") && swatch && <span className="block text-muted-foreground">{swatch}</span>}
          </span>
        </span>
      )
    }
    return value === "none" ? <span className="text-muted-foreground">none</span> : value
  }

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border bg-card">
      <div className={cn(dark && "dark")}>
        <div
          ref={stageRef}
          className={cn(
            "doc-stage flex flex-wrap gap-8 bg-background p-8 text-foreground sm:p-10",
            align === "center" ? "items-start justify-center" : "items-start justify-start"
          )}
          style={minHeight ? { minHeight } : undefined}
        >
          {specimens.map((s, i) => (
            <div
              key={i}
              data-specimen
              className={cn("flex flex-col items-center gap-3", s.type === Spec && s.props.className)}
            >
              {s.type === Spec ? s.props.children : s}
              <span className="text-xs text-muted-foreground">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-t bg-muted/40 px-3 py-1.5">
        <span className="truncate text-xs text-muted-foreground">
          {title ?? "Measured live from the rendered component"}
        </span>
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? "Measure in light mode" : "Measure in dark mode"}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </button>
      </figcaption>
      {labels.length === 1 && partList.length > 1 && (
        // One specimen with several parts: parts become the columns so the page stays short.
        <div className="overflow-x-auto border-t px-4 pt-2 pb-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4 font-medium text-muted-foreground">
                  Property
                </th>
                {partList.map((part, pi) => (
                  <th key={pi} scope="col" className="py-2 pr-4 font-medium whitespace-nowrap text-foreground">
                    {part?.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="border-b last:border-b-0">
                  <th scope="row" className="py-2 pr-4 align-top font-normal whitespace-nowrap text-muted-foreground">
                    {row.label}
                  </th>
                  {partList.map((part, pi) => (
                    <td key={pi} className="py-2 pr-4 align-top text-foreground tabular-nums">
                      {cell(data[pi]?.[0] ?? null, row.key, part)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!(labels.length === 1 && partList.length > 1) && partList.map((part, pi) => {
        const inSpecimen = !part?.scope || part.scope === "specimen"
        const cols = labels
          .map((label, si) => ({ label, si }))
          .filter(({ si }) => !inSpecimen || data[pi]?.[si] || !data[pi]?.some(Boolean))
        return (
        <div key={pi} className="border-t">
          {part && <div className="px-4 pt-4 text-sm font-semibold text-foreground">{part.label}</div>}
          <div className="overflow-x-auto px-4 pt-2 pb-4">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-4 font-medium text-muted-foreground">
                    Property
                  </th>
                  {cols.map(({ label, si }) => (
                    <th key={si} scope="col" className="py-2 pr-4 font-medium whitespace-nowrap text-foreground">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-b last:border-b-0">
                    <th scope="row" className="py-2 pr-4 align-top font-normal whitespace-nowrap text-muted-foreground">
                      {row.label}
                    </th>
                    {cols.map(({ si }) => (
                      <td key={si} className="py-2 pr-4 align-top text-foreground tabular-nums">
                        {cell(data[pi]?.[si] ?? null, row.key, part)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )
      })}
    </figure>
  )
}
