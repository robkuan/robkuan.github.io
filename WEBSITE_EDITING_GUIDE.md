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

- `section`: use `publications` or `work_in_progress`.
- `title`: the displayed title.
- `authors`: author list.
- `venue`: journal or publication venue.
- `status`: status text, such as `invited for revision and resubmission`.
- `abbr`: the small badge on the left, such as `JCR`, `PNAS`, or `WIP`.
- `year`: displayed after the venue when present. Delete the full line to remove it.
- `paper_url`: creates the `Paper` button. Delete the full line to remove the button.
- `note`: visible short note under the citation.
- `abstract`: text shown when clicking `Abs`.

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

The download button and preview both point to this same file. If the browser preview shows an old PDF after replacement, update the cache-busting date in both URLs in `cv/index.html`:

```html
/assets/pdf/cv.pdf?v=2026-06-10
```

Change both copies to the same new date.

## Shared Styling

Edit:

```text
assets/css/robkuan.css
```

This controls the site-specific styling for the headshot, home title block, research section headings, CV preview, and buttons.

## Other Files

- `404.html`: page shown for missing URLs.
- `publications/index.html`: old `/publications/` URL that redirects visitors to `/research/`.
- `sitemap.xml`: currently lists only `/`, `/cv/`, and `/research/`.
- `robots.txt`: crawler guidance.
- `CNAME`: custom domain setting for GitHub Pages.

## Leftover Template Pages

This repository still contains old al-folio template pages such as:

```text
blog/
books/
news/
people/
projects/
repositories/
teaching/
```

They are not in the visible navigation or sitemap, but static hosting can still serve them if someone directly visits those URLs. That means there is some risk of visitors seeing placeholder template content.

Recommended cleanup: delete or redirect these leftover template directories after you confirm you do not want to use them. Do not edit them for normal site updates.
