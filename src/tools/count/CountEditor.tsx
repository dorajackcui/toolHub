import { useLayoutEffect, useRef, useState } from "react";
import type { countTextLines } from "./count";

type Props = {
  text: string;
  onChange: (text: string) => void;
  lines: ReturnType<typeof countTextLines>;
  pending: boolean;
};

export default function CountEditor({ text, onChange, lines, pending }: Props) {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<number[]>([]);
  const [showCharacterHint, setShowCharacterHint] = useState(false);
  const inputLines = text.split(/\r\n|[\r\n\u2028\u2029]/u);

  useLayoutEffect(() => {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    const measure = () => {
      const next = Array.from(mirror.children, (line) => line.getBoundingClientRect().height);
      setHeights((previous) =>
        previous.length === next.length && previous.every((height, i) => height === next[i])
          ? previous
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(mirror);
    for (const line of mirror.children) observer.observe(line);
    return () => observer.disconnect();
  }, [text]);

  return (
    <>
      <div
        className="count-heading-wrap"
        onMouseLeave={() => setShowCharacterHint(false)}
      >
        <div className="count-editor-heading count-editor-grid">
          <span />
          <span className="input-count">
            共 {text ? inputLines.length.toLocaleString() : 0} 行
          </span>
          <div className="count-stat-row">
            <span>字数</span>
            <span>词数</span>
            <span>
              <button
                type="button"
                className="count-character-hint"
                aria-describedby="count-character-tooltip"
                onMouseEnter={() => setShowCharacterHint(true)}
                onFocus={() => setShowCharacterHint(true)}
                onBlur={() => setShowCharacterHint(false)}
                onClick={() => setShowCharacterHint(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setShowCharacterHint(false);
                }}
              >
                字符
              </button>
            </span>
          </div>
        </div>
        <div
          id="count-character-tooltip"
          role="tooltip"
          className="count-character-tooltip"
          hidden={!showCharacterHint}
        >
          含空白，不含换行
        </div>
      </div>
      <div className="count-editor-scroll">
        <div className="count-editor-grid count-editor-content">
          <div className="count-line-numbers" aria-hidden="true">
            {text && inputLines.map((_, index) => (
              <div key={index} style={{ height: heights[index] }}>
                {index + 1}
              </div>
            ))}
          </div>
          <div className="count-editor-text">
            <div ref={mirrorRef} className="count-text-mirror" aria-hidden="true">
              {inputLines.map((line, index) => (
                <div key={index}>{line || "\u200b"}</div>
              ))}
            </div>
            <textarea
              id="count-text"
              value={text}
              onChange={(event) => onChange(event.target.value)}
              wrap="soft"
              spellCheck={false}
            />
          </div>
          <div
            className="count-editor-stats"
            role="table"
            aria-label="逐行统计：字数、词数、字符（含空）"
            aria-busy={pending}
          >
            {lines.map((line, index) => (
              <div
                className="count-stat-row"
                role="row"
                aria-label={`第 ${line.number} 行`}
                key={line.number}
                style={{ height: heights[index] }}
              >
                <span role="cell" aria-label={`字数 ${line.wordCount}`}>
                  {line.wordCount.toLocaleString()}
                </span>
                <span role="cell" aria-label={`词数 ${line.words}`}>
                  {line.words.toLocaleString()}
                </span>
                <span role="cell" aria-label={`字符（含空） ${line.characters}`}>
                  {line.characters.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
