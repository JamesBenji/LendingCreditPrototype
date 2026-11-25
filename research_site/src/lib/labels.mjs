import extracted from "../data/extracted.json" with { type: "json" };

export const evidenceNames = {
  "CODE-VERIFIED": "CODE",
  "NOTEBOOK OUTPUT": "Notebook",
  REPRODUCED: "Results",
  "OWNER-REPORTED": "Deployment notes",
  ASSUMPTION: "Pricing inputs",
  LIMITATION: "Limitation",
  PROPOSED: "Next steps",
  UNRESOLVED: "Open question",
};

export function readerText(value) {
  let text = String(value);
  for (const cell of extracted.cells) {
    if (cell.id) {
      text = text.replaceAll(
        new RegExp(
          "\\s*[/,·—]\\s*" + cell.id.replace(/[.*+?^$()|[\]\\]/g, "\\$&"),
          "g",
        ),
        "",
      );
      text = text.replaceAll(cell.id, "");
    }
  }
  return text
    .replace(/(?<![\w/.\-])Chapters(?![\w/.\-])/g, "Parts")
    .replace(/(?<![\w/.\-])chapters(?![\w/.\-])/g, "parts")
    .replace(/(?<![\w/.\-])Chapter(?![\w/.\-])/g, "Part")
    .replace(/(?<![\w/.\-])chapter(?![\w/.\-])/g, "part")
    .replace(/technical dossier/gi, "Our Work")
    .replace(/limitations register/gi, "limitations")
    .replace(/evidence register/gi, "evidence table")
    .replace(/chapters and registers/gi, "Explore our work")
    .replace(/parts and registers/gi, "Explore our work")
    .replace(/CODE-VERIFIED/gi, "CODE")
    .replace(/NOTEBOOK OUTPUT/g, "Notebook")
    .replace(/OWNER-REPORTED/g, "Deployment notes")
    .replace(/owner-reported/g, "recorded by the operator")
    .replace(/UNRESOLVED/g, "Needs confirmation");
}

export function evidenceName(status) {
  return evidenceNames[status] || readerText(status);
}
