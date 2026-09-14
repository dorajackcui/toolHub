import { lazy } from "react";
import { Braces, Columns2, Hash, Eraser } from "lucide-react";
import type { ToolDefinition } from "../types";

export const tools: ToolDefinition[] = [
  {
    id: "tags",
    path: "/tags",
    name: "标签检查",
    englishName: "Tag Checker",
    description: "标签与数字一致性校验",
    icon: Braces,
    component: lazy(() => import("./tags/TagChecker")),
  },
  {
    id: "diff",
    path: "/diff",
    name: "文本比较",
    englishName: "Text Diff",
    description: "逐行比较与字符级差异",
    icon: Columns2,
    component: lazy(() => import("./diff/TextDiff")),
  },
  {
    id: "count",
    path: "/count",
    name: "字数统计",
    englishName: "Word Count",
    description: "实时字数、字符与段落统计",
    icon: Hash,
    component: lazy(() => import("./count/WordCount")),
  },
  {
    id: "clean",
    path: "/clean",
    name: "文本清洗",
    englishName: "Text Cleaner",
    description: "空白清理、格式统一与逐行去重",
    icon: Eraser,
    component: lazy(() => import("./clean/TextCleaner")),
  },
];
