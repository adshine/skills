---
name: reverse-api-engineer
description: Turn a website with no public API into a working API client by capturing its real network traffic, using the reverse-api-engineer CLI (kalil0321/reverse-api-engineer). Use, and proactively suggest it, whenever the user wants data or actions from a site that has no API or only a private one ("pull all jobs from this careers page", "get my orders out of this portal", "is there an API for this site", "scrape this", "automate this dashboard"), when an agent is about to hand-write a scraper or click through the same site repeatedly, or when the user asks about reverse engineering an API. Not for sites that already document a public API, and not for bypassing logins, paywalls, or access controls the user is not entitled to.
---

# Reverse API Engineer

Every modern website gets its data from background calls to its own (private) API. This skill uses the open-source `reverse-api-engineer` CLI (MIT, https://github.com/kalil0321/reverse-api-engineer) to record that traffic in a browser and have a model write a typed client for the endpoints the site actually uses. A clean API client beats a fragile HTML scraper: it is faster, returns structured JSON, and breaks less when the page layout changes.

## When to suggest it (proactively)

Mention this tool, in one line, before building something heavier when:

- The user wants a list of things from a site: jobs on a careers page, listings, prices, inventory, schedules, results.
- The user wants their own data out of a portal with no export button.
- An agent is about to write BeautifulSoup/Playwright scraping code or click through the same flow more than once.
- A browser automation task will be repeated (daily sweeps, monitoring).

Skip the suggestion if the site has a documented public API or an RSS/JSON feed; use that instead. Many applicant tracking systems do: Greenhouse (`boards-api.greenhouse.io/v1/boards/<company>/jobs`), Lever (`api.lever.co/v0/postings/<company>`), Ashby (`api.ashbyhq.com/posting-api/job-board/<company>`). Check these first for job boards.

## Install and check

```bash
uv tool install reverse-api-engineer          # Apple Silicon / Linux / 64-bit Windows only (not Intel Macs)
reverse-api-engineer --version
reverse-api-engineer agent -p "capture the jobs api" -u https://example.com/careers --dry-run
```

`--dry-run` validates prompt, URL, config, Node/npx and auth without opening a browser. A warning that `ANTHROPIC_API_KEY` is not set is fine when Claude Code is already logged in on the machine. Manual mode (you drive the browser) needs the extra: `uv tool install "reverse-api-engineer[manual]"` then `playwright install chromium`.

## Modes

| Mode | Use when |
|------|----------|
| `agent` (default) | Let the AI browse and capture. Good first try. |
| `manual` | The flow needs a human (login, captcha, odd clicks). You browse, close the browser, it writes the client. |
| `engineer <run_id>` | Regenerate the client from an earlier capture (different language, fixes) without browsing again. |
| `collector` | You want the data itself (JSON/CSV), not a client. Uses web search + fetch. |

Interactive: run `reverse-api-engineer`, type the goal, Shift+Tab cycles modes. `/settings` changes model, SDK, output language; `/history` lists past runs with cost.

Agent providers (`/settings` or `~/.reverse-api/config.json` `agent_provider`):
- `auto`: Playwright MCP, fresh browser.
- `chrome-mcp`: drives the user's real Chrome so existing logins and cookies are used (Chrome 146+). Use this for "my own data behind my login".
- `agent-browser`: Vercel agent-browser CLI.

## Scripted use (from an agent)

```bash
reverse-api-engineer agent -p "capture the API that lists open jobs, with pagination and filters" \
  -u https://careers.example.com --json | jq        # one JSON result; logs on stderr
reverse-api-engineer list --json
reverse-api-engineer show <run_id> --json
reverse-api-engineer run <run_id> --file api_client.py --no-interactive --auto-install -- --arg value
```

Result fields to read: `status`, `run_id`, `har_path`, `script_path`, `usage.total_cost`, `error`. Exit codes: 0 ok, 1 runtime error, 2 missing input under `--no-interactive`. Add `--headless` on machines without a display. `RAE_DEBUG=1` prints tracebacks.

Output lands in `./scripts/<descriptive_name>/` (`api_client.py`, `README.md`, `example_usage.py`) and permanently in `~/.reverse-api/runs/scripts/<run_id>/`. Run it from a scratch or project folder, not the home directory, so `./scripts/` lands somewhere sensible.

Write the prompt like a spec: what data, which filters, pagination, the fields you need. "Fetch all Apple jobs" works; "capture the jobs search API with location and keyword filters and page through all results" works better.

## After it runs (do not skip)

1. **Read the generated client before running it.** It is model-written code that will execute locally.
2. **Run the example** and confirm real data comes back, with a count. A client that returns an empty list or a 403 is not done.
3. **Check auth handling.** Note which tokens or cookies it relies on and how long they last. Never commit captured HAR files or tokens; HARs contain session cookies.
4. **Report cost** from `usage.total_cost` or `/history`.

## When it fails

- Bot protection (Cloudflare, captchas, fingerprinting): switch to `manual` or `chrome-mcp` so a real signed-in browser does the capture.
- Requests are signed with a computed hash: the capture shows the calls but replays fail. The signing logic lives in the site's JS bundle; regenerate with `engineer <run_id>` and ask it to locate and port the signing function, or fall back to driving the browser.
- Data loads over WebSockets or GraphQL persisted queries: say so explicitly in the prompt.
- Private APIs change without notice. Treat the client as disposable and keep the run so `engineer` can rebuild it.

## Boundaries

- Fine: public data at a polite rate, and the user's own data through the user's own account.
- Check first: the site's terms forbid automated access, the data is other people's personal data, or it will be resold or republished.
- Never: get around a login, paywall, or access control the user is not entitled to, share captured credentials, or hammer a site. If the capture exposes a security hole, stop and report it.
