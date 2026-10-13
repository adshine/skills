#!/usr/bin/env node
// Automatic check for a built design-system docs site (hash routing, #/section/slug).
// Run through check-docs.sh, which installs the dependencies.
//
// Usage: check-docs.mjs <dist-folder | url> [--update-baseline] [--threshold 0.1]
//                       [--qa <dir>] [--concurrency 4]
//
// For every route (sidebar links plus each page-level ?tab=) x theme (light, dark)
// x viewport (1440x900, 390x844) it records console errors, page errors, page-level
// horizontal overflow, clipped text, images without alt, and a full-page screenshot.
// Screenshots are compared with the baseline in <qa>/baseline; diffs go to <qa>/diff.
// Exit code 1 on any error, overflow, clipped text, missing alt or visual change.
// Ellipsis or line-clamp truncation is reported as a warning and does not fail the run.

import fs from "node:fs"
import http from "node:http"
import path from "node:path"
import { chromium } from "playwright-core"
import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

const THEMES = ["light", "dark"]
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
]

// ---------- arguments ----------
const argv = process.argv.slice(2)
const opts = { update: false, threshold: 0.1, concurrency: 4, qa: null, target: null }
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === "--update-baseline") opts.update = true
  else if (a === "--threshold") opts.threshold = Number(argv[++i])
  else if (a === "--concurrency") opts.concurrency = Math.max(1, Number(argv[++i]))
  else if (a === "--qa") opts.qa = path.resolve(argv[++i])
  else if (a === "-h" || a === "--help") usage(0)
  else if (!opts.target) opts.target = a
  else usage(2)
}
if (!opts.target || Number.isNaN(opts.threshold)) usage(2)
function usage(code) {
  console.log("usage: check-docs.sh <dist-folder | url> [--update-baseline] [--threshold 0.1] [--qa <dir>] [--concurrency 4]")
  process.exit(code)
}

const isUrl = /^https?:\/\//.test(opts.target)
let root = null
if (!isUrl) {
  root = path.resolve(opts.target)
  if (!fs.existsSync(path.join(root, "index.html"))) {
    console.error(`no index.html in ${root}; build the docs first (pnpm build)`)
    process.exit(2)
  }
}
const QA = opts.qa ?? (isUrl ? path.resolve("qa") : path.resolve(root, "..", "qa"))
const DIRS = { baseline: path.join(QA, "baseline"), current: path.join(QA, "current"), diff: path.join(QA, "diff") }

// ---------- static server ----------
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".txt": "text/plain", ".map": "application/json",
}
function serve(dir) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname)
    if (p.endsWith("/")) p += "index.html"
    const file = path.join(dir, path.normalize(p))
    if (!file.startsWith(dir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end("not found")
      return
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream" })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)))
}

// ---------- helpers ----------
async function pool(items, n, fn) {
  const out = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i)
    }
  }))
  return out
}
const routeName = (hash) => {
  const [p, q] = hash.replace(/^#\/?/, "").split("?")
  const tab = q ? new URLSearchParams(q).get("tab") : null
  return ((p || "home").replace(/\//g, "-") + (tab ? `--${tab}` : "")).replace(/[^\w.-]/g, "_")
}
const urlFor = (base, hash) => base.replace(/#.*$/, "") + hash

async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {})
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
  await page.waitForTimeout(150)
}

// ---------- discovery ----------
async function discover(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(urlFor(base, "#/"))
  await settle(page)
  await page.waitForSelector('nav[aria-label="Documentation"] a', { timeout: 15000 }).catch(() => {})
  const hrefs = await page.$$eval('nav[aria-label="Documentation"] a', (as) => as.map((a) => a.getAttribute("href")))
  await ctx.close()
  const routes = ["#/"]
  for (const h of hrefs) {
    if (!h) continue
    const hash = h.startsWith("#") ? h : h.startsWith("/") ? "#" + h : null
    if (hash && !routes.includes(hash)) routes.push(hash)
  }
  // Page-level tabs: click each role=tab in the page; keep the ones that set ?tab= in the URL.
  const withTabs = await pool(routes, opts.concurrency, async (hash) => {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const p = await c.newPage()
    const found = []
    try {
      await p.goto(urlFor(base, hash))
      await settle(p)
      const count = await p.locator('main [role="tab"]').count()
      for (let i = 0; i < count; i++) {
        const tab = p.locator('main [role="tab"]').nth(i)
        if (!(await tab.isVisible().catch(() => false))) continue
        await tab.click({ timeout: 3000 }).catch(() => {})
        const h = await p.evaluate(() => location.hash)
        const q = h.split("?")[1]
        const id = q && new URLSearchParams(q).get("tab")
        if (id) found.push(id)
      }
    } finally {
      await c.close()
    }
    const ids = [...new Set(found)]
    // The first tab is the default view already covered by the plain route.
    return ids.slice(1).map((id) => `${hash}${hash.includes("?") ? "&" : "?"}tab=${id}`)
  })
  return routes.flatMap((r, i) => [r, ...withTabs[i]])
}

// ---------- per page check ----------
async function checkPage(browser, base, job) {
  const ctx = await browser.newContext({
    viewport: { width: job.vp.width, height: job.vp.height },
    colorScheme: job.theme,
    reducedMotion: "reduce",
  })
  await ctx.addInitScript((t) => { try { localStorage.setItem("theme", t) } catch {} }, job.theme)
  const page = await ctx.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300)) })
  page.on("pageerror", (e) => pageErrors.push(String(e.message ?? e).slice(0, 300)))
  page.on("requestfailed", (r) => consoleErrors.push(`request failed: ${r.url()} (${r.failure()?.errorText})`))
  const result = { route: job.route, name: job.name, theme: job.theme, viewport: job.vp.name }
  try {
    await page.goto(urlFor(base, job.route), { waitUntil: "load", timeout: 30000 })
    await settle(page)
    const probe = await page.evaluate(() => {
      const se = document.scrollingElement || document.documentElement
      const overflowPx = Math.max(0, se.scrollWidth - innerWidth)
      const describe = (el) => {
        const id = el.id ? `#${el.id}` : ""
        const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""
        return `${el.tagName.toLowerCase()}${id}${cls} "${(el.textContent || "").trim().slice(0, 40)}"`
      }
      const scrollsX = (el) => { const o = getComputedStyle(el).overflowX; return o === "auto" || o === "scroll" }
      const clipped = []
      const truncated = []
      const offscreen = []
      for (const el of document.body.querySelectorAll("*")) {
        if (clipped.length >= 10 && offscreen.length >= 10) break
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        const cs = getComputedStyle(el)
        if (cs.visibility === "hidden") continue
        // Text clipped by its own box: overflow hidden or clip, content wider or taller than the box.
        const clipsX = cs.overflowX === "hidden" || cs.overflowX === "clip"
        const clipsY = cs.overflowY === "hidden" || cs.overflowY === "clip"
        if ((clipsX || clipsY) && r.width > 2 && r.height > 2 && el.textContent.trim() && clipped.length < 10) {
          const overX = clipsX && el.scrollWidth > el.clientWidth + 1
          const overY = clipsY && el.scrollHeight > el.clientHeight + 2
          const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
          if ((overX || overY) && hasOwnText) {
            const intended = cs.textOverflow === "ellipsis" || (cs.webkitLineClamp && cs.webkitLineClamp !== "none")
            ;(intended ? truncated : clipped).push(describe(el))
          }
        }
        // Elements that leave the viewport on the right without a scrolling ancestor.
        if (r.right > innerWidth + 1 && offscreen.length < 10 && el.children.length === 0) {
          let a = el.parentElement, inScroller = false
          while (a && a !== document.body) { if (scrollsX(a)) { inScroller = true; break } a = a.parentElement }
          if (!inScroller && cs.position !== "fixed") offscreen.push(describe(el))
        }
      }
      const imgsNoAlt = [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.currentSrc || i.src).slice(0, 10)
      const brokenImgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.src).slice(0, 10)
      const notFound = /page not found|404/i.test(document.querySelector("main h1, h1")?.textContent || "")
      return { overflowPx, clipped, truncated: truncated.slice(0, 10), offscreen, imgsNoAlt, brokenImgs, notFound }
    })
    Object.assign(result, probe)
    const file = `${job.name}__${job.theme}__${job.vp.name}.png`
    result.file = file
    const shot = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" })
    fs.writeFileSync(path.join(opts.update ? DIRS.baseline : DIRS.current, file), shot)
    if (!opts.update) result.visual = compare(file, shot)
  } catch (e) {
    pageErrors.push(`check failed: ${String(e.message ?? e).split("\n")[0]}`)
  } finally {
    await ctx.close()
  }
  result.consoleErrors = consoleErrors
  result.pageErrors = pageErrors
  result.problems = problemsOf(result)
  return result
}

function compare(file, shot) {
  const basePath = path.join(DIRS.baseline, file)
  if (!fs.existsSync(basePath)) return { status: "no-baseline" }
  const a = PNG.sync.read(fs.readFileSync(basePath))
  const b = PNG.sync.read(shot)
  if (a.width !== b.width || a.height !== b.height) {
    // Compare the shared area so the diff image still shows where things moved.
    const w = Math.max(a.width, b.width), h = Math.max(a.height, b.height)
    const pad = (img) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(img, o, 0, 0, img.width, img.height, 0, 0); return o }
    const pa = pad(a), pb = pad(b), out = new PNG({ width: w, height: h })
    const n = pixelmatch(pa.data, pb.data, out.data, w, h, { threshold: 0.1 })
    fs.writeFileSync(path.join(DIRS.diff, file), PNG.sync.write(out))
    return { status: "size-changed", from: `${a.width}x${a.height}`, to: `${b.width}x${b.height}`, percent: +(100 * n / (w * h)).toFixed(3) }
  }
  const out = new PNG({ width: a.width, height: a.height })
  const n = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.1 })
  const percent = +(100 * n / (a.width * a.height)).toFixed(3)
  if (n > 0) fs.writeFileSync(path.join(DIRS.diff, file), PNG.sync.write(out))
  return { status: percent > opts.threshold ? "changed" : "same", percent }
}

function problemsOf(r) {
  const p = []
  if (r.pageErrors.length) p.push("E")
  if (r.consoleErrors.length) p.push("C")
  if (r.notFound) p.push("404")
  if (r.overflowPx > 1 || r.offscreen?.length) p.push("O")
  if (r.clipped?.length) p.push("T")
  if (r.truncated?.length) p.push("t")
  if (r.imgsNoAlt?.length || r.brokenImgs?.length) p.push("I")
  if (r.visual && (r.visual.status === "changed" || r.visual.status === "size-changed")) p.push(`V${r.visual.percent}%`)
  return p
}

// ---------- main ----------
async function main() {
  const t0 = Date.now()
  let server = null
  let base = opts.target
  if (!isUrl) {
    server = await serve(root)
    base = `http://127.0.0.1:${server.address().port}/`
  }
  if (opts.update) fs.rmSync(DIRS.baseline, { recursive: true, force: true })
  fs.rmSync(DIRS.current, { recursive: true, force: true })
  fs.rmSync(DIRS.diff, { recursive: true, force: true })
  for (const d of opts.update ? [DIRS.baseline] : [DIRS.current, DIRS.diff]) fs.mkdirSync(d, { recursive: true })

  const browser = await chromium.launch({ channel: "chrome", headless: true })
  let results
  let routes
  try {
    routes = await discover(browser, base)
    const jobs = []
    for (const route of routes) for (const vp of VIEWPORTS) for (const theme of THEMES) jobs.push({ route, name: routeName(route), vp, theme })
    results = await pool(jobs, opts.concurrency, (job) => checkPage(browser, base, job))
  } finally {
    await browser.close()
    server?.close()
  }

  // Baselines with no matching route any more.
  const produced = new Set(results.map((r) => r.file).filter(Boolean))
  const orphaned = opts.update || !fs.existsSync(DIRS.baseline) ? [] : fs.readdirSync(DIRS.baseline).filter((f) => f.endsWith(".png") && !produced.has(f))
  const belowThreshold = results.filter((r) => r.visual?.status === "same" && r.visual.percent > 0).length
  const missingBaseline = results.filter((r) => r.visual?.status === "no-baseline").length

  // Table: one row per route, one cell per theme x viewport.
  const cols = VIEWPORTS.flatMap((vp) => THEMES.map((t) => ({ vp: vp.name, theme: t, label: `${t}-${vp.name}` })))
  const byRoute = new Map()
  for (const r of results) {
    if (!byRoute.has(r.name)) byRoute.set(r.name, {})
    byRoute.get(r.name)[`${r.theme}-${r.viewport}`] = r
  }
  const w0 = Math.max(5, ...[...byRoute.keys()].map((k) => k.length))
  const cw = 14
  const line = (cells) => cells[0].padEnd(w0) + "  " + cells.slice(1).map((c) => c.padEnd(cw)).join("")
  console.log(line(["route", ...cols.map((c) => c.label)]))
  for (const [name, cells] of byRoute) {
    console.log(line([name, ...cols.map((c) => {
      const r = cells[c.label]
      if (!r) return "-"
      if (r.problems.length) return r.problems.join(",")
      if (r.visual?.status === "no-baseline") return "new"
      if (r.visual?.percent > 0) return `ok~${r.visual.percent}%`
      return "ok"
    })]))
  }
  const isWarning = (code) => code === "t"
  const failing = results.filter((r) => r.problems.some((c) => !isWarning(c)))
  const flagged = results.filter((r) => r.problems.length)
  if (flagged.length) {
    console.log("\nDetails (failures first, up to 20):")
    for (const r of [...failing, ...flagged.filter((r) => !failing.includes(r))].slice(0, 20)) {
      const bits = []
      if (r.pageErrors.length) bits.push(`page error: ${r.pageErrors[0]}`)
      if (r.consoleErrors.length) bits.push(`console: ${r.consoleErrors[0]}`)
      if (r.notFound) bits.push("page shows not found")
      if (r.overflowPx > 1) bits.push(`page scrolls sideways by ${r.overflowPx}px`)
      if (r.offscreen?.length) bits.push(`past right edge: ${r.offscreen[0]}`)
      if (r.clipped?.length) bits.push(`clipped: ${r.clipped[0]}`)
      if (r.truncated?.length) bits.push(`truncated on purpose (warning): ${r.truncated[0]}`)
      if (r.imgsNoAlt?.length) bits.push(`img without alt: ${r.imgsNoAlt[0]}`)
      if (r.brokenImgs?.length) bits.push(`broken img: ${r.brokenImgs[0]}`)
      if (r.visual?.status === "changed") bits.push(`${r.visual.percent}% pixels changed (diff/${r.file})`)
      if (r.visual?.status === "size-changed") bits.push(`size ${r.visual.from} -> ${r.visual.to} (diff/${r.file})`)
      console.log(`- ${r.name} ${r.theme} ${r.viewport}: ${bits.join("; ")}`)
    }
  }
  console.log("\nLegend: E page error, C console error, 404 not found, O sideways overflow, T clipped text, t ellipsis or line-clamp truncation (warning only), I image alt or broken, V% visual change over threshold, ok~% changed but under threshold, new no baseline")

  const summary = {
    target: opts.target,
    mode: opts.update ? "update-baseline" : "check",
    threshold: opts.threshold,
    routes: routes.length,
    pages: results.length,
    failing: failing.length,
    warnings: flagged.length - failing.length,
    missingBaseline,
    changedBelowThreshold: belowThreshold,
    orphanedBaselines: orphaned,
    seconds: +((Date.now() - t0) / 1000).toFixed(1),
  }
  fs.mkdirSync(QA, { recursive: true })
  fs.writeFileSync(path.join(QA, "check-report.json"), JSON.stringify({ summary, results }, null, 2))
  console.log(`\n${summary.routes} routes, ${summary.pages} page checks, ${summary.failing} failing, ${summary.warnings} with warnings` +
    (missingBaseline ? `, ${missingBaseline} without baseline` : "") +
    (belowThreshold ? `, ${belowThreshold} changed below the ${opts.threshold}% threshold (see diff/)` : "") +
    (orphaned.length ? `, ${orphaned.length} baselines with no route` : "") +
    ` in ${summary.seconds}s. Report: ${path.join(QA, "check-report.json")}` +
    (opts.update ? `\nBaselines written to ${DIRS.baseline}` : ""))
  process.exit(failing.length ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(2) })
