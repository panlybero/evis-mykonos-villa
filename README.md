# Evi's Mykonos Villa

Source for [evismykonosvilla.com](https://evismykonosvilla.com).

This is a **port of the original Squarespace site**, not a redesign. The
rendered HTML, the site's real stylesheets, the Poppins webfonts and all
photography were pulled from Squarespace and made self-contained, so the site
looks the same but is now a plain static site that can be hosted for free on
GitHub Pages.

Verified against the live Squarespace site page-by-page with a headless
browser: 4 of 11 pages render at a pixel-identical height, the rest are within
17px, with no console errors and no broken images.

## Structure

```
index.html            Home
summary/              About > Summary          (served at /summary/)
interior/             About > Interior
bedrooms/             About > Bedrooms
location/             About > Location
pool/ view/ seating/ table/ bbq/   Photo galleries
contact/              Contact
about-1/ galleries/   Redirect stubs for the nav "folder" URLs
assets/css/           site.css + static.css (Squarespace's own), gallery-fix.css
assets/js/            gallery.js, nav.js  (see below)
assets/fonts/         Poppins woff2 subsets
assets/img/           All photography, keyed by original asset id
CNAME                 Custom domain for GitHub Pages
```

## The two JS files

Squarespace's own JavaScript bundle could not be carried over (it loads
webpack chunks from Squarespace's servers that 404 once you're off the
platform). It was removed, and the two things it actually did on this site
were reimplemented:

- **`assets/js/gallery.js`** — the three gallery layouts used here
  (`GalleryStrips` justified rows, `GalleryGrid`, `GalleryMasonry`). Layout
  parameters (row height, gutter, column count, aspect ratio) are read from
  each gallery's own `data-props` attribute, so they match the original.
- **`assets/js/nav.js`** — the mobile overlay menu: burger open/close, the
  header colour-theme swap, and the About/Galleries folder sub-panels.
- **`assets/js/animations.js`** — the scroll fade-in, using Squarespace's own
  `.preFade` / `.fadeIn` classes. Notes on the implementation:
  - Squarespace animates more than `[data-animation-role]`: headings and
    paragraphs get `preFade` applied directly to the element inside
    `.sqs-html-content`. Both sets are targeted here, otherwise the copy
    appears instantly while only buttons and images fade, which reads as the
    page snapping in.
  - On load the fade waits for the section background image to paint first, so
    content appears over a filled hero rather than a blank area.
  - `.preFade` is applied with transitions switched off and the hidden state is
    flushed before transitions are enabled. Without this the element only
    starts easing away from opacity 1 and the reveal snaps instead of fading.
  - Timing is `ease-out` / `0.55s`. The original used `0.9s`; this is
    deliberately quicker.
  - Whatever is on screen at load is cascaded in document order
    (`INITIAL_BASE` / `INITIAL_STEP`) so the hero fills in progressively.
    Staggering per-section instead made every above-the-fold element start at
    the same instant, which read as one block popping in rather than a fade.
    Elements revealed later, on scroll, keep the per-section stagger.
  - Anything scrolled past (End key, hash link, fast fling) is shown
    immediately, so content can never get stuck invisible.
  - `prefers-reduced-motion` is honoured, and because `.preFade` is added by
    script the content stays visible if JavaScript is unavailable.

Images were also un-lazy-loaded from Squarespace's JS loader and given real
`src` attributes, so the page renders correctly even with JavaScript off.

## Local preview

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Editing

The pages are plain HTML. Note that the markup is Squarespace's generated
markup, so it is verbose and class-heavy — editing text and swapping image
paths is easy, but restructuring layout means working within Squarespace's
"fluid engine" grid classes.

## Differences from the original

- The **newsletter / mailing-list block** has been removed from the home,
  interior and bedrooms pages (it was never wired up to anything off
  Squarespace). Those three pages are correspondingly shorter than the
  original. To bring it back, restore the block markup and point the form at a
  real endpoint such as Formspree.

## Known follow-ups

- **Photos are Squarespace's web-optimised copies** (~11 MB total, mostly
  1440px wide). If you have the full-resolution originals, dropping them into
  `assets/img/<id>/` with the same filenames will improve sharpness on large
  and retina screens.
- **Favicon**: the original site used Squarespace's default (Squarespace-branded)
  favicon, so a simple villa icon (`favicon.svg`) was made instead.
- **`/location`** is still the "under construction" page it was on Squarespace.
