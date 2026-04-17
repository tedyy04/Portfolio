# Cinematic Photo Portfolio (React + TypeScript + Vite)

Personal portfolio site built with Vite + React Router.

## Local development

```bash
npm install
npm run dev
```

## Generate / rebuild portfolio data

This project auto-generates portfolio data from `public/images/` via `scripts/generate-portfolio.mjs`.

```bash
npm run regen
```

Build production:

```bash
npm run build
```

## Adding new photos

See `WORKFLOW.md` for the full preprocessing → metadata → overrides flow.

## Contact behavior

- The Contact form does not post to a backend.
- Clicking “Send Message” opens Gmail compose in a new tab (pre-filled subject/body).

## Deploy (Vercel)

- Build command: `npm run build`
- Output directory: `dist`

Notes:

- `vercel.json` includes:
  - SPA rewrite for React Router (refreshing `/contact`, `/about` won’t 404)
  - basic security headers (CSP, nosniff, frame-ancestors, etc.)

## Portfolio image overrides (manual categories / EXIF display)

If you want to override per-file values (category/label/alt/tags/exif), edit:

- `scripts/portfolio.overrides.json`

Example:

```json
{
  "ted_178.jpeg": {
    "category": "Portrait",
    "label": "MY FAVORITE SHOT",
    "alt": "Portrait of ...",
    "skipML": true,
    "exif": {
      "camera": "Fujifilm X-T5",
      "lens": "XF 56mm f/1.2",
      "aperture": "f/1.2",
      "shutterSpeed": "1/250",
      "iso": 400
    }
  }
}
```

Notes:

- Overrides have highest priority (override → ML → EXIF heuristic).
- `category` can be any string; Navbar/category pages will update automatically.
- After editing overrides, run `npm run regen` (or `npm run build`) and refresh/restart the dev server to see changes.
