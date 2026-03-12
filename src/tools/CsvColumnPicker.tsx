import { useMemo, useState, type ChangeEvent } from "react";

function parseCsv(text: string) {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export default function CsvColumnPicker() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<string[][]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const headers = rows[0] ?? [];
  const previewRows = useMemo(() => {
    if (!rows.length || !selected.length) {
      return [];
    }

    return rows.slice(1, 6).map((row) => selected.map((index) => row[index] ?? ""));
  }, [rows, selected]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const parsed = parseCsv(text);
    setRows(parsed);
    setSelected(parsed[0]?.map((_, index) => index) ?? []);
    setFileName(file.name);
  }

  function toggleColumn(index: number) {
    setSelected((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index].sort((a, b) => a - b)
    );
  }

  return (
    <section className="tool-panel">
      <div className="tool-panel__header">
        <div>
          <p className="eyebrow">[ sample tool ]</p>
          <h2>CSV Column Picker</h2>
        </div>
        <label className="upload-button">
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
          [ 选择 CSV 文件 ]
        </label>
      </div>

      <p className="tool-panel__intro">
        这是一个本地运行的示例工具，演示文件导入、预览和列选择。后续你可以把 Excel
        处理工具按相同模式继续接入。
      </p>

      {fileName ? <p className="hint">当前文件：{fileName}</p> : null}

      {headers.length ? (
        <>
          <div className="chip-row">
            {headers.map((header, index) => (
              <button
                key={`${header}-${index}`}
                className={selected.includes(index) ? "chip chip--active" : "chip"}
                onClick={() => toggleColumn(index)}
                type="button"
              >
                {header || `Column ${index + 1}`}
              </button>
            ))}
          </div>

          <div className="preview-table">
            <div className="preview-table__row preview-table__row--head">
              {selected.map((index) => (
                <span key={headers[index] ?? index}>{headers[index] || `Column ${index + 1}`}</span>
              ))}
            </div>
            {previewRows.map((row, rowIndex) => (
              <div className="preview-table__row" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <span key={`${rowIndex}-${cellIndex}`}>{cell || "-"}</span>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>&gt; 上传一个 CSV 文件开始预览。</p>
        </div>
      )}
    </section>
  );
}
