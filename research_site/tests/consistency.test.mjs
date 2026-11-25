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
