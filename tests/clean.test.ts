import { describe, expect, it } from "vitest";
import {
  cleanText,
  countInvisible,
  DEFAULT_CLEAN_OPTIONS,
  type CleanOptions,
} from "../src/tools/clean/clean";

const clean = (text: string, options: Partial<CleanOptions> = {}) =>
  cleanText(text, { ...DEFAULT_CLEAN_OPTIONS, ...options });

describe("text cleaning", () => {
  it.each([
    "",
    "\uFEFF a\t \r\n\r\nb\nc\rd\u2028e\u2029",
    "👩‍💻\u200c\u200b\u00a0",
    "a\n\n",
  ])("preserves all text when options are off: %j", (text) => {
    expect(clean(text)).toEqual({ text, removedDuplicates: 0, changes: [] });
  });
  it("cleans line boundaries without silently clearing BOM or merging lines", () => {
    expect(
      clean("\t a  b \r\n\u3000c\u00a0\n\ufeffd", {
        trimLines: true,
        collapseSpaces: true,
      }).text,
    ).toBe("a b\r\nc\n\ufeffd");
  });
  it("removes only the selected invisible characters, preserving emoji and script joiners", () => {
    const text = "\ufeffA\u200bB\u2060 👨‍👩‍👧‍👦\u200c\u00a0\u202f";
    expect(countInvisible(text)).toBe(5);
    expect(clean(text, { removeInvisible: true }).text).toBe(
      "AB 👨‍👩‍👧‍👦\u200c\u00a0\u202f",
    );
    expect(clean(text, { replaceNbsp: true }).text).toBe(
      "\ufeffA\u200bB\u2060 👨‍👩‍👧‍👦\u200c  ",
    );
  });
  it("limits width conversion to ASCII equivalents", () => {
    expect(clean("ＡｂＣ　１２３！中文，。ｶ①", { width: "half" }).text).toBe(
      "AbC 123!中文,。ｶ①",
    );
    expect(clean("AbC 123!中文，ｶ①", { width: "full" }).text).toBe(
      "ＡｂＣ　１２３！中文，ｶ①",
    );
  });
  it("converts line endings without adding or dropping a trailing newline", () => {
    expect(
      clean("a\rb\r\nc\nd\u2028e\u2029", { lineEnding: "crlf" }).text,
    ).toBe("a\r\nb\r\nc\r\nd\r\ne\r\n");
    expect(clean("a\r\nb\r", { lineEnding: "lf" }).text).toBe("a\nb\n");
    expect(clean("a", { lineEnding: "crlf" }).text).toBe("a");
  });
  it("removes whitespace-only lines and preserves ordering", () => {
    expect(
      clean("\n a \n\t\n\u3000\nb\n", { removeBlankLines: true }).text,
    ).toBe(" a \nb");
  });
  it("deduplicates after transformations with exact case-sensitive matching", () => {
    const result = clean(" Ａ \r\nB\r\nA\r\nb\r\nB", {
      trimLines: true,
      width: "half",
      deduplicate: true,
    });
    expect(result.text).toBe("A\r\nB\r\nb");
    expect(result.removedDuplicates).toBe(2);
    expect(
      result.changes
        .filter((change) => change.after === null)
        .map((change) => change.line),
    ).toEqual([3, 5]);
  });
  it("keeps deleted-line provenance for the highlighted preview", () => {
    const result = clean("a\n\nb", { removeBlankLines: true });
    expect(result).toEqual({
      text: "a\nb",
      removedDuplicates: 0,
      changes: [{ line: 2, before: "\n", after: null }],
    });
  });
  it("cleans all-blank input to empty and never inserts an extra line", () => {
    expect(clean("\n \r\n\t", { removeBlankLines: true }).text).toBe("");
    expect(clean("a\na\na", { deduplicate: true }).text).toBe("a");
  });
  it("is stable when combined cleaning is applied again", () => {
    const options = {
      trimLines: true,
      collapseSpaces: true,
      removeBlankLines: true,
      removeInvisible: true,
      replaceNbsp: true,
      deduplicate: true,
      width: "full",
      lineEnding: "lf",
    } as const;
    const once = clean("\ufeff a  b\r\n\n a\u00a0 b \nＡ　Ｂ\n", options).text;
    expect(clean(once, options).text).toBe(once);
  });
  it("handles many duplicate rows without quadratic comparison", () => {
    const result = clean(Array(20_000).fill("same").join("\n"), {
      deduplicate: true,
    });
    expect(result.text).toBe("same");
    expect(result.removedDuplicates).toBe(19_999);
  });
});
