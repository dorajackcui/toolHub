import { useMemo, useState } from "react";
import { CheckCheck, CircleAlert } from "lucide-react";
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
  compareTags,
  hasErrors,
  highlightLine,
  type CheckOptions,
} from "./compare";
import { DEFAULT_TAG_TYPES } from "./rules";
import TagTypeSettings from "./TagTypeSettings";

const EXAMPLE = {
  left: "Hello, {name}!\n<color=red>Save 20 coins</color>\nYou have {count} new messages.\nLevel 5 | Score 100",
  right:
    "你好，{name}！\n<color=red>节省 30 金币</color>\n你有新的消息。\n等级 5 | 得分 100",
};

export default function TagChecker() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [descriptions, setDescriptions] = useState<[string, string]>(["", ""]);
  const [filter, setFilter] = useState("all");
  const [options, setOptions] = useState<CheckOptions>({
    checkTags: true,
    checkNumbers: true,
    checkOrder: true,
    enabledTagTypes: [...DEFAULT_TAG_TYPES],
  });
  const results = useMemo(
    () => compareTags(left, right, options),
    [left, right, options],
  );
  const problems = results.flatMap((line, index) =>
    hasErrors(line) ? [index + 1] : [],
  );
  const visible = results
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => filter === "all" || hasErrors(line));
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");
  const [importKey, setImportKey] = useState(0);

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
      <ToolHeader name="标签检查">
        <Button
          variant="ghost"
          onClick={() => importTexts({ ...EXAMPLE, descriptions: ["", ""] })}
        >
          示例
        </Button>
        <Button onClick={clear}>清空</Button>
      </ToolHeader>
      <ExcelImporter key={importKey} mode="tags" onImport={importTexts} />
      <TextInputs
        prefix="tags"
        left={left}
        right={right}
        onLeft={setLeft}
        onRight={setRight}
        descriptions={descriptions}
      />
      <div className="check-toolbar">
        <div className="check-switches">
          {(
            [
              ["checkTags", "标签检查"],
              ["checkNumbers", "数字检查"],
              ["checkOrder", "检查顺序"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="switch-label">
              <input
                type="checkbox"
                role="switch"
                checked={options[key]}
                onChange={(event) =>
                  setOptions((previous) => ({
                    ...previous,
                    [key]: event.target.checked,
                  }))
                }
              />
              {label}
            </label>
          ))}
        </div>
        <TagTypeSettings
          value={options.enabledTagTypes}
          onChange={(enabledTagTypes) =>
            setOptions((previous) => ({ ...previous, enabledTagTypes }))
          }
        />
      </div>
      <div className="section-label">
        <span>结果</span>
        <div className="legend">
          <span>
            <i className="legend-green" />
            一致
          </span>
          <span>
            <i className="legend-red" />
            缺失或不一致
          </span>
        </div>
      </div>
      <section className="results-panel" aria-label="标签检查结果">
        <div className="results-toolbar">
          <div
            className={`result-status ${problems.length ? "has-errors" : ""}`}
            role="status"
          >
            {problems.length ? (
              <CircleAlert size={17} />
            ) : (
              <CheckCheck size={17} />
            )}
            <span>
              {!results.length
                ? "等待检查"
                : problems.length
                  ? `${problems.length} 行需要检查`
                  : "未发现问题"}
            </span>
            {results.length > 0 && <small>共 {results.length} 行</small>}
          </div>
          <FilterTabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "全部" },
              { value: "errors", label: "仅错误", count: problems.length },
            ]}
          />
        </div>
        {problems.length > 0 && (
          <div className="problem-lines">
            <span>问题行</span>
            <div>
              {problems.map((number) => (
                <button
                  type="button"
                  key={number}
                  onClick={() =>
                    document
                      .getElementById(`tag-row-${number}`)
                      ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
                  }
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        )}
        {!results.length ? (
          <EmptyState />
        ) : !visible.length ? (
          <div className="filtered-empty">
            <CheckCheck size={21} />
            无错误
          </div>
        ) : (
          <div className="result-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="number-column">行</th>
                  <th>原始文本</th>
                  <th>对照文本</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ line, index }) => (
                  <tr
                    id={`tag-row-${index + 1}`}
                    key={index}
                    className={hasErrors(line) ? "problem-row" : ""}
                  >
                    <td className="line-number">{index + 1}</td>
                    {[leftLines[index] ?? "", rightLines[index] ?? ""].map(
                      (text, side) => (
                        <td
                          key={side}
                          data-testid={
                            side ? "tag-right-result" : "tag-left-result"
                          }
                        >
                          {highlightLine(
                            text,
                            side ? line.missingTags1 : line.missingTags2,
                            options,
                          ).map((part, i) =>
                            part.state === "plain" ? (
                              <span key={i}>{part.text}</span>
                            ) : (
                              <mark
                                key={i}
                                className={`mark-${part.state}`}
                                title={
                                  part.state === "missing"
                                    ? "缺失或顺序不一致"
                                    : "一致"
                                }
                              >
                                {part.text}
                              </mark>
                            ),
                          )}
                          {!text && "\u00a0"}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
