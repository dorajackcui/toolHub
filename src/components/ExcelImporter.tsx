import { useId, useRef, useState } from "react";
import {
  ChevronDown,
  FileSpreadsheet,
  Upload,
  X,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { buildComparisonTexts, type ParsedWorkbook } from "../lib/workbook";
import { readWorkbook } from "../lib/read-workbook";
import { Button } from "./ui";

export interface ImportedTexts {
  left: string;
  right: string;
  descriptions: [string, string];
}

export default function ExcelImporter({
  mode,
  onImport,
}: {
  mode: "tags" | "diff";
  onImport: (value: ImportedTexts) => void;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [workbook, setWorkbook] = useState<ParsedWorkbook | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [columns, setColumns] = useState<[number, number]>([0, 1]);
  const [header, setHeader] = useState(true);
  const [busy, setBusy] = useState(false);
  const reading = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const sheet = workbook?.sheets[sheetIndex];
  const sameColumn = mode === "tags" && columns[0] === columns[1];

  async function loadFile(file?: File) {
    if (!file || reading.current) return;
    setExpanded(true);
    setError("");
    setStatus("");
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setError("请选择 .xlsx、.xls 或 .csv 文件。");
      return;
    }
    reading.current = true;
    setBusy(true);
    try {
      const parsed = await readWorkbook(
        await file.arrayBuffer(),
        file.name,
        mode === "tags",
      );
      if (!parsed.sheets.length) throw new Error("empty");
      setWorkbook(parsed);
      setSheetIndex(0);
      setColumns([0, parsed.sheets[0].columns.length > 1 ? 1 : 0]);
      setStatus(`已读取 ${file.name}，选择两列后应用。`);
    } catch {
      setWorkbook(null);
      setError("无法读取文件或没有可用列，请检查文件是否完整。");
    } finally {
      reading.current = false;
      setBusy(false);
    }
  }

  function apply() {
    if (!sheet || !workbook || sameColumn) return;
    // Tags uses displayed cell text and trims only trailing rows empty on both
    // selected columns. Text Diff preserves the source tool's raw values/rows.
    const texts =
      mode === "tags"
        ? buildComparisonTexts(sheet, columns[0], columns[1], header)
        : {
            leftText: sheet.rows
              .slice(header ? 1 : 0)
              .map((row) => row[columns[0]] ?? "")
              .join("\n"),
            rightText: sheet.rows
              .slice(header ? 1 : 0)
              .map((row) => row[columns[1]] ?? "")
              .join("\n"),
            rowCount: Math.max(0, sheet.rows.length - (header ? 1 : 0)),
          };
    onImport({
      left: texts.leftText,
      right: texts.rightText,
      descriptions: columns.map(
        (index) =>
          `${workbook.fileName} · ${sheet.name} · ${sheet.columns[index].label}`,
      ) as [string, string],
    });
    setError("");
    setStatus(`已导入 ${texts.rowCount} 行 · ${sheet.name}`);
  }

  return (
    <section
      className={`excel-import ${dragging ? "is-dragging" : ""}`}
      aria-label="表格导入"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void loadFile(event.dataTransfer.files[0]);
      }}
    >
      <div className="import-heading">
        <button
          type="button"
          className="import-toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          <span className="import-icon">
            <FileSpreadsheet size={19} />
          </span>
          <span>
            <strong>从表格导入</strong>
            <span className="import-caption">
              拖入 Excel / CSV，快速比较两列内容
            </span>
          </span>
          <ChevronDown size={16} className={expanded ? "rotated" : ""} />
        </button>
        <label
          className={`button button--secondary upload-button ${busy ? "disabled" : ""}`}
        >
          {busy ? (
            <LoaderCircle size={15} className="spinning" />
          ) : (
            <Upload size={15} />
          )}
          {busy ? "读取中" : "选择文件"}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            aria-label="选择表格文件"
            disabled={busy}
            onChange={(event) => {
              void loadFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      <div id={id} hidden={!expanded} className="import-content">
        {!workbook && !busy && (
          <p className="import-help">
            支持
            .xlsx、.xls、.csv；可选择工作表与对应列。也可以直接在下方粘贴文本。
          </p>
        )}
        {workbook && sheet && (
          <>
            <div className="file-summary">
              <span>
                <FileSpreadsheet size={15} />
                {workbook.fileName}
                <small>{workbook.sheets.length} 个工作表</small>
              </span>
              <Button
                variant="ghost"
                disabled={busy}
                aria-label="移除表格"
                onClick={() => {
                  setWorkbook(null);
                  setError("");
                  setStatus("");
                }}
              >
                <X size={15} />
              </Button>
            </div>
            <div className="import-fields">
              <label>
                工作表
                <select
                  value={sheetIndex}
                  disabled={busy}
                  onChange={(event) => {
                    const index = Number(event.target.value);
                    setSheetIndex(index);
                    setColumns([
                      0,
                      workbook.sheets[index].columns.length > 1 ? 1 : 0,
                    ]);
                    setStatus("");
                  }}
                >
                  {workbook.sheets.map((item, index) => (
                    <option key={item.name} value={index}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              {(["原始文本列", "对照文本列"] as const).map((label, side) => (
                <label key={label}>
                  {label}
                  <select
                    value={columns[side]}
                    disabled={busy}
                    onChange={(event) => {
                      const next: [number, number] = [...columns];
                      next[side] = Number(event.target.value);
                      setColumns(next);
                      setStatus("");
                    }}
                  >
                    {sheet.columns.map((column) => (
                      <option key={column.key} value={column.index}>
                        {column.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="import-bottom">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={header}
                  onChange={(event) => {
                    setHeader(event.target.checked);
                    setStatus("");
                  }}
                />
                首行为表头
              </label>
              <Button
                variant="primary"
                disabled={busy || sameColumn}
                onClick={apply}
              >
                应用到文本
                <ArrowRight size={14} />
              </Button>
            </div>
            {sameColumn && (
              <p className="error-message">标签检查需要选择两个不同的列。</p>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        {status && (
          <p role="status" className="import-status">
            {status}
          </p>
        )}
      </div>
    </section>
  );
}
