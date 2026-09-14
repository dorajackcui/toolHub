import type { ComponentType, LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";

export type ToolDefinition = {
  id: string;
  name: string;
  path: string;
  englishName: string;
  description: string;
  icon: LucideIcon;
  component: LazyExoticComponent<ComponentType>;
};
