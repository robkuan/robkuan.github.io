const baseUrl = process.argv[2] || "http://localhost:8080";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.log("Playwright is not installed. Run npm install and npx playwright install chromium to enable browser checks.");
  process.exit(0);
}

const browser = await chromium.launch();
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 }
  ]) {
    const page = await browser.newPage({ viewport });
    for (const path of ["/", "/cv/", "/research/"]) {
      await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "networkidle" });
      await page.locator("nav").waitFor();
      await page.locator('[role="main"]').waitFor();

      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (horizontalOverflow) {
        throw new Error(`${path} overflows horizontally at ${viewport.width}px`);
      }

      if (viewport.width <= 576) {
        const footerPosition = await page.evaluate(() => getComputedStyle(document.querySelector("footer")).position);
        if (footerPosition === "fixed") {
          throw new Error(`${path} uses a fixed footer at ${viewport.width}px`);
        }
      }

      if (path === "/cv/") {
        const cvButton = page.locator('a[href*="/assets/pdf/cv.pdf"]');
        if ((await cvButton.count()) !== 1) {
          throw new Error("/cv/ is missing the Download Full CV link");
        }
        const embeddedPreview = page.locator(".cv-pdf-preview");
        const embeddedPreviewSrc = await embeddedPreview.getAttribute("src", { timeoutMs: 1000 });
        if (!embeddedPreviewSrc?.includes("navpanes=0") || !embeddedPreviewSrc.includes("pagemode=none")) {
          throw new Error("/cv/ should request hidden PDF navigation panes in the embedded preview");
        }
        if (!(await embeddedPreview.isVisible())) {
          throw new Error("/cv/ should show the embedded PDF iframe");
        }
        const rasterPreviewCount = await page.locator(".cv-mobile-preview, .cv-mobile-preview img").count();
        if (rasterPreviewCount !== 0) {
          throw new Error("/cv/ should not show raster CV preview images");
        }
        const iframeLayout = await page.evaluate(() => {
          const iframe = document.querySelector(".cv-pdf-preview");
          if (!iframe) return null;
          const rect = iframe.getBoundingClientRect();
          return {
            height: rect.height,
            viewportHeight: window.innerHeight,
            scrolling: iframe.getAttribute("scrolling")
          };
        });
        if (!iframeLayout || iframeLayout.scrolling !== "yes") {
          throw new Error("/cv/ should use a native scrollable PDF iframe");
        }
        if (viewport.width <= 576 && iframeLayout.height < iframeLayout.viewportHeight * 0.6) {
          throw new Error("/cv/ mobile PDF iframe is too short to be usable");
        }
      } else if (path === "/research/") {
        const sectionHeadings = page.locator(".research-section-heading");
        if ((await sectionHeadings.count()) !== 1) {
          throw new Error("/research/ should show one section heading");
        }
        const badges = page.locator(".publications ol.bibliography li .abbr abbr, .publications ol.bibliography li abbr.badge");
        if ((await badges.count()) !== 0) {
          throw new Error("/research/ should not show publication abbreviation badges");
        }
        const abstractButtons = page.locator(".publications ol.bibliography li .links a.abstract");
        if ((await abstractButtons.count()) !== 5) {
          throw new Error("/research/ should show one abstract toggle for each publication");
        }
        if ((await abstractButtons.first().textContent())?.trim() !== "Abstract") {
          throw new Error('/research/ should label abstract toggles "Abstract"');
        }
        const hasTopResearchTitle = await page.locator('h1:has-text("research")').count();
        if (hasTopResearchTitle !== 0) {
          throw new Error('/research/ should not show a top "research" header');
        }
        const hasManuscriptPreparationNote = await page.evaluate(() => document.body.textContent.includes("Manuscript in preparation for submission"));
        if (hasManuscriptPreparationNote) {
          throw new Error("/research/ should not show the manuscript preparation note");
        }
      } else {
        const firstHeading = await page.locator("h1").first().textContent();
        if (!firstHeading || !firstHeading.trim()) {
          throw new Error(`${path} is missing a visible h1`);
        }
        const jobMarketLine = page.locator(".home-job-market");
        if ((await jobMarketLine.count()) !== 1) {
          throw new Error("/ should show one centered academic job market line");
        }
        const jobMarketText = await jobMarketLine.textContent();
        if (!/2026–2027.*job market/i.test(jobMarketText?.trim() || "")) {
          throw new Error("/ has the wrong academic job market line");
        }
        const jobMarketLayout = await page.evaluate(() => {
          const line = document.querySelector(".home-job-market");
          const textContainer = line?.closest(".clearfix");
          if (!line || !textContainer) return null;
          const lineRect = line.getBoundingClientRect();
          const containerRect = textContainer.getBoundingClientRect();
          return {
            textAlign: getComputedStyle(line).textAlign,
            lineCenter: lineRect.left + lineRect.width / 2,
            containerCenter: containerRect.left + containerRect.width / 2
          };
        });
        if (!jobMarketLayout || jobMarketLayout.textAlign !== "center" || Math.abs(jobMarketLayout.lineCenter - jobMarketLayout.containerCenter) > 1) {
          throw new Error("/ should center the academic job market line under the text container");
        }
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("browser checks passed");
