# Changelog

## 1.0.0 — 2026-11-25

首个可用版本。

- 在 `conversation.composer.dock` 显示下班倒计时，排在宿主读数之后（slot `order: 999`）
- 四种状态：上班前、工作中（含今日进度条）、最后 30 分钟、下班后；周末单独提示
- 行内编辑上下班时间（点击这一行，`Enter` 保存、`Esc` 取消）
- 设置页「下班倒计时」：修改时间、恢复默认、当前状态预览
- 中英文案；`--dsw-alias-*` 主题 token；窄窗自动隐藏百分比与进度条
- 设置保存在浏览器 `localStorage`（`dsh-gohome:work-hours`），写失败会如实提示；旧键 `dsh-timer:work-hours` 自动迁移
- 零依赖、无构建步骤