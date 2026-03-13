import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ExcelFilePicker, { type ExcelPickMode } from "../components/ExcelFilePicker";

type MarkPair = {
  id: string;
  label: string;
  open: string;
  close: string;
};

type ProcessedFile = {
  name: string;
  size: number;
  sheetCount: number;
  changedCells: number;
  blob: Blob;
};

const markPairs: MarkPair[] = [
  { id: "angle", label: "<>", open: "<", close: ">" },
  { id: "square", label: "[]", open: "[", close: "]" }
];

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMarks(value: string, activePairs: MarkPair[]) {
  if (!value.trim()) {
    return "";
  }

  return activePairs
    .flatMap((pair) => {
      const matcher = new RegExp(`${escapeForRegex(pair.open)}[^${escapeForRegex(pair.close)}]+${escapeForRegex(pair.close)}`, "g");
      return value.match(matcher) ?? [];
    })
    .join(" ")
    .trim();
}

function normalizeColumn(value: number) {
  return Math.max(1, Math.floor(value || 1));
}

export default function WorkbookPlaceholder() {
  const [files, setFiles] = useState<File[]>([]);
  const [pickMode, setPickMode] = useState<ExcelPickMode>("folder");
  const [sourceColumn, setSourceColumn] = useState(1);
  const [markColumn, setMarkColumn] = useState(2);
  const [outputColumn, setOutputColumn] = useState(3);
  const [selectedPairs, setSelectedPairs] = useState<string[]>(markPairs.map((pair) => pair.id));
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const activePairs = useMemo(
    () => markPairs.filter((pair) => selectedPairs.includes(pair.id)),
    [selectedPairs]
  );

  function togglePair(pairId: string) {
    setSelectedPairs((current) =>
      current.includes(pairId) ? current.filter((item) => item !== pairId) : [...current, pairId]
    );
  }

  function handleFilesChange(nextFiles: File[]) {
    setFiles(nextFiles);
    setProcessedFiles([]);
    setErrorMessage("");
  }

  async function processFiles() {
    if (!files.length) {
      setErrorMessage(pickMode === "folder" ? "请先选择包含 Excel 文件的文件夹。" : "请先选择一个 Excel 文件。");
      return;
    }

    if (!activePairs.length) {
      setErrorMessage("至少启用一种 mark 识别规则。");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const nextResults: ProcessedFile[] = [];
      const sourceIndex = normalizeColumn(sourceColumn) - 1;
      const markIndex = normalizeColumn(markColumn) - 1;
      const outputIndex = normalizeColumn(outputColumn) - 1;

      for (const file of files) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        let changedCells = 0;

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
            header: 1,
            defval: ""
          });

          rows.forEach((row) => {
            const sourceValue = String(row[sourceIndex] ?? "").trim();
            const markValue = String(row[markIndex] ?? "").trim();
            const extractedMark = extractMarks(markValue, activePairs);
            const outputValue = sourceValue ? [extractedMark, sourceValue].filter(Boolean).join(" ") : markValue;

            row[outputIndex] = outputValue;
            changedCells += 1;
          });

          workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(rows);
        }

        const workbookArray = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        nextResults.push({
          name: file.name.replace(/\.(xlsx|xls)$/i, "") + ".processed.xlsx",
          size: file.size,
          sheetCount: workbook.SheetNames.length,
          changedCells,
          blob: new Blob([workbookArray], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          })
        });
      }

      setProcessedFiles(nextResults);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "处理 Excel 文件时发生未知错误。");
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadFile(file: ProcessedFile) {
    const url = URL.createObjectURL(file.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="tool-panel">
      <div className="tool-panel__header">
        <div>
          <p className="eyebrow">[ excel batch ]</p>
          <h2>Excel Batch Processor</h2>
        </div>
        <span className="status-pill">Ready</span>
      </div>

      <p className="tool-panel__intro">
        支持文件夹批量处理和单文件处理。若原文列为空，直接复制 mark 列；若原文列不为空，则提取 mark 并拼接到原文开头，写入输出列。
      </p>

      <div className="tool-grid">
        <div className="tool-grid__full">
          <ExcelFilePicker
            files={files}
            mode={pickMode}
            onModeChange={setPickMode}
            onFilesChange={handleFilesChange}
          />
        </div>

        <label className="field">
          <span>原文列（1-base）</span>
          <input type="number" min="1" value={sourceColumn} onChange={(event) => setSourceColumn(Number(event.target.value))} />
        </label>

        <label className="field">
          <span>mark 提取列（1-base）</span>
          <input type="number" min="1" value={markColumn} onChange={(event) => setMarkColumn(Number(event.target.value))} />
        </label>

        <label className="field">
          <span>拼接输出列（1-base）</span>
          <input type="number" min="1" value={outputColumn} onChange={(event) => setOutputColumn(Number(event.target.value))} />
        </label>
      </div>

      <div className="mark-config">
        <p className="mark-config__title">mark 识别规则</p>
        <div className="chip-row">
          {markPairs.map((pair) => (
            <button
              key={pair.id}
              type="button"
              className={selectedPairs.includes(pair.id) ? "chip chip--active" : "chip"}
              onClick={() => togglePair(pair.id)}
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar">
        <button type="button" className="primary-button" onClick={processFiles} disabled={isProcessing}>
          {isProcessing ? "处理中..." : "开始批量处理"}
        </button>
        <span className="hint">
          {pickMode === "folder" ? "当前模式：文件夹批量处理" : "当前模式：单文件处理"}
        </span>
      </div>

      <div className="example-card">
        <p>规则示例</p>
        <p>原文列：`abc`</p>
        <p>mark 列：`&lt;sssaa&gt; abd`</p>
        <p>输出列：`&lt;sssaa&gt; abc`</p>
      </div>

      {errorMessage ? <div className="empty-state"><p>{errorMessage}</p></div> : null}

      {processedFiles.length ? (
        <div className="result-list">
          {processedFiles.map((file) => (
            <article className="result-card" key={file.name}>
              <div>
                <strong>{file.name}</strong>
                <p className="hint">工作表 {file.sheetCount} 个 / 写入 {file.changedCells} 个单元格 / 原文件 {Math.round(file.size / 1024)} KB</p>
              </div>
              <button type="button" className="chip chip--active" onClick={() => downloadFile(file)}>
                下载结果
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>&gt; 处理完成后会在这里列出每个 Excel 的下载结果。</p>
        </div>
      )}
    </section>
  );
}
