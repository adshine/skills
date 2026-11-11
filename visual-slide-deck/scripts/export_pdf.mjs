#!/usr/bin/env node
// Print a fixed-canvas deck to PDF, one 1440 x 810 slide per page.
// Usage: node export_pdf.mjs <deck.html> <out.pdf>
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const [file, out] = process.argv.slice(2);
if (!file || !out) { console.error('usage: node export_pdf.mjs <deck.html> <out.pdf>'); process.exit(2); }
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto('file://' + resolve(file));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);
const slides = await page.evaluate(() => document.querySelectorAll('.frame').length);
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`wrote ${out}: expect ${slides} pages. Check the page count, the document title, and every page by eye.`);
