import chapters from "../data/chapters.json" with { type: "json" };
const base = "/LendingCreditPrototype/";
export const readingOrder = [
  { path: base, label: "Our Work" },
  ...chapters.map((part) => ({
    path: base + "chapters/" + part.slug + "/",
    label: "Part " + part.number,
  })),
  ...[
    "evidence",
    "fields",
    "limitations",
    "timeline",
    "sources",
    "glossary",
    "search",
  ].map((page) => ({ path: base + page + "/", label: page })),
];
export function pageNavigation(pathname) {
  const index = readingOrder.findIndex((page) => page.path === pathname);
  if (index < 0) throw new Error("Unknown reading page: " + pathname);
  return {
    previous: readingOrder[index - 1] || null,
    next: readingOrder[index + 1] || null,
  };
}
