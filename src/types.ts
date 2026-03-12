import type { ReactElement } from "react";

export type ToolStatus = "ready" | "draft";

export type ToolDefinition = {
  id: string;
  name: string;
  summary: string;
  tags: string[];
  status: ToolStatus;
  component: () => ReactElement;
};
