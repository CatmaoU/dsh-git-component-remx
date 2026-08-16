# dsh-git-component-remx — Git 面板（DeepSeek Harness WebUI 插件）

> DeepSeek Harness Web GUI 的 Git 插件：悬浮面板实时查看工作区更改（已暂存 / 未暂存 / 未跟踪），支持提交、提交并推送、推送（主支/分支双目标）、连接状态灯、推送失败 AI 一键修复，提交信息留空时自动用 AI 生成。
>
> A Git plugin for the DeepSeek Harness Web GUI: a floating panel showing your working-tree changes, with commit / commit-and-push / push to main-or-branch targets, connection status lights, AI one-click push-failure repair and AI commit-message autofill.

> **源插件 / Upstream**: [github.com/nieyunliang/dsh-git-component](https://github.com/nieyunliang/dsh-git-component)
>
> 本包是上游的本地定制增强版（remx），保留了上游全部功能并新增下方「新增功能」一节所述能力。
>
> **⚠️ 附属插件 / Companion**: 本插件是源插件 `dsh-git-component` 的附属增强，**必须先安装源插件**才能使用。
> 缺失时插件会加载失败

## 功能 / Features

### 基础（上游已有）

- 悬浮面板（376px 宽，透明卡片风），可折叠为 Git 分支小图标
- 三个分组：**已暂存 / 未暂存 / 未跟踪**（porcelain v1 精确解析，含重命名）
- 点击文件内联查看 diff（最多 400 行，含 split 视图）
- 提交 / 提交并推送 / 推送
- 提交信息留空 → 自动用当前默认模型生成中文提交信息（≤60 字，单行）
- 15 秒自动刷新；跟随当前会话的工作目录（切换会话/工作区自动重载）

### 新增（remx 定制）

- **双胶囊推送目标**：header 并排「当前分支 / 分支名」两个胶囊，点击切换推送目标（高亮环跟随，蓝色实底+发光环=激活态）
  - 主支模式：推送当前分支到其上游（无上游自动 `--set-upstream`）
  - 分支模式：推送 `git push origin HEAD:refs/heads/<分支名>`（远端无该分支则自动创建）；重新推送、提交并推送、AI 修复重试全部遵循该目标
  - 目标与分支名持久化于 localStorage（`dsh-git-component-target` / `dsh-git-component-branch`），切到分支后持续生效，直到手动切回主支
- **连接状态灯（每个胶囊一个指示灯）**：
  - 🟢 绿 = 远端分支可达、工作区干净
  - 🔴 红 = 连接失败 / 报错（网络或凭据）
  - ⚪ 灰 = 未连接（未配置 remote 或远端无该分支）
  - 🟠 橙 = 工作区有改动（未提交）
  - 🔵 蓝（脉冲）= 正在推送中（合并为唯一指示灯，胶囊内只留一灯+文字）
  - 主支探测 `git ls-remote <remote> HEAD`，分支探测 `refs/heads/<branch>`；结果缓存 60s，手动刷新（↻）强制重探测
- **分支重命名**：分支胶囊上 **右键 或 双击** 打开内联编辑条重命名（Enter 确认 / Esc 取消，取消回退主支）
- **AI 一键修复推送失败**：推送失败自动调用 LLM 分析报错 → 生成修复命令（安全白名单 + 破坏性命令黑名单）→ 逐条执行 → 自动重试推送，结果展示在 verify 视图
- **仓库验证视图**：✓ 按钮逐项检查 git 可执行 / 仓库有效 / Git 目录 / 分支 / 工作区状态 / 远端 / 上游 / 远端可达性 / 凭据助手，失败项红色并展示完整报错
- **面板个性化**：可拖拽位置（localStorage 记忆）、设置页开关 + 背景不透明度滑块（settings.section「Git 面板」）
- **沙箱修复**：git 网络操作（ls-remote / push / @{u} 探测）绕过 dsh 的 pwsh 沙箱（`execFile` 直跑，修复 remote-https 管道 Permission denied 与 `@{u}` 被 PowerShell 解析为 hash literal 两个问题）

## 安装 / Install
可以丢给dsh让它自己安装
**先安装源插件（必装，本插件是其附属）**：

```sh
dsh plugin --profile web add github:nieyunliang/dsh-git-component
```

再安装本 remx 增强版（从 GitHub 发布仓库安装）：

```sh
dsh plugin --profile web add github:CatmaoU/dsh-git-component-remx
```

开发/测试时也可从本地源码目录安装（需在插件父目录执行）：

```sh
dsh plugin --profile web add ./dsh-git-component-remx
```

> **依赖强制**：本插件在 host 侧启动时用 `require.resolve('dsh-git-component')` 检测源插件是否已安装；
> 缺失时**不注册任何 git 路由**，只注册 `/git-component-remx/dependency` 状态路由，client 侧渲染
> 「缺少源插件 dsh-git-component」提示条（含安装命令复制 + GitHub 下载链接），面板不会工作。
> `package.json` 同时声明了 `peerDependencies: { "dsh-git-component": ">=0.1.0" }` 与
> `dsh.companion.requires` 元数据，供包管理器/工具链识别依赖关系。

> `dsh plugin add` 会自动把声明了 `dsh.bundle.patch` 的包加入该 profile 的
> `dsh.profile.bundles` 层（即 `dsh plugin --profile web --dump-config` 里能看到
> `git-component` 这一行）。之后**重启** webui 进程生效（Node 模块缓存不会热替换旧代码）。
>
> 注意：git 源安装需要 pnpm 允许构建脚本（`prepare`），如被拦截请按 pnpm 提示在
> profile 的 `pnpm-workspace.yaml` 的 `allowBuilds` 中加入对应 key 后重试。

要求：`web` profile（提供 `webServer` 与 `shell` 服务）、Node ≥ 22、Git ≥ 2.x。
插件 host 半零运行时依赖（仅 `index.js` 直接消费 Cordis `ctx`；`@deepseek-ai/dsh-settings` 与 `@deepseek-ai/schemastery` 经 profile 的 flat fallback 解析）。

## 使用 / Usage

1. 重启后打开 WebUI，右侧出现 Git 面板（右上角小分支图标可展开/收起）
2. 面板显示当前仓库的三个分组与变更文件；点击文件看 diff
3. 提交：填入信息后点「提交」或「提交并推送」（Ctrl/⌘+Enter 提交）
4. 留空提交信息：点提交后自动生成 AI 提交信息并提交
5. 推送：
   - 默认推送到**主支**（当前分支上游；无上游自动建立跟踪）
   - 点击**分支胶囊**切换到分支模式（首次点击弹出输入条设置分支名，默认 `feature-MMDD`），此后所有推送都到 `origin/<分支名>`
   - 右键/双击分支胶囊可重命名分支
6. 推送失败：面板自动调用 AI 一键修复，修复步骤与重试结果展示在验证视图；也可随时点 ✓ 手动验证仓库健康度

## 安全说明 / Security

- git 命令在**当前会话工作目录**下执行（自动 `git rev-parse --show-toplevel` 定位仓库根）
- 面板调用宿主 `/git-component/*` 路由，宿主侧按会话沙箱策略执行；不会放宽你当前的文件权限模式
- **AI 一键修复**：LLM 输出的命令经双重校验——必须 `git ` 开头、禁止 shell 元字符，且命中白名单（add/commit/fetch/pull/remote/config/branch/push/status/diff/rev-parse/ls-remote/log/show/symbolic-ref/update-index/reset）；黑名单拦截 `--hard`/`--force`/`clean`/`branch -dD`/`remote remove`/`checkout --`/`stash drop`/`rebase`/`merge`/`config --global` 等破坏性操作
- 分支名推送目标经正则校验（`^[A-Za-z0-9][A-Za-z0-9._/-]*$`，禁 `..` 与 `.lock`），防止注入
- 仓库内执行的 git 操作与你在终端里敲等价命令的风险一致

## 原理 / How it works

单个 npm 包同时承载两半：

| 半 | 文件 | 机制 |
|---|---|---|
| Host 路由 | `index.js` | 包主入口；`inject: [webServer, shell, settings]`；启动时先校验源插件 `dsh-git-component` 已安装（`require.resolve`），缺失则拒绝注册功能路由、仅注册 `/git-component-remx/dependency` 状态路由；就绪后注册 `/git-component/status\|conn\|diff\|commit\|push\|stage\|verify\|automessage\|autofix` 路由；网络类 git 操作走 `execFile` 直跑（绕沙箱），本地操作走 `shell` |
| 浏览器面板 | `client.js` | `exports["./client"]` + `dsh.client.platform: web`，由 `dsh-client-modules` 扫描发现，经 `/plugins/dsh-git-component-remx/client.js` 注入页面；`GitPanelEntry` 门卫先请求 `/git-component-remx/dependency`：缺失 → 渲染「缺少源插件」提示条（含安装命令/下载链接），就绪 → 渲染 GitPanel；注册到 `shell.overlay` 插槽（id `git-component`, order 90） |

`cordis.patch.yml` 是 bundle 层：profile 列出本 bundle 时插入一行 `git-component`。
激活顺序由服务可用性驱动，`inject` 保证 `webServer`/`shell` 就绪后才 apply。

## 开发 / Development

```
dsh-git-component-remx/
├── package.json        # dsh.bundle.patch + dsh.client 声明
├── cordis.patch.yml    # bundle 补丁层（一行 insert）
├── index.js            # Host 半：git 操作 + HTTP 路由（仅 dsh-settings/schemastery 两依赖）
├── client.js           # 浏览器半：手写 __ModuleLoader__ bundle（无构建步骤）
├── README.md
└── LICENSE             # MIT
```

修改后本地验证：

```sh
dsh plugin --profile web add ./dsh-git-component-remx   # 重装（或先 remove）
dsh --profile web --dump-config | grep git-component     # 确认行存在
# 重启 webui 进程
```

> 提示：client.js 的修改**刷新页面即生效**（dsh-client-modules 实时读盘、no-cache）；host 半（index.js）的修改需**重启**。

## License

MIT © nieyunliang（上游）· 本 remx 定制版基于上游 MIT 许可修改
