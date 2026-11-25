import sources from "../data/sources.json" with { type: "json" };
export const repository =
  "https://github.com/JamesBenji/LendingCreditPrototype";
export function getSource(id) {
  const s = sources.find((s) => s.id === id);
  if (!s) throw new Error("Unknown source: " + id);
  return s;
}
export const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
export function sourceURL(id, { commit, lines } = {}) {
  const s = getSource(id);
  if (lines && !/^\d+(?:-\d+)?$/.test(lines))
    throw new Error("Malformed line anchor");
  if (lines && s.type === "directory")
    throw new Error("Directory cannot have lines");
  const line = lines ? "#L" + lines.replace("-", "-L") : "";
  return (
    repository +
    "/" +
    (s.type === "directory" ? "tree" : "blob") +
    "/" +
    (commit || s.ref) +
    "/" +
    s.path.split("/").map(encodeURIComponent).join("/") +
    line
  );
}
export function sourceLink(id, label, options) {
  const s = getSource(id);
  return (
    '<a class="source-link" data-source="' +
    escape(id) +
    '" href="' +
    sourceURL(id, options) +
    '" target="_blank" rel="noopener noreferrer">' +
    escape(label || s.label) +
    '<span class="external" aria-label=" (GitHub)"> ↗</span></a>'
  );
}
export const commitURL = (commit) =>
  repository + "/commit/" + encodeURIComponent(commit);
// Longest known path wins. A unique basename also names a repository item.
export const sourceMatchers = sources
  .flatMap((s) => {
    const basename = s.path.split("/").at(-1);
    return sources.filter((other) => other.path.split("/").at(-1) === basename)
      .length === 1 &&
      s.type === "file" &&
      basename !== s.path
      ? [s, { ...s, path: basename }]
      : [s];
  })
  .sort((a, b) => b.path.length - a.path.length);
