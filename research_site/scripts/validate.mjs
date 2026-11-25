import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getSource, sourceURL } from "../src/lib/sources.mjs";
import { render } from "../src/lib/render.mjs";
const root = path.resolve(import.meta.dirname, "../..");
const dir = path.join(root, "research_site/src/data");
const read = (n) =>
  JSON.parse(fs.readFileSync(path.join(dir, n + ".json"), "utf8"));
export function validate() {
  const sources = read("sources"),
    fields = read("fields"),
    features = read("model-features"),
    x = read("extracted"),
    evidence = read("evidence"),
    chapters = read("chapters");
  const counts = {
    numeric: 49,
    categorical: 6,
    date: 2,
    target: 1,
    benchmark: 3,
    outcome: 3,
  };
  assert.equal(
    new Set(fields.map((f) => f.field)).size,
    fields.length,
    "Duplicate field names",
  );
  for (const [group, count] of Object.entries(counts))
    assert.equal(
      fields.filter((f) => f.loaded && f.group === group).length,
      count,
      group + " count",
    );
  assert.equal(fields.filter((f) => f.loaded).length, 64);
  assert.equal(features.length, 56);
  assert.equal(new Set(features).size, 56);
  assert.equal(49 - 2 + 6 + 3, 56);
  assert.deepEqual([...features].sort(), [...x.modelFeatures].sort());
  assert.equal(x.runtime.transformed_feature_count, 124);
  const forbidden = [
    "loan_status",
    "default",
    "issue_d",
    "earliest_cr_line",
    "int_rate",
    "grade",
    "sub_grade",
    "funded_amnt",
    "total_rec_prncp",
    "recoveries",
  ];
  for (const f of features) {
    assert(!forbidden.includes(f), "Forbidden input " + f);
    const row = fields.find((r) => r.field === f);
    assert(row?.modelInput);
    for (const key of [
      "definition",
      "rationale",
      "availableAtApplication",
      "source",
      "preprocessing",
      "role",
    ])
      assert(row[key], f + " missing " + key);
  }
  for (const f of fields) {
    assert(f.role, "Missing field role");
    assert.equal(f.modelInput, features.includes(f.field));
    getSource(f.source);
    getSource(f.definitionSource);
  }
  assert.equal(
    new Set(sources.map((s) => s.id)).size,
    sources.length,
    "Duplicate source IDs",
  );
  for (const s of sources) {
    assert(s.path && s.ref && s.description, "Incomplete source");
    assert(
      !s.path.startsWith("/") && !s.path.includes(".."),
      "Invalid source path",
    );
    const local = path.join(root, s.path);
    assert(fs.existsSync(local), "Broken repository source " + s.path);
    assert.equal(
      fs.statSync(local).isDirectory(),
      s.type === "directory",
      "File/tree mismatch",
    );
    const url = new URL(sourceURL(s.id));
    assert(url.pathname.includes(s.type === "directory" ? "/tree/" : "/blob/"));
    // The target must also exist at the pinned commit, not only in the working tree.
    execFileSync("git", ["cat-file", "-e", s.ref + ":" + s.path], {
      cwd: root,
      stdio: "pipe",
    });
  }
  const classes = [
    "REPRODUCED",
    "NOTEBOOK OUTPUT",
    "CODE-VERIFIED",
    "OWNER-REPORTED",
    "ASSUMPTION",
    "LIMITATION",
    "PROPOSED",
    "UNRESOLVED",
  ];
  assert.equal(new Set(evidence.map((e) => e.id)).size, evidence.length);
  for (const e of evidence) {
    assert(classes.includes(e.status));
    assert(e.claim && e.locator && e.limitation);
    getSource(e.source);
  }
  for (const file of [
    "experiments",
    "comparisons",
    "timeline",
    "limitations",
    "metrics",
  ])
    for (const row of read(file)) {
      assert(
        evidence.some((e) => e.id === row.evidence),
        "Claim has no evidence in " + file,
      );
      if (row.source) getSource(row.source);
    }
  // Rounded hand-curated comparison records must match the saved notebook table.
  const output = x.cells.find((c) => c.index === 26).text;
  for (const r of read("comparisons"))
    for (const key of ["difference", "low", "high"])
      assert(
        output.includes(r[key].toFixed(4)),
        "Comparison conflicts with saved output",
      );
  const testOutput = x.cells.find((c) => c.index === 28).text;
  for (const r of read("experiments"))
    for (const key of [
      "roc_auc",
      "average_precision",
      "brier",
      "ece",
      "lift",
      "precision",
    ])
      assert(
        testOutput.includes(r[key].toFixed(4)),
        "Experiment conflicts with saved output",
      );
  assert.equal(chapters.length, 34);
  assert.equal(new Set(chapters.map((c) => c.slug)).size, 34);
  for (const c of chapters) {
    assert(c.summary && c.sources.length && c.number >= 1 && c.number <= 34);
    for (const id of c.sources) getSource(id);
    const text = fs.readFileSync(
      path.join(root, "research_site/src/content", c.slug + ".md"),
      "utf8",
    );
    assert(!/content coming soon|TODO|TBD/i.test(text), "Placeholder content");
    assert(text.split(/\s+/).length >= 130, "Thin chapter " + c.slug);
    assert(
      text.includes("{{source:") && text.includes("{{evidence:"),
      "Chapter has no inline provenance",
    );
    const result = render(text);
    assert(
      result.headings.length >= 3,
      "Chapter has no local structure " + c.slug,
    );
    assert(!result.html.includes("{{"), "Unresolved content token");
    for (const match of text.matchAll(
      /\{\{source:([^|}]+)(?:\|[^|}]+)?(?:\|([^}]+))?\}\}/g,
    ))
      if (match[2]) {
        const s = getSource(match[1]);
        const [first, last = first] = match[2].split("-").map(Number);
        assert(first > 0 && last >= first, "Malformed line anchor");
        const lines = fs
          .readFileSync(path.join(root, s.path), "utf8")
          .split("\n").length;
        assert(
          last <= lines,
          "Line anchor past EOF: " + s.path + " " + match[2],
        );
      }
  }
  const packageText = fs.readFileSync(
    path.join(root, "scripts/package_release.py"),
    "utf8",
  );
  assert(
    !packageText.includes("research_site"),
    "Research site entered VM packager",
  );
  console.log(
    "Validated 34 chapters, 64 loaded fields, 56 inputs, all evidence classes and pinned repository paths.",
  );
}
if (process.argv[1] === fileURLToPath(import.meta.url)) validate();
