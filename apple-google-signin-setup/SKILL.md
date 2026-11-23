---
name: apple-google-signin-setup
description: Set up "Sign in with Google" and "Sign in with Apple" keys for an Alethi app whose server does the web OAuth flow (Ghostbar's Cloudflare Worker is the worked example). Use when asked to make Apple or Google sign-in work, when the server answers "not set up yet" / error=unavailable, when the keys GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, APPLE_SERVICES_ID, APPLE_TEAM_ID, APPLE_KEY_ID or APPLE_PRIVATE_KEY are missing, or when a new Alethi app needs Google or Apple sign-in.
---

# Apple and Google sign-in setup (Alethi apps)

Done for Ghostbar on 23 Nov 2026. Takes about 20 minutes for Google, 15 for Apple, most of it in the
signed-in Chrome (Claude in Chrome, "Browser 1").

## What lives where

| Thing | Where |
|---|---|
| Google Cloud account | alethibusiness@gmail.com (`gcloud` is logged in as it; TLDR Books is project `tldr-books-487703`) |
| Ghostbar Google project | `ghostbar-signin` (number 495729388401), client "Ghostbar Web" |
| Apple Developer account | alethibusiness@gmail.com, team ALETHI CONSULTING INC (7XKDXXC88Q). Signing in needs the owner's password and 2FA |
| Support email for an app | Ask the app's docs first. Ghostbar: `ghostbarsupport@alethiconsulting.com` (set by the owner in a Gemini chat, also `MAIL_REPLY_TO` in `worker/wrangler.jsonc`) |
| Secrets | Bitwarden via `rbw`: `Ghostbar / Google Sign-In / OAuth client` (username = client ID, password = secret), `Ghostbar / Sign in with Apple / key` (username = key ID, notes = .p8 and IDs) |
| Server | Cloudflare Worker, `npx --no-install wrangler secret put NAME` from the worker folder |

One Google project per app, never reuse another app's project: Google's sign-in screen shows the
project's app name, so reusing TLDR's would say "TLDR Books".

## Before starting

1. Read the server's OAuth code to get the exact callback URLs. Ghostbar: `worker/src/oauth.ts`,
   `${SITE_URL}/api/auth/oauth/{google|apple}/callback`, SITE_URL in `wrangler.jsonc`.
2. Check the app has public `/`, `/privacy` and `/terms` pages (curl for 200). Google will not publish
   without them. Ghostbar's are in `worker/src/legal.ts`; keep them true to what the server stores.
3. `rbw sync` works? If it fails with `missing field access_token`, the owner runs
   `rbw purge && rbw login && rbw sync` (there is no `rbw logout`).

## Google (web OAuth client with a secret)

1. `gcloud projects create <app>-signin --name="<App>" --account=alethibusiness@gmail.com`
2. Chrome: `https://console.cloud.google.com/auth/overview/create?project=<app>-signin&authuser=0`
   - App name: the product name. User support email: only the signed-in Gmail or a Google Group can be
     picked, so it is alethibusiness@gmail.com. Audience: External. Contact email: the app's support
     address. Tick the Google API Services User Data Policy box: **accepting terms, ask the owner first**.
3. Clients > Create client: type Web application, name "<App> Web", one Authorized redirect URI (the
   Google callback). No JavaScript origins needed.
4. The dialog shows the client ID and secret once. Read them from the page DOM
   (`/\d+-[a-z0-9]+\.apps\.googleusercontent\.com/` and `/GOCSPX-[A-Za-z0-9_-]+/`), never retype from a
   screenshot.
5. Save to Bitwarden through stdin (rbw add hangs waiting on stdin if you use EDITOR from a
   non-terminal shell):
   `printf '%s\n\n%s\n' "$SECRET" "notes" | rbw add "<App> / Google Sign-In / OAuth client" "$CLIENT_ID" --uri '<console url>'`
   then check `rbw get` matches.
6. Server: `printf '%s' "$CLIENT_ID" | npx --no-install wrangler secret put GOOGLE_CLIENT_ID`, same for
   `GOOGLE_CLIENT_SECRET`.
7. Branding: home page, privacy and terms links; authorized domain fills itself from the redirect.
8. Audience > Publish app > Confirm. With only `openid email` scopes and no logo, no Google review is
   needed. Uploading a logo triggers verification: leave it off unless the owner asks.
9. Check: `curl -s -o /dev/null -w "%{redirect_url}" "$SITE_URL/api/auth/oauth/start?provider=google&device_id=agent-check&device_name=check"`
   must point at accounts.google.com with the new client ID.

## Apple (Services ID plus a Sign in with Apple key)

The owner signs in to developer.apple.com in Chrome (password and 2FA; agents never type them). Team:
ALETHI CONSULTING INC, Team ID `7XKDXXC88Q` (shown top right). Ghostbar values, done 23 Nov 2026:
App ID `com.alethi.ghostbar`, Services ID `com.alethi.ghostbar.signin`, Key ID `Y29V4587S9`.

1. `https://developer.apple.com/account/resources/identifiers/add/bundleId` > App IDs > App. Description
   = product name, Explicit bundle ID (Ghostbar builds use the local `com.local.ghostbar.rust` from
   `app/bundle.sh`, so a real one was registered), tick Sign In with Apple ("Enable as a primary App ID"),
   Continue, Register.
2. Same page > Services IDs. Description = product name (Apple shows it on its sign-in screen),
   identifier `<bundle id>.signin`, Register. Open it from the Services IDs list, tick Sign in with
   Apple, Configure: **change Primary App ID from TLDR Books to the new App ID** (it defaults to TLDR),
   domain = SITE_URL host, return URL = the Apple callback. Next, Done, Continue, Save.
3. `.../resources/authkeys/add`: name "<App> Sign in with Apple", tick Sign in with Apple, Configure,
   pick the new App ID, Save, Continue, Register. Note the Key ID, then Download (once only; lands in
   `~/Downloads/AuthKey_<KEYID>.p8`, about 257 bytes).
4. Bitwarden through stdin, first line = password:
   `printf '%s\n\n%s\n' "<KEYID>" "$(cat AuthKey.p8) + notes with team, services and app IDs" | rbw add "<App> / Sign in with Apple / key" "<KEYID>"`.
   Check the PEM in `rbw get --full` matches the file, then move the .p8 to the Trash.
5. Server secrets: `APPLE_SERVICES_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and
   `cat AuthKey.p8 | wrangler secret put APPLE_PRIVATE_KEY` (the whole PEM).
6. Check: the start URL for `provider=apple` points at appleid.apple.com with the Services ID, and
   `curl -sL` on that URL shows "Sign in to Apple Account", not `invalid_client`.

## Finish

- The real test is a sign-in from the app. Ghostbar opens the provider in macOS's sign-in session
  (`gb-platform/src/web_auth.rs`); with Chrome as the default browser it opens in Chrome. The owner picks
  their own account: agents do not sign in for them.
- Update the app's open-items or HANDOFF file and commit.

## Gotchas

- An app in Google "Testing" only lets listed test users in (up to 100). Publishing needs the three pages.
- The client secret cannot be shown again after the dialog closes. Save it first.
- Wrangler here is logged in as danieladebimpe and can deploy to the Admin@alethiconsulting.com account.
- Never paste secrets into chat or commit them; keep any temporary copy in the session scratchpad and
  delete it once the vault has it.
