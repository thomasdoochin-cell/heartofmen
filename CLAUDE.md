# CLAUDE.md

This file is the permanent memory for the Heart of Men website. **Read it before making any change.** It captures the specs, the workflow, and every gotcha we've hit so no future session has to rediscover them.

## The site

- **Live at www.heartofmen.org** (apex `heartofmen.org` 308-redirects to `www`). Deployed on **Vercel** from the GitHub repo `thomasdoochin-cell/heartofmen`. **Every push to `main` auto-deploys to production — pushing IS publishing.** There is no separate deploy step.
- A single static landing page for **Heart of Men — "Living Leadership,"** an 8-month men's leadership journey.
- **No build step, no framework, no dependencies.** All CSS and JS are inline in the HTML.
  - `index.html` — the landing page. Sections are marked with `<!-- ===== N. NAME ===== -->` banner comments.
  - `404.html` — custom branded error page (self-contained; uses root-absolute `/Images/...` paths so it renders from any URL).
  - `vercel.json` — routing (`cleanUrls` + the venue-tracking rewrite; see below).
  - `Images/` — photos, videos, favicons, OG image. `Images/Scrolling Tiles/` feeds the two carousels.

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

- **Countdown bars** (top + bottom, black w/ gold): live Days/Hours/Minutes/Seconds computed in JS toward a hard-coded target date — update the `new Date(year, monthIndex, day)` (month is 0-indexed!) when the deadline changes. Lead text + sub-text are plain HTML.
- **Sunday Saunter pop-up:** fires **20 seconds** after load, **first visit only** (localStorage key `hom_saunter_popup_v1`). To re-test: Incognito, or `localStorage.removeItem('hom_saunter_popup_v1')`.
- **Venue tracking for flyers:** `vercel.json` rewrites any clean word-path (`/bakers`) to `/index.html`, so `www.heartofmen.org/bakers` serves the landing page and shows up as its own path (`/bakers`) in **Vercel Web Analytics → Pages** — no per-venue setup. Rules for the team: lowercase, no spaces (use hyphens), avoid `images`/`favicon`/`404`. The rewrite excludes `Images/`, `_vercel/`, and any path with a `.` so assets and the custom 404 still work. `cleanUrls: true` is also on.

## Social preview (Open Graph / Twitter)

- Card image: `Images/og-living-leadership.jpg` (1200×630). Tags live in `<head>`: `og:*`, `twitter:card=summary_large_image`, canonical. **All absolute URLs must use `https://www.heartofmen.org`** (the apex redirects, which breaks scrapers). These URLs have silently reverted to apex before — double-check them when editing head.
- After changing the card, **re-scrape**: opengraph.xyz and Facebook's Sharing Debugger. iMessage caches per-device and is stubborn — test from a fresh phone.

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
- Never point social/canonical URLs at the apex `heartofmen.org` — always `www`.
