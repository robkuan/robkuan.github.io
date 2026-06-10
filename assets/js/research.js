(async function renderPublications() {
  const container = document.querySelector("#publication-list");
  if (!container) return;

  try {
    const response = await fetch("/assets/json/publications.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Could not load publications: ${response.status}`);
    const publications = await response.json();
    container.replaceChildren(...renderBySection(publications));
  } catch (error) {
    container.innerHTML = "<p>Publications could not be loaded. Please try again later.</p>";
    console.error(error);
  }

  container.addEventListener("click", (event) => {
    const trigger = event.target.closest("a.abstract");
    if (!trigger) return;
    event.preventDefault();
    trigger.closest("li")?.querySelector(".abstract.hidden")?.classList.toggle("open");
  });
})();

function renderBySection(publications) {
  const sorted = publications
    .map((publication, index) => ({ ...publication, index }))
    .sort((a, b) => a.index - b.index);

  const sectionLabels = new Map([
    ["publications", "publications and working papers"],
    ["work_in_progress", "selected work in progress"]
  ]);

  const bySection = new Map();
  for (const publication of sorted) {
    const section = publication.section || "publications";
    if (!bySection.has(section)) bySection.set(section, []);
    bySection.get(section).push(publication);
  }

  const nodes = [];
  for (const [section, entries] of bySection) {
    const heading = document.createElement("h2");
    heading.className = "research-section-heading";
    heading.textContent = sectionLabels.get(section) || section;

    const list = document.createElement("ol");
    list.className = "bibliography";
    for (const publication of entries) {
      list.append(renderPublication(publication));
    }

    nodes.push(heading, list);
  }
  return nodes;
}

function renderPublication(publication) {
  const item = document.createElement("li");

  const row = document.createElement("div");
  row.className = "row";

  const abbrCol = document.createElement("div");
  abbrCol.className = "col col-sm-2 abbr";

  const abbr = document.createElement("abbr");
  abbr.className = "badge rounded w-100";
  abbr.textContent = publication.abbr || abbreviationFor(publication.venue);
  abbrCol.append(abbr);

  const body = document.createElement("div");
  body.className = "col-sm-8";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = publication.title;

  const authors = document.createElement("div");
  authors.className = "author";
  authors.append(...formatAuthors(publication.authors));

  const periodical = document.createElement("div");
  periodical.className = "periodical";
  if (publication.venue) {
    const venue = document.createElement("em");
    venue.textContent = publication.venue;
    periodical.append(venue);
    if (publication.status) periodical.append(` (${publication.status})`);
    if (publication.year) periodical.append(`, ${publication.year}`);
  } else if (publication.status) {
    periodical.textContent = publication.status;
  }

  const note = document.createElement("div");
  note.className = "publication-note";
  note.textContent = publication.note || "";

  const links = document.createElement("div");
  links.className = "links";
  addLink(links, "Paper", publication.paper_url);
  if (publication.abstract) addToggle(links, "Abs");

  body.append(title, authors);
  if (periodical.textContent) body.append(periodical);
  if (note.textContent) body.append(note);
  body.append(links);

  if (publication.abstract) {
    const abstract = document.createElement("div");
    abstract.className = "abstract hidden";
    const paragraph = document.createElement("p");
    paragraph.textContent = publication.abstract;
    abstract.append(paragraph);
    body.append(abstract);
  }

  row.append(abbrCol, body);
  item.append(row);
  return item;
}

function addLink(container, label, href) {
  if (!href) return;
  const link = document.createElement("a");
  link.href = href;
  link.className = "btn btn-sm z-depth-0";
  link.setAttribute("role", "button");
  link.textContent = label;
  if (/^https?:\/\//.test(href)) {
    link.rel = "external nofollow noopener";
    link.target = "_blank";
  }
  container.append(link);
}

function addToggle(container, label) {
  const link = document.createElement("a");
  link.href = "#";
  link.className = "abstract btn btn-sm z-depth-0";
  link.setAttribute("role", "button");
  link.textContent = label;
  container.append(link);
}

function formatAuthors(authorText) {
  const nodes = [];
  const parts = authorText.split("Robert Kuan");
  parts.forEach((part, index) => {
    if (part) nodes.push(document.createTextNode(part));
    if (index < parts.length - 1) {
      const currentAuthor = document.createElement("em");
      currentAuthor.textContent = "Robert Kuan";
      nodes.push(currentAuthor);
    }
  });
  return nodes.length ? nodes : [document.createTextNode(authorText)];
}

function abbreviationFor(venue) {
  if (!venue) return "Paper";
  if (/Proceedings of the National Academy of Sciences/i.test(venue)) return "PNAS";
  if (/Nature/i.test(venue)) return "Nature";
  return "Paper";
}
