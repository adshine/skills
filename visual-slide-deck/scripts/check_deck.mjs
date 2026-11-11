#!/usr/bin/env node
// Measure and screenshot every slide of a fixed-canvas deck (templates/deck.html structure).
// Usage: node check_deck.mjs <deck.html> <out-dir>
// Exit code 1 when any slide has content past its edge or a broken image. Looking at the screenshots is still required.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const [file, out] = process.argv.slice(2);
if (!file || !out) { console.error('usage: node check_deck.mjs <deck.html> <out-dir>'); process.exit(2); }
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto('file://' + resolve(file));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  const frames = [...document.querySelectorAll('.frame')];
  return {
    slides: frames.length,
    brokenImages: [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')),
    perSlide: frames.map((frame, i) => {
      const slide = frame.querySelector('.slide'), box = slide.getBoundingClientRect();
      const kids = [...slide.querySelectorAll('h1,h2,h3,p,span,b,li,dt,dd,a,article,figure')].map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.height);
      const bottom = kids.length ? Math.max(...kids.map((r) => r.bottom)) : box.top, right = kids.length ? Math.max(...kids.map((r) => r.right)) : box.left;
      return { slide: i + 1, ratio: +(box.width / box.height).toFixed(4), pastBottom: Math.round(bottom - box.bottom), pastRight: Math.round(right - box.right), spaceBelow: Math.round(box.bottom - bottom) };
    }),
  };
});

for (let i = 0; i < report.slides; i++) {
  await page.evaluate((k) => { const d = document.getElementById('deck'); d.scrollTo({ left: k * d.clientWidth, behavior: 'instant' }); }, i);
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${out}/slide-${String(i + 1).padStart(2, '0')}.png` });
}
await browser.close();

const bad = report.perSlide.filter((s) => s.pastBottom > 1 || s.pastRight > 1 || s.ratio !== 1.7778);
console.log(JSON.stringify(report, null, 2));
console.log(bad.length || report.brokenImages.length ? `FAIL: ${bad.length} slide(s) overflow, ${report.brokenImages.length} broken image(s)` : `PASS: ${report.slides} slides fit, no broken images. Now look at every screenshot in ${out}.`);
process.exit(bad.length || report.brokenImages.length ? 1 : 0);
