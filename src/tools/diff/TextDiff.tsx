import { useMemo, useState } from "react";
import { CheckCheck, RotateCcw, Sparkles } from "lucide-react";
import ExcelImporter, {
  type ImportedTexts,
} from "../../components/ExcelImporter";
import {
  Button,
  EmptyState,
  FilterTabs,
  TextInputs,
  ToolHeader,
} from "../../components/ui";
import {
  computeCharDiff,
  computeSideBySideDiff,
  type CharDiff,
} from "./compare";

function DiffText({ parts }: { parts: CharDiff[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.type === "equal" ? (
          <span key={index}>{part.text}</span>
        ) : (
          <mark
            key={index}
            className={`mark-${part.type}`}
            title={part.type === "added" ? "新增" : "删除"}
          >
            {part.text}
          </mark>
        ),
      )}
    </>
  );
}

export default function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [descriptions, setDescriptions] = useState<[string, string]>(["", ""]);
  const [filter, setFilter] = useState("all");
  const [importKey, setImportKey] = useState(0);
  const results = useMemo(
    () => (!left && !right ? [] : computeSideBySideDiff(left, right)),
    [left, right],
  );
  const charDiffs = useMemo(
    () =>
      results.map((line) =>
        line.type === "modified"
          ? computeCharDiff(line.left, line.right)
          : null,
      ),
    [results],
  );
  const stats = { added: 0, removed: 0, modified: 0, equal: 0 };
  results.forEach((line) => stats[line.type]++);
  const diffCount = stats.added + stats.removed + stats.modified;
  const visible = results.filter(
    (line) =>
      filter === "all" ||
      (filter === "diff" ? line.type !== "equal" : line.type === "equal"),
  );

  function importTexts(value: ImportedTexts) {
    setLeft(value.left);
    setRight(value.right);
    setDescriptions(value.descriptions);
    setFilter("all");
  }
  function clear() {
    setLeft("");
    setRight("");
    setDescriptions(["", ""]);
    setFilter("all");
    setImportKey((key) => key + 1);
  }

  return (
    <>
      <ToolHeader
        name="文本比较"
        description="逐行比较两份文本，精确定位每一个字符的变化。"
        number="02"
      >
        <Button
          variant="ghost"
          onClick={() =>
            importTexts({
              left: "让每一次检查都更简单。\nHello, world!\n版本：1.0\n这行内容保持一致。",
              right:
                "让每一次比较都更简单。\nHello, ToolHub!\n版本：2.0\n这行内容保持一致。\n这是新增的一行。",
              descriptions: ["", ""],
            })
          }
        >
          <Sparkles size={15} />
          试用示例
        </Button>
        <Button onClick={clear}>
          <RotateCcw size={14} />
          清空内容
        </Button>
      </ToolHeader>
      <ExcelImporter key={importKey} mode="diff" onImport={importTexts} />
      <div className="section-label">
        <span>
          <b>01</b> 输入内容
        </span>
        <small>按相同行号进行比较</small>
      </div>
      <TextInputs
        prefix="diff"
        left={left}
        right={right}
        onLeft={setLeft}
        onRight={setRight}
        descriptions={descriptions}
      />
      <div className="diff-summary" aria-label="差异统计">
        <span>
          <i className="summary-dot equal" />
          一致 <strong>{stats.equal}</strong>
        </span>
        <span>
          <i className="summary-dot modified" />
          修改 <strong>{stats.modified}</strong>
        </span>
        <span>
          <i className="summary-dot added" />
          新增 <strong>{stats.added}</strong>
        </span>
        <span>
          <i className="summary-dot removed" />
          删除 <strong>{stats.removed}</strong>
        </span>
      </div>
      <div className="section-label">
        <span>
          <b>02</b> 对比结果
        </span>
        <div className="legend">
          <span>
            <i className="legend-red" />
            删除
          </span>
          <span>
            <i className="legend-green" />
            新增
          </span>
        </div>
      </div>
      <section className="results-panel" aria-label="文本比较结果">
        <div className="results-toolbar">
          <div className="result-status" role="status">
            <CheckCheck size={17} />
            <span>
              {!results.length
                ? "等待比较"
                : diffCount
                  ? `${diffCount} 行存在差异`
                  : "所有内容一致"}
            </span>
            {results.length > 0 && <small>共 {results.length} 行</small>}
          </div>
          <FilterTabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "全部" },
              { value: "diff", label: "不一致", count: diffCount },
              { value: "same", label: "一致", count: stats.equal },
            ]}
          />
        </div>
        {!results.length ? (
          <EmptyState>每一处变化，一目了然</EmptyState>
        ) : !visible.length ? (
          <div className="filtered-empty">
            <CheckCheck size={21} />
            {filter === "diff" ? "所有内容一致" : "没有一致的行"}
          </div>
        ) : (
          <div className="result-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="number-column">行</th>
                  <th>
                    原始文本<span>SOURCE</span>
                  </th>
                  <th>
                    对照文本<span>TARGET</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((line) => {
                  const chars = charDiffs[line.lineNumber - 1];
                  return (
                    <tr
                      key={line.lineNumber}
                      className={`diff-row-${line.type}`}
                    >
                      <td
                        className="line-number"
                        title={
                          {
                            equal: "一致",
                            modified: "修改",
                            added: "新增",
                            removed: "删除",
                          }[line.type]
                        }
                      >
                        {line.lineNumber}
                      </td>
                      <td>
                        {chars ? (
                          <DiffText parts={chars.left} />
                        ) : line.type === "removed" ? (
                          <mark className="mark-removed">
                            {line.left || "\u00a0"}
                          </mark>
                        ) : (
                          line.left || "\u00a0"
                        )}
                      </td>
                      <td>
                        {chars ? (
                          <DiffText parts={chars.right} />
                        ) : line.type === "added" ? (
                          <mark className="mark-added">
                            {line.right || "\u00a0"}
                          </mark>
                        ) : (
                          line.right || "\u00a0"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="tool-footnote">
        按行号对应比较，保留空格、空行与大小写差异。红色为原始文本的删除内容，绿色为对照文本的新增内容。
      </p>
    </>
  );
}
