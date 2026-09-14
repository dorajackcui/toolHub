# ToolHub

将标签检查和文本比较整合到同一个 React + TypeScript + Vite 项目。全部处理在浏览器内完成；无需数据库、API、Vercel 或源仓库在线服务。

线上入口：[momotools.dorajackcui.workers.dev](https://momotools.dorajackcui.workers.dev/)

## 工具与迁移范围

| 工具     | 地址                    | 保留的能力                                                                                                                                              |
| -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 标签检查 | `/tags`（首页默认工具） | 逐行标签与数字检查、顺序开关、重复标签数量检查、六类可选标签、错误行汇总、仅错误筛选、双侧高亮、清空、Excel/XLS/CSV 导入、工作表/双列选择、可选首行表头 |
| 文本比较 | `/diff`                 | 逐行对应比较、LCS 字符级高亮、新增/删除/修改/一致统计、全部/不一致/一致筛选、清空、Excel/XLS/CSV 选择或拖入、双列应用、移除文件                         |

两个工具共用导航、表格导入、输入面板、筛选控件、字体与配色。切换工具和浏览器前进/后退会保留当前页面会话内的输入和选项；刷新页面会清空数据，不保存到服务器或 localStorage。

原 toolHub 的 Excel Batch Processor 页面和旧组件已移除。这里是实际代码迁移，没有 iframe、子模块或对原站点的运行时依赖。

## 与源仓库的兼容性

- 标签来源：[v0-tags-checker-5r](https://github.com/dorajackcui/v0-tags-checker-5r)，迁移快照 `e3f429a6094bc3c7a8467c949d0589f635b2f644`。
- 文本来源：[v0-textDiff](https://github.com/dorajackcui/v0-textDiff)，迁移快照 `69246b39661cc710ede4d18707710c8d4b043dc5`。
- 标签、数字、顺序默认均开启；尖括号、花括号、转义换行、竖线、井号默认开启，方括号默认关闭。
- 标签工具保留源数字正则和按行/按位置比较规则；关闭顺序检查后按数量匹配重复项。数字是源工具的独立整数/小数匹配，不增加货币、负号、千分位等新语义。
- 文本工具保留按相同行号比较及原始 LCS 算法（包括 Unicode 码点和相同 LCS 长度时的选择规则）。新增一行不会自动移动后续行来对齐。
- 标签导入使用单元格显示值，删除所选两列末尾均为空的行；文本导入使用原始值并保留行。单元格内部换行沿用源工具的文本展开方式，不独立按单元格比较。
- 文本工具的导入面板额外支持切换工作表和关闭表头；重复/空表头使用列索引标识，避免同名列相互覆盖。
- 标签预览改用 React 文本节点，安全显示 HTML 字符串；两侧共用行高，错误行保持对齐。

`tests/fixtures/source-parity.json` 是直接运行上述源代码生成的固定期望值，包含 400 组标签场景和 9 组文本场景。测试不需要访问源仓库。

## 本地开发

使用 Node.js 22.12+（推荐 Node 22 LTS）。

```bash
npm ci
npm run dev
```

```bash
npm test       # 源算法兼容性、边界条件与真实表格解析
npm run build # TypeScript 检查与生产构建
npm run check # 测试 + 生产构建
npm run preview
```

构建产物在 `dist/`。工具和表格解析库按需加载；只有导入文件时才加载 SheetJS。SheetJS 使用官方分发的 0.20.3，依赖及校验摘要固定在 `package-lock.json`。

字符比较保留原站点的精确 LCS 算法，时间和空间复杂度为单行字符长度乘积。超长单行文本会消耗较多浏览器内存，建议按实际文本行拆分。

## Cloudflare 部署

当前使用已有的 Cloudflare Worker **momotools**，仓库配置在 `wrangler.jsonc`：

- Git 仓库：`dorajackcui/toolHub`
- 生产分支：`main`
- 根目录：`/`
- 构建命令：`npm run build`
- 部署命令：`npx wrangler deploy`
- 静态资源：`dist`
- SPA fallback：`single-page-application`，直接访问/刷新 `/tags` 和 `/diff` 均可。

后续提交到 main 后由现有 Cloudflare Git 集成自动构建部署。此模式只部署静态资源，不需要 Worker 业务脚本或任何应用密钥。

已登录 Cloudflare CLI 时也可以手动执行：

```bash
npm run deploy
```

若另外使用 Cloudflare Pages，选择 React/Vite，构建命令 `npm run build`、输出目录 `dist`。Pages 自带 SPA 回退；项目不生成 `404.html`。现有 Workers 项目无需迁移到 Pages。

官方说明：[Workers 静态资源](https://developers.cloudflare.com/workers/static-assets/)、[SPA 路由](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)、[Pages React 部署](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)。

## 以后添加工具

```text
src/
  tools/
    index.tsx           # 唯一工具注册表
    tags/               # 标签规则、比较逻辑与页面
    diff/               # 文本比较逻辑与页面
  components/
    ui.tsx              # 共享按钮、输入面板、筛选、标题
    ExcelImporter.tsx   # 共享表格导入交互
  lib/
    workbook.ts         # 工作表、列与行转换
    read-workbook.ts     # 按需读取 Excel/CSV
  App.tsx               # 导航、路由与页面会话状态
  styles.css            # 全站设计样式
tests/
  fixtures/             # 源算法对照数据
```

1. 在 `src/tools/<tool>/` 创建独立页面，将纯计算逻辑与 UI 分开。
2. 在 `src/tools/index.tsx` 注册 id、path、名称、图标与 lazy import。
3. 复用共享组件和样式；新增核心计算逻辑时在 `tests/` 添加输入/输出用例。
4. 运行 `npm run check` 后提交到此仓库。

无需修改两个旧仓库，也无需为每个工具配置单独的部署。
