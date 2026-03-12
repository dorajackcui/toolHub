import { useState } from "react";
import { tools } from "./tools";

export default function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0]?.id ?? "");
  const activeTool = tools.find((tool) => tool.id === activeToolId) ?? tools[0];
  const ActiveComponent = activeTool.component;
  const statusLine = [
    `${tools.length} tools`,
    "static deploy",
    "local file processing",
    "cloudflare pages"
  ].join(" / ");

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">[ tool-hub ]</p>
          <h1>把零散小工具收拢成一个可持续发布的前端工作台。</h1>
          <p className="brand-copy">
            本地处理文件，Cloudflare 部署静态页面，GitHub 负责版本管理和持续交付。
          </p>
          <pre className="ascii-block" aria-hidden="true">{`+------------------+
| tool hub / spa  |
+------------------+`}</pre>
        </div>

        <nav className="tool-list" aria-label="Tool navigation">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={tool.id === activeToolId ? "tool-card tool-card--active" : "tool-card"}
              onClick={() => setActiveToolId(tool.id)}
            >
              <div className="tool-card__top">
                <strong>&gt; {tool.name}</strong>
                <span className={tool.status === "ready" ? "badge" : "badge badge--muted"}>
                  {tool.status === "ready" ? "Ready" : "Draft"}
                </span>
              </div>
              <p>{tool.summary}</p>
              <div className="tag-row">
                {tool.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">[ architecture ]</p>
            <h2>适合你这个场景的方案：纯前端、工具注册式扩展、按功能独立演进。</h2>
          </div>
          <pre className="hero-metrics">{statusLine}</pre>
        </section>

        <section className="principles">
          <article>
            <h3>快速迭代</h3>
            <p>新增工具只需要增加一个组件并注册，不必改整站结构。</p>
          </article>
          <article>
            <h3>稳定上线</h3>
            <p>旧工具作为独立模块存在，新功能上线不会轻易影响既有能力。</p>
          </article>
          <article>
            <h3>前端本地处理</h3>
            <p>文件仅在浏览器里处理，适合表格清洗、批量导出、模板整理。</p>
          </article>
        </section>

        <ActiveComponent />
      </main>
    </div>
  );
}
