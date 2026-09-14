import { useDeferredValue, useMemo, useState } from "react";
import CopyButton from "../../components/CopyButton";
import { Button, ToolHeader } from "../../components/ui";
import { countText } from "./count";

export default function WordCount() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);
  const stats = useMemo(() => countText(deferredText), [deferredText]);
  const pending = text !== deferredText;
  const primary = [
    ["字数", stats.wordCount],
    ["字符（含空白）", stats.characters],
    ["字符（不含空白）", stats.withoutWhitespace],
    ["词数", stats.words],
  ] as const;
  const secondary = [
    ["汉字", stats.hanCharacters],
    ["数字", stats.digits],
    ["标点", stats.punctuation],
    ["行", stats.lines],
    ["段落", stats.paragraphs],
    ["UTF-8 字节", stats.bytes],
  ] as const;

  return (
    <>
      <ToolHeader name="字数统计">
        <Button
          variant="ghost"
          onClick={() =>
            setText("让文字更简单。\nHello, ToolHub! 2026 👨‍👩‍👧‍👦\n\n从这里开始。")
          }
        >
          示例
        </Button>
        <Button onClick={() => setText("")}>清空</Button>
      </ToolHeader>
      <section
        className="count-results"
        aria-label="字数统计结果"
        aria-busy={pending}
      >
        <dl className="count-primary">
          {primary.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
        <dl className="count-secondary">
          {secondary.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="input-panel count-input">
        <div className="input-heading">
          <label htmlFor="count-text">文本</label>
          <CopyButton
            label="复制统计"
            disabled={!text || pending}
            text={[...primary, ...secondary]
              .map(([label, value]) => `${label}：${value}`)
              .join("\n")}
          />
        </div>
        <textarea
          id="count-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
        />
      </section>
      <details className="tool-details">
        <summary>统计口径</summary>
        <ul>
          <li>
            字数：汉字逐字计数，其他语言按词计数；连续数字计一词，标点和空白不计。
          </li>
          <li>
            字符：按 Unicode 字素计数，一个组合 emoji
            或带组合音标的字母计一个字符；换行也计入空白，CRLF 计一个。
          </li>
          <li>
            词数：使用浏览器中文分词规则，含其他语言单词和数字串，不含标点。中文分词结果与字数不同。
          </li>
          <li>
            数字和标点逐字符统计。行数含空行；段落以空行分隔。UTF-8
            字节包含空白和换行。
          </li>
        </ul>
      </details>
    </>
  );
}
