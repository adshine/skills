// Read live CSS variable values in light and dark from the loaded theme.css,
// so tables always match what ships, whichever mode the docs are in.
let cache: { light: Record<string, string>; dark: Record<string, string> } | null = null

function collect() {
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        const target = rule.selectorText === ":root" ? light : rule.selectorText === ".dark" ? dark : null
        if (!target) continue
        for (const prop of Array.from(rule.style)) {
          if (prop.startsWith("--")) target[prop.slice(2)] = rule.style.getPropertyValue(prop).trim()
        }
      } else if ("cssRules" in rule) {
        walk((rule as CSSGroupingRule).cssRules)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules)
    } catch {
      // Cross-origin sheets (web fonts) cannot be read; skip them.
    }
  }
  return { light, dark }
}

export function readVar(name: string, dark: boolean): string {
  if (!cache || !Object.keys(cache.light).length) cache = collect()
  return dark ? (cache.dark[name] ?? cache.light[name] ?? "") : (cache.light[name] ?? "")
}

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.trim().replace("#", "")
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split("").map((c) => c + c).join("")
  if (!/^[0-9a-f]{6}$/i.test(h)) return null
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]: [number, number, number]) {
  const c = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

/** WCAG 2 contrast ratio between two hex colors, or null if either is not hex. */
export function contrast(a: string, b: string): number | null {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  if (!x || !y) return null
  const [l1, l2] = [luminance(x), luminance(y)].sort((p, q) => q - p)
  return (l1 + 0.05) / (l2 + 0.05)
}
