import type { ToolDefinition } from "../types";
import ToolNavCard from "./ToolNavCard";

type AppSidebarProps = {
  activeToolId: string;
  onSelectTool: (toolId: string) => void;
  tools: ToolDefinition[];
};

export default function AppSidebar(props: AppSidebarProps) {
  const { activeToolId, onSelectTool, tools } = props;

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <p className="eyebrow">[ tool-hub ]</p>
        <h1>Excel 批量处理</h1>
        <p className="brand-copy">本地选择文件夹，批量处理 Excel 并导出结果。</p>
      </div>

      <nav className="tool-list" aria-label="Tool navigation">
        {tools.map((tool) => (
          <ToolNavCard
            key={tool.id}
            isActive={tool.id === activeToolId}
            name={tool.name}
            onClick={() => onSelectTool(tool.id)}
          />
        ))}
      </nav>
    </aside>
  );
}
