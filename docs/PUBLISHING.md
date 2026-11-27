# 发布流程（dsh-gohome）

本文件记录从「本地插件」到「dsh-market 可安装」的完整步骤，以及每一步的现状。

- 仓库：https://github.com/mingyang66/dsh-gohome
- 市场列表来源：https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
- 当前版本：`1.1.0`

---

## 阶段 0 · 现状总览

| 事项 | 状态 |
| --- | --- |
| 代码公开在 GitHub（public） | ✅ main = `f5d8627`（1.1.0），tag `v1.0.0`、`v1.1.0` |
| CI（`npm test` 契约测试） | ✅ GitHub Actions 通过 |
| 本机 GitHub 源码安装验证 | ✅ `github:mingyang66/dsh-gohome` 安装成功，两个 slot 正常 |
| npm 发布 | ❌ 未发布（可选，非必需） |
| dsh-market 收录 | ⏳ PR [#18970](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/18970) 已提交，检查全绿，等维护者合并 |

> 市场不会自动发现新仓库。**只有精选列表合并了条目，市场才搜得到。**

---

## 阶段 1 · 包内容要求（已完成，供改版时对照）

发布物必须满足：

1. `package.json` 声明 `dsh.bundle.patch`（Host 行）与 `dsh.client`（Web 半边）：
   ```json
   "dsh": {
     "bundle": { "patch": "./cordis.patch.yml" },
     "client": { "platform": "web", "immediately": true, "inject": ["@deepseek-ai/dsh-client-ui-conversation"] }
   }
   ```
2. `exports` 导出 `.`（Host）、`./client`（浏览器）、`./icon`、`./locale/*.json`
3. `files` 覆盖运行所需文件；`private` 不能为 `true`
4. `locale/{zh,en}.json` 里有 `meta.title`、`meta.description`（插件管理器和详情页都读它）
5. `icon.svg`（≤256 KiB）
6. `engines.dsh` 写在实测过的范围：`>=0.2.2-rc.5 <0.3.0-0`
7. 零构建步骤（本插件无 `prepare`/`postinstall`，市场安装不会触发构建审批）

自检命令：

```powershell
cd C:\Users\Administrator\Documents\deepseek-harness\default-workspace\dsh-gohome
node test/contract.test.mjs      # 7 项契约测试
npm pack --dry-run               # 期望 11 个文件（含 docs）、约 15 kB
```

---

## 阶段 2 · 发到 GitHub（已完成）

```powershell
cd C:\Users\Administrator\Documents\deepseek-harness\default-workspace\dsh-gohome
git add -A
git commit -m "feat: ..."
git push origin main
git tag -f v1.0.0
git push -f origin v1.0.0
```

本机注意：`github.com` 直连时通时断，git 已配置走本机代理：

```powershell
git config --global http.https://github.com/.proxy http://127.0.0.1:7897
git config --global http.https://codeload.github.com/.proxy http://127.0.0.1:7897
git config --global http.https://api.github.com/.proxy http://127.0.0.1:7897
```

代理端口变化时改这三条；代理关闭时 GitHub 安装与 push 会一起失败。

---

## 阶段 3 · 上架 dsh-market（待执行）

### 3.1 打开精选列表仓库

https://github.com/awesome-dsh-plugin/awesome-dsh-plugin

也可以在 dsh-market 界面点右上角「申请收录插件 ↗」，跳转的是同一个仓库。

### 3.2 Fork 并添加条目

在该仓库的插件清单里按相邻条目的格式增加一条（`category` 必须用仓库已有取值）：

```json
{
  "name": "dsh-gohome",
  "url": "https://github.com/mingyang66/dsh-gohome",
  "category": "productivity",
  "owner": "mingyang66",
  "description": {
    "zh": "输入框下方的下班倒计时：行内改时间、设置页、零依赖、纯本地计算。",
    "en": "Workday countdown under the composer with inline editing, a settings page, and no dependencies."
  }
}
```

字段说明（市场解析器读取的）：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 展示名，也是默认安装标识 |
| `url` | 是 | 必须是 https，通常填仓库地址 |
| `category` | 是 | 必须是清单已有分类，否则条目被跳过 |
| `npm` | 否 | 填了就走 npm 安装；不填则走 `github:owner/repo` 源码 |
| `owner` | 否 | 作者/归属，展示用 |
| `description` | 否 | 字符串或 `{zh,en}` |
| `screenshots` | 否 | 最多 6 张 https 图片 |
| `tarball` | 否 | GitHub Release 预构建包固定地址，优先于源码 |

### 3.3 提 PR

标题建议：`Add dsh-gohome`

正文建议：

```markdown
Adds dsh-gohome, a lightweight workday countdown for the DeepSeek Harness composer dock.

- Shows time left until the configured end time, today's progress, a "wrapping up" state for the last 30 minutes, and an off-work timer afterwards.
- Hours are editable in place (click the row) and on a settings page; settings persist in `localStorage`.
- Zero dependencies, no build step, no network requests. Verified on DSH 0.2.2-rc.5.
- Repo: https://github.com/mingyang66/dsh-gohome (MIT)
```

### 3.4 等待收录

合并后站点与 dsh-market 由每日 CI 刷新，通常一天内生效。

### 3.5 验证

```text
# 市场内搜索 dsh-gohome 应出现条目
# 或直接装（与市场安装同一条通道）：
plugin_manager → install_bundle → github:mingyang66/dsh-gohome
```

---

## 阶段 4 · 收录后验证清单

1. 市场里能搜到，描述、图标正常
2. 从市场安装成功，`package.json` 里来源为 `github:...`
3. 刷新页面：输入框下方出现倒计时，`设置 → dsh-gohome` 页面可改时间
4. 契约测试与 CI 仍为绿

---

## 阶段 5 · 可选增强

### 5.1 发布 npm（提升国内可用性与版本化）

```powershell
npm login
npm publish --access public
npm view dsh-gohome version
```

发布后在清单条目里加 `"npm": "dsh-gohome"`，市场会改走 registry。

### 5.2 GitHub Release 预构建包

1. Releases → Draft a new release → 选 `v1.0.0`
2. 上传 `npm pack` 产物 `dsh-gohome-1.0.0.tgz`
3. 条目里加：
   ```json
   "tarball": "https://github.com/mingyang66/dsh-gohome/releases/latest/download/dsh-gohome-1.0.0.tgz"
   ```

### 5.3 截图

市场详情页支持 https 图片，截一张输入框下方的倒计时行即可。

---

## 阶段 6 · 版本迭代流程

```powershell
# 1) 改代码
# 2) 升版本（package.json + CHANGELOG）
# 3) 提交并推送
git add -A
git commit -m "fix: ..."
git push origin main
git tag -f v1.0.1
git push -f origin v1.0.1
```

- **GitHub 源安装**：市场按 commit 比对，push 后提示「有新提交（未发版）」，可更新
- **npm 安装**：必须 `npm publish` 新版本号，市场才会提示升级
- 装 GitHub 源的用户不会自动切到 npm 包，反之亦然

---

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `connection to github.com timed out after 5000ms` | 预检 5s 内没连上 GitHub | 配好 git 代理后重试安装 |
| `SSL_ERROR_SYSCALL` / `Connection was reset` | 代理节点/直连不稳 | 切换节点或稍后重试 |
| `fatal: could not read Username` | 非交互环境无凭据 | 在普通终端执行，或用 GCM 登录 |
| 市场里搜不到 | 条目未合并 | 检查 PR 状态 |
| 改工作区文件不生效 | 装的是 GitHub 快照 | 切回本地安装或重新推 GitHub 后重装 |