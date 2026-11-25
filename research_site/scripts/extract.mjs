import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const root = path.resolve(import.meta.dirname, "../..");
const data = path.join(root, "research_site/src/data");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const notebook = read("Lending_project_v2 (1).ipynb");
const metadata = read("lending_artifacts/metadata.json");
const runtime = read("docs/evidence/runtime-inspection.json");
const metrics = read("docs/evidence/reproduced-metrics.json");
const join = (value) => (Array.isArray(value) ? value.join("") : value || "");
const source = join(notebook.cells[6].source);
const groups = {};
for (const [group, variable] of Object.entries({
  numeric: "NUMERIC_CANDIDATES",
  categorical: "CATEGORICAL_CANDIDATES",
  date: "DATE_CANDIDATES",
  target: "TARGET_FIELDS",
  benchmark: "BENCHMARK_FIELDS",
  outcome: "OUTCOME_FIELDS",
})) {
  const match = source.match(
    new RegExp(variable + "\\s*=\\s*\\[([\\s\\S]*?)\\]"),
  );
  if (!match) throw new Error("Missing notebook field group " + variable);
  groups[group] = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}
const cells = notebook.cells.map((c, index) => ({
  index,
  id: c.id,
  type: c.cell_type,
  source: join(c.source),
  text:
    c.outputs
      ?.flatMap((o) =>
        o.text
          ? [join(o.text)]
          : o.data?.["text/plain"]
            ? [join(o.data["text/plain"])]
            : [],
      )
      .join("\n") || "",
  hasImage: !!c.outputs?.some((o) => o.data?.["image/png"]),
}));
const evidenceFiles = fs
  .readdirSync(path.join(root, "docs/evidence"))
  .sort()
  .map((name) => {
    const p = "docs/evidence/" + name;
    const bytes = fs.readFileSync(path.join(root, p));
    const d = JSON.parse(bytes);
    return {
      path: p,
      sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      ref: d.inspected_commit || d.research_commit || null,
      keys: Object.keys(d),
    };
  });
const generated = {
  groups,
  modelFeatures: metadata.feature_cols,
  numericFeatures: metadata.numeric_features,
  categoricalFeatures: metadata.categorical_features,
  defaults: metadata.defaults,
  LGD: metadata.LGD_measured_net,
  funding: metadata.FUNDING_COST_assumed,
  margin: metadata.OPERATING_MARGIN_assumed,
  metrics,
  runtime,
  cells,
  evidenceFiles,
};
// Only public repository records are read; no raw dataset, model load, fit, or API.
const target = path.join(data, "extracted.json");
const serialized = JSON.stringify(generated, null, 2) + "\n";
if (process.argv.includes("--check")) {
  const existing = read("research_site/src/data/extracted.json");
  if (JSON.stringify(existing) !== JSON.stringify(generated))
    throw new Error(
      "Evidence changed. Run npm run extract and review the content.",
    );
} else fs.writeFileSync(target, serialized);
const figureDir = path.join(root, "research_site/public/figures");
fs.mkdirSync(figureDir, { recursive: true });
const image = notebook.cells[12].outputs.find((o) => o.data?.["image/png"])
  ?.data["image/png"];
if (!image) throw new Error("Required saved EDA figure is missing");
fs.writeFileSync(
  path.join(figureDir, "eda-cell-12.png"),
  Buffer.from(join(image), "base64"),
);
const commit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).trim();
fs.writeFileSync(
  path.join(data, "build-info.json"),
  JSON.stringify(
    { commit, evidenceCommit: metrics.inspected_commit },
    null,
    2,
  ) + "\n",
);
console.log(
  "Checked notebook groups, metadata, all evidence JSON and stable cell labels.",
);
