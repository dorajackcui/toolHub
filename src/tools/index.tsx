import type { ToolDefinition } from "../types";
import WorkbookPlaceholder from "./WorkbookPlaceholder";

export const tools: ToolDefinition[] = [
  {
    id: "excel-batch-processor",
    name: "Excel Batch Processor",
    component: WorkbookPlaceholder
  }
];
