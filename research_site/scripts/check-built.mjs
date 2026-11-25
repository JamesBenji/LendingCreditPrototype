import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { load } from "cheerio";
import { sourceMatchers as sources } from "../src/lib/sources.mjs";
const dist = path.resolve(import.meta.dirname, "../dist");
const base = "/LendingCreditPrototype/";
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((d) =>
      d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)],
    );
}
const files = walk(dist),
  html = files.filter((f) => f.endsWith(".html"));
let links = 0;
assert.equal(
  html.length,
  42,
  "Expected 34 chapters + 6 registers + search + home",
);
for (const file of html) {
  const $ = load(fs.readFileSync(file, "utf8"));
  assert.equal($("h1").length, 1, "Exactly one primary heading");
  assert($("html").attr("lang") === "en");
  const ids = $("[id]")
    .toArray()
    .map((el) => $(el).attr("id"));
  assert.equal(ids.length, new Set(ids).size, "Duplicate IDs " + file);
  assert(!$("body").text().includes("{{"), "Unresolved content syntax");
  $("h2,h3").each((i, el) =>
    assert(
      $(el).attr("id") || $(el).parent().attr("id"),
      "Heading lacks deep link " + file,
    ),
  );
  $("a[href],script[src],link[href],img[src]").each((i, el) => {
    const href = $(el).attr("href") || $(el).attr("src");
    if (/^(https?:|mailto:|data:)/.test(href)) return;
    assert(
      href.startsWith(base) || href.startsWith("#"),
      "Wrong Pages base path " + href + " in " + file,
    );
    const current =
      base +
      path.relative(dist, path.dirname(file)).replaceAll(path.sep, "/") +
      "/";
    const url = new URL(href, "https://jamesbenji.github.io" + current);
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    const target = path.join(
      dist,
      relative.endsWith("/") ? relative + "index.html" : relative,
    );
    assert(fs.existsSync(target), "Broken built link " + href + " in " + file);
    links++;
    if (url.hash) {
      const targetHTML =
        target === file ? $ : load(fs.readFileSync(target, "utf8"));
      assert(
        targetHTML("[id]")
          .toArray()
          .some(
            (e) =>
              targetHTML(e).attr("id") ===
              decodeURIComponent(url.hash.slice(1)),
          ),
        "Missing anchor " + href,
      );
    }
  });
  // No repository filename may appear in reader text outside a source link.
  function inspect(node) {
    if (
      node.type === "tag" &&
      ["a", "script", "style", "math", "svg"].includes(node.name)
    )
      return;
    if (node.type === "text")
      for (const s of sources)
        assert(
          !node.data.includes(s.path),
          "Unlinked known source " + s.path + " in " + file,
        );
    else for (const c of node.children || []) inspect(c);
  }
  inspect($("main")[0]);
  $("tbody tr").each((i, row) => {
    const numeric = $(row)
      .find("td")
      .toArray()
      .some((el) => /^[-−]?\d+(?:\.\d+)?%?$/.test($(el).text().trim()));
    if (numeric)
      assert(
        $(row).find("[data-evidence]").length,
        "Numeric table row lacks evidence " + file,
      );
  });
  $("a[data-source]").each((i, el) => {
    const url = new URL($(el).attr("href"));
    assert(/\/(blob|tree)\/[^/]+\//.test(url.pathname));
    if (url.hash) assert(/^#L\d+(?:-L\d+)?$/.test(url.hash));
  });
}
for (const file of files.filter(
  (f) => /\.(css|js)$/.test(f) && !f.includes("/pagefind/"),
)) {
  const content = fs.readFileSync(file, "utf8");
  assert(
    !/fetch\(["'](?:https?:[^"']*eab-credit|\/api\/)/.test(content),
    "Unexpected product API call",
  );
  if (file.endsWith(".css"))
    assert(
      !/url\(["']?\/(?!LendingCreditPrototype\/)/.test(content),
      "Wrong root asset in CSS",
    );
}
assert(
  fs.existsSync(path.join(dist, "pagefind/pagefind.js")),
  "Missing static search index",
);
console.log(
  "Checked " +
    html.length +
    " static pages, " +
    links +
    " local links, source links, anchors, numeric evidence and Pages assets.",
);
