#!/usr/bin/env python3
"""Crawl a site (same-origin, BFS) and audit SEO/meta/link health. Buckets 5, 12, 13 collector.

Collects per page: status, redirect chain, title, meta description, canonical, h1 count,
OG tags, JSON-LD types, robots directives. Reports broken links, redirect chains,
missing/duplicate metadata, sitemap 404s, and orphan pages.

Example:
  python3 crawl_audit.py --url https://example.com --max-pages 50 --out crawl.json
"""

import argparse
import json
import re
import time
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, urldefrag

import requests

UA = {"User-Agent": "website-audit-skill/1.0"}
DELAY = 0.3


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title, self._in_title, self._in_ldjson = "", False, False
        self.meta_description = None
        self.canonical = None
        self.h1_count = 0
        self.og = {}
        self.robots_meta = []
        self.ldjson_raw = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "meta":
            name = (a.get("name") or a.get("property") or "").lower()
            if name == "description":
                self.meta_description = a.get("content", "")
            elif name.startswith("og:"):
                self.og[name] = a.get("content", "")
            elif name == "robots":
                self.robots_meta.append(a.get("content", ""))
        elif tag == "link" and (a.get("rel") or "").lower() == "canonical":
            self.canonical = a.get("href")
        elif tag == "script" and (a.get("type") or "").lower() == "application/ld+json":
            self._in_ldjson = True
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "script":
            self._in_ldjson = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_ldjson:
            self.ldjson_raw.append(data)


def ld_types(raw_blocks):
    types = set()
    for raw in raw_blocks:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict):
                t = item.get("@type")
                if isinstance(t, list):
                    types.update(t)
                elif t:
                    types.add(t)
    return sorted(types)


def fetch(url):
    try:
        r = requests.get(url, headers=UA, timeout=15, allow_redirects=True)
        chain = [h.url for h in r.history] + ([r.url] if r.history else [])
        return r, chain
    except requests.RequestException as e:
        return None, [str(e)]


def main():
    p = argparse.ArgumentParser(description="SEO and link-health crawler")
    p.add_argument("--url", required=True)
    p.add_argument("--max-pages", type=int, default=50)
    p.add_argument("--out")
    args = p.parse_args()

    u = urlparse(args.url)
    base = f"{u.scheme}://{u.netloc}"

    sitemap_urls = set()
    try:
        sm = requests.get(f"{base}/sitemap.xml", headers=UA, timeout=15)
        if sm.status_code == 200:
            sitemap_urls = {m.group(1).strip() for m in re.finditer(r"<loc>\s*(.*?)\s*</loc>", sm.text)}
    except requests.RequestException:
        pass

    pages, findings = {}, []
    queue, seen_links = [base + "/"], set()
    visited = set()
    themes, upload_years = set(), set()

    while queue and len(visited) < args.max_pages:
        url = urldefrag(queue.pop(0))[0]
        if url in visited or urlparse(url).netloc != u.netloc:
            continue
        visited.add(url)
        time.sleep(DELAY)
        r, chain = fetch(url)
        if r is None:
            findings.append({"page": url, "bucket": "Navigation & Information Architecture",
                             "check": "reachability", "severity_hint": "High",
                             "found": "request failed", "evidence": chain[0], "expected": "HTTP 200"})
            continue

        info = {"status": r.status_code, "redirectChain": chain}
        if r.status_code >= 400:
            findings.append({"page": url, "bucket": "Navigation & Information Architecture",
                             "check": "internal link target", "severity_hint": "Medium" if r.status_code == 404 else "High",
                             "found": f"HTTP {r.status_code} on internally linked page",
                             "evidence": f"GET {url} -> {r.status_code}", "expected": "HTTP 200"})
            pages[url] = info
            continue
        if len(chain) > 2:
            findings.append({"page": url, "bucket": "SEO, Structured Data & Indexation",
                             "check": "redirect chain", "severity_hint": "Low",
                             "found": f"{len(chain) - 1}-hop redirect chain",
                             "evidence": " -> ".join(chain), "expected": "single 301 hop max"})

        if "text/html" in r.headers.get("content-type", ""):
            themes.update(re.findall(r"wp-content/themes/([a-zA-Z0-9_-]+)", r.text))
            upload_years.update(re.findall(r"wp-content/uploads/(20\d\d)/", r.text))
            parser = PageParser()
            try:
                parser.feed(r.text)
            except Exception:
                pass
            info.update({"title": parser.title.strip(), "metaDescription": parser.meta_description,
                         "canonical": parser.canonical, "h1Count": parser.h1_count,
                         "og": parser.og, "ldJsonTypes": ld_types(parser.ldjson_raw),
                         "robotsMeta": parser.robots_meta})
            for href in parser.links:
                absolute = urldefrag(urljoin(url, href))[0]
                seen_links.add(absolute)
                if urlparse(absolute).netloc == u.netloc and absolute not in visited:
                    queue.append(absolute)

            checks = [(not info["title"], "missing <title>", "unique descriptive title", "Medium"),
                      (not info["metaDescription"], "missing meta description", "150-160 char description", "Low"),
                      (not info["canonical"], "missing canonical", "valid rel=canonical", "Low"),
                      (info["h1Count"] != 1, f"h1 count = {info['h1Count']}", "exactly one h1", "Low"),
                      (not info["og"].get("og:title") or not info["og"].get("og:image"),
                       "incomplete Open Graph tags", "og:title and og:image present", "Low")]
            for bad, found, expected, sev in checks:
                if bad:
                    findings.append({"page": url, "bucket": "SEO, Structured Data & Indexation",
                                     "check": found.split(" =")[0], "severity_hint": sev, "found": found,
                                     "evidence": f"parsed <head> of {url}", "expected": expected})
        pages[url] = info

    titles = {}
    for url, info in pages.items():
        t = info.get("title")
        if t:
            titles.setdefault(t, []).append(url)
    for t, urls in titles.items():
        if len(urls) > 1:
            findings.append({"page": urls[0], "bucket": "SEO, Structured Data & Indexation",
                             "check": "duplicate titles", "severity_hint": "Low",
                             "found": f"title shared by {len(urls)} pages: '{t[:60]}'",
                             "evidence": ", ".join(urls[:5]), "expected": "unique title per page"})

    for sm_url in sorted(sitemap_urls - set(pages)):
        if urlparse(sm_url).netloc != u.netloc or len(visited) >= args.max_pages:
            break
        r, _ = fetch(sm_url)
        time.sleep(DELAY)
        if r is not None and r.status_code == 404:
            findings.append({"page": sm_url, "bucket": "SEO, Structured Data & Indexation",
                             "check": "sitemap 404", "severity_hint": "Medium",
                             "found": "URL in sitemap returns 404",
                             "evidence": f"sitemap.xml lists {sm_url}; GET -> 404", "expected": "sitemap lists live URLs only"})
        elif r is not None and sm_url not in seen_links:
            findings.append({"page": sm_url, "bucket": "SEO, Structured Data & Indexation",
                             "check": "orphan page", "severity_hint": "Low",
                             "found": "in sitemap but never internally linked",
                             "evidence": f"crawl of {len(pages)} pages found no link to it", "expected": "reachable from site navigation"})

    # Archetype clustering: pages sharing a URL pattern almost certainly share a
    # template, so audits sample per archetype instead of walking every URL.
    from collections import defaultdict
    parents = defaultdict(list)
    for url in pages:
        path = urlparse(url).path.rstrip("/")
        segs = [s for s in path.split("/") if s]
        if len(segs) < 2:
            continue  # top-level pages are usually distinct templates; never cluster them
        parents["/" + "/".join(segs[:-1]) + "/<slug>"].append(url)
    archetypes = {}
    for pattern, urls in parents.items():
        if len(urls) >= 3:
            archetypes[pattern] = {"count": len(urls), "samples": sorted(urls)[:3]}
    singletons = [u for u in sorted(pages)
                  if all(u not in parents[p] for p in archetypes)]

    result = {"base": base, "pagesCrawled": len(pages), "sitemapUrls": len(sitemap_urls),
              "truncated": bool(queue),
              "archetypes": archetypes,
              "singletonPages": singletons,
              "auditPlanHint": "walk every singleton page; per archetype deep-audit one sample and spot-check the others listed",
              "templateFingerprint": {"themes": sorted(themes), "uploadYears": sorted(upload_years),
                                      "note": "stock theme + old upload years suggests surviving demo content; judge per bucket 6"},
              "pages": pages, "findings": findings}
    out = json.dumps(result, indent=2)
    if args.out:
        with open(args.out, "w") as f:
            f.write(out)
        print(f"{len(pages)} pages, {len(findings)} findings -> {args.out}")
    else:
        print(out)


if __name__ == "__main__":
    main()
