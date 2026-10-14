# 组件登记表（homepage 博客前台）

> 本表登记本仓库的**可复用组件**（跨页面使用、对外导出）。页面级组件（`src/pages/*`）
> 与页面内部的私有子组件不在此列。新增组件必须同一笔提交登记；删除组件同步删条目。
>
> 样式约定：全站为**朴素排版**，外观交给浏览器默认渲染。组件层**不得**写颜色、圆角、
> 字号、阴影或过渡；全站 CSS 只在 `src/index.css`，仅保留需求文档列出的 5 条豁免。

| 组件 | 用途 | 关键 props | 最小示例 | 注意事项 |
|---|---|---|---|---|
| `LoadingState` | 异步区加载中占位 | `label?: string`，默认 `Loading…` | `<LoadingState />` | `role="status"`（礼貌级 live region）；不放任何视觉样式。 |
| `ErrorState` | 异步区加载失败占位 | `onRetry?: () => void`，缺省不渲染按钮 | `<ErrorState onRetry={retry} />` | `role="alert"`（强提示级）；重试按钮是原生 `<button>`，可 Tab 聚焦。 |
| `EmptyState` | 列表/搜索无结果占位 | `message?: string`，默认 `Nothing here yet.` | `<EmptyState message="No posts yet." />` | 纯文案；不参与布局决策，由调用方决定何时渲染。 |

## 非组件但共用的模块

以下不是 UI 组件，不登记为组件行，列此仅供定位：

- `src/hooks/useAsync.ts`：异步加载 hook，返回 `{ status, data, retry }`。
- `src/components/States.tsx`：上表三个状态组件的实现文件。
