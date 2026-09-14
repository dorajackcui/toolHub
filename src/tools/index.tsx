import { lazy } from "react";
import { Braces, Columns2 } from "lucide-react";
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
];
