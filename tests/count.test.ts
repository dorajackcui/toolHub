import { describe, expect, it } from "vitest";
import { countText } from "../src/tools/count/count";

describe("word and character statistics", () => {
  it("starts every metric at zero", () => {
    expect(Object.values(countText(""))).toEqual(Array(10).fill(0));
  });
  it("distinguishes mixed-language word count, words, characters and bytes", () => {
    expect(countText("你好 Hello 123!\n")).toEqual({
      wordCount: 4,
      characters: 14,
      withoutWhitespace: 11,
      words: 3,
      hanCharacters: 2,
      digits: 3,
      punctuation: 1,
      lines: 2,
      paragraphs: 1,
      bytes: 18,
    });
  });
  it("counts complete emoji and combining sequences as individual characters", () => {
    expect(countText("👨‍👩‍👧‍👦e\u0301🇨🇳👍🏽")).toMatchObject({
      characters: 4,
      withoutWhitespace: 4,
      hanCharacters: 0,
      digits: 0,
      bytes: 44,
    });
  });
  it("counts supplementary Han without splitting surrogate pairs", () => {
    expect(countText("𠀀你好〇")).toMatchObject({
      wordCount: 4,
      hanCharacters: 4,
      characters: 4,
      bytes: 13,
    });
  });
  it("counts CRLF once and recognizes blank-line paragraphs and Unicode separators", () => {
    expect(countText("a\r\nb\r\n \t\r\nc\rd\u2028e\u2029")).toMatchObject({
      characters: 13,
      withoutWhitespace: 5,
      lines: 7,
      paragraphs: 2,
    });
  });
  it("handles whitespace-only input and nonbreaking spaces", () => {
    expect(countText(" \t\n\u00a0\u3000")).toMatchObject({
      wordCount: 0,
      characters: 5,
      withoutWhitespace: 0,
      words: 0,
      paragraphs: 0,
      lines: 2,
    });
  });
  it("keeps contractions as words and recognizes non-ASCII digits", () => {
    expect(countText("don't stop １２３ ٤٥")).toMatchObject({
      wordCount: 4,
      words: 4,
      digits: 5,
    });
  });
});
