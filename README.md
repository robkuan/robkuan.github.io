# Robert Kuan Website

Static GitHub Pages site for `www.robkuan.com`.

GitHub Pages custom-domain documentation: <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>

## Local Preview With Docker

Install Docker Desktop for macOS, then run:

```bash
docker compose up --build
```

Open `http://localhost:8080`. Stop the server with `Ctrl+C`.

## Run Checks

With the Docker preview running:

```bash
scripts/check-site.sh
```

Optional browser checks:

```bash
npm install
npx playwright install chromium
npm run check:browser -- http://localhost:8080
```

## Update Content

See `WEBSITE_EDITING_GUIDE.md` for a page-by-page editing map.

- Home page: edit `index.html`.
- CV: replace `assets/pdf/cv.pdf` with a new PDF using the same filename and update the `v=YYYY-MM-DD` date in all CV URLs in `cv/index.html` if browser caching persists. Mobile browsers redirect directly to the PDF; desktop uses the embedded preview.
- Research: edit `assets/json/publications.json`.

### Manual Research Edits

The Research page is data-driven. Small text edits do not require changing HTML:

1. Open `assets/json/publications.json`.
2. Find the entry by its `title`.
3. Edit the relevant field:
   - `title`: paper title, including punctuation such as `Don't Just Prompt—Suggest`.
   - `note`: visible short note under the citation, such as `Job market paper.`
   - `status`: visible status line, such as `invited for revision and resubmission`.
   - `paper_url`: link used by the `Paper` button. Leave it out if there is no public paper link.
   - `abstract`: text shown when a visitor clicks `Abstract`.
   - `section`: use `working_papers` or `publications` to place the entry under the matching research heading.
4. Keep valid JSON syntax: quote every string, separate fields with commas, and do not add comments inside the JSON file.
5. Run `scripts/check-site.sh` after editing.

## Publish

1. Commit and push changes to `main`.
2. In GitHub repository settings, set Pages to deploy from the `main` branch and repository root.
3. Set the custom domain to `www.robkuan.com`.
4. Configure DNS:
   - `www.robkuan.com` CNAME to `robkuan.github.io`
   - `robkuan.com` A records to GitHub Pages:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Optional `robkuan.com` AAAA records for IPv6:
     - `2606:50c0:8000::153`
     - `2606:50c0:8001::153`
     - `2606:50c0:8002::153`
     - `2606:50c0:8003::153`
5. Enable HTTPS in GitHub Pages settings once available.

The root-level `CNAME` file already contains `www.robkuan.com`.

## Template Cleanup

The old al-folio sample pages have been removed, including `blog/`, `books/`, `news/`, `people/`, `projects/`, `repositories/`, `teaching/`, and the old `publications/` route. The active HTML pages are `index.html`, `research/index.html`, `cv/index.html`, and `404.html`.
