export type CleanOptions = {
  trimLines: boolean;
  collapseSpaces: boolean;
  removeBlankLines: boolean;
  removeInvisible: boolean;
  replaceNbsp: boolean;
  deduplicate: boolean;
  lineEnding: "preserve" | "lf" | "crlf";
  width: "preserve" | "half" | "full";
};

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  trimLines: false,
  collapseSpaces: false,
  removeBlankLines: false,
  removeInvisible: false,
  replaceNbsp: false,
  deduplicate: false,
  lineEnding: "preserve",
  width: "preserve",
};

export const INVISIBLE_LABELS: Record<string, string> = {
  "\u200b": "ZWSP",
  "\u2060": "WJ",
  "\ufeff": "BOM",
  "\u00a0": "NBSP",
  "\u202f": "NNBSP",
};

export function countInvisible(text: string) {
  return Array.from(text.matchAll(/[\u200b\u2060\ufeff\u00a0\u202f]/gu)).length;
}

export type CleanChange = {
  line: number;
  before: string;
  after: string | null;
};

export function cleanText(text: string, options: CleanOptions) {
  if (!text)
    return { text: "", removedDuplicates: 0, changes: [] as CleanChange[] };
  const endings = text.match(/\r\n|[\r\n\u2028\u2029]/gu) ?? [];
  const rows = text.split(/\r\n|[\r\n\u2028\u2029]/u).map((before, index) => ({
    before,
    after: before,
    ending: endings[index] ?? "",
    index,
  }));
  const seen = new Set<string>();
  let removedDuplicates = 0;
  const kept = rows.filter((row) => {
    let value = row.before;
    // Keep ZWJ/ZWNJ: they are meaningful in emoji and several writing systems.
    if (options.removeInvisible)
      value = value.replace(/[\u200b\u2060\ufeff]/gu, "");
    if (options.replaceNbsp) value = value.replace(/[\u00a0\u202f]/gu, " ");
    if (options.width === "half")
      value = value.replace(/[\uff01-\uff5e\u3000]/gu, (char) =>
        char === "\u3000"
          ? " "
          : String.fromCharCode(char.charCodeAt(0) - 0xfee0),
      );
    if (options.trimLines)
      value = value.replace(/^[\t\p{Zs}]+|[\t\p{Zs}]+$/gu, "");
    if (options.collapseSpaces) value = value.replace(/[ \t]+/gu, " ");
    if (options.width === "full")
      value = value.replace(/[\x20-\x7e]/gu, (char) =>
        char === " "
          ? "\u3000"
          : String.fromCharCode(char.charCodeAt(0) + 0xfee0),
      );
    row.after = value;
    if (options.removeBlankLines && /^[\t\p{Zs}]*$/u.test(value)) return false;
    if (options.deduplicate && seen.has(value)) {
      removedDuplicates++;
      return false;
    }
    seen.add(value);
    return true;
  });
  const outputs = new Map<number, string>();
  kept.forEach((row, index) => {
    const ending =
      index === kept.length - 1
        ? ""
        : options.lineEnding === "lf"
          ? "\n"
          : options.lineEnding === "crlf"
            ? "\r\n"
            : row.ending;
    outputs.set(row.index, row.after + ending);
  });
  const changes: CleanChange[] = [];
  for (const row of rows) {
    const before = row.before + row.ending;
    const after = outputs.get(row.index) ?? null;
    if (before !== after) changes.push({ line: row.index + 1, before, after });
  }
  return { text: [...outputs.values()].join(""), removedDuplicates, changes };
}
