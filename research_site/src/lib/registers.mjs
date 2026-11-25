import { readerText, evidenceName } from "./labels.mjs";
import fields from "../data/fields.json" with { type: "json" };
import experiments from "../data/experiments.json" with { type: "json" };
import evidence from "../data/evidence.json" with { type: "json" };
import limits from "../data/limitations.json" with { type: "json" };
import timeline from "../data/timeline.json" with { type: "json" };
import metrics from "../data/metrics.json" with { type: "json" };
import sources from "../data/sources.json" with { type: "json" };
import glossary from "../data/glossary.json" with { type: "json" };
import comparisons from "../data/comparisons.json" with { type: "json" };
import x from "../data/extracted.json" with { type: "json" };
import { escape, sourceLink, commitURL } from "./sources.mjs";
import { evidenceLink } from "./render.mjs";
export const base = "/LendingCreditPrototype/";
const ev = (id) => evidenceLink(id);
const table = (id, title, columns, rows) => ({
  id,
  title: readerText(title),
  columns,
  rows: rows.map((row) => ({
    ...row,
    ...Object.fromEntries(
      columns.map((column) => [
        column.key,
        typeof row[column.key] === "string"
          ? readerText(row[column.key])
          : row[column.key],
      ]),
    ),
  })),
});
const c = (key, label) => ({ key, label });
const fieldTable = (mode) =>
  table(
    "fields-" + mode,
    mode === "model-fields"
      ? "All 56 conceptual model inputs"
      : mode === "serving-fields"
        ? "Full model inputs and serving defaults"
        : "Evidenced field catalogue",
    [
      c("field", "Field"),
      c("meaning", "Meaning and significance"),
      c("role", "Use and timing"),
      c("detail", "Full disposition"),
      c("source", "Source"),
    ],
    fields
      .filter((f) =>
        mode === "loaded-fields"
          ? f.loaded
          : ["model-fields", "serving-fields"].includes(mode)
            ? f.modelInput
            : true,
      )
      .map((f) => ({
        field: escape(f.field),
        meaning:
          escape(f.definition) +
          "<p>" +
          escape(f.rationale) +
          "</p><small>" +
          escape(readerText(f.definitionStatus)) +
          "</small>",
        role:
          escape(f.role) +
          "<p>" +
          escape(f.availableAtApplication) +
          "</p><small>Serving: " +
          escape(f.serving) +
          "</small>",
        detail:
          "<details><summary>Inspect " +
          escape(f.field) +
          "</summary><dl>" +
          Object.entries(f)
            .filter(([k]) => !["field", "definition", "rationale"].includes(k))
            .map(
              ([k, v]) =>
                "<dt>" +
                escape(k) +
                "</dt><dd>" +
                (k === "source" || k === "definitionSource"
                  ? sourceLink(v)
                  : k === "default" && v !== null
                    ? escape(v) +
                      " " +
                      sourceLink("metadata", "Training default")
                    : escape(readerText(v === null ? "Not applicable" : v))) +
                "</dd>",
            )
            .join("") +
          "</dl></details>",
        source:
          sourceLink(f.source, "View field role — cell " + f.cell) +
          "<p>" +
          sourceLink(f.definitionSource, "Inspect working meaning") +
          "</p>",
        group: f.group,
        status: f.verificationStatus,
      })),
  );
export function getRegisters(mode) {
  if (!mode) return [];
  if (mode === "working-groups") {
    const purposes = {
      numeric: [
        "Numeric borrower information",
        "Exposure, income, burden and credit history; two FICO bounds become one midpoint.",
        "47 retained raw inputs; two FICO bounds become one midpoint. Source timing still needs confirmation.",
      ],
      categorical: [
        "Borrower and loan context",
        "Term, employment, housing, verification, purpose and application type.",
        "Six conceptual inputs; encoding expands their representation.",
      ],
      date: [
        "Dates for design and history",
        "Order cohorts and calculate elapsed credit history.",
        "Used for splitting or engineering; not raw PD predictors.",
      ],
      target: [
        "Final outcome",
        "Construct the answer that the model learns to estimate.",
        "Never a predictor.",
      ],
      benchmark: [
        "Incumbent assessment",
        "Compare application information with LendingClub pricing; grade also groups results.",
        "Separate benchmark/combined models, outside the served application-only model.",
      ],
      outcome: [
        "Principal loss measurement",
        "Use funded principal, repayments and recoveries to measure training LGD.",
        "LGD-only; funded amount is known at origination but grouped here by its loss-measurement role.",
      ],
    };
    return [
      table(
        "working-groups",
        "Why the working file contains 64 columns",
        [
          c("name", "Information group"),
          c("count", "Fields"),
          c("purpose", "Why it is loaded"),
          c("model", "Does it enter application PD?"),
          c("names", "Exact names"),
          c("evidence", "Source"),
        ],
        Object.entries(x.groups).map(([group, names]) => ({
          name: purposes[group][0],
          count: names.length,
          purpose: purposes[group][1],
          model: purposes[group][2],
          names:
            "<details><summary>Show field names</summary><ul>" +
            names.map((name) => "<li>" + escape(name) + "</li>").join("") +
            "</ul></details>",
          evidence: ev("pipeline"),
          group,
        })),
      ),
    ];
  }
  if (mode === "serving-fields")
    return [
      table(
        "fields-serving-fields",
        "What serving actually supplies",
        [
          c("field", "Model input"),
          c("collection", "How it is supplied"),
          c("default", "Saved training default"),
          c("used", "Used in saved tree splits?"),
          c("evidence", "Source"),
        ],
        fields
          .filter((f) => f.modelInput)
          .map((f) => ({
            field: escape(f.field),
            collection:
              f.serving === "browser input"
                ? "Form"
                : f.serving === "backend derived"
                  ? "Calculated from current inputs"
                  : "Training default",
            default: escape(f.default ?? "Not available"),
            used: x.runtime.used_raw_features.includes(f.field) ? "Yes" : "No",
            evidence: ev("artifact") + " " + sourceLink("metadata", "DEFAULTS"),
            group: f.serving,
          })),
      ),
    ];
  if (
    ["fields", "loaded-fields", "model-fields", "serving-fields"].includes(mode)
  )
    return [fieldTable(mode)];
  if (mode === "timeline")
    return [
      table(
        "timeline",
        "Decisions and experiments",
        [
          c("stage", "Stage"),
          c("question", "Question"),
          c("decision", "Decision"),
          c("consequence", "Consequence"),
          c("uncertainty", "Remaining uncertainty"),
          c("evidence", "Evidence"),
        ],
        timeline.map((t) => ({
          ...t,
          stage: escape(t.stage + ". " + t.title),
          question: escape(t.question),
          decision: escape(t.decision),
          consequence: escape(t.consequence),
          uncertainty: escape(t.uncertainty),
          evidence: ev(t.evidence),
          status: evidence.find((e) => e.id === t.evidence).status,
        })),
      ),
    ];
  if (mode === "experiments")
    return [
      table(
        "experiments",
        "Saved seven-model test table",
        [
          c("model", "Model / question"),
          c("roc_auc", "ROC-AUC"),
          c("average_precision", "AP"),
          c("brier", "Brier"),
          c("ece", "ECE"),
          c("lift", "Lift at 10%"),
          c("precision", "Precision at ≥70% recall"),
          c("evidence", "Evidence"),
        ],
        experiments.map((r) => ({
          ...r,
          model: escape(r.model) + "<p>" + escape(r.question) + "</p>",
          evidence: ev(r.evidence),
        })),
      ),
    ];
  if (mode === "comparisons")
    return [
      table(
        "comparisons",
        "Saved paired test AUC differences",
        [
          c("question", "Question"),
          c("models", "A minus B"),
          c("difference", "Difference"),
          c("low", "95% low"),
          c("high", "95% high"),
          c("interpretation", "Interpretation"),
          c("evidence", "Evidence"),
        ],
        comparisons.map((r) => ({
          ...r,
          models: escape(r.A + " − " + r.B),
          interpretation:
            r.low > 0
              ? "Interval excludes zero; supports a positive difference."
              : "No demonstrated difference; interval contains zero.",
          evidence: ev(r.evidence),
        })),
      ),
    ];
  if (mode === "limitations" || mode === "hardships")
    return [
      table(
        "limitations",
        "Limitations and difficulties",
        [
          c("problem", "Problem / status"),
          c("claim", "Affected claim"),
          c("detected", "Detection"),
          c("bias", "Impact / direction"),
          c("mitigation", "Current mitigation"),
          c("nextStep", "Remaining risk and next step"),
          c("evidence", "Evidence"),
        ],
        limits.map((r) => ({
          ...r,
          problem:
            '<span id="' +
            r.id +
            '"></span><strong>' +
            escape(r.id + " " + r.problem) +
            "</strong><p>" +
            escape(r.description) +
            "</p><small>" +
            escape(r.severity) +
            " / unresolved</small>",
          nextStep:
            escape(r.nextStep) +
            "<p>Not resolved: " +
            escape(r.description) +
            "</p>",
          evidence: ev(r.evidence),
        })),
      ),
    ];
  if (mode === "evidence")
    return [
      table(
        "evidence",
        "Evidence behind our work",
        [
          c("id", "Evidence / source"),
          c("claim", "Supported claim"),
          c("locator", "Source locator"),
          c("limitation", "Evidence limit"),
          c("link", "Evidence source"),
        ],
        evidence.map((e) => ({
          ...e,
          id:
            '<span id="' +
            e.id +
            '"></span>' +
            escape(readerText(e.label)) +
            "<p>" +
            escape(evidenceName(e.status)) +
            "</p>",
          locator: readerText(e.locator),
          link:
            (e.status === "ASSUMPTION"
              ? '<a href="/LendingCreditPrototype/chapters/loss-price/#combine-probability-and-severity">Read about pricing inputs</a>'
              : sourceLink(
                  e.status === "NOTEBOOK OUTPUT" ? "notebook" : e.source,
                  "View " + evidenceName(e.status).toLowerCase(),
                )) +
            "<p>" +
            escape(e.label) +
            "</p>",
        })),
      ),
    ];
  if (mode === "sources")
    return [
      table(
        "sources",
        "Repository source map",
        [
          c("label", "Source"),
          c("description", "Purpose"),
          c("ref", "Pinned commit"),
          c("type", "Source type"),
        ],
        sources.map((s) => ({
          ...s,
          label: sourceLink(s.id),
          ref:
            '<a href="' +
            commitURL(s.ref) +
            '" target="_blank" rel="noopener noreferrer">' +
            s.ref.slice(0, 12) +
            " ↗</a>",
        })),
      ),
    ];
  if (mode === "glossary")
    return [
      table(
        "glossary",
        "Glossary",
        [
          c("term", "Term"),
          c("name", "Full name"),
          c("definition", "Definition"),
          c("chapter", "Read explanation"),
        ],
        glossary.map((g) => ({
          ...g,
          term: '<span id="' + g.id + '"></span>' + escape(g.term),
          chapter:
            '<a href="' + base + "chapters/" + g.chapter + '/">Read part</a>',
        })),
      ),
    ];
  if (mode === "metrics")
    return [
      table(
        "metrics",
        "Metric quick reference",
        [
          c("name", "Metric"),
          c("definition", "Plain meaning"),
          c("source", "Implementation"),
          c("evidence", "Status"),
        ],
        metrics.map((m) => ({
          ...m,
          source: sourceLink(m.source, "Metric helpers — cell 20"),
          evidence: ev(m.evidence),
        })),
      ),
    ];
  if (mode === "splits")
    return [
      table(
        "splits",
        "Reconstructed chronological cohorts",
        [
          c("name", "Partition"),
          c("rows", "Loans"),
          c("dates", "Issue-month span"),
          c("rate", "Observed charge-off rate"),
          c("evidence", "Provenance"),
        ],
        Object.entries(x.metrics.splits).map(([name, r]) => ({
          name,
          rows: r.rows,
          dates: r.first_issue_month + " → " + r.last_issue_month,
          rate: (r.default_rate * 100).toFixed(4) + "%",
          evidence: ev("sample"),
        })),
      ),
    ];
  if (mode === "results")
    return [
      table(
        "results",
        "Recorded frozen-model test results",
        [
          c("model", "Probability path"),
          c("auc", "ROC-AUC"),
          c("ap", "AP"),
          c("brier", "Brier"),
          c("ece", "ECE"),
          c("mean", "Mean PD"),
          c("observed", "Observed defaults"),
          c("evidence", "Provenance"),
        ],
        Object.entries(x.metrics.metrics.test).map(([model, r]) => ({
          model,
          auc: r.roc_auc.toFixed(4),
          ap: r.average_precision.toFixed(4),
          brier: r.brier.toFixed(6),
          ece: r.ece_10_quantile_bins.toFixed(4),
          mean: (r.mean_predicted_pd * 100).toFixed(2) + "%",
          observed: (x.metrics.splits.test.default_rate * 100).toFixed(2) + "%",
          evidence: ev("frozen"),
        })),
      ),
    ];
  if (mode === "parameters") {
    const cell = x.cells.find((c) => c.index === 24).source;
    const space = cell.match(/param_dist = (\{[\s\S]*?\n\})/)[1];
    const rows = Object.entries(x.runtime.model_parameters)
      .filter(([key]) =>
        [
          "n_estimators",
          "max_depth",
          "learning_rate",
          "subsample",
          "colsample_bytree",
          "min_child_weight",
          "reg_alpha",
          "reg_lambda",
        ].includes(key),
      )
      .map(([parameter, selected]) => ({
        parameter,
        selected,
        space: escape(
          space.match(
            new RegExp('"model__' + parameter + '": (\\[[^\\]]+\\])'),
          )?.[1] || "",
        ),
        evidence: ev("search") + " " + ev("artifact"),
      }));
    return [
      table(
        "parameters",
        "Search space and artifact-confirmed choice",
        [
          c("parameter", "Parameter"),
          c("space", "Candidate values"),
          c("selected", "Selected"),
          c("evidence", "Evidence"),
        ],
        rows,
      ),
    ];
  }
  if (mode === "artifacts")
    return [
      table(
        "artifacts",
        "Recorded artifact identities",
        [
          c("name", "Artifact"),
          c("bytes", "Bytes"),
          c("hash", "SHA-256"),
          c("evidence", "Provenance"),
        ],
        Object.entries(x.runtime.artifact_manifest).map(([name, r]) => ({
          name: sourceLink(
            name === "metadata.json"
              ? "metadata"
              : name === "platt_calibrator.joblib"
                ? "calibrator"
                : "model",
          ),
          bytes: r.bytes,
          hash: escape(r.sha256),
          evidence: ev("artifact"),
        })),
      ),
      table(
        "versions",
        "Recorded runtime versions",
        [
          c("name", "Package"),
          c("version", "Version"),
          c("evidence", "Provenance"),
        ],
        Object.entries(x.runtime.versions).map(([name, version]) => ({
          name,
          version: version || "Not installed in this recorded runtime",
          evidence: ev("artifact"),
        })),
      ),
    ];
  if (mode === "trace")
    return [
      table(
        "trace",
        "Source map for the request trace",
        [
          c("stage", "Stage"),
          c("input", "Input"),
          c("output", "Output"),
          c("failure", "Validation or failure"),
          c("source", "Inspect implementation"),
        ],
        [
          [
            "React form",
            "Options and controlled values",
            "JSON with one-decimal DTI",
            "Browser ranges; network messages",
            "form",
          ],
          [
            "Client DTI",
            "Monthly debt and annual income",
            "Calculated percentage",
            "Finite, nonnegative debt and positive income",
            "dti",
          ],
          [
            "Flask route",
            "JSON request",
            "Parsed object or HTTP error",
            "415 non-JSON; 400 parse/schema errors",
            "api",
          ],
          [
            "Schema",
            "Raw input keys",
            "Finite numbers and supported categories",
            "Omitted keys default; unknown keys ignored",
            "schema",
          ],
          [
            "Preparation",
            "Defaults plus validated inputs",
            "56 ordered fields; recomputed LTI",
            "Uncollected values appear observed",
            "predictor",
          ],
          [
            "Saved prediction",
            "Ordered conceptual fields",
            "Raw PD then calibrated PD",
            "Artifact/version/load compatibility",
            "predictor",
          ],
          [
            "Loss and policy",
            "PD, LGD, assumed costs",
            "Loss, recommendation and rate",
            "Unvalidated hand-set cutoffs; 40% cap",
            "predictor",
          ],
          [
            "Repayment",
            "Principal, rounded rate, months",
            "Payments and gross interest",
            "Positive principal/term; no default/prepayment",
            "repayment",
          ],
          [
            "Result rendering",
            "API response",
            "Synthetic assessment display",
            "Schedule is hypothetical even after decline",
            "result",
          ],
        ].map(([stage, input, output, failure, source]) => ({
          stage,
          input,
          output,
          failure,
          source: sourceLink(source),
        })),
      ),
    ];
  if (mode === "appendices")
    return ["evidence", "sources", "glossary"].flatMap(getRegisters);
  throw new Error("Unknown register " + mode);
}
