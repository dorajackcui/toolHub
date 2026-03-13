import type { ReactElement } from "react";

export type ToolDefinition = {
  id: string;
  name: string;
  component: () => ReactElement;
};
