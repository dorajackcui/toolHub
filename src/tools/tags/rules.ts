export const TAG_TYPE_DEFINITIONS = [
  {
    id: "angleBrackets",
    label: "Angle brackets",
    example: "<tag>, <color=red>",
    pattern: /<[^>]*>/.source,
  },
  {
    id: "curlyBrackets",
    label: "Curly brackets",
    example: "{name}, {0}",
    pattern: /\{[^}]+\}/.source,
  },
  {
    id: "escapedLineBreaks",
    label: "Escaped line breaks",
    example: String.raw`\r, \n`,
    pattern: /\\r|\\n/.source,
  },
  {
    id: "pipe",
    label: "Pipe",
    example: "|",
    pattern: /\|/.source,
  },
  {
    id: "hash",
    label: "Hash-wrapped",
    example: "#tag#",
    pattern: /#[^#]*#/.source,
  },
  {
    id: "squareBrackets",
    label: "Square brackets",
    example: "[tag], [value=1]",
    pattern: /\[[^\]]+\]/.source,
  },
] as const;

export type TagType = (typeof TAG_TYPE_DEFINITIONS)[number]["id"];

export const ALL_TAG_TYPES: TagType[] = TAG_TYPE_DEFINITIONS.map(
  ({ id }) => id,
);
export const DEFAULT_TAG_TYPES: TagType[] = ALL_TAG_TYPES.filter(
  (id) => id !== "squareBrackets",
);

// Matches standalone numbers (integers or decimals).
export const NUMBER_REGEX = /\b\d+(?:\.\d+)?\b/g;

export function createCheckRegex(
  enabledTagTypes: readonly TagType[],
  checkNumbers: boolean,
) {
  const enabledTypes = new Set(enabledTagTypes);
  const patterns = TAG_TYPE_DEFINITIONS.filter(({ id }) =>
    enabledTypes.has(id),
  ).map(({ pattern }) => pattern);

  if (checkNumbers) {
    patterns.push(NUMBER_REGEX.source);
  }

  return patterns.length > 0 ? new RegExp(patterns.join("|"), "g") : null;
}
