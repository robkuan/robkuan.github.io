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
      } else if (path === "/research/") {
        const sectionHeadings = page.locator(".research-section-heading");
        if ((await sectionHeadings.count()) !== 2) {
          throw new Error("/research/ should show two section headings");
        }
        const hasTopResearchTitle = await page.locator('h1:has-text("research")').count();
        if (hasTopResearchTitle !== 0) {
          throw new Error('/research/ should not show a top "research" header');
        }
      } else {
        const firstHeading = await page.locator("h1").first().textContent();
        if (!firstHeading || !firstHeading.trim()) {
          throw new Error(`${path} is missing a visible h1`);
        }
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("browser checks passed");
