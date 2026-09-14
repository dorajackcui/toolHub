import { Suspense, useEffect, useState } from "react";
import { ArrowUpRight, ChevronRight, Layers2, ShieldCheck } from "lucide-react";
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
    document.title = `${active.name} · ToolHub`;
  }, [active]);

  return (
    <div className="app-shell">
      <a href="#workspace" className="skip-link">
        跳到工具内容
      </a>
      <aside className="sidebar">
        <a
          className="brand"
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
          <span className="brand-symbol">
            <Layers2 size={22} />
          </span>
          <span>
            tool<span className="brand-light">hub</span>
            <small>让内容校验，更简单</small>
          </span>
        </a>
        <div className="nav-caption">
          工作台 <span>WORKSPACE</span>
        </div>
        <nav aria-label="工具导航">
          {tools.map((tool) => (
            <a
              href={tool.path}
              key={tool.id}
              className={`nav-tool ${active.id === tool.id ? "active" : ""}`}
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
              <tool.icon size={20} strokeWidth={1.7} />
              <span>
                <strong>{tool.name}</strong>
                <small>{tool.englishName}</small>
              </span>
              <ChevronRight size={15} />
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-note">
            <ShieldCheck size={19} />
            <strong>安心处理你的文本</strong>
            <p>文本与文件仅在当前浏览器中处理。</p>
          </div>
          <a
            href="https://github.com/dorajackcui/toolHub"
            target="_blank"
            rel="noreferrer"
          >
            ToolHub{" "}
            <span>
              v1.0 <ArrowUpRight size={13} />
            </span>
          </a>
        </div>
      </aside>
      <div className="main-shell">
        <div className="topbar">
          <span>
            工具集 <ChevronRight size={13} />
            <strong>{active.name}</strong>
          </span>
          <span className="local-badge">
            <i />
            本地处理
          </span>
        </div>
        <main id="workspace" tabIndex={-1} className="workspace">
          {tools
            .filter((tool) => visited.has(tool.id))
            .map((tool) => (
              <div key={tool.id} hidden={active.id !== tool.id}>
                <Suspense
                  fallback={
                    <p className="loading-state" role="status">
                      正在加载工具…
                    </p>
                  }
                >
                  <tool.component />
                </Suspense>
              </div>
            ))}
          <footer className="workspace-footer">
            <span>少一点重复检查，多一点专注。</span>
            <span>TOOLHUB / CONTENT UTILITIES</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
