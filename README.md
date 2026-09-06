# HexoFrames

Portfolio site for Hemanth Sarode — photographer & videographer, Bengaluru, India. Wildlife, automotive heritage, live music/DJ, and street work, shot on a Sony α6400.

Live at [hexoframes.netlify.app](https://hexoframes.netlify.app) (or your custom domain, if you've set one up in Netlify).

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS v4** for styling
- Two routes: `/` (single-page portfolio: hero, work grid, about, contact) and `/gallery` (full archive, filterable by category, with a lightbox)

## Adding or editing photos

All content lives in one file: [`src/data/categories.ts`](./src/data/categories.ts). Each category (nature, automotive, wildlife, concerts, etc.) is an entry with a `title`/`subtitle` and a `photos` array. To add a photo:

1. Drop a **web-sized** copy of the image into `public/assets/` (resize the longest edge to ~1200–1600px first — see "Image sizing" below; never commit a full-resolution original here).
2. Add an entry to the right category's `photos` array with real values — `camera`, `settings` (aperture/shutter/ISO), and `location`/`description` should describe what's actually in the shot, not filler text.
3. A category with an empty `photos: []` array is automatically hidden from both the homepage grid and the gallery's filter pills — no other code changes needed to add or retire a category.

### Image sizing — why this matters

`public/` is what actually gets deployed and downloaded by every visitor. Camera originals from the α6400 are typically 15–30MB each; at that size a handful of photos would blow past Netlify's free-tier bandwidth fast. Before adding any photo:

```bash
sips -Z 1400 -s formatOptions 75 your-photo.jpg --out public/assets/your-photo.jpg
```

That resizes the longest edge to 1400px and compresses to ~75% JPEG quality — typically under 200KB, indistinguishable from the original at web display sizes. (`sips` is macOS-only and can't write `.webp`; if you want `.webp` specifically you'll need `cwebp` or an online converter — Next.js's `<Image>` component optimizes either format fine, so `.jpg` is a perfectly reasonable default.)

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Deployment

Connected to Netlify via this GitHub repo — every push to `main` deploys automatically. No manual build-and-drag-drop step anymore.

```bash
git add -A
git commit -m "..."
git push
```

That's it — Netlify picks up the push and rebuilds within a couple of minutes.

## Project structure

```
src/
  app/
    page.tsx          Homepage — hero, work grid, about, contact
    gallery/page.tsx   Full archive with category filters + lightbox
    layout.tsx          Fonts (Anton display, Space Mono for technical
                         labels, Inter for body) + page metadata
    globals.css          Color tokens, Tailwind theme
  components/
    Nav.tsx              Shared nav bar (desktop + mobile menu)
  data/
    categories.ts        All photo content — the only file you need to
                          touch to add, edit, or reorder photos
public/
  assets/                Web-sized photos actually served to visitors
  ads.txt                 AdSense verification — must live here to be
                            served at the real domain root
```
