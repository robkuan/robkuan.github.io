# Website Editing Guide

This site is a static HTML site. The three intended website-facing pages are:

- Home: `/`
- Research: `/research/`
- CV: `/cv/`

After edits, rebuild the Docker preview:

```bash
docker compose up --build -d
```

Then check:

```bash
scripts/check-site.sh
npm run check:browser -- http://localhost:8080
```

## Home Page

Edit:

```text
index.html
```

Common edits:

- Name and role: edit the `<h1 class="post-title">` and `.home-tagline` block.
- Biography paragraphs: edit the paragraphs inside `<div class="clearfix">`.
- Headshot: replace `assets/img/robert-kuan-headshot.jpg` with a new image using the same filename.
- Social icons: edit the links inside `<div class="contact-icons">`.
- Footer: edit the `<footer>` near the bottom.

## Research Page

Edit research entries here:

```text
assets/json/publications.json
```

The Research HTML shell is here:

```text
research/index.html
```

The JavaScript that renders the research entries is here:

```text
assets/js/research.js
```

Common `publications.json` fields:

- `section`: use `publications` for visible research entries.
- `title`: the displayed title.
- `authors`: author list.
- `venue`: journal or publication venue.
- `status`: status text, such as `invited for revision and resubmission`.
- `year`: displayed after the venue when present. Delete the full line to remove it.
- `paper_url`: creates the `Paper` button. Delete the full line to remove the button.
- `note`: visible short note under the citation.
- `abstract`: text shown when clicking `Abstract`.

Keep the file valid JSON:

- Put strings in double quotes.
- Separate fields with commas.
- Do not leave a trailing comma after the last field in an entry.
- Do not add comments inside the JSON file.

## CV Page

Edit:

```text
cv/index.html
```

Update the CV PDF by replacing:

```text
assets/pdf/cv.pdf
```

The download button and embedded preview both point to this PDF. The preview includes URL parameters that ask supported PDF viewers to hide navigation panes by default. Mobile browsers are redirected directly to the PDF because embedded PDF iframes are inconsistent on phones and tablets. If the browser shows an old PDF after replacement, update the cache-busting date in all CV PDF URLs in `cv/index.html`:

```html
/assets/pdf/cv.pdf?v=2026-06-17
```

Change all copies to the same new date.

## Shared Styling

Edit:

```text
assets/css/robkuan.css
```

This controls the site-specific styling for the headshot, home title block, research section headings, CV preview, and buttons.

## Other Files

- `404.html`: page shown for missing URLs.
- `sitemap.xml`: currently lists only `/`, `/cv/`, and `/research/`.
- `robots.txt`: crawler guidance.
- `CNAME`: custom domain setting for GitHub Pages.

## Removed Template Pages

The old al-folio template routes were removed so visitors do not see placeholder pages and you do not accidentally edit the wrong files. These paths should return 404:

```text
blog/
books/
news/
people/
projects/
repositories/
teaching/
publications/
```

Normal site updates should only touch the files listed in the Home, Research, CV, Shared Styling, and Other Files sections above.
