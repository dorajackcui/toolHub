import { computeCharDiff, type CharDiff } from "../diff/compare";
import { INVISIBLE_LABELS, type CleanChange } from "./clean";

function visibleText(text: string) {
  return text.replace(
    /[ \t\r\n\u2028\u2029\u200b\u2060\ufeff\u00a0\u202f]/gu,
    (char) =>
      INVISIBLE_LABELS[char]
        ? `[${INVISIBLE_LABELS[char]}]`
        : ({
            " ": "·",
            "\t": "⇥",
            "\r": "␍",
            "\n": "␊",
            "\u2028": "[LS]",
            "\u2029": "[PS]",
          }[char] ?? char),
  );
}

function Parts({ parts }: { parts: CharDiff[] }) {
  return parts.map((part, index) =>
    part.type === "equal" ? (
      <span key={index}>{visibleText(part.text)}</span>
    ) : (
      <mark key={index} className={`mark-${part.type}`}>
        {visibleText(part.text)}
      </mark>
    ),
  );
}

export default function ChangePreview({ changes }: { changes: CleanChange[] }) {
  return (
    <>
      <div className="result-scroll">
        <table className="compare-table clean-changes">
          <thead>
            <tr>
              <th className="number-column">原行</th>
              <th>原文</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            {changes.slice(0, 50).map((change) => {
              const before = [...change.before].slice(0, 2000).join("");
              const after = [...(change.after ?? "")].slice(0, 2000).join("");
              const detailed =
                before.length * after.length <= 250_000 &&
                before.length + after.length <= 2000;
              const parts = detailed
                ? computeCharDiff(before, after)
                : {
                    left: [{ text: before, type: "removed" as const }],
                    right: [{ text: after, type: "added" as const }],
                  };
              const shortened =
                before !== change.before || after !== (change.after ?? "");
              return (
                <tr key={change.line}>
                  <td className="line-number">{change.line}</td>
                  <td>
                    <Parts parts={parts.left} />
                    {shortened && <span>…</span>}
                  </td>
                  <td>
                    {change.after === null ? (
                      <span className="removed-line">已删除</span>
                    ) : (
                      <Parts parts={parts.right} />
                    )}
                    {shortened && change.after !== null && <span>…</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="preview-note">
        · 空格 / ⇥ 制表符 / ␍ CR / ␊ LF。预览最多 50
        行，长行截取并整段高亮；复制包含完整结果。
      </p>
    </>
  );
}
