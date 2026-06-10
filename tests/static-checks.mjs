const baseUrl = process.argv[2] || "http://localhost:8080";
const requiredPaths = ["/", "/cv/", "/research/"];
const removedPaths = [
  "/publications/",
  "/blog/",
  "/books/",
  "/news/",
  "/people/",
  "/projects/",
  "/repositories/",
  "/teaching/",
  "/assets/html/relativity.html",
  "/assets/jupyter/blog.ipynb.html",
  "/assets/plotly/demo.html"
];
const placeholders = [
  "You R. Name",
  "Albert Einstein",
  "Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?",
  "Letters on wave mechanics",
  "The Godfather"
];

const pages = new Map();

for (const path of requiredPaths) {
  const html = await getText(path);
  pages.set(path, html);
  assertNoPlaceholders(path, html);
  assertTemplateShell(path, html);
  assertFooter(path, html);
}

assertNav(pages.get("/"));
assertHome(pages.get("/"));
assertCvPreview(pages.get("/cv/"));
await assertResearch();
await assertInternalLinks();
await assertRemovedRoutes();

console.log("static checks passed");
process.exit(0);

async function assertResearch() {
  const researchHtml = pages.get("/research/");
  assert(researchHtml.includes("/assets/js/research.js"), "Research page must load the research renderer");

  const publications = JSON.parse(await getText("/assets/json/publications.json"));
  assert(Array.isArray(publications), "Publications source must be an array");
  assert(publications.length === 8, `Research page should list 8 CV research entries; got ${publications.length}`);
  assert(
    publications.filter((publication) => publication.section === "publications").length === 5,
    "Research page should have 5 publications and working papers"
  );
  assert(
    publications.filter((publication) => publication.section === "work_in_progress").length === 3,
    "Research page should have 3 selected work in progress entries"
  );

  const renderer = await getText("/assets/js/research.js");
  assert(!renderer.includes('"DOI"'), "Research renderer should not create DOI buttons");
  assert(!renderer.includes('"PDF"'), "Research renderer should not create PDF buttons");
  assert(renderer.includes("publications and working papers"), "Research renderer should create the publications section");
  assert(renderer.includes("selected work in progress"), "Research renderer should create the work in progress section");
  assert(renderer.includes("research-section-heading"), "Research renderer should use visible left-aligned section headings");

  for (const [index, publication] of publications.entries()) {
    assert(publication.title, `Publication ${index} is missing a title`);
    assert(publication.authors, `Publication ${index} is missing authors`);
    assert(publication.section, `Publication ${index} is missing a section`);
    if (publication.section === "publications") {
      assert(publication.venue, `Publication ${index} is missing a venue`);
      assert(publication.abstract, `Publication ${index} is missing an abstract`);
    }
    assert(!publication.doi_url, `Publication ${index} should not define doi_url`);
    assert(!publication.pdf_url, `Publication ${index} should not define pdf_url`);
    if (publication.paper_url) new URL(publication.paper_url);
  }
}

function assertHome(html) {
  assert(html.includes("https://www.linkedin.com/in/robkuan/"), "Home page must include the LinkedIn profile link");
  assert(html.includes("mailto:rkuan@wharton.upenn.edu"), "Home page must include the email button");
  assert(!html.includes("/assets/pdf/cv.pdf?v=2026-06-10"), "Home page should not include a CV icon link");
  assert(html.includes("PhD Candidate in"), "Home page must include the role line");
  assert(html.includes("The Wharton School</a>, University of Pennsylvania"), "Home page must keep Wharton and Penn on the same line");
  assert(!html.includes('class="more-info"'), "Home page should not include profile more-info text");
  assert(!/selected publications/i.test(html), "Home page should not include a selected publications section");
}

function assertNav(html) {
  const navLinksMatch = html.match(/<ul class="navbar-nav[\s\S]*?">([\s\S]*?)<\/ul>/);
  assert(navLinksMatch, "Original-style navbar links were not found");

  const labels = [...navLinksMatch[1].matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)]
    .map((match) => stripTags(match[1]).replace("(current)", "").trim())
    .filter(Boolean);

  assert(
    JSON.stringify(labels) === JSON.stringify(["home", "research", "cv"]),
    `Expected nav labels home, research, cv; got ${labels.join(", ")}`
  );
}

function assertTemplateShell(path, html) {
  assert(html.includes('class="fixed-top-nav'), `${path} must use the original fixed-top body class`);
  assert(html.includes('class="navbar navbar-light navbar-expand-sm fixed-top"'), `${path} must use the original navbar classes`);
  assert(html.includes('class="container mt-5"'), `${path} must use the original content container`);
  assert(html.includes('class="post"'), `${path} must use the original post wrapper`);

  if (path === "/") {
    assert(html.includes('class="post-header"'), `${path} must use the original post header`);
    assert(html.includes('class="post-title"'), `${path} must use the original post title`);
  }

  if (path === "/research/") {
    assert(html.includes('class="publications"'), "Research page must use the original publications wrapper");
    assert(html.includes('id="publication-list"'), "Research page must expose the publications renderer target");
    assert(!html.includes('class="post-title">research'), "Research page should not show a top research title header");
  }
}

function assertCvPreview(html) {
  const downloadMatch = html.match(/href="([^"]*\/assets\/pdf\/cv\.pdf[^"]*)"/);
  const previewMatch = html.match(/<iframe\b[^>]+src="([^"]*\/assets\/pdf\/cv\.pdf[^"]*)"/);
  assert(downloadMatch, "CV page must link to /assets/pdf/cv.pdf");
  assert(previewMatch, "CV page must embed /assets/pdf/cv.pdf");
  assert(downloadMatch[1] === previewMatch[1], "CV download and preview must point at the same PDF URL");
  assert(html.includes("Download Full CV"), "CV page must have one Download Full CV button");
  assert(!html.includes('class="post-title">cv'), "CV page should not show a CV title header");
  assert(!html.includes("Embedded preview"), "CV page should not include embedded preview helper text");
  assert(!html.includes("Open PDF"), "CV page should not include the old Open PDF button");
  assert(!html.includes("Download PDF"), "CV page should not include the old Download PDF button text");
}

function assertFooter(path, html) {
  assert(html.includes("&copy; Copyright 2026 Robert Kuan."), `${path} must include the simplified footer`);
  assert(!html.includes("Powered by"), `${path} should not include powered-by footer text`);
  assert(!html.includes("Hosted by"), `${path} should not include hosted-by footer text`);
}

async function assertInternalLinks() {
  const pathsToCheck = new Set();

  for (const html of pages.values()) {
    for (const match of html.matchAll(/\b(?:href|src|data)="([^"]+)"/g)) {
      const href = match[1];
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      if (/^https?:\/\//.test(href)) continue;
      if (href.startsWith("data:")) continue;
      pathsToCheck.add(href);
    }
  }

  for (const path of pathsToCheck) {
    const response = await fetch(new URL(path, baseUrl));
    assert(response.ok, `Internal link failed: ${path} returned ${response.status}`);
  }
}

async function assertRemovedRoutes() {
  for (const path of removedPaths) {
    const response = await fetch(new URL(path, baseUrl));
    assert(response.status === 404, `Removed route should return 404: ${path} returned ${response.status}`);
  }
}

async function getText(path) {
  const response = await fetch(new URL(path, baseUrl));
  assert(response.ok, `${path} returned ${response.status}`);
  return response.text();
}

function assertNoPlaceholders(path, html) {
  for (const placeholder of placeholders) {
    assert(!html.includes(placeholder), `${path} still contains template placeholder: ${placeholder}`);
  }
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, "");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
