import { useState } from "react";
import AppSidebar from "./components/AppSidebar";
import { tools } from "./tools";

export default function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0]?.id ?? "");
  const activeTool = tools.find((tool) => tool.id === activeToolId) ?? tools[0];
  const ActiveComponent = activeTool.component;

  return (
    <div className="shell">
      <AppSidebar activeToolId={activeToolId} onSelectTool={setActiveToolId} tools={tools} />

      <main className="content">
        <ActiveComponent />
      </main>
    </div>
  );
}
