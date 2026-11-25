# dsh-gohome 下班倒计时

在 DeepSeek Harness 消息输入框下方的 dock 区域显示一行实时倒计时，按你设置的上下班时间计算（默认 09:00 上班、18:00 下班）。

- **上班时间之前**：`距离上班 HH:MM:SS`
- **工作时段内**：`距离下班 HH:MM:SS`，附今日进度条与百分比；最后 30 分钟标签变为 `即将下班`、进度条转为警示色
- **下班之后**：`下班已过 HH:MM:SS`（明确表示已经过去的时间，不是还要等的时间）
- **周六、周日**：`周末休息 周一 <上班时间>`

进度条只出现在工作时段内，其他状态只有倒计时文本。每秒刷新一次，只读取本机时钟，不发送任何数据。

窗口变窄时自动降级：≤640px 隐藏百分比，≤480px 再隐藏进度条，只保留标签与倒计时。

位置：该行注册在 `conversation.composer.dock` 的 `order: 999`，并用自己的 flex `order: 9999` 排到那一行的最右端（宿主自己的上下文占用环也在同一行，属于宿主、不归插件的 slot 管）。

**注意**：该行属于输入框下方的 dock，只在会话的输入框形态下渲染；空白的新会话首屏（hero）没有输入框卡片，所以发第一条消息后才会出现。

## 使用

安装本 bundle 并保持启用后，打开任意会话即可在输入框下方看到倒计时行。它属于 Client 装饰，不需要在对话里触发。

## 修改上下班时间

有两个入口，共用同一份设置，改动双向同步：

1. **行内编辑（快）**：直接点倒计时这一行（鼠标点击，或 Tab 聚焦后按 Enter / 空格），同行变成 `上班 [09:00] 下班 [18:00] 保存 取消`，改完点保存；`Enter` 保存、`Esc` 取消。
2. **设置页（完整）**：`设置 → 下班倒计时`，可改上下班时间、恢复默认，并显示当前状态预览；未改动时「保存」为禁用态。

规则与限制：

- 默认 `09:00`–`18:00`；`End` 必须晚于 `Start`，否则就地提示「结束时间需晚于开始时间」且不保存。
- 保存后立即生效，无需刷新；主会话、右侧栏、设置页三处同步更新。
- 记录在浏览器 `localStorage`（键 `dsh-gohome:work-hours`；改名前的 `dsh-timer:work-hours` 会在首次读取时自动迁移过来），**按浏览器保存**：换浏览器、换机器或清站点数据会回到默认值。
- 设置页导航项没有自定义图标，宿主会给它一个通用图标。

为什么不做成插件 Config：Client 半边拿不到 Host 的 Config/`cordis.patch.yml`，要走 Host RPC 或自建 HTTP 路由才能读配置，对这一个纯展示插件不划算。当前用 UI + localStorage 换取「改完即生效」。

## 已知限制

- 仅按本地时区计算，不做跨时区换算。
- 不识别法定节假日与调休，只按周一至周五判断工作日。
- 设置按浏览器保存（localStorage），不同浏览器/设备互不同步；写存储失败时会提示「未能写入浏览器存储，仅本次有效」，不会谎报已保存。
- 关闭插件后该行消失，不影响会话数据。

## Files

| File | Purpose |
| --- | --- |
| `cordis.patch.yml` | 插入 `dsh-gohome` 插件行 |
| `index.js` | Host 半边（无逻辑） |
| `client.js` | 倒计时 UI 与 locale 注册 |
| `locale/en.json`, `locale/zh.json` | 插件管理器标题与描述 |
| `icon.svg` | 插件图标 |

## English

`dsh-gohome` shows a live workday countdown below the message composer: time left, today's progress, a "wrapping up" state for the last 30 minutes, an "off work for" timer after the end time, and a weekend label. Click the row to edit the hours in place, or open the Settings entry (「下班倒计时」 / "Workday countdown") to save or reset them. Settings are stored in `localStorage`; the plugin has no dependencies and no build step, and it never makes network requests.

### Install

```sh
npm install dsh-gohome
```

or through DSH itself:

```text
plugin_manager → install_bundle → target: dsh-gohome
```

Refresh the page afterwards. Requires DeepSeek Harness `>=0.2.2-rc.5 <0.3.0-0`.

### From source

```sh
git clone https://github.com/mingyang66/dsh-gohome.git
cd dsh-gohome
npm test
```

Then pass the absolute path of that directory to `plugin_manager` `install_bundle`.

### License

[MIT](LICENSE)