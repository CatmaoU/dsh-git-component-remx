// dsh-git-component-remx — Host half.
// Exposes git operations as HTTP routes consumed by the browser bundle
// (./client.js, served via exports["./client"]). Runtime dependencies:
// @deepseek-ai/dsh-settings + @deepseek-ai/schemastery resolve through the
// installation flat fallback ($DSH_HOME/profiles/node_modules), same as dsh-drop-in.
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";

// ---------------------------------------------------------------------------
// 附属插件强制依赖：本插件（dsh-git-component-remx）是源插件
// dsh-git-component 的附属增强，运行时要求源插件必须已经安装。
// 缺失时：不注册任何 git 功能路由，仅注册依赖状态路由供 client 半
// 渲染「缺少源插件 + 下载引导」提示条，并在日志中给出安装命令。
// ---------------------------------------------------------------------------
const SOURCE_PLUGIN = 'dsh-git-component'
const SOURCE_INSTALL_CMD = 'dsh plugin --profile web add github:nieyunliang/dsh-git-component'
const SOURCE_DOWNLOAD_URL = 'https://github.com/nieyunliang/dsh-git-component'

const requireFromHere = createRequire(import.meta.url)
function sourcePluginAvailable() {
  try {
    requireFromHere.resolve(SOURCE_PLUGIN + '/package.json')
    return true
  } catch {
    return false
  }
}

const sq = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'"

// Hard dependencies: activation is service-availability driven, so without
// inject this row could apply before webServer/shell exist and silently no-op.
const inject = ['webServer', 'shell', 'settings']

// User-facing switch (settings UI): disable hides the floating right-side panel.
// opacity 0-100：面板背景不透明度（0 全透明 → 100 云母磨砂/不透明），供 client 半滑块调节。
const SETTINGS_NS = settingsNamespace("git-component");
const GitComponentSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  opacity: z.number().min(0).max(100).default(88)
});

export default {
  inject,
  apply(ctx) {
    // 附属插件强制依赖检查：源插件 dsh-git-component 必须已安装。
    // 缺失 → 拒绝注册任何 git 功能路由，注册依赖状态路由供 client 半
    // 渲染「缺少源插件」提示，并在日志中给出安装命令与下载地址。
    if (!sourcePluginAvailable()) {
      const message = '[dsh-git-component-remx] 缺少源插件 ' + SOURCE_PLUGIN
        + '：本插件是源插件的附属增强，必须先安装源插件。'
        + '安装命令：' + SOURCE_INSTALL_CMD
        + '（下载：' + SOURCE_DOWNLOAD_URL + '）'
      try { if (ctx.logger && typeof ctx.logger.error === 'function') ctx.logger.error(message) } catch {}
      console.error(message)
      const webServer = ctx.get('webServer')
      if (webServer !== undefined) {
        ctx.effect(() => webServer.register({
          kind: 'exact',
          path: '/git-component-remx/dependency',
          handler: async (req, res) => {
            send(res, 200, {
              ok: false,
              missing: SOURCE_PLUGIN,
              installCmd: SOURCE_INSTALL_CMD,
              downloadUrl: SOURCE_DOWNLOAD_URL,
              error: '缺少源插件 ' + SOURCE_PLUGIN + '，请先安装源插件',
            })
          },
        }))
      }
      return
    }

    const shell = ctx.get('shell')
    const sandboxPolicy = ctx.get('sandboxPolicy')
    const webServer = ctx.get('webServer')
    if (shell === undefined || webServer === undefined) return

    const settings = ctx.settings.register(SETTINGS_NS, GitComponentSettingsSchema, { applies: 'live' })
    const panelEnabled = () => {
      try { return settings.get().enabled !== false } catch (e) { return true }
    }

    function sessionMode() {
      if (sandboxPolicy === undefined) return null
      try { return sandboxPolicy.resolve().mode } catch (e) { return null }
    }

    async function runGit(cwd, args, opts) {
      opts = opts || {}
      const request = {
        command: 'git ' + args,
        workdir: typeof cwd === 'string' && cwd.length > 0 ? cwd : undefined,
        timeoutMs: opts.timeoutMs || 20000,
        stdoutMaxBytes: opts.stdoutMaxBytes || 1024 * 1024,
        env: { GIT_TERMINAL_PROMPT: '0' },
      }
      if (opts.policy !== undefined) request.sandboxPolicy = opts.policy
      if (opts.stdin !== undefined) request.stdin = opts.stdin
      try {
        const spec = shell.resolve(request)
        return await shell.run(spec)
      } catch (err) {
        return { exitCode: -1, stdout: { text: '' }, stderr: { text: 'git 执行失败: ' + String((err && err.message) || err) } }
      }
    }

    // 网络操作与 @{u} 探测专用：直接 spawn git（不经 shell/沙箱）。
    // 原因1：dsh 沙箱（ACL restricted-token）下 git 无法为 remote-https 创建管道
    //   → "error: cannot create standard input pipe for remote-https: Permission denied"；
    // 原因2：PowerShell 包装把 @{u} 当 hash literal 解析
    //   → "Missing '=' operator after key in hash literal"。
    // 仅用于只读探测与 push/ls-remote 等网络操作；本地写操作仍走 runGit（沙箱内）。
    function runGitRaw(cwd, args, opts) {
      opts = opts || {}
      return new Promise((resolve) => {
        execFile('git', args, {
          cwd: typeof cwd === 'string' && cwd.length > 0 ? cwd : undefined,
          env: Object.assign({}, process.env, { GIT_TERMINAL_PROMPT: '0' }),
          windowsHide: true,
          maxBuffer: opts.maxBytes || 1024 * 1024,
          timeout: opts.timeoutMs || 30000,
        }, (err, stdout, stderr) => {
          resolve({
            exitCode: err ? (typeof err.code === 'number' ? err.code : -1) : 0,
            stdout: { text: String(stdout || '') },
            stderr: { text: String(stderr || '') + (err && err.killed ? '\n(killed by timeout)' : '') },
          })
        })
      })
    }

    // 单轮 LLM 文本请求（autofix/automessage 共用）。返回 { text, failure }。
    async function llmText(llm, modelSvc, system, userPrompt, opts) {
      opts = opts || {}
      const selection = modelSvc.currentSelection()
      if (!selection || !selection.provider || !selection.model) return { text: '', failure: { message: '未配置默认模型' } }
      let text = ''
      let failure = null
      try {
        const stream = llm.stream({
          provider: selection.provider,
          model: selection.model,
          reasoningEffort: selection.reasoningEffort,
          system,
          messages: [{
            id: opts.id || 'git-component-llm',
            role: 'user',
            content: [{ type: 'text', text: userPrompt }],
            source: { kind: 'user' },
          }],
          temperature: opts.temperature ?? 0.3,
          maxTokens: opts.maxTokens ?? 2000,
          stop: opts.stop,
        })
        for await (const chunk of stream) {
          if (chunk.type === 'text-delta') text += chunk.text
          else if (chunk.type === 'finish') {
            const reason = chunk.reason
            if (reason && (reason.kind === 'error' || reason.kind === 'aborted') && reason.failure) failure = reason.failure
          }
        }
      } catch (err) {
        failure = { message: String((err && err.message) || err) }
      }
      return { text: text.trim(), failure }
    }

    async function resolveRepo(cwd) {
      const res = await runGit(cwd, 'rev-parse --show-toplevel', { timeoutMs: 10000, stdoutMaxBytes: 65536 })
      if (res.exitCode !== 0) return null
      const out = (res.stdout && res.stdout.text || '').trim()
      return out || null
    }

    // Never widen the session mode; only re-root the workspace-write boundary at the target repo.
    function policyFor(root) {
      const mode = sessionMode()
      if (mode === null) return undefined
      if (mode === 'read-only') return { mode: 'read-only', workspaceRoot: root }
      return { mode: 'workspace-write', workspaceRoot: root }
    }

    function errText(res, fallback) {
      return ((res.stderr && res.stderr.text) || (res.stdout && res.stdout.text) || fallback).trim()
    }

    function parseStatus(text) {
      const records = text.split('\0').filter((r) => r.length > 0)
      const view = { branch: 'HEAD', upstream: null, ahead: 0, behind: 0, gone: false, detached: true, changes: [] }
      let i = 0
      if (records.length > 0 && records[0].startsWith('## ')) {
        const head = records[0].slice(3)
        i = 1
        const m = head.match(/^(.+?)(?:\.\.\.([^\s]+))?(?:\s+\[([^\]]*)\])?$/)
        if (m) {
          if (m[1] === 'HEAD (no branch)') { view.detached = true; view.branch = 'HEAD' }
          else { view.detached = false; view.branch = m[1] }
          if (m[2]) view.upstream = m[2]
          const meta = m[3]
          if (meta === 'gone') view.gone = true
          else if (meta) {
            const am = meta.match(/ahead (\d+)/)
            const bm = meta.match(/behind (\d+)/)
            if (am) view.ahead = parseInt(am[1], 10)
            if (bm) view.behind = parseInt(bm[1], 10)
          }
        }
      }
      // porcelain v1: XY path where X is the index slot and Y the worktree slot;
      // either slot may be a space (unmodified), so both classes must include ' '.
      const statusRe = /^([ A-Z?!T])([ A-Z?!T]) (.*)$/
      for (; i < records.length; i++) {
        const rec = records[i]
        const m = statusRe.exec(rec)
        if (!m) continue
        const x = m[1]
        const y = m[2]
        let path = m[3]
        let oldPath = null
        if ((x === 'R' || x === 'C') && i + 1 < records.length && !statusRe.test(records[i + 1])) {
          oldPath = records[i + 1]
          i++
        }
        const state = x === '?' ? 'untracked' : x === ' ' ? 'unstaged' : 'staged'
        view.changes.push({ path, oldPath, x, y, state })
      }
      return view
    }

    // 连接状态探测：绿=远端分支可达(ok) / 红=失败或报错(err) / 灰=未连接(idle，无 remote 或远端无该分支)。
    // ls-remote 走 runGitRaw（网络管道须绕开 dsh 沙箱）；结果缓存 60s，避免 15s 轮询每次都打网络。
    // branch 参数为空 → 探测远端默认分支（符号引用 HEAD）；指定 branch → 探测 refs/heads/<branch> 是否存在。
    const connCache = new Map() // "root#branch" -> { state: 'ok'|'err'|'idle', ts }
    const CONN_TTL = 60 * 1000
    async function probeConn(root, force, branch) {
      const key = root + '#' + (branch || '@')
      const hit = connCache.get(key)
      if (!force && hit && Date.now() - hit.ts < CONN_TTL) return hit.state
      let state = 'idle'
      try {
        const remR = await runGitRaw(root, ['remote'], { timeoutMs: 10000 })
        const remotes = ((remR.stdout && remR.stdout.text) || '').split(/\s+/).filter(Boolean)
        if (remotes.length > 0) {
          // 默认分支：探测符号引用 HEAD。注意不能用 --heads + HEAD（会被限定到
          // 不存在的 refs/heads/HEAD 而恒空）；HEAD 是符号引用，裸 ls-remote <remote> HEAD 即可命中。
          const lr = branch
            ? await runGitRaw(root, ['ls-remote', '--heads', remotes[0], 'refs/heads/' + branch], { timeoutMs: 8000 })
            : await runGitRaw(root, ['ls-remote', remotes[0], 'HEAD'], { timeoutMs: 8000 })
          const has = ((lr.stdout && lr.stdout.text) || '').trim().length > 0
          state = lr.exitCode === 0 ? (has ? 'ok' : 'idle') : 'err'
        }
      } catch (e) {
        state = 'err'
      }
      connCache.set(key, { state, ts: Date.now() })
      return state
    }
    function setConnState(root, state) {
      connCache.set(root + '#@', { state, ts: Date.now() })
    }

    const send = (res, code, body) => {
      res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(body))
    }
    const readBody = (req) => new Promise((resolve, reject) => {
      let data = ''
      req.on('data', (c) => {
        data += c
        if (data.length > 1e6) { req.destroy(); reject(new Error('body too large')) }
      })
      req.on('end', () => {
        try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) }
      })
      req.on('error', reject)
    })
    const queryOf = (req) => new URL(req.url, 'http://dsh.local').searchParams
    const route = (path, handler) => ctx.effect(() => {
      try {
        webServer.register({ kind: 'exact', path, handler })
      } catch (err) {
        // 冲突兜底：官方 dsh-git-component 也注册 /git-component/* 同名路由，
        // 两个 bundle 同时装配时 register 抛 `duplicate exact route`，会拖垮整个
        // dsh web 启动。正常装配下本 bundle 的 cordis.patch.yml 已把官方入口
        // disabled、路由由 remx 独占；此处 try/catch 保证即使官方抢先注册
        //（例如用户手工改过 profile patch、装配顺序变化）也只是跳过重复路由
        // 并告警，绝不让 dsh web 因路由重复而启动失败。
        const msg = String((err && err.message) || err)
        if (msg.includes('duplicate')) {
          console.warn('[dsh-git-component-remx] skip duplicate route ' + path + ' (' + msg + ')')
          return
        }
        console.error('[dsh-git-component-remx] route ' + path + ' failed: ' + msg)
      }
    })

    route('/git-component/status', async (req, res) => {
      try {
        const cwd = queryOf(req).get('cwd') || ''
        const root = await resolveRepo(cwd)
        if (root === null) return send(res, 200, { ok: false, error: '当前目录不是 Git 仓库' })
        const r = await runGit(cwd, '-c core.quotepath=false status --porcelain=v1 -b -z -uall', {
          timeoutMs: 15000,
          stdoutMaxBytes: 4 * 1024 * 1024,
          policy: policyFor(root),
        })
        if (r.exitCode !== 0) return send(res, 200, { ok: false, error: errText(r, 'git status 失败') })
        const view = parseStatus(r.stdout && r.stdout.text || '')
        view.root = root
        // force=1（手动刷新）→ 绕过缓存强制重新探测连接
        view.conn = await probeConn(root, queryOf(req).get('force') === '1')
        send(res, 200, Object.assign({ ok: true }, view))
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    // 单独探测某个远端分支的连接状态（分支胶囊用）：GET /git-component/conn?cwd=&branch=xxx&force=1
    route('/git-component/conn', async (req, res) => {
      try {
        const q = queryOf(req)
        const cwd = q.get('cwd') || ''
        const branch = q.get('branch') || ''
        const root = await resolveRepo(cwd)
        if (root === null) return send(res, 200, { ok: false, error: '当前目录不是 Git 仓库' })
        const conn = await probeConn(root, q.get('force') === '1', branch)
        send(res, 200, { ok: true, conn, branch })
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    route('/git-component/diff', async (req, res) => {
      try {
        const q = queryOf(req)
        const cwd = q.get('cwd') || ''
        const path = q.get('path') || ''
        if (!path) return send(res, 200, { ok: false, error: '缺少文件路径' })
        const root = await resolveRepo(cwd)
        if (root === null) return send(res, 200, { ok: false, error: '当前目录不是 Git 仓库' })
        let command
        if (q.get('untracked') === '1') command = 'diff --no-index /dev/null ' + sq('./' + path)
        else if (q.get('staged') === '1') command = 'diff --cached -- ' + sq(path)
        else command = 'diff -- ' + sq(path)
        const r = await runGit(cwd, '-c core.quotepath=false ' + command, {
          timeoutMs: 15000,
          stdoutMaxBytes: 768 * 1024,
          policy: policyFor(root),
        })
        const out = r.stdout && r.stdout.text || ''
        const err = r.stderr && r.stderr.text || ''
        if (r.exitCode !== 0 && r.exitCode !== 1) return send(res, 200, { ok: false, error: (err || out || 'git diff 失败').trim() })
        send(res, 200, { ok: true, text: out, truncated: !!(r.stdout && r.stdout.truncated) })
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    route('/git-component/commit', async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = typeof body.cwd === 'string' ? body.cwd : ''
        const message = typeof body.message === 'string' ? body.message.trim() : ''
        if (!message) return send(res, 200, { ok: false, error: '提交信息不能为空' })
        const root = await resolveRepo(cwd)
        if (root === null) return send(res, 200, { ok: false, error: '当前目录不是 Git 仓库' })
        const policy = policyFor(root)
        const add = await runGit(cwd, 'add -A', { timeoutMs: 30000, policy })
        if (add.exitCode !== 0) return send(res, 200, { ok: false, error: errText(add, 'git add 失败') })
        const commit = await runGit(cwd, 'commit -F -', { timeoutMs: 30000, stdin: message, policy })
        const out = ((commit.stdout && commit.stdout.text || '') + (commit.stderr && commit.stderr.text || '')).trim()
        if (commit.exitCode !== 0) return send(res, 200, { ok: false, error: out || 'git commit 失败' })
        const short = /^\[[^\]]+\s([0-9a-f]{7,})\]/m.exec(out)
        send(res, 200, { ok: true, hash: short ? short[1] : null, output: out })
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    route('/git-component/push', async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = typeof body.cwd === 'string' ? body.cwd : ''
        const root = await resolveRepo(cwd)
        if (root === null) return send(res, 200, { ok: false, error: '当前目录不是 Git 仓库' })
        // push 依赖 remote-https helper 管道，dsh 沙箱（ACL restricted-token）下会
        // "Permission denied"；且 PowerShell 包装把 @{u} 当 hash literal。全部走
        // runGitRaw（execFile 直跑 git）：
        // target='branch' 且 branch 合法 → 推送到远端分支 refs/heads/<branch>（当前 HEAD）。
        const target = body.target === 'branch' ? 'branch' : 'main'
        let branchName = ''
        if (target === 'branch') {
          branchName = typeof body.branch === 'string' ? body.branch.trim() : ''
          if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(branchName) || /(^|\/)\.\.(\/|$)/.test(branchName) || /\.lock(\/|$)/.test(branchName)) {
            return send(res, 200, { ok: false, error: '分支名不合法' })
          }
        }
        if (target === 'branch') {
          const r = await runGitRaw(root, ['push', 'origin', 'HEAD:refs/heads/' + branchName], { timeoutMs: 90000, maxBytes: 512 * 1024 })
          const out = ((r.stdout && r.stdout.text || '') + (r.stderr && r.stderr.text || '')).trim()
          if (r.exitCode !== 0) { setConnState(root, 'err'); return send(res, 200, { ok: false, error: out || 'git push 失败' }) }
          setConnState(root, 'ok')
          return send(res, 200, { ok: true, branch: branchName, output: out })
        }
        const branchR = await runGitRaw(root, ['rev-parse', '--abbrev-ref', 'HEAD'], { timeoutMs: 15000 })
        const branch = ((branchR.stdout && branchR.stdout.text) || '').trim()
        const upR = await runGitRaw(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], { timeoutMs: 15000 })
        let args = ['push']
        if (upR.exitCode !== 0 && branch && branch !== 'HEAD') {
          const remR = await runGitRaw(root, ['remote'], { timeoutMs: 15000 })
          const remotes = ((remR.stdout && remR.stdout.text) || '').split(/\s+/).filter(Boolean)
          const remote = (remotes && remotes[0]) || 'origin'
          args = ['push', '--set-upstream', remote, branch]
        }
        const r = await runGitRaw(root, args, { timeoutMs: 90000, maxBytes: 512 * 1024 })
        const out = ((r.stdout && r.stdout.text || '') + (r.stderr && r.stderr.text || '')).trim()
        if (r.exitCode !== 0) { setConnState(root, 'err'); return send(res, 200, { ok: false, error: out || 'git push 失败' }) }
        setConnState(root, 'ok')
        send(res, 200, { ok: true, output: out })
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    // Stage / unstage one file (used by the diff view's quick actions).
    route('/git-component/stage', async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = typeof body.cwd === 'string' ? body.cwd : ''
        const path = typeof body.path === 'string' ? body.path : ''
        const action = body.action === 'unstage' ? 'unstage' : 'stage'
        if (!path) return send(res, 200, { ok: false, error: '缺少文件路径' })
        const root = await resolveRepo(cwd)
        if (root === null) return send(res, 200, { ok: false, error: '当前目录不是 Git 仓库' })
        const policy = policyFor(root)
        const command = action === 'unstage' ? 'restore --staged -- ' + sq(path) : 'add -- ' + sq(path)
        const r = await runGit(cwd, command, { timeoutMs: 30000, stdoutMaxBytes: 512 * 1024, policy })
        const out = ((r.stdout && r.stdout.text || '') + (r.stderr && r.stderr.text || '')).trim()
        if (r.exitCode !== 0) return send(res, 200, { ok: false, error: out || (action === 'unstage' ? 'git restore 失败' : 'git add 失败') })
        send(res, 200, { ok: true, output: out })
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    // 验证当前 .git 仓库信息是否有效：逐项检查并在结果里带完整报错文本。
    // 即使 cwd 不是 Git 仓库也返回结构化 checks（仓库有效=false），供面板完整展示。
    route('/git-component/verify', async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = typeof body.cwd === 'string' ? body.cwd : ''
        const checks = []
        const add = (name, ok, detail) => checks.push({ name, ok: !!ok, detail: String(detail || '').trim() })

        // 1. git 可执行
        const gv = await runGit(cwd || undefined, '--version', { timeoutMs: 10000, stdoutMaxBytes: 4096 })
        add('git 可执行', gv.exitCode === 0, errText(gv, '无法执行 git --version'))

        // 2. 仓库有效性
        const root = await resolveRepo(cwd)
        if (root === null) {
          const rp = await runGit(cwd, 'rev-parse --show-toplevel', { timeoutMs: 10000, stdoutMaxBytes: 65536 })
          add('仓库有效', false, errText(rp, '当前目录不在任何 Git 仓库内'))
          const failed = checks.filter((c) => !c.ok).length
          return send(res, 200, { ok: true, repoRoot: null, summary: checks.length + ' 项检查，' + failed + ' 项失败', checks })
        }
        add('仓库有效', true, '仓库根目录: ' + root)
        const policy = policyFor(root)

        // 3. git 目录（.git 是目录还是文件）
        const gd = await runGit(root, 'rev-parse --git-dir', { timeoutMs: 10000, stdoutMaxBytes: 4096, policy })
        add('Git 目录', gd.exitCode === 0, errText(gd, '无法解析 git 目录'))

        // 4. 当前分支 / HEAD
        const br = await runGit(root, 'rev-parse --abbrev-ref HEAD', { timeoutMs: 10000, stdoutMaxBytes: 4096, policy })
        const branch = ((br.stdout && br.stdout.text) || '').trim()
        add('当前分支', br.exitCode === 0, errText(br, '无法解析分支') || (branch === 'HEAD' ? 'HEAD（游离状态）' : branch))

        // 5. 工作区状态（含上游/ahead/behind）
        const st = await runGit(root, '-c core.quotepath=false status --porcelain=v1 -b -z -uall', { timeoutMs: 15000, stdoutMaxBytes: 4 * 1024 * 1024, policy })
        if (st.exitCode === 0) {
          const view = parseStatus((st.stdout && st.stdout.text) || '')
          const bits = []
          if (view.detached) bits.push('detached HEAD')
          else bits.push('分支 ' + view.branch)
          if (view.upstream) bits.push('上游 ' + view.upstream + (view.ahead || view.behind ? '（ahead ' + view.ahead + ', behind ' + view.behind + '）' : '') + (view.gone ? ' [gone]' : ''))
          else bits.push('无上游分支')
          bits.push(view.changes.length + ' 处更改')
          add('工作区状态', true, bits.join('；'))
        } else {
          add('工作区状态', false, errText(st, 'git status 失败'))
        }

        // 6. 远端配置
        const rv = await runGit(root, 'remote -v', { timeoutMs: 10000, stdoutMaxBytes: 65536, policy })
        const remotesText = ((rv.stdout && rv.stdout.text) || '').trim()
        if (rv.exitCode !== 0) {
          add('远端配置', false, errText(rv, 'git remote -v 失败'))
        } else if (!remotesText) {
          add('远端配置', false, '未配置任何 remote（无法推送）')
        } else {
          add('远端配置', true, remotesText)
        }

        // 7. 上游分支（@{u} 在 PowerShell 包装下是 hash literal，走 runGitRaw）
        const up = await runGitRaw(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], { timeoutMs: 10000 })
        if (up.exitCode === 0) add('上游分支', true, ((up.stdout && up.stdout.text) || '').trim())
        else add('上游分支', false, '无上游分支：' + errText(up, '无法解析 @{u}'))

        // 8. 每个 remote 的网络可达性（ls-remote，完整报错；网络管道须绕开沙箱）
        const remoteNames = remotesText.split(/\r?\n/).map((l) => (l.trim().split(/\s+/)[0] || '')).filter(Boolean)
        const seen = new Set()
        for (const name of remoteNames) {
          if (seen.has(name)) continue
          seen.add(name)
          const lr = await runGitRaw(root, ['ls-remote', '--heads', name], { timeoutMs: 25000 })
          if (lr.exitCode === 0) add('远端 ' + name + ' 可达', true, 'ls-remote 成功（网络与认证正常）')
          else add('远端 ' + name + ' 可达', false, errText(lr, 'ls-remote 失败'))
        }

        // 9. 凭据助手（推送认证相关）
        const ch = await runGit(root, 'config --get credential.helper', { timeoutMs: 10000, stdoutMaxBytes: 4096, policy })
        if (ch.exitCode === 0) add('凭据助手', true, ((ch.stdout && ch.stdout.text) || '').trim() || '（已配置，值为空）')
        else add('凭据助手', false, '未配置 credential.helper（推送可能需要交互认证）')

        const failed = checks.filter((c) => !c.ok).length
        send(res, 200, { ok: true, repoRoot: root, summary: checks.length + ' 项检查，' + failed + ' 项失败', checks })
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    // AI-generated commit message from the working-tree changes.
    route('/git-component/automessage', async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = typeof body.cwd === 'string' ? body.cwd : ''
        const root = await resolveRepo(cwd)
        if (root === null) return send(res, 200, { ok: false, error: '当前目录不是 Git 仓库' })
        const llm = ctx.get('llm')
        const modelSvc = ctx.get('agentDefaultModel')
        if (llm === undefined || modelSvc === undefined) {
          return send(res, 200, { ok: false, error: '当前环境不支持 AI 生成提交信息' })
        }
        const policy = policyFor(root)
        const stat1 = await runGit(cwd, 'diff --cached --stat', { timeoutMs: 15000, stdoutMaxBytes: 256 * 1024, policy })
        const stat2 = await runGit(cwd, 'diff --stat', { timeoutMs: 15000, stdoutMaxBytes: 256 * 1024, policy })
        const untrackedRes = await runGit(cwd, 'ls-files --others --exclude-standard', { timeoutMs: 10000, stdoutMaxBytes: 256 * 1024, policy })
        let summary = ''
        const s1 = stat1.exitCode === 0 ? (stat1.stdout && stat1.stdout.text || '').trim() : ''
        const s2 = stat2.exitCode === 0 ? (stat2.stdout && stat2.stdout.text || '').trim() : ''
        if (s1) summary += '已暂存的更改:\n' + s1 + '\n'
        if (s2) summary += '未暂存的更改:\n' + s2 + '\n'
        const untracked = untrackedRes.exitCode === 0 ? (untrackedRes.stdout && untrackedRes.stdout.text || '').trim() : ''
        if (untracked) summary += '未跟踪的新文件:\n' + untracked + '\n'
        const diffRes = await runGit(cwd, '-c core.quotepath=false diff HEAD --', { timeoutMs: 20000, stdoutMaxBytes: 768 * 1024, policy })
        let diffText = (diffRes.exitCode === 0 || diffRes.exitCode === 1) ? (diffRes.stdout && diffRes.stdout.text || '') : ''
        if (diffText.length > 4000) diffText = diffText.slice(0, 4000) + '\n…（截断）'
        if (diffText.trim()) summary += '\n具体 diff:\n' + diffText
        if (!summary.trim()) return send(res, 200, { ok: false, error: '没有可提交的更改' })

        const selection = modelSvc.currentSelection()
        if (!selection || !selection.provider || !selection.model) {
          return send(res, 200, { ok: false, error: '未配置默认模型' })
        }
        const system = '你是一个 git 提交信息生成器。根据用户提供的更改内容，生成一条简洁的中文提交信息。要求：单行、不超过 60 字、以动词开头（如 新增/修复/优化/重构/更新/删除）、不使用引号或反引号、不要解释、不要输出任何多余内容。'
        const userPrompt = '请为以下更改生成提交信息：\n' + summary.slice(0, 6000)
        let text = ''
        let failure = null
        // 推理模型（deepseek-v4-flash 等）的 max_tokens 是输出总预算（含 reasoning tokens），
        // high effort 推理会吃光 200 → text 为空 → 「AI 未能生成提交信息」。故预算提到
        // 2000 给推理留足空间；stop: ['\n'] 会对整条生成生效（推理/文本中的换行提前终止），
        // 一并去掉，改为生成后按第一行截断（保持单行提交信息约束）。
        const stream = llm.stream({
          provider: selection.provider,
          model: selection.model,
          reasoningEffort: selection.reasoningEffort,
          system,
          messages: [{
            id: 'git-component-auto-msg',
            role: 'user',
            content: [{ type: 'text', text: userPrompt }],
            source: { kind: 'user' },
          }],
          temperature: 0.3,
          maxTokens: 2000,
        })
        for await (const chunk of stream) {
          if (chunk.type === 'text-delta') text += chunk.text
          else if (chunk.type === 'finish') {
            const reason = chunk.reason
            if (reason && (reason.kind === 'error' || reason.kind === 'aborted') && reason.failure) failure = reason.failure
          }
        }
        if (!text.trim() && failure) {
          return send(res, 200, { ok: false, error: 'AI 生成失败: ' + (failure.message || failure.code || '未知错误') })
        }
        let msg = text.trim().replace(/^["'`]+|["'`]+$/g, '').split(/\r?\n/)[0].trim()
        if (!msg) return send(res, 200, { ok: false, error: 'AI 未能生成提交信息' })
        send(res, 200, { ok: true, message: msg })
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    // 一键修复：push 失败时让 LLM 给出修复命令并安全执行，随后自动重试 push。
    // 入参 {cwd, error}；返回 {ok, explanation, actions:[{git,note,ok,output}], pushRetry:{ok,error}}。
    route('/git-component/autofix', async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = typeof body.cwd === 'string' ? body.cwd : ''
        const root = await resolveRepo(cwd)
        if (root === null) return send(res, 200, { ok: false, error: '当前目录不是 Git 仓库' })
        const llm = ctx.get('llm')
        const modelSvc = ctx.get('agentDefaultModel')
        if (llm === undefined || modelSvc === undefined) {
          return send(res, 200, { ok: false, error: '当前环境不支持 AI 一键修复' })
        }
        const error = typeof body.error === 'string' ? body.error : ''
        // 遵循前端推送目标：target='branch' 时重试推送也走 refs/heads/<branch>
        const afTarget = body.target === 'branch' ? 'branch' : 'main'
        let afBranch = ''
        if (afTarget === 'branch') {
          afBranch = typeof body.branch === 'string' ? body.branch.trim() : ''
          if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(afBranch) || /(^|\/)\.\.(\/|$)/.test(afBranch) || /\.lock(\/|$)/.test(afBranch)) afBranch = ''
        }

        // 当前状态摘要（供 LLM 诊断）：分支 / 上游 / 远端 / 是否已暂存
        const branchR = await runGitRaw(root, ['rev-parse', '--abbrev-ref', 'HEAD'], { timeoutMs: 10000 })
        const branch = ((branchR.stdout && branchR.stdout.text) || '').trim()
        const upR = await runGitRaw(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], { timeoutMs: 10000 })
        const upstream = upR.exitCode === 0 ? ((upR.stdout && upR.stdout.text) || '').trim() : ''
        const remR = await runGitRaw(root, ['remote', '-v'], { timeoutMs: 10000 })
        const remotes = ((remR.stdout && remR.stdout.text) || '').trim()

        const system = '你是一个 git 故障诊断助手。用户推送代码失败，请分析报错并给出修复方案。' +
          '只输出一个 JSON 对象（不要 markdown 代码块，不要多余文字），格式：' +
          '{"explanation":"用中文一句话说明失败原因","actions":[{"git":"git 命令（如 git fetch origin）","note":"这条命令的作用"}]}。' +
          '规则：每条 git 命令必须以 "git " 开头；不得包含引号、管道、重定向、分号、反引号、$() 等 shell 语法；' +
          '不得使用任何破坏性命令（reset --hard、push --force/-f、clean、branch -d/-D、remote remove、checkout -- 、stash drop、filter-branch、gc --prune、rebase、merge、cherry-pick、revert、config --global、update-ref、delete tag、submodule deinit）；' +
          '优先使用 fetch 后再 rebase/merge 之外的温和方式，或配置本地 user.name/user.email（git config user.name "张三" 这类允许，但只能本地）。' +
          '如果问题需要用户手动处理（如认证失败），actions 可以为空数组并在 explanation 中说明。'

        const stateText = '仓库根目录: ' + root + '\n当前分支: ' + (branch || '未知') +
          (upstream ? '\n上游分支: ' + upstream : '\n无上游分支') +
          (remotes ? '\n远端:\n' + remotes : '\n未配置远端') +
          '\npush 报错:\n' + (error || '（无错误文本）')

        const { text, failure } = await llmText(llm, modelSvc, system, stateText, {
          id: 'git-component-autofix',
          temperature: 0.2,
          maxTokens: 2000,
        })
        if (!text && failure) {
          return send(res, 200, { ok: false, error: 'AI 修复失败: ' + (failure.message || failure.code || '未知错误') })
        }

        // 解析 JSON（容忍被 ``` 包裹）
        let clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
        const firstBrace = clean.indexOf('{')
        const lastBrace = clean.lastIndexOf('}')
        if (firstBrace >= 0 && lastBrace > firstBrace) clean = clean.slice(firstBrace, lastBrace + 1)
        let plan = null
        try { plan = JSON.parse(clean) } catch (e) { plan = null }
        if (!plan || !Array.isArray(plan.actions)) {
          return send(res, 200, { ok: false, error: 'AI 未能给出可执行的修复方案（解析失败）: ' + text.slice(0, 300) })
        }

        // 命令安全校验：黑名单 token 检查 + 白名单前缀
        const forbidden = ['--hard', '--force', ' -f', ' clean', 'branch -d', 'branch -D', 'remote remove', 'remote rm', 'checkout --', 'stash drop', 'stash clear', 'filter-branch', 'gc --prune', 'rebase', 'merge', 'cherry-pick', 'revert', 'config --global', 'config --system', 'update-ref', 'push --delete', 'tag -d', 'tag --delete', 'submodule deinit', 'reset --merge', 'rm -r', 'rm -rf']
        const allowedBases = ['git add', 'git commit', 'git fetch', 'git pull', 'git remote', 'git config', 'git branch', 'git push', 'git status', 'git diff', 'git rev-parse', 'git ls-remote', 'git log', 'git show', 'git symbolic-ref', 'git update-index', 'git reset']
        const actions = []
        let blocked = false
        for (const a of (plan.actions || [])) {
          const g = typeof a.git === 'string' ? a.git.trim() : ''
          const note = typeof a.note === 'string' ? a.note : ''
          if (!g) continue
          if (!g.startsWith('git ')) { actions.push({ git: g, note, ok: false, output: '被拦截：命令不是以 git 开头' }); blocked = true; continue }
          if (/["'`;|&><$()]/.test(g)) { actions.push({ git: g, note, ok: false, output: '被拦截：包含 shell 语法字符（引号/管道/重定向/分号等）' }); blocked = true; continue }
          const lower = ' ' + g.toLowerCase() + ' '
          if (forbidden.some((f) => lower.includes(f.toLowerCase()))) { actions.push({ git: g, note, ok: false, output: '被拦截：命令含破坏性参数 ' + forbidden.find((f) => lower.includes(f.toLowerCase())) }); blocked = true; continue }
          if (!allowedBases.some((b) => g.startsWith(b))) { actions.push({ git: g, note, ok: false, output: '被拦截：不允许的命令类别（白名单: add/commit/fetch/pull/remote/config/branch/push/status/diff/rev-parse/ls-remote/log/show/symbolic-ref/update-index/reset）' }); blocked = true; continue }
          const args = g.slice(4).trim().split(/\s+/).filter(Boolean)
          const r = await runGitRaw(root, ['-c', 'core.quotepath=false'].concat(args), { timeoutMs: 60000 })
          const output = ((r.stdout && r.stdout.text || '') + (r.stderr && r.stderr.text || '')).trim()
          actions.push({ git: g, note, ok: r.exitCode === 0, output: output || (r.exitCode === 0 ? '（无输出）' : '（无输出，退出码 ' + r.exitCode + '）') })
        }

        // 修复后自动重试 push（遵循推送目标：分支模式推 refs/heads/<branch>）
        let pushRetry = { ok: false, error: '（未重试）' }
        if (!blocked) {
          let pargs
          if (afTarget === 'branch' && afBranch) {
            pargs = ['push', 'origin', 'HEAD:refs/heads/' + afBranch]
          } else {
            const b2 = await runGitRaw(root, ['rev-parse', '--abbrev-ref', 'HEAD'], { timeoutMs: 10000 })
            const br2 = ((b2.stdout && b2.stdout.text) || '').trim()
            const u2 = await runGitRaw(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], { timeoutMs: 10000 })
            pargs = ['push']
            if (u2.exitCode !== 0 && br2 && br2 !== 'HEAD') {
              const r2 = await runGitRaw(root, ['remote'], { timeoutMs: 10000 })
              const rms = ((r2.stdout && r2.stdout.text) || '').split(/\s+/).filter(Boolean)
              pargs = ['push', '--set-upstream', (rms && rms[0]) || 'origin', br2]
            }
          }
          const pr = await runGitRaw(root, pargs, { timeoutMs: 90000, maxBytes: 512 * 1024 })
          const pout = ((pr.stdout && pr.stdout.text || '') + (pr.stderr && pr.stderr.text || '')).trim()
          setConnState(root, pr.exitCode === 0 ? 'ok' : 'err')
          pushRetry = pr.exitCode === 0 ? { ok: true, output: pout } : { ok: false, error: pout || 'git push 失败' }
        }

        const allOk = actions.every((x) => x.ok) && pushRetry.ok
        send(res, 200, {
          ok: allOk,
          explanation: typeof plan.explanation === 'string' ? plan.explanation : '',
          actions,
          pushRetry,
        })
      } catch (e) { send(res, 500, { ok: false, error: String((e && e.message) || e) }) }
    })

    console.log('[git-component-remx] host plugin active: /git-component/status /git-component/conn /git-component/diff /git-component/commit /git-component/push /git-component/stage /git-component/verify /git-component/automessage /git-component/autofix')
  },
}
