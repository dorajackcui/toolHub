import { useDeferredValue, useMemo, useState } from "react";
import CopyButton from "../../components/CopyButton";
import { Button, ToolHeader } from "../../components/ui";
import { countCharacters } from "../../lib/text";
import ChangePreview from "./ChangePreview";
import {
  cleanText,
  countInvisible,
  DEFAULT_CLEAN_OPTIONS,
  INVISIBLE_LABELS,
  type CleanOptions,
} from "./clean";

const toggles = [
  ["trimLines", "清除行首尾空白"],
  ["collapseSpaces", "合并空格 / Tab"],
  ["removeBlankLines", "删除空行"],
  ["removeInvisible", "清除零宽空格 / BOM"],
  ["replaceNbsp", "不换行空格 → 空格"],
  ["deduplicate", "逐行去重"],
] as const;

function HiddenPreview({ text }: { text: string }) {
  const chars = [...text];
  return (
    <>
      <pre className="hidden-preview">
        {chars.slice(0, 4000).map((char, index) =>
          INVISIBLE_LABELS[char] ? (
            <mark key={index} className="mark-removed">
              [{INVISIBLE_LABELS[char]}]
            </mark>
          ) : (
            char
          ),
        )}
      </pre>
      {chars.length > 4000 && (
        <p className="preview-note">隐藏字符预览仅显示文本开头部分。</p>
      )}
    </>
  );
}

export default function TextCleaner() {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_CLEAN_OPTIONS);
  const [showChanges, setShowChanges] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const request = useMemo(() => ({ text, options }), [text, options]);
  const deferred = useDeferredValue(request);
  const result = useMemo(() => {
    const cleaned = cleanText(deferred.text, deferred.options);
    return {
      ...cleaned,
      beforeCount: countCharacters(deferred.text),
      afterCount: countCharacters(cleaned.text),
      invisibleCount: countInvisible(deferred.text),
    };
  }, [deferred]);
  const pending = deferred !== request;

  return (
    <>
      <ToolHeader name="文本清洗">
        <Button
          variant="ghost"
          onClick={() =>
            setText(
              "  Hello,   ToolHub!  \n\nＡＢＣ　１２３\n零宽\u200b空格 / 不换行\u00a0空格\n重复行\n重复行",
            )
          }
        >
          示例
        </Button>
        <Button onClick={() => setText("")}>清空</Button>
      </ToolHeader>
      <section className="clean-options" aria-label="清洗选项">
        <div className="clean-toggles">
          {toggles.map(([key, label]) => (
            <label className="checkbox-label" key={key}>
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(event) =>
                  setOptions({ ...options, [key]: event.target.checked })
                }
              />
              {label}
            </label>
          ))}
        </div>
        <div className="clean-selects">
          <label>
            换行
            <select
              value={options.lineEnding}
              onChange={(event) =>
                setOptions({
                  ...options,
                  lineEnding: event.target.value as CleanOptions["lineEnding"],
                })
              }
            >
              <option value="preserve">保持原样</option>
              <option value="lf">LF</option>
              <option value="crlf">CRLF</option>
            </select>
          </label>
          <label>
            全半角
            <select
              value={options.width}
              onChange={(event) =>
                setOptions({
                  ...options,
                  width: event.target.value as CleanOptions["width"],
                })
              }
            >
              <option value="preserve">保持原样</option>
              <option value="half">转半角</option>
              <option value="full">转全角</option>
            </select>
          </label>
          <Button
            variant="ghost"
            onClick={() => setOptions(DEFAULT_CLEAN_OPTIONS)}
          >
            重置选项
          </Button>
        </div>
      </section>
      <div className="text-inputs clean-inputs" aria-busy={pending}>
        <section className="input-panel">
          <div className="input-heading">
            <label htmlFor="clean-source">原始文本</label>
            <span className="input-count">
              {result.beforeCount.toLocaleString()} 字符
            </span>
          </div>
          <textarea
            id="clean-source"
            value={text}
            onChange={(event) => setText(event.target.value)}
            spellCheck={false}
          />
        </section>
        <section className="input-panel">
          <div className="input-heading">
            <label htmlFor="clean-result">清洗结果</label>
            <span className="input-count">
              {result.afterCount.toLocaleString()} 字符
            </span>
          </div>
          <textarea
            id="clean-result"
            value={result.text}
            readOnly
            spellCheck={false}
          />
        </section>
      </div>
      <div className="clean-summary">
        <span role="status">
          {pending
            ? "处理中…"
            : result.changes.length
              ? `${result.changes.length} 行有修改`
              : "无修改"}
          {result.removedDuplicates > 0 &&
            ` / 去重 ${result.removedDuplicates} 行`}
        </span>
        <CopyButton
          label="复制结果"
          text={result.text}
          disabled={!result.text || pending}
        />
      </div>
      <details
        className="tool-details"
        onToggle={(event) => setShowChanges(event.currentTarget.open)}
      >
        <summary>
          修改高亮{result.changes.length > 0 && ` (${result.changes.length})`}
        </summary>
        {showChanges &&
          (result.changes.length ? (
            <ChangePreview changes={result.changes} />
          ) : (
            <p>无修改</p>
          ))}
      </details>
      <details
        className="tool-details"
        onToggle={(event) => setShowHidden(event.currentTarget.open)}
      >
        <summary>
          隐藏字符{result.invisibleCount > 0 && ` (${result.invisibleCount})`}
        </summary>
        {showHidden && <HiddenPreview text={deferred.text} />}
      </details>
      <details className="tool-details">
        <summary>处理规则</summary>
        <ul>
          <li>
            先处理隐藏字符与半角转换，再处理行内空白和全角转换，最后删除空行、去重并统一换行。
          </li>
          <li>
            零宽清理仅移除 ZWSP (U+200B)、WJ (U+2060)、BOM (U+FEFF)；保留 emoji
            和文字需要的连接符。
          </li>
          <li>
            不换行空格包括 NBSP (U+00A0) 和 NNBSP
            (U+202F)。合并空格仅处理普通空格和 Tab，不跨行。
          </li>
          <li>
            全半角转换仅处理 ASCII
            及其全角对应字符（含逗号、感叹号等）与空格，不转换顿号、句号或日文假名。
          </li>
          <li>
            去重基于清洗后的整行，区分大小写，保留首次出现的顺序。空行和末尾换行受删除空行与去重选项影响。
          </li>
        </ul>
      </details>
    </>
  );
}
