# Evi's Mykonos Villa

Source for [evismykonosvilla.com](https://evismykonosvilla.com), rebuilt as a
plain static site (HTML/CSS/JS, no build tools required to run it) so it can
be hosted for free on GitHub Pages instead of Squarespace.

## Structure

```
index.html              Home page
summary/index.html      About > Summary  (served at /summary/)
interior/index.html     About > Interior
bedrooms/index.html     About > Bedrooms
location/index.html     About > Location
pool/  view/  seating/  table/  bbq/     Photo galleries
contact/index.html      Contact page
assets/css/style.css    All site styling
assets/js/main.js       Mobile menu + photo lightbox
assets/img/             All photos, organized by page
CNAME                   Tells GitHub Pages to serve this site on evismykonosvilla.com
build.py                Optional generator script (see below)
```

## Editing content

You can edit the `.html` files directly — they're plain HTML, no build step
needed. Each page repeats the same header/nav and footer markup; if you
change the navigation, update it in every file (or regenerate via `build.py`,
see below).

## Regenerating pages with build.py

`build.py` is a small Python script that generated all the HTML pages from
shared header/footer templates and page content defined in the script itself.
You don't need it to run the site, but if you prefer editing content in one
place (e.g. to change the navigation menu everywhere at once), edit
`build.py` and re-run:

```
python3 build.py
```

This overwrites all the `index.html` files in each folder.

## Local preview

From this folder, run:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Known follow-ups

- The **newsletter signup form** on the home/interior/bedrooms pages posts to
  a placeholder Formspree URL (`https://formspree.io/f/your-form-id`) and
  will not work until you create a free account at
  [formspree.io](https://formspree.io) and swap in your real form endpoint
  (or remove the form if you don't need it — the original site's version
  didn't work off-Squarespace either way).
- Photos were pulled from Squarespace's CDN at their web-optimized size
  (~11 MB total across the site). If you have full-resolution originals,
  swapping them into `assets/img/<page>/` will improve quality on large
  screens/retina displays.
- The `/location` page previously said "Currently under construction" on
  Squarespace. It now includes a basic embedded Google Map centered on Ano
  Mera — replace the query in `location/index.html`'s `<iframe>` `src` with
  a precise address/pin if you want to be more specific.
