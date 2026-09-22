import { Suspense, useEffect, useState } from "react";
import { tools } from "./tools";

const currentTool = () =>
  tools.find(
    (tool) => tool.path === window.location.pathname.replace(/\/$/, ""),
  ) ?? tools[0];

export default function App() {
  const [active, setActive] = useState(currentTool);
  const [visited, setVisited] = useState(() => new Set([currentTool().id]));
  useEffect(() => {
    function update() {
      const tool = currentTool();
      setActive(tool);
      setVisited((previous) => new Set([...previous, tool.id]));
    }
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  useEffect(() => {
    document.title = active.name + " · ToolHub";
  }, [active]);

  return (
    <div className="app-shell">
      <a href="#workspace" className="skip-link">
        跳到工具内容
      </a>
      <header className="app-nav">
        <a
          className="brand"
          aria-label="Tool Hub 首页"
          href="/tags"
          onClick={(event) => {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            window.history.pushState(null, "", "/tags");
            setActive(tools[0]);
            setVisited((previous) => new Set([...previous, "tags"]));
          }}
        >
          Tool Hub
          <span className="brand-dot" aria-hidden="true">
            .
          </span>
        </a>
        <nav aria-label="工具导航">
          {tools.map((tool) => (
            <a
              href={tool.path}
              key={tool.id}
              className={"nav-tool " + (active.id === tool.id ? "active" : "")}
              aria-current={active.id === tool.id ? "page" : undefined}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                if (active.id !== tool.id)
                  window.history.pushState(null, "", tool.path);
                setActive(tool);
                setVisited((previous) => new Set([...previous, tool.id]));
              }}
            >
              {tool.name}
            </a>
          ))}
        </nav>
      </header>
      <main id="workspace" tabIndex={-1} className="workspace">
        {tools
          .filter((tool) => visited.has(tool.id))
          .map((tool) => (
            <div key={tool.id} hidden={active.id !== tool.id}>
              <Suspense
                fallback={
                  <p className="loading-state" role="status">
                    加载中…
                  </p>
                }
              >
                <tool.component />
              </Suspense>
            </div>
          ))}
      </main>
    </div>
  );
}
