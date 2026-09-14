const graphemes = new Intl.Segmenter("zh-CN", { granularity: "grapheme" });

export function countCharacters(text: string) {
  let count = 0;
  for (const _ of graphemes.segment(text)) count++;
  return count;
}

export function countLines(text: string) {
  return text ? text.split(/\r\n|[\r\n\u2028\u2029]/u).length : 0;
}

export { graphemes };
