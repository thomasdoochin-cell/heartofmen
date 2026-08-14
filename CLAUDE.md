# CLAUDE.md

This file is the permanent memory for the Heart of Men website. Read it before making any change.

## The site

- **Live at heartofmen.org.** This repo auto-deploys to it through Vercel on every commit + push to `main`. There is no separate deploy step — pushing publishes.
- It's a single static landing page for **Heart of Men — "Living Leadership,"** an 8-month men's leadership journey.
- No build step, no framework, no dependencies. All CSS and JS are inline in the HTML files.
  - `index.html` — the landing page (sections marked by `<!-- ===== N. NAME ===== -->` banner comments).
  - `404.html` — custom error page.
  - `vercel.json` — routing.
  - `Images/` — photos, videos, favicons, OG image (`Scrolling Tiles/` feeds the carousels).

## Rules for every future change

1. **Keep it simple and static** — plain HTML and CSS, no frameworks, no build tools.
2. **Always mobile responsive.**
3. **Match the existing brand** (voice, colors, fonts below) unless I say otherwise.
4. **Show me your plan before writing any code.**
5. **When done, commit and push** so it deploys to heartofmen.org automatically.

## Clean URLs

Clean URLs are on via the rewrite in `vercel.json` — pages are reached **without** `.html` (e.g. `/thank-you`, not `/thank-you.html`). Keep every new page and every internal link consistent with that: link to `/thank-you`, never `/thank-you.html`. The rewrite excludes `Images/`, `_vercel/`, and any path with a `.`, so assets and the 404 still resolve. (Extensionless paths also double as flyer/venue URLs that show up as their own path in Vercel Web Analytics.)

## Signup buttons

The signup button links out to the relevant **Typeform**, or submits to **Formspree without a redirect** (staying on the page and swapping in an inline success message). Keep new signup buttons doing one of those two things — don't invent a new flow.

## Brand voice

Direct, warm, and grounded — a man talking straight to another man. Short punchy lines mixed with the occasional longer, reflective one. Plainspoken and a little raw ("Real Dudes," an earned "Holy shit… LOOK AT ME GO"), but never hype-y or salesy. Second person ("You know you're here for something…"). Serious about purpose, light on its feet. Match this when writing or editing copy.

## Colors (exact, from the code — use the CSS variables)

- `--black` `#0e0c09`
- `--green` `#1e2a1c`
- `--brown` `#433b32`
- `--gold` `#b99b56`
- `--gold-soft` `rgba(185, 155, 86, 0.85)`
- `--cream` `#e8dfc8`
- `--cream-muted` `#c9bfa8`

## Fonts (from the code)

- **Playfair Display** — headings.
- **Cormorant Garamond** — names / accents.
- Fallback stack: `Georgia, serif`. Both loaded from Google Fonts.

## Watch out

Asset paths are **case-sensitive on Vercel** (but not on my Mac). `Images/Photo.JPG` vs `.jpg` can work locally and 404 live — match filename case exactly.

## Do not

Never store personal or private information in this file.
