# CLAUDE.md

This file is the permanent memory for the Heart of Men website. **Read it before making any change.** It captures the specs, the workflow, and every gotcha we've hit so no future session has to rediscover them.

## The site

- **Live at heartofmen.org** — the **apex is canonical**; `www.heartofmen.org` 308-redirects to the apex. (This has flipped directions before; confirm in Vercel → Domains. As of last check: apex primary, www → apex.) Deployed on **Vercel** from the GitHub repo `thomasdoochin-cell/heartofmen`. **Every push to `main` auto-deploys to production — pushing IS publishing.** There is no separate deploy step.
- A mostly **static** site for **Heart of Men — "Living Leadership,"** an 8-month men's leadership journey.
- **No framework; all CSS/JS are inline in each HTML file.** The **one exception** is the embedded-checkout backend: a single Vercel serverless function under `/api/` plus a `package.json` (the only dependency is `stripe`). Vercel zero-config installs it and serves the function; the static pages are unaffected. See "Checkout (/welcome)" below.
  - `index.html` — the landing page. Sections marked with `<!-- ===== N. NAME ===== -->` banner comments.
  - `full-circle-fund.html` — the Full Circle Fund scholarship page, served at the clean URL `/full-circle-fund` (via a rewrite; see routing).
  - `welcome.html` — **hidden** enrollment page at `/welcome` (not in `nav.js`, `noindex`, not in sitemap). Two-column: `Six Grid.jpg` photo + welcome copy on the left, **embedded Stripe Checkout** on the right. Its own OG/Twitter card (title "Welcome In", image `Images/og-welcome.jpg`).
  - `confirm.html` — **hidden** post-payment thank-you page at `/confirm` (404-styled, `noindex`). Stripe's `return_url` lands here after a completed deposit.
  - `api/create-checkout-session.js` — serverless function (Node) that creates the embedded Checkout Session. `package.json` declares the `stripe` dep.
  - `nav.js` — shared nav injected on both pages (links `/` and `/full-circle-fund`).
  - `404.html` — custom branded error page (self-contained; root-absolute `/Images/...` paths so it renders from any URL).
  - `robots.txt`, `sitemap.xml` — SEO.
  - `vercel.json` — routing (venue rewrite; see below — **do NOT re-enable `cleanUrls`**).
  - `Images/` — photos, videos, favicons, OG image. `Images/Scrolling Tiles/` feeds the two carousels. `Images/FCF Page/` holds the Full Circle Fund page's media.

## Working style (how the owner likes to collaborate)

- **Small, well-understood changes:** just make them, verify, and deploy (or commit locally if they've asked to hold). No need to ask permission for each tweak.
- **Larger batches / anything ambiguous:** ask clarifying questions *before* coding (typos vs. verbatim, structural choices, dates, etc.).
- **Deploys are irreversible/public:** if the owner has said "hold for now / launch later," commit locally but **do not push** until they say "deploy." Confirm before a push that would take a big batch live unexpectedly.
- Keep it **simple and static**, **always mobile responsive**, and **match the brand** (below) unless told otherwise.

## Local preview & testing — READ THIS (hard-won)

The in-tool preview and the owner's own preview behave differently. Key facts:

- **The sandboxed preview server can't read the `Documents` folder directly** (macOS permission). We serve a **synced copy** from a scratchpad temp dir. So after editing, you must **copy `index.html` (and any new/changed images) into the served copy** before the preview reflects changes.
- **The scratchpad copy loses its images on server restart / between sessions.** If images 404 in the preview, re-sync the whole `Images/` folder (including `*.JPG` uppercase and `Scrolling Tiles/`). This is a preview-only artifact — the real repo is fine.
- **The headless preview tab does NOT run `IntersectionObserver` or `requestAnimationFrame` callbacks** (the tab isn't "painted"). Don't rely on them for verification. Autoplay video is also often paused there (`readyState:4` + `dims` correct = valid; "paused" is just the headless quirk). Use **scroll listeners + `getBoundingClientRect`** for lazy/deferred logic so it's testable.
- **Browser cache is aggressive**, especially for HTML. When "changes aren't showing," it's almost always cache: hard-refresh with DevTools open → "Empty Cache and Hard Reload," use **Incognito**, or add a `?v=N` query. To verify what's *actually* deployed, fetch the raw HTML server-side (`/usr/bin/curl -k -sS ...`) and grep it — bypasses all browser cache.
- **The owner previews locally** by running, from the project folder in their own Terminal: `python3 -m http.server 8000` → `http://localhost:8000`. That serves the real files (videos included), unsandboxed.

## Deploy checklist

1. Edit files. 2. Verify (preview or raw-curl). 3. `git add` **only the intended files** — never a blanket `git add -A` (the folder can contain large unreferenced originals, e.g. multi-hundred-MB `.mov` files; only commit what's referenced). 4. Commit with a Co-Authored-By trailer. 5. `git push origin main` → Vercel builds (~1–2 min; heavier when videos change).

## Case-sensitivity (Vercel is case-sensitive; the Mac is not)

`Images/Photo.JPG` vs `.jpg` works locally and **404s live**. Match filename case AND extension exactly in `src`/`href`. Real examples in this repo: `Real Dudes Talking 2.JPG`, `Group 3.JPG`, `Landshot.jpg`. When a compressed file changes extension case (e.g. `14.JPG`→`14.jpg`), git on the Mac treats it as a content edit, not a rename — use `git mv -f` to fix the tracked path case, or the live path 404s.

## Images & video optimization (process that works)

- **Images — use `sips`** (built into macOS, edits in place, keeps the filename so no code/ref changes). Section/carousel photos → `sips -Z 1600 -s formatOptions 72 "file.jpg"`. Headshots (display tiny) → `sips -Z 512 "file.png"`. This is how we cut `Images/` from ~57MB to ~29MB.
- **`sips` CANNOT rewrite `.webp` or `.mp4`** (errors out). Leave WebP/video to other tools.
- **Video — HandBrake** (free GUI). Preset: MP4 + Web Optimized, 720p (1280×720 is plenty for a darkened background), H.264, 30fps CFR, Constant Quality **RF ~28**, Encoder Preset "Slower", **remove the audio track** (videos are muted). Save with the identical filename to replace in place. This took the two background videos from 8.7MB total → 1.7MB.
- **Never resize `og-image`/social cards** below 1200×630, and don't touch logos/favicons.

## Videos (hero + Full Circle Fund backgrounds)

- Each video sits behind a `.bg-video` element with a `.bg-img` **photo fallback** underneath and a dark `.bg-overlay` on top. JS (`initBgVideo`) sets the `<source>` from `data-src`, hides the photo on `loadeddata`, and reverts to the photo on error or **low bandwidth** (`navigator.connection.saveData` or `effectiveType` 2g/slow-2g).
- **The hero video loads eagerly; the Full Circle Fund video is DEFERRED** — it only loads when the user scrolls within ~600px of it (scroll-listener based, not IntersectionObserver, so it's testable). This was the fix for the launch-day slowness: loading both videos up front (8.7MB) saturated bandwidth and starved the hero video + images.

## Lazy loading

All below-the-fold `<img>` have `loading="lazy" decoding="async"`. The **only eager images are the hero background and hero logo** (above the fold). If you add images, lazy-load anything not in the hero.

## Forms & CTAs

- **Enrollment CTAs** ("Take Your Seat", 5 of them): email box + button, submits to **Formspree** (`f/meevlybn`) via `fetch` (no page redirect), then opens the **Typeform** `https://form.typeform.com/to/TingvB3U` in a new tab and swaps in an inline success message.
- **Sunday Saunter newsletter** (footer form + the pop-up): submits to a **different Formspree** (`f/xoealrwk`) with the same fetch pattern, but **no Typeform redirect** — just an inline "You're in" message. `initNewsletterForm()` handles these.
- Keep new signup buttons doing one of these; don't invent a new flow. Each form needs a **unique wrap/success ID**.

## Countdown, pop-up, venue tracking

- **Countdown bars** (top + bottom, black w/ gold): live Days/Hours/Minutes/Seconds computed in JS toward a target date. The IIFE at the bottom of `index.html` is now **two-phase** via `currentPhase()`, re-evaluated every tick so the copy **and** date flip automatically when a deadline passes (works on an already-open page and on any fresh load after):
  - **Phase 1 (price increase):** lead `Program Price Increases in:`, target `new Date('2026-08-24T03:00:00-04:00')` — Mon Aug 24 2026, 3:00 AM **Eastern**. Note this is an **explicit-offset ISO string** (fixed instant for all viewers), unlike Phase 2. August is **EDT (−04:00)**; if a target lands in EST months use −05:00. Owner says "EST" but means Eastern-clock time.
  - **Phase 2 (enrollment close, the long-standing default):** lead `Enrollment closes in:`, target `new Date(year, 8, 5)` = **Sept 5**, local time (month is 0-indexed!), rolls to next year once passed.
  - The `.cd-lead` spans in the HTML are set to the *currently active* phase's text to avoid a flash before JS runs; JS overwrites them on load regardless. When the price-increase promo is over, the whole Phase-1 block can be deleted and it cleanly falls back to the Sept 5 enrollment countdown.
- **Time zone in copy:** the owner writes times as "EST"; we display **"ET"** on the site (e.g. pop-up "2:00pm ET", `/confirm` "6:00–8:30 ET") since it's really EDT in summer. Prefer "ET" for any customer-facing time.
- **Sunday Saunter pop-up:** fires **20 seconds** after load, **first visit only** (localStorage key `hom_saunter_popup_v1`). To re-test: Incognito, or `localStorage.removeItem('hom_saunter_popup_v1')`.
- **Venue tracking for flyers:** `vercel.json` rewrites any clean word-path (`/bakers`) to `/index.html`, so `heartofmen.org/bakers` serves the landing page and shows up as its own path (`/bakers`) in **Vercel Web Analytics → Pages** — no per-venue setup. Rules for the team: lowercase, no spaces (use hyphens), avoid `images`/`favicon`/`404`. The rewrite excludes `Images/`, `_vercel/`, and any path with a `.` so assets and the custom 404 still work.
- **⚠️ NEVER set `cleanUrls: true` in `vercel.json`.** It intercepts every extensionless path at the filesystem stage and 404s any without a matching `.html` **before** the venue rewrite runs — which silently kills all venue/flyer tracking. This bit us once (commit that added the Full Circle Fund page). Correct `vercel.json` = no `cleanUrls`, with an **explicit rewrite for each real extra page listed BEFORE the catch-all**, e.g.:
  ```json
  { "rewrites": [
      { "source": "/full-circle-fund", "destination": "/full-circle-fund.html" },
      { "source": "/welcome", "destination": "/welcome.html" },
      { "source": "/confirm", "destination": "/confirm.html" },
      { "source": "/((?!Images/|_vercel/|.*\\.).*)", "destination": "/index.html" }
  ] }
  ```
  (This is the current `vercel.json`.) Rewrites are first-match-wins, so specific pages must precede the catch-all. When adding a new real page, add its explicit rewrite the same way. `/api/*` functions are served by Vercel before rewrites, so no rewrite is needed for them.

## Checkout (/welcome) — embedded Stripe

- **On-page embedded Checkout**, not the hosted page or the Buy Button (we tried the Buy Button first; owner wanted card entry to stay on-site). Flow: `welcome.html` loads Stripe.js (`https://js.stripe.com/v3/`), POSTs to `/api/create-checkout-session`, gets a `clientSecret`, and mounts the form into `#checkout` via `stripe.initEmbeddedCheckout({ clientSecret })`. We fetch the secret **ourselves first** (not via Stripe's `fetchClientSecret` callback) so a failure cleanly reveals the `#checkout-fallback` link (points at the hosted Payment Link `buy.stripe.com/5kQbJ33V64AXgrR5jV73G02`) instead of Stripe silently retrying.
- **Publishable key** (`pk_live_…`) is in `welcome.html` (public, fine). **Secret key is NEVER in code** — it's the Vercel env var **`STRIPE_SECRET_KEY`** (Project → Settings → Environment Variables), read by the function as `process.env.STRIPE_SECRET_KEY`.
- **`PRICE_ID`** (constant at the top of the function) is the deposit's `price_…`, a **one-time $2,250** payment → `mode: 'payment'`. Current live value: `price_1TyyGiRoQXKqP1qiSDdNcyyw`. **Intentional discrepancy (do NOT "fix"):** as of Aug 2026 the **public** landing-page pricing is **$2,750 deposit + $975/mo** (Launch Support tier $1,825/mo), but the Stripe checkout deposit stays **$2,250** on purpose — a couple of guys are coming in at that older threshold. The `/welcome` embedded form shows Stripe's amount ($2,250), not the public number. If the price is ever recurring, switch `mode` to `'subscription'`. **To test cheaply**, temporarily swap in a $1 price (we used `price_1U7N8bRoQXKqP1qiiTFX6fA2`), deploy, run a card, then swap the real price back — leave a `// TEMP` comment so the revert isn't forgotten. Price ID must match the key mode (live price with live keys).
- **Promotion codes** are enabled on the session (`allow_promotion_codes: true`), so the embedded form shows an "Add promotion code" field. Gotcha: a promo code created while the Dashboard **Test mode** toggle is ON won't work on the live (`sk_live`) checkout — create promo codes in **live** mode. Amount-off coupons are currency-locked (must be USD); percent-off avoids that.
- **Return/redirect:** the function sets `return_url` to `https://heartofmen.org/confirm?session_id={CHECKOUT_SESSION_ID}` — this is how /confirm is reached, entirely in code (no dashboard redirect step needed for embedded mode). `/confirm` ignores the param and is a static thank-you.
- **Appearance:** embedded Checkout is Stripe-rendered (light) inside an iframe; customize via Stripe Dashboard → Settings → Branding (accent color, logo). It can't be fully dark-themed from our CSS.
- **Testing:** the function can't run in the local ruby/python preview (no Node runtime) — `/api` 404s and the page shows the fallback. Real verification happens on the Vercel deploy. Use Stripe **test mode** keys/price to trial without real charges.

## Social preview (Open Graph / Twitter)

- Card image: `Images/og-living-leadership.jpg` (1200×630). Tags live in `<head>`: `og:*`, `twitter:card=summary_large_image`, canonical. **All absolute URLs must use the canonical host — currently the apex `https://heartofmen.org`** (www redirects to it, and a redirect hop can trip up scrapers). If Vercel's primary domain ever flips, update these to match. These URLs have flipped between apex and www before — double-check them against Vercel → Domains when editing head.
- After changing the card, **re-scrape**: opengraph.xyz and Facebook's Sharing Debugger. iMessage caches per-device and is stubborn — test from a fresh phone.
- `/welcome` has its **own** card: title "Welcome In", image `Images/og-welcome.jpg` (1200×630, cropped from `Six Grid.png`), `og:url` `https://heartofmen.org/welcome`. Same canonical-host rule applies.

## Brand voice

Direct, warm, and grounded — a man talking straight to another man. Short punchy lines mixed with the occasional longer, reflective one. Plainspoken and a little raw ("Real Dudes," an earned "Holy shit… LOOK AT ME GO"), but never hype-y or salesy. Second person. Serious about purpose, light on its feet. **No italics except within testimonials.** Match this when writing or editing copy.

## Colors (use the CSS variables)

- `--black` `#0e0c09` · `--green` `#1e2a1c` · `--brown` `#433b32`
- `--gold` `#b99b56` · `--gold-soft` `rgba(185, 155, 86, 0.85)`
- `--cream` `#e8dfc8` · `--cream-muted` `#c9bfa8`
- Accent reds used in "I'm Thomas" / "Our Rhythm": `#944830` (Thomas) and `#7d4630` (Our Rhythm, earthier). `#b16f4a` for lighter accents.

## Fonts (from the code — note: headings are Cormorant, NOT Playfair)

- **Cormorant Garamond** — headings (`h1`, `h2`, `.section-header`), names, and large accent lines.
- **Playfair Display** — body text, buttons, eyebrows, most UI text.
- Fallback: `Georgia, serif`. Both loaded from Google Fonts.

## Do not

- Never store personal or private information in this file.
- Never `git add -A` blindly (large unreferenced media can get swept in).
- Point social/canonical URLs at the **canonical host** — currently the apex `heartofmen.org` (www redirects to it). Match whatever Vercel → Domains shows as primary.
