# Accurai Website

A single-file site (`src/index.html`) that is **prerendered to static, per-URL HTML** for SEO, then deployed to Vercel from this repo.

## Structure
- `src/index.html` — the entire site (HTML + CSS + JS, with content data inline). **Source of truth — edit here.**
- `public/` — static assets copied to the site root (favicons, `og-image.png`, `robots.txt`, `llms.txt`, `/resources` PDFs).
- `prerender.mjs` — build script: renders every route to `dist/<route>/index.html` and generates `sitemap.xml`.
- `vercel.json` — Vercel build config: clean URLs + SPA fallback.
- `dist/` — build output (gitignored; Vercel regenerates on each deploy).

## Local development
```bash
npm install
npm run build      # generates dist/
npm run preview    # serve dist/ locally
```

## Deploy (GitHub + Vercel)
The Vercel project is connected to this repo. On every push to the production branch, Vercel runs `npm run build` (from `vercel.json`) and serves `dist/`. No manual prerender step needed.

If you ever set it up from scratch in the Vercel dashboard:
- Framework preset: **Other**
- Build command: **`npm run build`**
- Output directory: **`dist`**
- Optional env var `SITE_URL` (defaults to `https://accurai.ca`) — used for canonical URLs and the sitemap.

## Add a blog post
Edit the `blog` array in `src/index.html` and add an entry:
```js
{slug:'my-new-post', cat:'AI Accuracy', title:"My New Post Title",
 date:'July 2026', read:'5 min read',
 excerpt:"One-sentence summary for cards and meta description.",
 body:`<p>Intro paragraph.</p><h2>A section</h2><p>More text.</p>
       <ul><li>A point.</li><li>Another point.</li></ul>`}
```
Push to GitHub. The build automatically prerenders `/blog/my-new-post`, links it on the blog index, and adds it to the sitemap. Services and industries work the same way (their `slug` arrays are auto-discovered).

## How routing works
- Clean URLs via the History API (e.g. `/services/agentic-ai-safety`).
- `vercel.json` serves the prerendered static file for each route; the catch-all rewrite is only a fallback for any non-prerendered path.
- Opening `src/index.html` directly as a file still works — it falls back to hash navigation for quick local preview.
