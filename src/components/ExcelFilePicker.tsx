import type { ChangeEvent } from "react";

export type ExcelPickMode = "folder" | "file";

type ExcelFilePickerProps = {
  files: File[];
  mode: ExcelPickMode;
  onModeChange: (mode: ExcelPickMode) => void;
  onFilesChange: (files: File[]) => void;
};

function filterExcelFiles(fileList: FileList | null) {
  return Array.from(fileList ?? []).filter((file) => /\.(xlsx|xls)$/i.test(file.name));
}

export default function ExcelFilePicker(props: ExcelFilePickerProps) {
  const { files, mode, onModeChange, onFilesChange } = props;

  function handleFolderChange(event: ChangeEvent<HTMLInputElement>) {
    onFilesChange(filterExcelFiles(event.target.files));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = filterExcelFiles(event.target.files);
    onFilesChange(nextFiles.slice(0, 1));
  }

  return (
    <section className="picker-card">
      <div className="picker-card__header">
        <p className="mark-config__title">文件读取</p>
        <div className="chip-row">
          <button
            type="button"
            className={mode === "folder" ? "chip chip--active" : "chip"}
            onClick={() => onModeChange("folder")}
          >
            选择文件夹
          </button>
          <button
            type="button"
            className={mode === "file" ? "chip chip--active" : "chip"}
            onClick={() => onModeChange("file")}
          >
            选择单个 Excel
          </button>
        </div>
      </div>

      {mode === "folder" ? (
        <label className="upload-button upload-button--block">
          <input
            type="file"
            multiple
            onChange={handleFolderChange}
            {...({ webkitdirectory: "true", directory: "" } as Record<string, string>)}
          />
          [ 选择文件夹并抓取 Excel ]
        </label>
      ) : (
        <label className="upload-button upload-button--block">
          <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
          [ 选择单个 Excel 文件 ]
        </label>
      )}

      <p className="hint">
        {files.length
          ? mode === "folder"
            ? `已抓取 ${files.length} 个 Excel 文件`
            : `已选择文件：${files[0]?.name ?? ""}`
          : mode === "folder"
            ? "尚未选择文件夹"
            : "尚未选择 Excel 文件"}
      </p>
    </section>
  );
}
