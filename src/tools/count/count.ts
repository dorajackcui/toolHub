import { countLines, graphemes } from "../../lib/text";

const words = new Intl.Segmenter("zh-CN", { granularity: "word" });
const han = /\p{Unified_Ideograph}|[\u3007\uFA0E\uFA0F]/gu;

function countWords(text: string) {
  let count = 0;
  for (const word of words.segment(text)) if (word.isWordLike) count++;
  return count;
}

export function countText(text: string) {
  let characters = 0;
  let withoutWhitespace = 0;
  for (const { segment } of graphemes.segment(text)) {
    characters++;
    if (!/^\s+$/u.test(segment)) withoutWhitespace++;
  }
  const hanCharacters = Array.from(text.matchAll(han)).length;
  const lines = text.split(/\r\n|[\r\n\u2028\u2029]/u);
  let paragraphs = 0;
  let inParagraph = false;
  for (const line of lines) {
    if (line.trim()) {
      if (!inParagraph) paragraphs++;
      inParagraph = true;
    } else inParagraph = false;
  }
  return {
    // Count Han individually; segment the remaining languages into words.
    wordCount: hanCharacters + countWords(text.replace(han, " ")),
    characters,
    withoutWhitespace,
    words: countWords(text),
    hanCharacters,
    digits: Array.from(text.matchAll(/\p{Nd}/gu)).length,
    punctuation: Array.from(text.matchAll(/\p{P}/gu)).length,
    lines: countLines(text),
    paragraphs,
    bytes: new TextEncoder().encode(text).length,
  };
}
