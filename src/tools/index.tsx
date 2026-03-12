import type { ToolDefinition } from "../types";
import CsvColumnPicker from "./CsvColumnPicker";
import WorkbookPlaceholder from "./WorkbookPlaceholder";

export const tools: ToolDefinition[] = [
  {
    id: "csv-column-picker",
    name: "CSV Column Picker",
    summary: "本地选择 CSV 列并预览结果，作为文件处理工具的基础样板。",
    tags: ["CSV", "Local First", "Sample"],
    status: "ready",
    component: CsvColumnPicker
  },
  {
    id: "excel-batch-processor",
    name: "Excel Batch Processor",
    summary: "预留给 Excel / 文件包批量处理类工具的扩展位。",
    tags: ["Excel", "Batch", "Draft"],
    status: "draft",
    component: WorkbookPlaceholder
  }
];
