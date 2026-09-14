import { createCheckRegex, type TagType } from "./rules";

export interface CheckOptions {
  checkTags: boolean;
  checkNumbers: boolean;
  checkOrder: boolean;
  enabledTagTypes: TagType[];
}
export interface TagWithPosition {
  tag: string;
  lineIndex: number;
  tagIndexInLine: number;
}
export interface LineDifference {
  missingTags1: TagWithPosition[];
  missingTags2: TagWithPosition[];
  commonTags: TagWithPosition[];
}

export function extractTags(
  text: string,
  options: CheckOptions,
): TagWithPosition[][] {
  const regex = createCheckRegex(
    options.checkTags ? options.enabledTagTypes : [],
    options.checkNumbers,
  );
  return text
    .split("\n")
    .map((line, lineIndex) =>
      regex
        ? Array.from(line.matchAll(regex), (match, tagIndexInLine) => ({
            tag: match[0],
            lineIndex,
            tagIndexInLine,
          }))
        : [],
    );
}

// Compare checked items at the same line number, preserving the source tool's
// order-sensitive and duplicate-aware unordered matching rules.
export function compareTags(
  text1: string,
  text2: string,
  options: CheckOptions,
): LineDifference[] {
  if (!text1 && !text2) return [];
  const left = extractTags(text1, options);
  const right = extractTags(text2, options);
  return Array.from(
    { length: Math.max(left.length, right.length) },
    (_, lineIndex) => {
      const a = left[lineIndex] ?? [];
      const b = right[lineIndex] ?? [];
      const result: LineDifference = {
        missingTags1: [],
        missingTags2: [],
        commonTags: [],
      };
      if (options.checkOrder) {
        for (let index = 0; index < Math.max(a.length, b.length); index++) {
          if (a[index] && b[index] && a[index].tag === b[index].tag)
            result.commonTags.push(a[index]);
          else {
            if (a[index]) result.missingTags2.push(a[index]);
            if (b[index]) result.missingTags1.push(b[index]);
          }
        }
      } else {
        const count = (tags: TagWithPosition[]) => {
          const counts = new Map<string, number>();
          tags.forEach(({ tag }) =>
            counts.set(tag, (counts.get(tag) ?? 0) + 1),
          );
          return counts;
        };
        const remainingB = count(b);
        a.forEach((tag) => {
          const remaining = remainingB.get(tag.tag) ?? 0;
          if (remaining > 0) {
            remainingB.set(tag.tag, remaining - 1);
            result.commonTags.push(tag);
          } else result.missingTags2.push(tag);
        });
        const remainingA = count(a);
        b.forEach((tag) => {
          const remaining = remainingA.get(tag.tag) ?? 0;
          if (remaining > 0) remainingA.set(tag.tag, remaining - 1);
          else result.missingTags1.push(tag);
        });
      }
      return result;
    },
  );
}

export const hasErrors = (line: LineDifference) =>
  line.missingTags1.length > 0 || line.missingTags2.length > 0;

export interface HighlightPart {
  text: string;
  state: "plain" | "match" | "missing";
}

// Return text segments, never HTML. React escapes both tags and unchecked text.
export function highlightLine(
  text: string,
  missing: TagWithPosition[],
  options: CheckOptions,
): HighlightPart[] {
  const regex = createCheckRegex(
    options.checkTags ? options.enabledTagTypes : [],
    options.checkNumbers,
  );
  if (!regex) return [{ text, state: "plain" }];
  const parts: HighlightPart[] = [];
  const missingPositions = new Set(missing.map((item) => item.tagIndexInLine));
  let offset = 0;
  Array.from(text.matchAll(regex)).forEach((match, index) => {
    if (match.index > offset)
      parts.push({ text: text.slice(offset, match.index), state: "plain" });
    parts.push({
      text: match[0],
      state: missingPositions.has(index) ? "missing" : "match",
    });
    offset = match.index + match[0].length;
  });
  if (offset < text.length)
    parts.push({ text: text.slice(offset), state: "plain" });
  return parts;
}
