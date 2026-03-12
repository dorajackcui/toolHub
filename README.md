# Tool Hub

一个适合持续叠加小工具的前端 SPA。当前骨架针对你的场景做了几个约束：

- 纯前端、本地文件处理，不依赖后端和数据库
- 适合部署到 Cloudflare Pages
- 每个工具独立注册，降低新增功能对旧功能的影响

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

Cloudflare Pages:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

`public/_redirects` 已经包含 SPA 路由回退配置，直接支持刷新子路径。

## 当前结构

```text
src/
  tools/
    CsvColumnPicker.tsx
    WorkbookPlaceholder.tsx
    index.tsx
  App.tsx
  main.tsx
  styles.css
```

## 新增一个工具

1. 在 `src/tools/` 下新增一个组件文件
2. 在 `src/tools/index.tsx` 里注册 `id`、名称、描述和组件
3. 如果需要共享的文件读取、导出、解析逻辑，再抽到 `src/lib/`

建议保持这些边界：

- 每个工具自带自己的输入解析、状态和导出逻辑
- 跨工具复用的只有 UI、文件工具函数、通用格式转换
- 不要让一个工具直接依赖另一个工具的内部实现

## 适合你后续接入的能力

- Excel 工作簿读取与导出
- 多文件包批处理
- 模板填充
- 批量重命名和字段映射
- CSV / Excel / JSON 相互转换

如果后面要做 Excel 真实读写，建议加一个前端库，例如 `xlsx`，并把解析逻辑限制在单个工具内部。
