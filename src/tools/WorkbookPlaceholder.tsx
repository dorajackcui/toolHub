export default function WorkbookPlaceholder() {
  return (
    <section className="tool-panel">
      <div className="tool-panel__header">
        <div>
          <p className="eyebrow">[ planned tool ]</p>
          <h2>Excel Batch Processor</h2>
        </div>
        <span className="status-pill">Draft</span>
      </div>

      <p className="tool-panel__intro">
        这里预留给你后续的 Excel 工具，比如批量拆分工作簿、字段映射、模板填充、文件包统一处理。
      </p>

      <div className="roadmap-card">
        <p>建议保持每个工具独立：</p>
        <ul>
          <li>输入文件解析逻辑单独放在工具目录里</li>
          <li>每个工具只暴露一个页面组件</li>
          <li>公共 UI 和文件下载逻辑做成共享模块</li>
        </ul>
      </div>
    </section>
  );
}
