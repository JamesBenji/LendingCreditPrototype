import { readerText, evidenceName } from "./labels.mjs";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import texmath from "markdown-it-texmath";
import katex from "katex";
import { load } from "cheerio";
import { escape, sourceLink, sourceMatchers } from "./sources.mjs";
import sources from "../data/sources.json" with { type: "json" };
import evidence from "../data/evidence.json" with { type: "json" };
import glossary from "../data/glossary.json" with { type: "json" };
const md = new MarkdownIt({ html: true, linkify: false })
  .use(texmath, {
    engine: katex,
    delimiters: "dollars",
    katexOptions: {
      throwOnError: true,
      strict: "error",
      output: "htmlAndMathml",
    },
  })
  .use(anchor, {
    slugify: (s) =>
      s
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    permalink: anchor.permalink.linkInsideHeader({
      symbol: "#",
      placement: "after",
      ariaHidden: false,
    }),
  });
export function evidenceLink(id) {
  const e = evidence.find((e) => e.id === id);
  if (!e) throw new Error("Unknown evidence: " + id);
  return (
    '<span class="evidence" data-evidence="' +
    id +
    '">' +
    (e.status === "ASSUMPTION"
      ? '<a href="/LendingCreditPrototype/chapters/loss-price/#combine-probability-and-severity" class="source-link">Pricing inputs</a>'
      : sourceLink(
          e.status === "NOTEBOOK OUTPUT" ? "notebook" : e.source,
          evidenceName(e.status),
        )) +
    '<span class="evidence-context"> — ' +
    escape(readerText(e.label)) +
    "</span></span>"
  );
}
export function render(text) {
  text = text
    .replace(
      /\{\{source:([^|}]+)(?:\|([^|}]+))?(?:\|([^}]+))?\}\}/g,
      (_, id, label, lines) => sourceLink(id, label, { lines }),
    )
    .replace(/\{\{evidence:([^}]+)\}\}/g, (_, id) => evidenceLink(id));
  const $ = load(md.render(text), null, false);
  const known = sourceMatchers;
  function walk(node) {
    if (node.type === "tag" && ["a", "svg", "math"].includes(node.name)) return;
    if (node.type === "tag" && $(node).hasClass("katex")) return;
    if (node.type === "text") {
      const raw = $(node).parents("pre,code").length
          ? node.data
          : readerText(node.data),
        hits = [];
      node.data = raw;
      for (const s of known) {
        let start = 0;
        while ((start = raw.indexOf(s.path, start)) !== -1) {
          if (
            !hits.some((h) => start < h.end && start + s.path.length > h.start)
          )
            hits.push({ start, end: start + s.path.length, s });
          start += s.path.length;
        }
      }
      if (hits.length) {
        hits.sort((a, b) => a.start - b.start);
        let html = "",
          start = 0;
        for (const h of hits) {
          html +=
            escape(raw.slice(start, h.start)) + sourceLink(h.s.id, h.s.path);
          start = h.end;
        }
        html += escape(raw.slice(start));
        $(node).replaceWith(html);
      }
    } else for (const c of [...(node.children || [])]) walk(c);
  }
  for (const node of $.root().contents().toArray()) walk(node);
  function linkTerms(node) {
    if (
      node.type === "tag" &&
      (["a", "pre", "code", "math", "svg", "h2", "h3"].includes(node.name) ||
        $(node).hasClass("katex"))
    )
      return;
    if (node.type === "text") {
      const linked = escape(node.data).replace(
        /\b(PD|LGD|DTI|ROC-AUC|PR-AUC|AP|ECE|CV|FICO|LTI)\b/g,
        (term) => {
          const g = glossary.find((g) => g.term === term);
          return (
            '<a class="glossary-link" href="/LendingCreditPrototype/glossary/#' +
            g.id +
            '" title="' +
            escape(g.name) +
            ": " +
            escape(g.definition) +
            '">' +
            term +
            "</a>"
          );
        },
      );
      if (linked !== escape(node.data)) $(node).replaceWith(linked);
    } else for (const c of [...(node.children || [])]) linkTerms(c);
  }
  for (const node of $.root().contents().toArray()) linkTerms(node);

  $("table").each((i, el) =>
    $(el).wrap(
      '<div class="table-scroll" tabindex="0" role="region" aria-label="Part data table"></div>',
    ),
  );
  $(".katex-display").each((i, el) =>
    $(el).wrap(
      '<div class="math-scroll" tabindex="0" role="region" aria-label="Equation"></div>',
    ),
  );
  $("pre").attr("tabindex", "0").attr("aria-label", "Code or saved output");
  return {
    html: $.html(),
    headings: $("h2,h3")
      .toArray()
      .map((el) => ({
        id: $(el).attr("id"),
        label: $(el).clone().find("a").remove().end().text(),
        level: el.name,
      })),
  };
}
