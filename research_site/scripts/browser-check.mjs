import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import chapters from "../src/data/chapters.json" with { type: "json" };
const cwd = path.resolve(import.meta.dirname, "..");
const reportDir = path.join(cwd, "reports");
fs.mkdirSync(reportDir, { recursive: true });
const base = "http://127.0.0.1:4327/LendingCreditPrototype/";
const server = spawn(
  process.execPath,
  [
    "node_modules/astro/astro.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4327",
  ],
  {
    cwd,
    stdio: "pipe",
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
  },
);
let log = "";
server.stdout.on("data", (c) => (log += c));
server.stderr.on("data", (c) => (log += c));
let browser;
const checks = [];
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  assert(ready, "Static preview failed: " + log);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const api = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) api.push(r.url());
  });
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const c of chapters) {
      const r = await page.goto(base + "chapters/" + c.slug + "/");
      assert.equal(r.status(), 200);
      await page.waitForLoadState("domcontentloaded");
      assert.equal(await page.locator("h1").count(), 1);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert(!overflow, "Page overflow at " + width + " " + c.slug);
    }
    await page.goto(base + "chapters/training-serving/");
    await page.screenshot({
      path: path.join(reportDir, "serving-" + width + ".png"),
      fullPage: false,
    });
    checks.push({ width, chapters: 34, overflow: false });
    console.log("Responsive checks passed at " + width + "px.");
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const urls = [
    "",
    ...chapters.map((c) => "chapters/" + c.slug + "/"),
    "evidence/",
    "fields/",
    "limitations/",
    "timeline/",
    "sources/",
    "glossary/",
    "search/",
  ];
  const axeResults = [];
  for (const url of urls) {
    await page.goto(base + url);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    axeResults.push({
      url,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    });
  }
  fs.writeFileSync(
    path.join(reportDir, "accessibility.json"),
    JSON.stringify(axeResults, null, 2),
  );
  assert(
    axeResults.every((r) => r.violations.length === 0),
    "Accessibility failures: see reports/accessibility.json",
  );
  await page.goto(base + "fields/");
  await page.locator("[data-filter]").fill("fico_avg");
  assert.equal(
    await page.locator("tbody tr:visible").count(),
    3,
    "Field filter should find bounds and midpoint",
  );
  await page.locator("[data-filter]").fill("");
  await page.locator("select[data-group]").selectOption("engineered");
  assert.equal(await page.locator("tbody tr:visible").count(), 3);
  await page.goto(base + "evidence/");
  await page.locator("select[data-group]").selectOption("OWNER-REPORTED");
  assert.equal(await page.locator("tbody tr:visible").count(), 1);
  await page.goto(base + "limitations/");
  await page.locator("[data-filter]").fill("Serving gap");
  assert.equal(await page.locator("tbody tr:visible").count(), 1);
  await page.goto(base + "timeline/");
  await page.locator("[data-filter]").fill("Memory failure");
  assert.equal(await page.locator("tbody tr:visible").count(), 1);
  await page.goto(base + "search/");
  await page.locator("#query").fill("calibration");
  await page.locator("button[type=submit]").click();
  await page.waitForFunction(() =>
    document.querySelector("#search-status").textContent.includes("results"),
  );
  assert((await page.locator("#search-results a").count()) > 0);
  assert(
    (
      await page.locator("#search-results a").first().getAttribute("href")
    ).startsWith("/LendingCreditPrototype/"),
  );
  await page.goto(base + "chapters/lending-decision/");
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.textContent),
    "Skip to chapter",
  );
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement.id), "main");
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".chapter-sidebar").isVisible(), false);
  await page.emulateMedia({ media: "screen" });
  await context.close();
  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 360, height: 900 },
  });
  const staticPage = await noJS.newPage();
  await staticPage.goto(base + "fields/");
  assert.equal(await staticPage.locator("tbody tr").count(), 67);
  assert.equal(await staticPage.locator(".filters").isVisible(), false);
  await staticPage.goto(base + "chapters/lending-decision/");
  assert((await staticPage.locator(".katex").count()) > 0);
  await noJS.close();
  assert.equal(api.length, 0, "Publication called product API");
  assert.deepEqual(errors, [], "Browser runtime errors");
  fs.writeFileSync(
    path.join(reportDir, "browser-summary.json"),
    JSON.stringify(
      {
        responsive: checks,
        axePages: urls.length,
        axeViolations: 0,
        search: true,
        filters: true,
        keyboard: true,
        print: true,
        noJS: true,
        apiCalls: 0,
      },
      null,
      2,
    ),
  );
  console.log(
    "Passed 102 chapter/viewport checks; axe on 42 pages; search, filters, keyboard, print and no-JavaScript checks.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
