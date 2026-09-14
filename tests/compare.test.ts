import { describe, expect, it } from "vitest";
import reference from "./fixtures/source-parity.json";
import {
  compareTags,
  hasErrors,
  highlightLine,
  type CheckOptions,
} from "../src/tools/tags/compare";
import {
  ALL_TAG_TYPES,
  DEFAULT_TAG_TYPES,
  createCheckRegex,
} from "../src/tools/tags/rules";
import {
  computeCharDiff,
  computeSideBySideDiff,
} from "../src/tools/diff/compare";

describe("original repository compatibility", () => {
  it("matches all 400 original tag results, including duplicates, toggles, optional tag types and row alignment", () => {
    for (const sample of reference.tagCases) {
      const actual = compareTags(
        sample.left,
        sample.right,
        sample.options as CheckOptions,
      );
      expect(actual.slice(0, sample.expected.length)).toEqual(sample.expected);
      // The new table also renders trailing unchecked lines; they must stay clean.
      expect(
        actual
          .slice(sample.expected.length)
          .every((line) => !hasErrors(line) && !line.commonTags.length),
      ).toBe(true);
    }
  });
  it.each(reference.diffCases)(
    "preserves original line and LCS results for $left / $right",
    (sample) => {
      expect(computeSideBySideDiff(sample.left, sample.right)).toEqual(
        sample.lines,
      );
      expect(computeCharDiff(sample.left, sample.right)).toEqual(
        sample.characters,
      );
    },
  );
});

const defaults: CheckOptions = {
  checkTags: true,
  checkNumbers: true,
  checkOrder: true,
  enabledTagTypes: [...DEFAULT_TAG_TYPES],
};
describe("tag rendering and edge cases", () => {
  it("preserves literal HTML in unchecked segments", () => {
    const text = "<img src=x onerror=alert(1)> & {name}";
    const parts = highlightLine(text, [], {
      ...defaults,
      checkNumbers: false,
      enabledTagTypes: ["curlyBrackets"],
    });
    expect(parts).toEqual([
      { text: "<img src=x onerror=alert(1)> & ", state: "plain" },
      { text: "{name}", state: "match" },
    ]);
    expect(parts.map((part) => part.text).join("")).toBe(text);
  });
  it("highlights only the unmatched duplicate occurrence on either side", () => {
    const options = { ...defaults, checkOrder: false };
    const [line] = compareTags("{a}", "{a} {a}", options);
    expect(
      highlightLine("{a} {a}", line.missingTags1, options).map(
        (part) => part.state,
      ),
    ).toEqual(["match", "plain", "missing"]);
  });
  it("has no checks when both check switches are off", () => {
    expect(
      compareTags("{x} 10", "{y} 20", {
        ...defaults,
        checkTags: false,
        checkNumbers: false,
      }).some(hasErrors),
    ).toBe(false);
  });
  it("supports all six tag families without treating digits inside tags as extra numbers", () => {
    const regex = createCheckRegex(ALL_TAG_TYPES, true)!;
    expect("<a=2> {0} \\r | #3# [4] 5".match(regex)).toEqual([
      "<a=2>",
      "{0}",
      "\\r",
      "|",
      "#3#",
      "[4]",
      "5",
    ]);
  });
  it("starts with square brackets disabled and all other tag types enabled", () => {
    expect(DEFAULT_TAG_TYPES).toHaveLength(5);
    expect(DEFAULT_TAG_TYPES).not.toContain("squareBrackets");
  });
});
