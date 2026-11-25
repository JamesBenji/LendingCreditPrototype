import test from "node:test";
import assert from "node:assert/strict";
import { load } from "cheerio";
import { validate } from "../scripts/validate.mjs";
import { sourceURL, sourceLink } from "../src/lib/sources.mjs";
import { render } from "../src/lib/render.mjs";
import { getRegisters } from "../src/lib/registers.mjs";
import x from "../src/data/extracted.json" with { type: "json" };
import fields from "../src/data/fields.json" with { type: "json" };
test("Content, input counts, evidence and repository paths are consistent", () =>
  validate());
test("Field lists exactly match extracted notebook groups", () => {
  for (const [group, names] of Object.entries(x.groups))
    assert.deepEqual(
      fields.filter((f) => f.group === group).map((f) => f.field),
      names,
    );
  assert.equal(x.runtime.defaulted_features.length, 40);
  assert.deepEqual(x.runtime.unused_supplied_features_in_saved_trees, [
    "application_type",
  ]);
});
test("Source links encode spaces, distinguish directories and validate line syntax", () => {
  assert(sourceURL("notebook").includes("Lending_project_v2%20(1).ipynb"));
  assert(sourceURL("frontend").includes("/tree/"));
  assert(sourceURL("predictor", { lines: "83-94" }).endsWith("#L83-L94"));
  assert.throws(() => sourceURL("predictor", { lines: "-1" }));
  assert.throws(() => sourceURL("predictor", { lines: "0" }));
  assert.throws(() => sourceURL("predictor", { lines: "10-5" }));
  assert.throws(() => sourceURL("frontend", { lines: "1" }));
  assert.throws(() => sourceURL("missing"));
  assert(sourceLink("api").includes("noopener noreferrer"));
});
test("Known paths are clickable, including saved-output and code references", () => {
  const $ = load(
    render(
      "Source README.md and flask_app/predictor.py.\n\n~~~text\nREADME.md\n~~~",
    ).html,
  );
  assert.equal($("a[data-source]").length, 3);
  assert.equal($('a[data-source="overview"]').length, 2);
});
test("Mathematics renders without client JavaScript and headings have anchors", () => {
  const $ = load(render("## PD\n\n$$PD(x)=P(Y=1\\mid X=x)$$").html);
  assert.equal($("h2[id]").length, 1);
  assert.equal($("h2 a").length, 1);
  assert.equal($(".katex").length, 1);
  assert.equal($("math").length, 1);
});
test("Numeric comparison and result tables always expose evidence", () => {
  for (const mode of [
    "experiments",
    "comparisons",
    "results",
    "splits",
    "parameters",
    "artifacts",
  ])
    for (const table of getRegisters(mode))
      for (const row of table.rows)
        assert(
          row.evidence?.includes("data-evidence="),
          table.id + " has numeric row without evidence",
        );
});
test("Chapter templates expose all required registers", () => {
  for (const mode of [
    "fields",
    "loaded-fields",
    "model-fields",
    "serving-fields",
    "timeline",
    "limitations",
    "evidence",
    "sources",
    "metrics",
    "glossary",
    "trace",
    "appendices",
  ])
    assert(getRegisters(mode).length > 0);
  assert.equal(getRegisters("model-fields")[0].rows.length, 56);
  assert.equal(getRegisters("loaded-fields")[0].rows.length, 64);
});

test("Source-linked code preserves the original copyable filename", () => {
  const $ = load(render("~~~python\nopen('flask_app/predictor.py')\n~~~").html);
  $("pre .external").remove();
  assert.equal($("pre").text().trim(), "open('flask_app/predictor.py')");
});

test("Reader labels keep filenames and source routes intact", async () => {
  const { readerText } = await import("../src/lib/labels.mjs");
  assert.equal(
    readerText("Technical dossier / Chapter 10"),
    "Our Work / Part 10",
  );
  assert.equal(readerText("Chapters and registers"), "Explore our work");
  assert.equal(readerText("Cell 10 · NIRO3uBSbFyJ"), "Cell 10");
  assert.equal(
    readerText("research_site/src/data/chapters.json"),
    "research_site/src/data/chapters.json",
  );
  assert.equal(
    readerText("/LendingCreditPrototype/chapters/target/"),
    "/LendingCreditPrototype/chapters/target/",
  );
});

test("Evidence links explain what they open", async () => {
  const { evidenceLink } = await import("../src/lib/render.mjs");
  const code = load(evidenceLink("serving"));
  assert.equal(code("a").text().replace(" ↗", ""), "CODE");
  const notebook = load(evidenceLink("comparisons"));
  assert.equal(notebook("a").text().replace(" ↗", ""), "NOTEBOOK");
  assert(notebook("a").attr("href").includes("Lending_project_v2"));
  const pricing = load(evidenceLink("cost"));
  assert.equal(pricing("a").text(), "PRICING INPUTS");
  assert.equal(
    pricing("a").attr("href"),
    "/LendingCreditPrototype/chapters/loss-price/#combine-probability-and-severity",
  );
});

test("Reading navigation covers every static page without changing routes", async () => {
  const { readingOrder, pageNavigation } = await import(
    "../src/lib/navigation.mjs"
  );
  assert.equal(readingOrder.length, 42);
  assert.equal(new Set(readingOrder.map((p) => p.path)).size, 42);
  for (let index = 0; index < readingOrder.length; index++) {
    const navigation = pageNavigation(readingOrder[index].path);
    assert.equal(navigation.previous, readingOrder[index - 1] || null);
    assert.equal(navigation.next, readingOrder[index + 1] || null);
  }
});

test("Evidence tags are uppercase, have no subtitles and exclude the defense guide", async () => {
  const { evidenceLink } = await import("../src/lib/render.mjs");
  const { getSource } = await import("../src/lib/sources.mjs");
  assert.throws(() => getSource("defense"));
  for (const id of [
    "pipeline",
    "frozen",
    "comparisons",
    "cost",
    "timing",
    "fairness",
    "future",
    "vm",
  ]) {
    const $ = load(evidenceLink(id));
    assert.equal($(".evidence-context").length, 0);
    const label = $("a").clone().find(".external").remove().end().text().trim();
    assert.equal(label, label.toUpperCase());
    assert(!$.html().includes("DEFENSE_GUIDE"));
  }
});
