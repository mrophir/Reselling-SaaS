# Stockpile — marketing site

Marketing landing page for Stockpile, an inventory CRM for mid-to-high-volume resellers.
Built with Next.js 16 + Tailwind CSS v4 + TypeScript. Self-hosted fonts (no external font fetch).

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
```

## Build / deploy
```bash
npm run build
npm run start
```
Deploys to Vercel as-is: push to GitHub, import the repo in Vercel, no config needed.

## Where things live
- `app/page.tsx`    — the entire landing page (all sections are components in this one file)
- `app/layout.tsx`  — fonts + metadata
- `app/globals.css` — design tokens (colours, fonts, animations) in the Tailwind v4 @theme block

## Design tokens (app/globals.css)
- ink / ink-soft / ink-card — backgrounds (near-black)
- paper / paper-dim / paper-faint — text shades (warm off-white)
- amber — the single signal accent (dead-money / warning)
- moss — success (profit, zeroed pile)
- rust — negative / aging
Edit these in the @theme block to re-skin the whole site.

## Sections
Nav · Hero (with live dashboard mockup) · Platform strip · Problem · Features (bento) ·
Who it's for · vs Spreadsheet (comparison table) · Pricing/CTA · Footer
