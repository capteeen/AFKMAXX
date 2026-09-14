# AFKMAXX

Production web app (Next.js) plus a browser extension that performs allowlisted HTTPS checks from the user’s machine. `$AFK` is a placeholder ledger only. There is no token sale, wallet connect, or Robinhood listing.

Auth is **Supabase email + password**. App data (jobs, results, ledger) stays in Prisma.

## Run locally

1. Create a project at [supabase.com](https://supabase.com).
2. Authentication → Providers → Email: enable it.
3. For local development, turn **off** “Confirm email” so signup can sign you in immediately. If you leave confirm-email on, you must click the mail and land on `/auth/callback`.
4. Authentication → URL Configuration: add `http://127.0.0.1:4173/auth/callback` as a Redirect URL. Site URL: `http://127.0.0.1:4173`.
5. Project Settings → API: copy Project URL and anon public key into `.env`.

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Open http://127.0.0.1:4173 (not `localhost`, so cookies match `AUTH_URL`).

- Sign up / log in at `/login`.
- Set `ADMIN_EMAIL` in `.env` to that address to get `/admin`.
- Load `extension/` unpacked (Chrome) or as a temporary add-on (Firefox). For a public install, pack a zip with `npm run extension:pack` and upload it to the Chrome Web Store (steps below).
- In the app: consent, Extension → Issue device token, Request → queue `https://example.com`, Status → Start.

`example.com` and `example.org` auto-approve. Other hosts stay pending until an admin approves them. Ownership is declared, not proven.

## Chrome Web Store

Regular Chrome users cannot install an unpacked folder. They need a listing.

1. Pack: `npm run extension:pack` → `dist-extension.zip` (manifest at the zip root).
2. Register at [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole) (one-time Google developer fee, 2-step verification).
3. **Add new item** → upload `dist-extension.zip`.
4. Fill Store listing, Privacy, and Distribution. Publish **Unlisted** until the web app is on a public HTTPS origin you can paste into `/privacy`. Then switch to Public if you want search.
5. After the item has an ID, put the store URL on the landing page. Users who already have the extension: popup → Connect this site → paste your `AUTH_URL` origin → open `/app` → Issue device token.

Until Google approves the item, only unpacked / trusted-tester installs work.

### Paste into the dashboard

**Single purpose:** Perform user-approved HTTPS GET checks from this machine for the AFKMAXX web app, with a pause control and a daily data cap.

**Short description:** already in `extension/manifest.json` (`description`).

**Detailed description:**

```
AFKMAXX runs small HTTPS checks to sites you approve, from your own computer. It is not a VPN, proxy, or ad blocker.

After you install:
1. Open the popup and connect your AFKMAXX web app origin (http://127.0.0.1 is already allowed).
2. Sign in on that site, consent, and issue a device token.
3. Queue an approved destination, then start. Pause anytime in the app or the popup.

Checks omit cookies, cap the response body, and stop at the daily MB limit. Results are unaudited until an operator reviews them. $AFK in the app is a placeholder ledger, not a withdrawal.
```

**Privacy policy URL:** your live `https://YOUR_ORIGIN/privacy` (required). Localhost is not accepted.

**Permission justifications**

- `storage`: save run state, daily usage, connected origin, device token, short local result list.
- `alarms`: poll the next job about every 30 seconds while running.
- `scripting`: inject the AFKMAXX page bridge only on the web app origin the user connected.
- Host access for example.com / example.org: default sample check targets.
- Optional `https://*/*`: extra check hosts and the production app origin, each granted by a click in the popup. The extension does not fetch a host until that grant exists.

**Remote code:** none. All extension scripts ship in the zip.

**Screenshots:** upload `extension/store-screenshot-1280.png` (1280×800). Tile icon: `extension/icon128.png`. Add a second shot of `/app` once that origin is public.

## Production

1. Change `prisma/schema.prisma` `datasource.provider` to `postgresql` and set `DATABASE_URL` to Postgres.
2. Set `AUTH_URL` to your public origin, `ADMIN_EMAIL`, and the Supabase URL/anon key. Add the production `/auth/callback` URL in the Supabase dashboard.
3. `npx prisma migrate deploy && npm run build && npm start`
4. Ship the extension through the Chrome Web Store / Firefox AMO when ready (`npm run extension:pack`). Unpacked load still works. For a hosted app origin, users click Connect this site in the popup (or add that origin to `content_scripts` for a pinned build).

SQLite is for local only. Use Postgres in production.

## What is not live

Robinhood Chain, `$AFK` withdrawals, DNS ownership proofs, native desktop/mobile apps. A Chrome Web Store listing exists only after you upload `dist-extension.zip` and Google approves it.

## Specimens

Concept HTML lives under `/specimens` and is not the product.

## Privacy

See `/privacy`.
