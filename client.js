window.__ModuleLoader__.load({
	id: "dsh-git-component-remx",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		var React = require("react");

		const CSS = `
.dsh-git-componentanel-root, .dsh-git-componentanel-root * { box-sizing: border-box; }
.dsh-git-componentanel-root {
  position: fixed; top: 84px; left: 50%; transform: translateX(-50%); bottom: auto;
  width: 376px; height: calc(50vh - 56px);
  z-index: 2147483647; pointer-events: auto;
  display: flex; flex-direction: column;
  border-radius: 18px;
  /* 背景不透明度由滑块控制（--dsh-git-panel-alpha: 0-100，行内 style 注入）：
     0 = 全透明；100 = 云母磨砂/不透明。backdrop-filter 随 alpha 增强磨砂模糊。 */
  background: color-mix(in srgb, var(--dsw-alias-bg-base, #ffffff) calc(var(--dsh-git-panel-alpha, 88) * 1%), transparent);
  -webkit-backdrop-filter: blur(calc(var(--dsh-git-panel-alpha, 88) * 0.12px)) saturate(1.35);
  backdrop-filter: blur(calc(var(--dsh-git-panel-alpha, 88) * 0.12px)) saturate(1.35);
  color: var(--dsw-alias-label-primary, #16181d);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 18%, transparent);
  box-shadow:
    0 1px 3px -1px color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 35%, #000000) 6%, transparent),
    0 6px 16px -8px color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 35%, #000000) 10%, transparent),
    0 14px 32px -16px color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 35%, #000000) 8%, transparent);
  overflow: hidden;
  font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  animation: dsh-git-componentanel-in 0.22s cubic-bezier(0.21, 1.02, 0.73, 1);
}
@keyframes dsh-git-componentanel-in {
  from { opacity: 0; transform: translateX(16px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
.dsh-git-componentanel-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent);
  background: transparent;
  cursor: grab; user-select: none;
}
.dsh-git-componentanel-header:active { cursor: grabbing; }
.dsh-git-componentanel-header .dsh-git-componentanel-icobtn { cursor: pointer; }
.dsh-git-componentanel-header .dsh-git-componentanel-branch { cursor: default; }
.dsh-git-componentanel-logo {
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--dsw-alias-brand-primary, #2563eb);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 20%, transparent);
  border-radius: 8px; padding: 3px 6px;
}
.dsh-git-componentanel-branch {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: 12px; color: var(--dsw-alias-label-secondary, #5b6472);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 10%, transparent);
  border-radius: 999px; padding: 2px 10px;
  max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  cursor: pointer; user-select: none;
  transition: border-color 0.12s ease, background 0.12s ease;
}
.dsh-git-componentanel-branch:hover { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 45%, transparent); }
.dsh-git-componentanel-branch.active {
  color: var(--dsw-alias-label-primary, #16181d);
  border-color: var(--dsw-alias-brand-primary, #2563eb);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 16%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 30%, transparent);
}
/* 激活胶囊内的状态灯描白边，让"环"跟随激活态 */
.dsh-git-componentanel-branch.active .dsh-git-componentanel-dot { outline: 2px solid rgba(255, 255, 255, 0.85); outline-offset: 1px; }
.dsh-git-componentanel-branch .dsh-git-componentanel-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-state-success-primary, #16a34a); flex: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary, #16a34a) 18%, transparent); }
.dsh-git-componentanel-branch .dsh-git-componentanel-dot.conn-ok { background: var(--dsw-alias-state-success-primary, #16a34a); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary, #16a34a) 18%, transparent); }
.dsh-git-componentanel-branch .dsh-git-componentanel-dot.conn-err { background: var(--dsw-alias-state-error-primary, #dc2626); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 18%, transparent); }
.dsh-git-componentanel-branch .dsh-git-componentanel-dot.conn-idle { background: var(--dsw-alias-label-tertiary, #8b9ac4); box-shadow: none; }
.dsh-git-componentanel-branch .dsh-git-componentanel-dot.conn-dirty { background: var(--dsw-alias-state-warning-primary, #f59e0b); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-warning-primary, #f59e0b) 18%, transparent); }
/* 推送中：唯一指示灯变蓝并脉冲（合并原 pushdot，胶囊内只留一个圈） */
.dsh-git-componentanel-branch .dsh-git-componentanel-dot.conn-push { background: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); animation: dsh-git-componentanel-pulse 0.8s ease-in-out infinite; }
@keyframes dsh-git-componentanel-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
/* 分支名内联编辑条（window.prompt 在 sandbox iframe 被禁，改用面板内输入） */
.dsh-git-componentanel-branch-edit { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent); }
.dsh-git-componentanel-branch-edit-label { font-size: 11px; color: var(--dsw-alias-label-secondary, #5b6472); flex: none; }
.dsh-git-componentanel-branch-edit-input {
  flex: 1; min-width: 0; font-size: 12px; font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  padding: 3px 7px; border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 16%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 6%, transparent);
  color: var(--dsw-alias-label-primary, #16181d); outline: none;
}
.dsh-git-componentanel-branch-edit-input:focus { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 60%, transparent); }
.dsh-git-componentanel-branch-edit .dsh-git-componentanel-btn { font-size: 12px; padding: 3px 9px; flex: none; }
.dsh-git-componentanel-icobtn {
  border: none; background: transparent; color: var(--dsw-alias-label-secondary, #5b6472);
  width: 26px; height: 26px; border-radius: 8px; cursor: pointer; font-size: 14px; line-height: 1;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.12s ease, color 0.12s ease;
}
.dsh-git-componentanel-icobtn:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent); color: var(--dsw-alias-label-primary, #16181d); }
.dsh-git-componentanel-icobtn.loading { animation: dsh-git-componentanel-spin 0.9s linear infinite; }
@keyframes dsh-git-componentanel-spin { to { transform: rotate(360deg); } }
.dsh-git-componentanel-icobtn:disabled { opacity: 0.45; cursor: default; }
.dsh-git-componentanel-body {
  flex: 1; overflow-y: auto; padding: 8px 10px 10px;
  display: flex; flex-direction: column; gap: 10px;
}
.dsh-git-componentanel-body::-webkit-scrollbar { width: 8px; }
.dsh-git-componentanel-body::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 16%, transparent);
  border-radius: 8px; border: 2px solid transparent; background-clip: content-box;
}
.dsh-git-componentanel-section-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--dsw-alias-label-secondary, #5b6472);
  margin: 2px 2px 4px;
}
.dsh-git-componentanel-section-title .dsh-git-componentanel-count {
  font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 700; font-size: 10px;
  color: var(--dsw-alias-label-secondary, #5b6472);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 6%, transparent);
  border-radius: 999px; padding: 0 6px;
}
.dsh-git-componentanel-row {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 6px; border-radius: 9px; cursor: pointer;
  transition: background 0.1s ease;
  min-width: 0;
}
.dsh-git-componentanel-row:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 6%, transparent); }
.dsh-git-componentanel-row.active { background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 9%, transparent); }
.dsh-git-componentanel-badge {
  flex: none; width: 20px; height: 20px; border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
  font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 11px; font-weight: 700;
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 7%, transparent);
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsh-git-componentanel-badge.staged {
  color: var(--dsw-alias-state-success-primary, #16a34a);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #16a34a) 13%, transparent);
}
.dsh-git-componentanel-badge.unstaged {
  color: var(--dsw-alias-state-warn-primary, #d97706);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #d97706) 13%, transparent);
}
.dsh-git-componentanel-path {
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: 12px; color: var(--dsw-alias-label-primary, #16181d);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0;
}
.dsh-git-componentanel-path .dsh-git-componentanel-old { color: var(--dsw-alias-label-secondary, #5b6472); text-decoration: line-through; }
.dsh-git-componentanel-caret { color: var(--dsw-alias-label-secondary, #5b6472); font-size: 10px; flex: none; transition: transform 0.15s ease; }
.dsh-git-componentanel-row.open .dsh-git-componentanel-caret { transform: rotate(90deg); }
.dsh-git-componentanel-diff {
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 10%, transparent);
  border-radius: 12px; overflow: hidden;
  /* flex 压缩陷阱：body 是 flex column，overflow 非 visible 的 flex 子项
     min-height:auto 解析为 0，空间不足时会被压扁并裁掉内容；
     禁止收缩，高度由内容决定，滚动交给 body。 */
  flex: none;
  background: transparent;
}
.dsh-git-componentanel-diff-head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 6px 10px; font-size: 11px; color: var(--dsw-alias-label-secondary, #5b6472);
  font-family: ui-monospace, Menlo, Consolas, monospace;
  border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent);
  background: transparent;
}
.dsh-git-componentanel-diff-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-git-componentanel-diff-pre {
  margin: 0; padding: 8px 0; max-height: 190px; overflow: auto;
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: 11.5px; line-height: 1.55; tab-size: 4;
}
.dsh-git-componentanel-diff-pre::-webkit-scrollbar { width: 8px; height: 8px; }
.dsh-git-componentanel-diff-pre::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 16%, transparent); border-radius: 8px; }
.dsh-git-componentanel-dl { display: block; padding: 0 10px; white-space: pre; color: var(--dsw-alias-label-primary, #16181d); }
.dsh-git-componentanel-dl.add { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #16a34a) 11%, transparent); color: var(--dsw-alias-state-success-primary, #16a34a); }
.dsh-git-componentanel-dl.del { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 11%, transparent); color: var(--dsw-alias-state-error-primary, #dc2626); }
.dsh-git-componentanel-dl.hunk { color: var(--dsw-alias-brand-primary, #2563eb); background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 4%, transparent); }
.dsh-git-componentanel-dl.meta { color: var(--dsw-alias-label-secondary, #5b6472); font-style: italic; }
.dsh-git-componentanel-empty {
  text-align: center; color: var(--dsw-alias-label-secondary, #5b6472);
  padding: 26px 12px; font-size: 12.5px;
}
.dsh-git-componentanel-empty .dsh-git-componentanel-big { font-size: 22px; margin-bottom: 6px; }
.dsh-git-componentanel-errorbox {
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 32%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 9%, transparent);
  color: var(--dsw-alias-state-error-primary, #dc2626);
  border-radius: 12px; padding: 10px 12px; font-size: 12px; line-height: 1.5;
  word-break: break-word;
}
.dsh-git-componentanel-commit {
  border-top: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent);
  padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 8px;
  background: transparent;
}
.dsh-git-componentanel-textarea {
  width: 100%; resize: none; min-height: 56px; max-height: 120px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 12%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base, #ffffff) 60%, transparent);
  backdrop-filter: blur(12px);
  color: var(--dsw-alias-label-primary, #16181d);
  padding: 8px 11px; font: 12.5px/1.5 inherit; outline: none;
  transition: border-color 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.dsh-git-componentanel-textarea:focus {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 70%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 20%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-bg-base, #ffffff) 70%, transparent);
}
.dsh-git-componentanel-textarea::placeholder { color: var(--dsw-alias-label-secondary, #5b6472); }
.dsh-git-componentanel-btns { display: flex; gap: 8px; }
.dsh-git-componentanel-btn {
  flex: 1; min-height: 34px; border-radius: 11px; border: 1px solid transparent; cursor: pointer;
  padding: 6px 10px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.02em;
  display: inline-flex; align-items: center; justify-content: center;
  transition: filter 0.12s ease, background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}
.dsh-git-componentanel-btn:disabled { opacity: 0.45; cursor: default; }
.dsh-git-componentanel-btn.primary {
  background: linear-gradient(180deg, #3b82f6, #1d4ed8);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 4px 14px -6px rgba(29, 78, 216, 0.55);
}
.dsh-git-componentanel-btn.primary:not(:disabled):hover { filter: brightness(1.08); }
.dsh-git-componentanel-btn.primary:not(:disabled):active { filter: brightness(0.94); }
.dsh-git-componentanel-btn.outline {
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 10%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 22%, transparent);
  color: var(--dsw-alias-label-primary, #16181d);
}
.dsh-git-componentanel-btn.outline:not(:disabled):hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: color-mix(in srgb, #3b82f6 12%, transparent);
}
.dsh-git-componentanel-btn.outline:not(:disabled):active { filter: brightness(0.94); }
.dsh-git-componentanel-footer { display: flex; align-items: center; gap: 8px; min-height: 22px; }
.dsh-git-componentanel-push {
  flex: none; border: none; background: transparent; cursor: pointer;
  color: var(--dsw-alias-label-secondary, #5b6472); font-size: 12px; font-weight: 600;
  padding: 2px 4px; border-radius: 6px;
}
.dsh-git-componentanel-push:hover { color: var(--dsw-alias-brand-primary, #2563eb); }
.dsh-git-componentanel-push:disabled { opacity: 0.5; cursor: default; }
.dsh-git-componentanel-notice { flex: 1; font-size: 12px; line-height: 1.45; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-git-componentanel-notice.ok { color: var(--dsw-alias-state-success-primary, #16a34a); }
.dsh-git-componentanel-notice.err { color: var(--dsw-alias-state-error-primary, #dc2626); }
.dsh-git-componentanel-notice.info { color: var(--dsw-alias-label-secondary, #5b6472); }
.dsh-git-componentanel-root.collapsed {
  top: 80px; bottom: auto; left: 50%; right: auto;
  transform: translateX(-50%);
  width: 44px; height: 44px;
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  animation: none; cursor: pointer;
  align-items: center; justify-content: center;
  padding: 0;
}
.dsh-git-componentanel-tab-icon {
  display: inline-flex;
  color: var(--dsw-alias-label-secondary, #5b6472);
  transition: color 0.12s ease, transform 0.12s ease;
}
.dsh-git-componentanel-root.collapsed:hover .dsh-git-componentanel-tab-icon { color: var(--dsw-alias-brand-primary, #2563eb); transform: scale(1.1); }
.dsh-git-componentanel-diff-head { gap: 2px; }
.dsh-git-componentanel-diff-head .dsh-git-componentanel-icobtn { width: 22px; height: 22px; font-size: 12px; flex: none; }
.dsh-git-componentanel-hunk-head {
  display: flex; align-items: center; gap: 6px;
  padding: 3px 10px; cursor: pointer; user-select: none;
  font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 11.5px;
  color: var(--dsw-alias-brand-primary, #2563eb);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 4%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent);
}
.dsh-git-componentanel-hunk-head:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent); }
.dsh-git-componentanel-hunk-caret { font-size: 9px; flex: none; }
.dsh-git-componentanel-hunk-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-git-componentanel-diff-split { display: flex; flex-direction: column; }
.dsh-git-componentanel-split-cols { display: flex; border-top: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent); }
.dsh-git-componentanel-split-col { flex: 1; min-width: 0; max-height: 260px; overflow: auto; }
.dsh-git-componentanel-split-col + .dsh-git-componentanel-split-col { border-left: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 10%, transparent); }
.dsh-git-componentanel-split-line {
  display: flex; font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: 11.5px; line-height: 1.55; white-space: pre;
}
.dsh-git-componentanel-lineno {
  flex: none; width: 34px; text-align: right; padding: 0 8px 0 4px;
  color: var(--dsw-alias-label-secondary, #5b6472);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 3%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 6%, transparent);
  user-select: none;
}
.dsh-git-componentanel-linebody { flex: 1; min-width: 0; padding: 0 8px; overflow: hidden; text-overflow: ellipsis; }
.dsh-git-componentanel-split-line.add { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #16a34a) 11%, transparent); }
.dsh-git-componentanel-split-line.del { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 11%, transparent); }
.dsh-git-componentanel-split-line.empty { background: transparent; }
.dsh-git-componentanel-split-line.meta { color: var(--dsw-alias-label-secondary, #5b6472); font-style: italic; }
.dsh-git-componentanel-tok.comment { color: var(--dsw-alias-label-secondary, #5b6472); font-style: italic; }
.dsh-git-componentanel-tok.string { color: #0f9d58; }
.dsh-git-componentanel-tok.keyword { color: #1a56db; font-weight: 600; }
.dsh-git-componentanel-tok.number { color: #b45309; }
body[data-ds-dark-theme] .dsh-git-componentanel-tok.string { color: #4ade80; }
body[data-ds-dark-theme] .dsh-git-componentanel-tok.keyword { color: #7aa2f7; }
body[data-ds-dark-theme] .dsh-git-componentanel-tok.number { color: #fbbf24; }
.dsh-git-componentanel-settings { display: flex; flex-direction: column; gap: 8px; }
.dsh-git-componentanel-settings-title { font-size: 15px; font-weight: 700; margin: 0; }
.dsh-git-componentanel-settings-row { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.dsh-git-componentanel-settings-desc { font-size: 12px; color: var(--dsw-alias-label-secondary, #5b6472); margin: 0; line-height: 18px; }
.dsh-git-componentanel-settings-range { display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }
.dsh-git-componentanel-settings-range-head { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
.dsh-git-componentanel-settings-range-val { font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace; font-size: 12px; color: var(--dsw-alias-label-secondary, #5b6472); }
.dsh-git-componentanel-settings-range input[type="range"] { width: 100%; accent-color: var(--dsw-alias-brand-primary, #2563eb); cursor: pointer; }
.dsh-git-componentanel-verify { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; flex: 1; min-height: 0; }
.dsh-git-componentanel-verify-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dsh-git-componentanel-verify-summary { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-primary, #16181d); }
.dsh-git-componentanel-verify-list { display: flex; flex-direction: column; gap: 6px; flex: 1; min-height: 0; overflow-y: auto; padding-right: 2px; }
.dsh-git-componentanel-verify-check { border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 12%, transparent); border-radius: 8px; padding: 6px 8px; background: color-mix(in srgb, var(--dsw-alias-bg-base, #ffffff) 60%, transparent); }
.dsh-git-componentanel-verify-check.ok { border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #16a34a) 40%, transparent); }
.dsh-git-componentanel-verify-check.err { border-color: color-mix(in srgb, var(--dsw-alias-state-danger-primary, #dc2626) 45%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-danger-primary, #dc2626) 6%, transparent); }
.dsh-git-componentanel-verify-name { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-primary, #16181d); }
.dsh-git-componentanel-verify-check.err .dsh-git-componentanel-verify-name { color: var(--dsw-alias-state-danger-primary, #dc2626); }
.dsh-git-componentanel-verify-detail { font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace; font-size: 11px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-secondary, #5b6472); margin: 4px 0 0; max-height: 140px; overflow-y: auto; }
.dsh-git-componentanel-verify-check.err .dsh-git-componentanel-verify-detail { color: var(--dsw-alias-state-danger-primary, #dc2626); }
.dsh-git-componentanel-root.missing { width: 360px; height: auto; min-height: 0; }
.dsh-git-componentanel-missing { display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; }
.dsh-git-componentanel-missing-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dsh-git-componentanel-missing-title { font-size: 14px; font-weight: 700; color: var(--dsw-alias-label-primary, #16181d); }
.dsh-git-componentanel-missing-desc { font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary, #5b6472); margin: 0; }
.dsh-git-componentanel-missing-cmd { font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace; font-size: 11px; line-height: 1.6; white-space: pre-wrap; word-break: break-all; margin: 0; padding: 8px 10px; border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 14%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-bg-base, #ffffff) 70%, transparent); color: var(--dsw-alias-label-primary, #16181d); }
.dsh-git-componentanel-missing-btns { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dsh-git-componentanel-missing-link { text-decoration: none; display: inline-flex; align-items: center; }
.dsh-git-componentanel-missing-hint { font-size: 11px; color: var(--dsw-alias-label-tertiary, #8b9ac4); margin: 0; }
.dsh-git-componentanel-missing-mini { display: grid; place-items: center; width: 100%; height: 100%; font-size: 18px; color: var(--dsw-alias-state-warning-primary, #f59e0b); cursor: pointer; }
`;

		function injectCss(css) {
			const style = document.createElement("style");
			style.textContent = css;
			document.head.appendChild(style);
			return () => style.remove();
		}

		const h = React.createElement;

		const BranchIcon = (props) => h("svg", Object.assign({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, props),
			h("line", { x1: "6", x2: "6", y1: "3", y2: "15" }),
			h("circle", { cx: "18", cy: "6", r: "3" }),
			h("circle", { cx: "6", cy: "18", r: "3" }),
			h("path", { d: "M18 9a9 9 0 0 1-9 9" }),
		);

		const call = async (path, body) => {
			const opt = body === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
			const r = await fetch(path, opt);
			return r.json();
		};

		// ---- settings 开关（仿 dsh-drop-in 模式）：settingsScope.bind({namespace}) 返回
		// controller（getSnapshot/subscribe/set）。namespace 由 host 半 index.js 注册。
		// 双保险：settingsScope 不可用（host 半未重启、namespace 未注册）时回退 localStorage，
		// 保证开关「实时保存」跨刷新保持。
		// 【读取主次】localStorage 为主通道（用户最后设置值优先、即写即读），settingsScope
		// 快照仅作初始来源。原因：git-component 不在 dsh-host-apiproxy 的
		// WEB_SETTINGS_NAMESPACES 白名单，settingsScope 快照 status=unavailable/writable=false，
		// set 会被拒、快照永不更新；若读优先快照，滑块/开关会被弹回旧值。
		// 【同窗口通知】localStorage.setItem 不会触发本窗口的 storage 事件（仅跨标签页），
		// settingsScope 不可写也不发通知，故用本地订阅总线（enabledListeners/opacityListeners）
		// 在 set 后主动通知所有订阅者 → useSyncExternalStore 即时重渲染（实时渲染）。
		const LS_ENABLED_KEY = "dsh-git-component-enabled";
		const LS_POS_KEY = "dsh-git-component-pos";
		const enabledListeners = new Set();
		const opacityListeners = new Set();
		let settingsScope = null;
		function bindSettingsScope(ctx) {
			try {
				if (ctx && ctx.settingsScope && typeof ctx.settingsScope.bind === "function") {
					settingsScope = ctx.settingsScope.bind({ namespace: "git-component" });
				} else if (ctx && ctx.get && typeof ctx.get === "function") {
					const s = ctx.get("settingsScope");
					if (s && typeof s.bind === "function") settingsScope = s.bind({ namespace: "git-component" });
				}
			} catch (e) { settingsScope = null; }
		}
		function scopeValue() {
			try {
				if (settingsScope && typeof settingsScope.getSnapshot === "function") {
					const snap = settingsScope.getSnapshot();
					const value = snap && snap.value;
					if (value !== undefined && value !== null) return value;
				}
			} catch (e) {}
			return null;
		}
		function isEnabled() {
			try {
				const raw = localStorage.getItem(LS_ENABLED_KEY);
				if (raw !== null) return raw !== "0";
			} catch (e) {}
			const value = scopeValue();
			if (value !== null) return value.enabled !== false;
			return true;
		}
		function subscribeEnabled(fn) {
			enabledListeners.add(fn);
			let unsub = () => {};
			try {
				if (settingsScope && typeof settingsScope.subscribe === "function") {
					unsub = settingsScope.subscribe(fn);
				}
			} catch (e) {}
			const onStorage = () => { try { fn(); } catch (e) {} };
			try { window.addEventListener("storage", onStorage); } catch (e) {}
			return () => {
				enabledListeners.delete(fn);
				try { unsub(); } catch (e) {}
				try { window.removeEventListener("storage", onStorage); } catch (e) {}
			};
		}
		function setEnabled(next) {
			try { localStorage.setItem(LS_ENABLED_KEY, next ? "1" : "0"); } catch (e) {}
			try {
				if (settingsScope && typeof settingsScope.set === "function") {
					Promise.resolve(settingsScope.set("enabled", next)).catch(() => {});
				}
			} catch (e) {}
			enabledListeners.forEach((fn) => { try { fn(); } catch (e) {} });
		}
		// ---- 面板背景不透明度（0-100）：localStorage 主通道优先，settingsScope 快照兜底，默认 88。 ----
		const LS_OPACITY_KEY = "dsh-git-component-opacity";
		const DEFAULT_OPACITY = 88;
		function getOpacity() {
			try {
				const raw = localStorage.getItem(LS_OPACITY_KEY);
				if (raw !== null) {
					const n = parseInt(raw, 10);
					if (!isNaN(n)) return Math.min(100, Math.max(0, n));
				}
			} catch (e) {}
			const value = scopeValue();
			if (value !== null && typeof value.opacity === "number" && isFinite(value.opacity)) {
				return Math.min(100, Math.max(0, Math.round(value.opacity)));
			}
			return DEFAULT_OPACITY;
		}
		function subscribeOpacity(fn) {
			opacityListeners.add(fn);
			let unsub = () => {};
			try {
				if (settingsScope && typeof settingsScope.subscribe === "function") {
					unsub = settingsScope.subscribe(fn);
				}
			} catch (e) {}
			const onStorage = () => { try { fn(); } catch (e) {} };
			try { window.addEventListener("storage", onStorage); } catch (e) {}
			return () => {
				opacityListeners.delete(fn);
				try { unsub(); } catch (e) {}
				try { window.removeEventListener("storage", onStorage); } catch (e) {}
			};
		}
		function setOpacity(next) {
			const n = Math.min(100, Math.max(0, Math.round(Number(next) || 0)));
			try { localStorage.setItem(LS_OPACITY_KEY, String(n)); } catch (e) {}
			try {
				if (settingsScope && typeof settingsScope.set === "function") {
					Promise.resolve(settingsScope.set("opacity", n)).catch(() => {});
				}
			} catch (e) {}
			opacityListeners.forEach((fn) => { try { fn(); } catch (e) {} });
			return n;
		}
		function loadPos() {
			try {
				const raw = localStorage.getItem(LS_POS_KEY);
				if (raw) {
					const p = JSON.parse(raw);
					if (typeof p.left === "number" && typeof p.top === "number") return p;
				}
			} catch (e) {}
			return null;
		}
		function savePos(pos) {
			try {
				if (pos) localStorage.setItem(LS_POS_KEY, JSON.stringify(pos));
				else localStorage.removeItem(LS_POS_KEY);
			} catch (e) {}
		}

		// ---- 推送目标：main 或 分支（点击切换，localStorage 持久化；默认 main）----
		const LS_TARGET_KEY = "dsh-git-component-target";
		const LS_BRANCH_KEY = "dsh-git-component-branch";
		function loadTarget() {
			try { return localStorage.getItem(LS_TARGET_KEY) === "branch" ? "branch" : "main"; } catch (e) { return "main"; }
		}
		function loadBranchName() {
			try { return localStorage.getItem(LS_BRANCH_KEY) || ""; } catch (e) { return ""; }
		}
		function saveTarget(t) {
			try { localStorage.setItem(LS_TARGET_KEY, t); } catch (e) {}
		}
		function saveBranchName(b) {
			try {
				if (b) localStorage.setItem(LS_BRANCH_KEY, b);
				else localStorage.removeItem(LS_BRANCH_KEY);
			} catch (e) {}
		}
		// 分支名合法性（与 host 校验一致：字母数字开头，允许 . _ / -，禁 .. 与 .lock）
		function branchNameValid(b) {
			return /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(b) && !/(^|\/)\.\.(\/|$)/.test(b) && !/\.lock(\/|$)/.test(b);
		}
		function defaultBranchName() {
			const d = new Date();
			const mm = String(d.getMonth() + 1).padStart(2, "0");
			const dd = String(d.getDate()).padStart(2, "0");
			return "feature-" + mm + dd;
		}

		// ---- diff helpers: begin ----
		const LANG_BY_EXT = {
			js: "js", mjs: "js", cjs: "js", jsx: "jsx", ts: "ts", tsx: "tsx",
			json: "json", html: "html", htm: "html", xml: "xml", svg: "xml",
			css: "css", scss: "scss", md: "md", markdown: "md",
			py: "py", rs: "rs", go: "go", java: "java", c: "c", h: "c",
			cpp: "cpp", hpp: "cpp", cc: "cpp", sh: "sh", bash: "sh", zsh: "sh",
			yml: "yml", yaml: "yml", toml: "toml", sql: "sql", vue: "jsx", svelte: "jsx"
		};
		const langOf = (path) => {
			const m = /\.([A-Za-z0-9]+)$/.exec(String(path || ""));
			return m ? LANG_BY_EXT[m[1].toLowerCase()] || null : null;
		};
		const JS_WORDS = "break case catch class const continue debugger default delete do else export extends false finally for from function get if import in instanceof let new null of return set static super switch this throw true try typeof undefined var void while with yield async await";
		const TS_WORDS = JS_WORDS + " interface type enum namespace declare readonly abstract implements private protected public any unknown never string number boolean";
		const LANG_SPECS = {
			js: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'", "`"], words: JS_WORDS },
			jsx: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'", "`"], words: JS_WORDS },
			ts: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'", "`"], words: TS_WORDS },
			tsx: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'", "`"], words: TS_WORDS },
			json: { line: [], block: [], strings: ['"'], words: "true false null" },
			html: { line: [], block: ["<!--", "-->"], strings: ['"', "'"], words: "" },
			xml: { line: [], block: ["<!--", "-->"], strings: ['"', "'"], words: "" },
			css: { line: [], block: ["/*", "*/"], strings: ['"', "'"], words: "important inherit initial unset" },
			scss: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'"], words: "important inherit initial unset" },
			md: { line: [], block: ["<!--", "-->"], strings: [], words: "" },
			py: { line: ["#"], block: [], strings: ["'''", '"""', "'", '"'], words: "and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield" },
			rs: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'"], words: "as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while" },
			go: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'", "`"], words: "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var" },
			java: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'"], words: "abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null" },
			c: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'"], words: "auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while" },
			cpp: { line: ["//"], block: ["/*", "*/"], strings: ['"', "'"], words: "auto break case char class const continue default delete do double else enum extern false float for friend goto if inline int long namespace new nullptr operator private protected public register return short signed sizeof static struct switch template this throw true try typedef typename union unsigned using virtual void volatile while" },
			sh: { line: ["#"], block: [], strings: ['"', "'"], words: "if then else elif fi for while do done case esac function in return local export readonly unset set shift source echo exit" },
			yml: { line: ["#"], block: [], strings: ['"', "'"], words: "true false null yes no on off" },
			toml: { line: ["#"], block: [], strings: ['"', "'", '"""'], words: "true false" },
			sql: { line: ["--"], block: ["/*", "*/"], strings: ["'", '"'], words: "select from where insert into values update delete create table index view alter drop add column primary key foreign references join inner left right full outer on as and or not null distinct group by order having limit offset union all case when then else end exists in like between is" }
		};
		/** Tokenize one diff line into [{text, cls}] for syntax highlighting. */
		function tokenizeLine(text, lang) {
			const spec = LANG_SPECS[lang];
			if (spec === void 0) return [{ text: text, cls: "plain" }];
			const out = [];
			let pos = 0;
			while (pos < text.length) {
				const rest = text.slice(pos);
				const lineComment = spec.line.length > 0 ? rest.indexOf(spec.line[0]) : -1;
				const blockStart = spec.block.length > 0 ? rest.indexOf(spec.block[0]) : -1;
				let strAt = -1;
				let strChar = "";
				for (const ch of spec.strings) {
					const at = rest.indexOf(ch);
					if (at !== -1 && (strAt === -1 || at < strAt)) { strAt = at; strChar = ch; }
				}
				const cands = [];
				if (lineComment !== -1) cands.push({ at: lineComment, kind: "line" });
				if (blockStart !== -1) cands.push({ at: blockStart, kind: "block" });
				if (strAt !== -1) cands.push({ at: strAt, kind: "string" });
				if (cands.length === 0) {
					pushTokens(out, rest, spec.words);
					break;
				}
				cands.sort((a, b) => a.at - b.at);
				const next = cands[0];
				if (next.at > 0) pushTokens(out, rest.slice(0, next.at), spec.words);
				if (next.kind === "line") {
					out.push({ text: rest.slice(next.at), cls: "comment" });
					break;
				}
				if (next.kind === "block") {
					const end = rest.indexOf(spec.block[1], next.at + spec.block[0].length);
					if (end === -1) { out.push({ text: rest.slice(next.at), cls: "comment" }); break; }
					out.push({ text: rest.slice(next.at, end + spec.block[1].length), cls: "comment" });
					pos += next.at + (end - next.at) + spec.block[1].length;
					continue;
				}
				let j = next.at + strChar.length;
				while (j < rest.length) {
					if (rest[j] === "\\") { j += 2; continue; }
					if (rest.slice(j, j + strChar.length) === strChar) break;
					j++;
				}
				const end = j < rest.length ? j + strChar.length : rest.length;
				out.push({ text: rest.slice(next.at, end), cls: "string" });
				pos += next.at + (end - next.at);
			}
			if (out.length === 0) out.push({ text: text, cls: "plain" });
			return out;
		}
		/** Push keyword/number/plain tokens for a non-comment/non-string slice. */
		function pushTokens(out, text, words) {
			const wordRe = words.length > 0 ? "\\b(?:" + words.split(" ").join("|") + ")\\b" : "";
			const re = new RegExp(wordRe + (wordRe ? "|" : "") + "\\b\\d[\\d_]*(?:\\.[\\d_]+)?(?:[eE][+-]?\\d+)?\\b", "g");
			let last = 0;
			let m;
			while ((m = re.exec(text)) !== null) {
				if (m.index > last) out.push({ text: text.slice(last, m.index), cls: "plain" });
				// \b 边界已由正则保证；按首字符区分数字与关键字
				out.push({ text: m[0], cls: /^\d/.test(m[0]) ? "number" : "keyword" });
				last = m.index + m[0].length;
			}
			if (last < text.length) out.push({ text: text.slice(last), cls: "plain" });
		}
		/** Parse unified diff text into headers + hunks (line-capped). */
		function parseUnifiedDiff(text, maxLines) {
			const headers = [];
			const hunks = [];
			const lines = String(text || "").split("\n");
			let cur = null;
			let total = 0;
			for (const ln of lines) {
				const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(ln);
				if (m) {
					if (total >= maxLines) { cur = null; continue; }
					cur = { oldStart: Number(m[1]), oldCount: Number(m[2] || 1), newStart: Number(m[3]), newCount: Number(m[4] || 1), lines: [] };
					hunks.push(cur);
					continue;
				}
				if (cur === null) {
					if (ln.startsWith("diff ") || ln.startsWith("index ") || ln.startsWith("---") || ln.startsWith("+++") || ln.startsWith("new file") || ln.startsWith("deleted file") || ln.startsWith("similarity") || ln.startsWith("rename")) headers.push(ln);
					continue;
				}
				if (total >= maxLines) { cur = null; continue; }
				total++;
				if (ln.startsWith("+")) cur.lines.push({ kind: "add", text: ln.slice(1) });
				else if (ln.startsWith("-")) cur.lines.push({ kind: "del", text: ln.slice(1) });
				else if (ln.startsWith("\\")) cur.lines.push({ kind: "meta", text: ln });
				else cur.lines.push({ kind: "ctx", text: ln });
			}
			return { headers: headers, hunks: hunks, truncated: total >= maxLines };
		}
		/** Align one hunk's lines into left/right pairs for side-by-side view. */
		function sideBySidePairs(hunk) {
			const pairs = [];
			for (const ln of hunk.lines) {
				if (ln.kind === "del") pairs.push({ left: ln.text, right: null, kind: "del" });
				else if (ln.kind === "add") pairs.push({ left: null, right: ln.text, kind: "add" });
				else pairs.push({ left: ln.text, right: ln.text, kind: ln.kind });
			}
			return pairs;
		}
		// ---- diff helpers: end ----

		const GitPanel = (props) => {
			const items = props.useWorkspaces((s) => s.items);
			const recentId = props.useWorkspaces((s) => s.recentWorkspaceId);
			const sessionsById = props.useSessions((s) => s.byId);
			const currentId = props.useSessions((s) => s.current);

			const [status, setStatus] = React.useState(null);
			const [error, setError] = React.useState(null);
			const [loading, setLoading] = React.useState(true);
			const [collapsed, setCollapsed] = React.useState(false);
			const [busy, setBusy] = React.useState(null);
			const [message, setMessage] = React.useState("");
			const [diff, setDiff] = React.useState(null);
			const [splitView, setSplitView] = React.useState(false);
			const [folded, setFolded] = React.useState({});
			const [notice, setNotice] = React.useState(null);
			const [verify, setVerify] = React.useState(null); // null=普通视图；{running,summary,checks}=验证结果
			const alive = React.useRef(true);

			// 推送目标：'main'（推当前分支上游）或 'branch'（推 origin refs/heads/<branchName>）。
			// localStorage 持久化：切到分支后，重新推送与提交并推送都走分支，直到手动切回 main。
			const [target, setTarget] = React.useState(loadTarget);
			const [branchName, setBranchName] = React.useState(loadBranchName);
			// 分支胶囊的连接状态（绿/红/灰）由 /git-component/conn?branch=xxx 探测，15s 轮询随 refresh 更新。
			const [branchConn, setBranchConn] = React.useState("idle");
			const branchNameRef = React.useRef(branchName);
			branchNameRef.current = branchName;
			const [branchEdit, setBranchEdit] = React.useState(false);
			const [branchInput, setBranchInput] = React.useState("");
			const switchTarget = (t) => { setTarget(t); saveTarget(t); };
			const setBranch = (name) => { setBranchName(name); saveBranchName(name); };

			// 设置开关（enabled）：关闭时不渲染面板。用 useSyncExternalStore 订阅
			// settingsScope 快照变化，host 半 settings 值变更（设置页开关）即时生效。
			const enabled = React.useSyncExternalStore(subscribeEnabled, isEnabled, isEnabled);

			// 面板背景不透明度（0-100，settingsScope + localStorage 双通道）。
			const opacity = React.useSyncExternalStore(subscribeOpacity, getOpacity, getOpacity);

			// 面板位置：可拖拽（pointer 事件），拖拽结束实时写 localStorage；
			// null 表示未拖过 → 使用 CSS 默认（水平居中 top:84px）。
			const [pos, setPos] = React.useState(loadPos);
			const posRef = React.useRef(pos);
			const dragRef = React.useRef(null);
			const applyPos = React.useCallback((p) => {
				posRef.current = p;
				setPos(p);
				savePos(p);
			}, []);
			const onPointerMove = React.useCallback((e) => {
				const d = dragRef.current;
				if (!d) return;
				const dx = e.clientX - d.startX;
				const dy = e.clientY - d.startY;
				if (!d.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
				d.moved = true;
				applyPos({ left: Math.max(0, Math.round(d.left + dx)), top: Math.max(0, Math.round(d.top + dy)) });
			}, [applyPos]);
			const onPointerUp = React.useCallback(() => {
				dragRef.current = null;
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", onPointerUp);
				window.removeEventListener("pointercancel", onPointerUp);
			}, [onPointerMove]);
			const startDrag = React.useCallback((e) => {
				if (e.button !== 0) return;
				const t = e.target;
				if (t && t.closest && (t.closest("button") || t.closest("textarea") || t.closest("input") || t.closest("a") || t.closest(".dsh-git-componentanel-branch"))) return;
				const root = e.currentTarget.closest ? e.currentTarget.closest(".dsh-git-componentanel-root") : null;
				const rect = (root || e.currentTarget).getBoundingClientRect();
				dragRef.current = { startX: e.clientX, startY: e.clientY, left: rect.left, top: rect.top, moved: false };
				try { if (root && root.setPointerCapture) root.setPointerCapture(e.pointerId); } catch (err) {}
				window.addEventListener("pointermove", onPointerMove);
				window.addEventListener("pointerup", onPointerUp);
				window.addEventListener("pointercancel", onPointerUp);
			}, [onPointerMove, onPointerUp]);

			const currentSession = currentId ? sessionsById[currentId] : undefined;
			const recentWs = items.find((w) => w.workspaceId === recentId) || items[0];
			const cwd = (currentSession && currentSession.cwd) || (recentWs ? recentWs.path : "");

			// 推送参数：target='branch' 时带分支名（host 校验合法性，不合法则按 main 推送）
			const pushArgs = React.useCallback(() => {
				const bn = branchNameRef.current;
				const args = { cwd: cwd, target: target };
				if (target === "branch" && bn && branchNameValid(bn)) args.branch = bn;
				return args;
			}, [cwd, target]);

			const refresh = React.useCallback(async (silent, forceConn) => {
				if (!alive.current) return;
				if (!silent) setLoading(true);
				try {
					const res = await call("/git-component/status?cwd=" + encodeURIComponent(cwd) + (forceConn ? "&force=1" : ""));
					if (!alive.current) return;
					if (res && res.ok) {
						setStatus(res);
						setError(null);
						// 分支胶囊连接状态：若设置了分支名，探测 origin/<branchName>
						const bn = branchNameRef.current;
						if (bn) {
							try {
								const cr = await call("/git-component/conn?cwd=" + encodeURIComponent(cwd) + "&branch=" + encodeURIComponent(bn) + (forceConn ? "&force=1" : ""));
								if (!alive.current) return;
								if (cr && cr.ok) setBranchConn(cr.conn || "idle");
							} catch (e) { if (alive.current) setBranchConn("err"); }
						} else {
							setBranchConn("idle");
						}
					} else {
						setStatus(null);
						setError((res && res.error) || "无法读取 Git 状态");
					}
				} catch (err) {
					if (!alive.current) return;
					setStatus(null);
					setError("Git 面板调用失败：" + String((err && err.message) || err));
				} finally {
					if (alive.current) setLoading(false);
				}
			}, [cwd]);

			React.useEffect(() => {
				alive.current = true;
				setDiff(null);
				setNotice(null);
				refresh(true);
				// 浏览器原生定时器：组件位于工厂顶层作用域，无法访问 apply 的 ctx
				// （client 侧亦无 timer 服务），故用 setInterval + cleanup 清理。
				const d = setInterval(() => refresh(true), 15000);
				return () => { alive.current = false; clearInterval(d); };
			}, [refresh]);

			// 拖拽 window 监听清理（防止拖拽中组件卸载导致监听泄漏）。
			React.useEffect(() => () => {
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", onPointerUp);
				window.removeEventListener("pointercancel", onPointerUp);
			}, [onPointerMove, onPointerUp]);

			// 默认隐藏：enabled=false 或 status 未就绪（初始加载中 / 非 Git 仓库 / 读取出错）
			// 一律不渲染 → 无「先显示再隐藏」闪烁。interval 每 15s 刷新，切换/进入
			// Git 仓库目录后 refresh 成功 → status 就绪 → 自动显示。
			if (!enabled || !status) return null;

			const toggleDiff = async (ch) => {
				if (diff && diff.path === ch.path && !diff.loading) {
					setDiff(null);
					return;
				}
				setFolded({});
				setDiff({ path: ch.path, text: null, error: null, loading: true, st: ch.state, parsed: null });
				try {
					const q = "cwd=" + encodeURIComponent(cwd) + "&path=" + encodeURIComponent(ch.path) + "&staged=" + (ch.state === "staged" ? "1" : "0") + "&untracked=" + (ch.state === "untracked" ? "1" : "0");
					const res = await call("/git-component/diff?" + q);
					if (!alive.current) return;
					if (res && res.ok) {
						setDiff({ path: ch.path, text: res.text, error: null, truncated: !!res.truncated, loading: false, st: ch.state, parsed: parseUnifiedDiff(res.text, 400) });
					} else {
						setDiff({ path: ch.path, text: null, error: (res && res.error) || "无法读取差异", loading: false, st: ch.state, parsed: null });
					}
				} catch (err) {
					if (!alive.current) return;
					setDiff({ path: ch.path, text: null, error: String((err && err.message) || err), loading: false, st: ch.state, parsed: null });
				}
			};

			const runStage = async (d) => {
				if (busy !== null || d.loading) return;
				const action = d.st === "staged" ? "unstage" : "stage";
				setBusy("stage");
				setNotice(null);
				try {
					const res = await call("/git-component/stage", { cwd: cwd, path: d.path, action: action });
					if (!alive.current) return;
					if (res && res.ok) {
						setNotice({ kind: "ok", text: (action === "unstage" ? "已取消暂存 " : "已暂存 ") + d.path });
						setDiff(null);
						setFolded({});
						refresh(true);
					} else {
						setNotice({ kind: "err", text: (res && res.error) || (action === "unstage" ? "取消暂存失败" : "暂存失败") });
					}
				} catch (err) {
					if (!alive.current) return;
					setNotice({ kind: "err", text: String((err && err.message) || err) });
				} finally {
					if (alive.current) setBusy(null);
				}
			};

			const toggleHunk = (hi) => setFolded((f) => Object.assign({}, f, { [hi]: !f[hi] }));

			const runCommit = async (alsoPush) => {
				if (busy !== null) return;
				setBusy(alsoPush ? "both" : "commit");
				setNotice(null);
				try {
					let msg = message.trim();
					if (!msg) {
						const gen = await call("/git-component/automessage", { cwd: cwd });
						if (!alive.current) return;
						if (gen && gen.ok && gen.message) {
							msg = gen.message;
							setMessage(msg);
							setNotice({ kind: "info", text: "已用 AI 生成提交信息" });
						} else {
							setNotice({ kind: "err", text: (gen && gen.error) || "AI 生成提交信息失败，请手动填写" });
							return;
						}
					}
					const res = await call("/git-component/commit", { cwd: cwd, message: msg });
					if (!alive.current) return;
					if (res && res.ok) {
						setMessage("");
						setNotice({ kind: "ok", text: "已提交" + (res.hash ? " " + res.hash : "") });
						if (alsoPush) {
							const pushRes = await call("/git-component/push", pushArgs());
							if (!alive.current) return;
							if (pushRes && pushRes.ok) {
								const dest = pushRes.branch ? ("分支 " + pushRes.branch) : (status && status.upstream ? status.upstream : "远端");
								setNotice({ kind: "ok", text: "已提交并推送到 " + dest });
							} else {
								setNotice({ kind: "err", text: "提交成功，但推送失败：" + ((pushRes && pushRes.error) || "未知错误") });
							}
						}
						refresh(true);
					} else {
						setNotice({ kind: "err", text: (res && res.error) || "提交失败" });
					}
				} catch (err) {
					if (!alive.current) return;
					setNotice({ kind: "err", text: String((err && err.message) || err) });
				} finally {
					if (alive.current) setBusy(null);
				}
			};

			const runPush = async () => {
				if (busy !== null) return;
				setBusy("push");
				setNotice(null);
				try {
					const res = await call("/git-component/push", pushArgs());
					if (!alive.current) return;
					if (res && res.ok) {
						const dest = res.branch ? ("分支 " + res.branch) : (status && status.upstream ? status.upstream : "远端");
						setNotice({ kind: "ok", text: "已推送到 " + dest });
					} else {
						// 推送失败：自动调用 LLM 一键修复，结果用 verify 视图展示
						const error = (res && res.error) || "未知错误";
						setVerify({ running: true, summary: "推送失败，正在调用 AI 一键修复…", checks: null });
						try {
							const fix = await call("/git-component/autofix", Object.assign({ cwd: cwd, error: error }, pushArgs()));
							if (!alive.current) return;
							if (fix && fix.ok !== undefined && Array.isArray(fix.actions)) {
								const checks = fix.actions.map((a) => ({
									name: "修复: " + a.git + (a.note ? "（" + a.note + "）" : ""),
									ok: !!a.ok,
									detail: (a.output || (a.ok ? "执行成功" : "执行失败")).slice(0, 2000),
								}));
								if (fix.pushRetry) {
									checks.push({
										name: "自动重试推送",
										ok: !!fix.pushRetry.ok,
										detail: (fix.pushRetry.output || fix.pushRetry.error || (fix.pushRetry.ok ? "推送成功" : "推送失败")).slice(0, 2000),
									});
								}
								const failed = checks.filter((c) => !c.ok).length;
								setVerify({ running: false, summary: fix.explanation || ("AI 一键修复：" + checks.length + " 步，" + failed + " 步未成功"), checks: checks });
								if (fix.ok) { setNotice({ kind: "ok", text: "AI 已修复并推送成功" }); }
								else { setNotice({ kind: "err", text: "AI 修复未完全成功，请查看修复详情" }); }
							} else {
								setVerify({ running: false, summary: "AI 修复失败", checks: [{ name: "AI 一键修复", ok: false, detail: (fix && fix.error) || "修复接口返回异常" }] });
								setNotice({ kind: "err", text: (fix && fix.error) || "AI 一键修复失败" });
							}
						} catch (err) {
							if (!alive.current) return;
							setVerify({ running: false, summary: "AI 修复失败", checks: [{ name: "AI 一键修复", ok: false, detail: String((err && err.message) || err) }] });
							setNotice({ kind: "err", text: "AI 一键修复失败：" + String((err && err.message) || err) });
						}
					}
					refresh(true);
				} catch (err) {
					if (!alive.current) return;
					setNotice({ kind: "err", text: String((err && err.message) || err) });
				} finally {
					if (alive.current) setBusy(null);
				}
			};

			// 验证当前 .git 仓库信息有效性；结果（含完整报错）显示在面板内。
			const runVerify = async () => {
				if (busy !== null) return;
				setVerify({ running: true, summary: "正在验证…", checks: null });
				try {
					const res = await call("/git-component/verify", { cwd: cwd });
					if (!alive.current) return;
					if (res && res.ok) {
						setVerify({ running: false, summary: res.summary || "", checks: res.checks || [] });
					} else {
						setVerify({ running: false, summary: "验证失败", checks: [{ name: "验证请求", ok: false, detail: (res && res.error) || "验证接口返回异常" }] });
					}
				} catch (err) {
					if (!alive.current) return;
					setVerify({ running: false, summary: "验证失败", checks: [{ name: "验证请求", ok: false, detail: String((err && err.message) || err) }] });
				}
			};

			const changes = status ? status.changes : [];
			const staged = changes.filter((c) => c.state === "staged");
			const unstaged = changes.filter((c) => c.state === "unstaged");
			const untracked = changes.filter((c) => c.state === "untracked");
			const total = changes.length;
			const canCommit = total > 0 && busy === null;

			const renderRow = (ch, cls) => {
				const open = diff && diff.path === ch.path && !diff.loading;
				const badgeLetter = ch.x === "?" ? "?" : (ch.x !== " " ? ch.x : ch.y);
				return h("div", {
						key: ch.path,
						className: "dsh-git-componentanel-row" + (open ? " open active" : ""),
						onClick: () => toggleDiff(ch),
						title: "查看差异",
					},
					h("span", { className: "dsh-git-componentanel-badge " + cls }, badgeLetter),
					h("span", { className: "dsh-git-componentanel-path" },
						ch.oldPath ? h("span", null, h("span", { className: "dsh-git-componentanel-old" }, ch.oldPath), " → ") : null,
						ch.path,
					),
					h("span", { className: "dsh-git-componentanel-caret" }, "›"),
				);
			};

			const renderSection = (title, list, cls) => {
				if (list.length === 0) return null;
				return h("div", { className: "dsh-git-componentanel-section" },
					h("div", { className: "dsh-git-componentanel-section-title" },
						h("span", null, title),
						h("span", { className: "dsh-git-componentanel-count" }, String(list.length)),
					),
					list.map((ch) => renderRow(ch, cls)),
				);
			};

			const renderLineTokens = (text, lang) => {
				const tokens = tokenizeLine(text, lang);
				return tokens.map((t, i) =>
					t.cls === "plain" ? t.text : h("span", { key: i, className: "dsh-git-componentanel-tok " + t.cls }, t.text),
				);
			};

			const renderHunkHead = (hk, hi, key) =>
				h("div", { key: key, className: "dsh-git-componentanel-hunk-head", onClick: () => toggleHunk(hi), title: "折叠/展开该 hunk" },
					h("span", { className: "dsh-git-componentanel-hunk-caret" }, folded[hi] ? "▶" : "▼"),
					h("span", { className: "dsh-git-componentanel-hunk-label" }, "@@ -" + hk.oldStart + "," + hk.oldCount + " +" + hk.newStart + "," + hk.newCount + " @@"),
				);

			const renderUnified = (d) => {
				const parsed = d.parsed;
				const lang = langOf(d.path);
				const nodes = [];
				for (const hd of parsed.headers) nodes.push(h("span", { key: "hd" + nodes.length, className: "dsh-git-componentanel-dl meta" }, hd));
				parsed.hunks.forEach((hk, hi) => {
					nodes.push(renderHunkHead(hk, hi, "hh" + hi));
					if (folded[hi]) return;
					hk.lines.forEach((ln, i) => {
						let cls = "dsh-git-componentanel-dl";
						if (ln.kind === "add") cls += " add";
						else if (ln.kind === "del") cls += " del";
						else if (ln.kind === "meta") cls += " meta";
						const prefix = ln.kind === "add" ? "+" : ln.kind === "del" ? "-" : "";
						nodes.push(h("span", { key: "hl" + hi + "_" + i, className: cls }, prefix, renderLineTokens(ln.text, lang)));
					});
				});
				if (parsed.truncated || d.truncated) {
					nodes.push(h("span", { key: "trunc", className: "dsh-git-componentanel-dl meta" }, "… 差异过大，已截断"));
				}
				return h("div", { className: "dsh-git-componentanel-diff-pre" }, nodes);
			};

			const renderSplit = (d) => {
				const parsed = d.parsed;
				const lang = langOf(d.path);
				if (parsed.hunks.length === 0) return renderUnified(d);
				return h("div", { className: "dsh-git-componentanel-diff-split" },
					parsed.hunks.map((hk, hi) => {
						let oldNo = hk.oldStart;
						let newNo = hk.newStart;
						const pairs = sideBySidePairs(hk);
						return h("div", { key: "h" + hi, className: "dsh-git-componentanel-hunk" },
							renderHunkHead(hk, hi),
							folded[hi]
								? null
								: h("div", { className: "dsh-git-componentanel-split-cols" },
									h("div", { className: "dsh-git-componentanel-split-col" },
										pairs.map((p, i) => h("div", { key: i, className: "dsh-git-componentanel-split-line" + (p.left === null ? " empty" : " " + p.kind) },
											h("span", { className: "dsh-git-componentanel-lineno" }, p.left === null ? "" : String(oldNo++)),
											h("span", { className: "dsh-git-componentanel-linebody" }, p.left === null ? "" : renderLineTokens(p.left, lang)),
										)),
									),
									h("div", { className: "dsh-git-componentanel-split-col" },
										pairs.map((p, i) => h("div", { key: i, className: "dsh-git-componentanel-split-line" + (p.right === null ? " empty" : " " + p.kind) },
											h("span", { className: "dsh-git-componentanel-lineno" }, p.right === null ? "" : String(newNo++)),
											h("span", { className: "dsh-git-componentanel-linebody" }, p.right === null ? "" : renderLineTokens(p.right, lang)),
										)),
									),
								),
						);
					}),
				);
			};

			const renderDiff = () => {
				if (!diff) return null;
				const st = diff.st;
				const stageLabel = st === "staged" ? "取消暂存" : "暂存";
				return h("div", { className: "dsh-git-componentanel-diff" },
					h("div", { className: "dsh-git-componentanel-diff-head" },
						h("span", { className: "dsh-git-componentanel-diff-path", title: diff.path }, diff.path),
						h("button", {
							className: "dsh-git-componentanel-icobtn",
							onClick: () => setSplitView((v) => !v),
							disabled: diff.loading || diff.error !== null,
							title: splitView ? "单栏视图" : "分栏对比",
							"aria-label": splitView ? "单栏视图" : "分栏对比",
						}, splitView ? "▤" : "≡"),
						h("button", {
							className: "dsh-git-componentanel-icobtn",
							onClick: () => runStage(diff),
							disabled: busy !== null || diff.loading || diff.error !== null,
							title: stageLabel,
							"aria-label": stageLabel,
						}, st === "staged" ? "↩" : "+"),
						h("button", { className: "dsh-git-componentanel-icobtn", onClick: () => setDiff(null), title: "关闭差异", "aria-label": "关闭差异" }, "✕"),
					),
					diff.loading
						? h("div", { className: "dsh-git-componentanel-empty" }, "读取差异中…")
						: diff.error
							? h("div", { className: "dsh-git-componentanel-errorbox" }, diff.error)
							: splitView ? renderSplit(diff) : renderUnified(diff),
				);
			};

			let body;
			if (verify) {
				// 验证视图：逐项列出检查结果，完整显示所有报错文本（pre 保留换行、可滚动）。
				const checks = verify.checks || [];
				body = h("div", { className: "dsh-git-componentanel-verify" },
					h("div", { className: "dsh-git-componentanel-verify-head" }, [
						h("span", { className: "dsh-git-componentanel-verify-summary" }, verify.running ? "正在验证…" : (verify.summary || "")),
						h("button", { className: "dsh-git-componentanel-icobtn", onClick: () => setVerify(null), title: "返回", "aria-label": "返回" }, "✕"),
					]),
					verify.running
						? h("div", { className: "dsh-git-componentanel-empty" }, "…")
						: h("div", { className: "dsh-git-componentanel-verify-list" },
								checks.map((c) =>
									h("div", { key: c.name, className: "dsh-git-componentanel-verify-check " + (c.ok ? "ok" : "err") },
										h("div", { className: "dsh-git-componentanel-verify-name" }, (c.ok ? "✓ " : "✗ ") + c.name),
										c.detail ? h("pre", { className: "dsh-git-componentanel-verify-detail" }, c.detail) : null,
									),
								),
							),
				);
			} else if (loading && !status && !error) {
				body = h("div", { className: "dsh-git-componentanel-body" }, h("div", { className: "dsh-git-componentanel-empty" }, h("div", { className: "dsh-git-componentanel-big" }, "…"), "正在读取 Git 状态"));
			} else if (error) {
				body = h("div", { className: "dsh-git-componentanel-body" },
					h("div", { className: "dsh-git-componentanel-errorbox" }, error),
					h("div", { className: "dsh-git-componentanel-empty" }, "提示：请在侧边栏选择一个 Git 仓库所在的工作区"),
				);
			} else if (status && total === 0) {
				body = h("div", { className: "dsh-git-componentanel-body" }, h("div", { className: "dsh-git-componentanel-empty" }, h("div", { className: "dsh-git-componentanel-big" }, "✓"), "工作区干净，没有未提交的更改"));
			} else {
				body = h("div", { className: "dsh-git-componentanel-body" },
					renderSection("已暂存", staged, "staged"),
					renderSection("未暂存", unstaged, "unstaged"),
					renderSection("未跟踪", untracked, "untracked"),
					renderDiff(),
				);
			}

			if (collapsed) {
				const posStyle = pos ? { left: pos.left + "px", top: pos.top + "px", right: "auto", transform: "none" } : undefined;
				return h("div", {
						className: "dsh-git-componentanel-root collapsed",
						style: Object.assign({}, posStyle, { "--dsh-git-panel-alpha": String(opacity) }),
						onClick: () => setCollapsed(false),
						onPointerDown: startDrag,
						onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") setCollapsed(false); },
						role: "button",
						tabIndex: 0,
						"aria-label": "展开 Git 面板",
						title: "展开 Git 面板",
					},
					h(BranchIcon, { className: "dsh-git-componentanel-tab-icon", width: 20, height: 20 }),
				);
			}

			const branchMeta = status
				? (status.ahead > 0 || status.behind > 0 ? " ↑" + status.ahead + " ↓" + status.behind : "") + (status.gone ? " (gone)" : "")
				: "";
			const curBranchName = status ? (status.detached ? "HEAD (游离)" : status.branch) : "—";

			// 连接状态点（单胶囊）：优先级 报错(红) > 有改动(橙) > 连接成功(绿) > 未连接(灰)。
			// main 胶囊 conn 来自 /git-component/status；分支胶囊 conn 来自 /git-component/conn?branch=xxx。
			const conn = status && status.conn;
			let dotCls = "conn-idle", connTitle = "未连接（未配置 remote 或尚未探测）";
			if (conn === "err") { dotCls = "conn-err"; connTitle = "连接失败 / 报错（无法访问远端，请检查网络或凭据）"; }
			else if (total > 0) { dotCls = "conn-dirty"; connTitle = "工作区有改动（" + total + " 处，未提交）"; }
			else if (conn === "ok") { dotCls = "conn-ok"; connTitle = "已连接远端，工作区干净"; }
			if (status && status.upstream && conn !== "err") connTitle += " · 上游 " + status.upstream + (status.detached ? "（HEAD 游离状态）" : "");

			// 分支胶囊状态点（同一工作区改动也显示橙；连接状态探测 origin/<branchName>）
			let bDotCls = "conn-idle", bDotTitle = "未连接（未设置分支名或远端无该分支）";
			if (branchConn === "err") { bDotCls = "conn-err"; bDotTitle = "连接失败 / 报错（无法访问远端分支，请检查网络或凭据）"; }
			else if (total > 0) { bDotCls = "conn-dirty"; bDotTitle = "工作区有改动（" + total + " 处，未提交）"; }
			else if (branchConn === "ok") { bDotCls = "conn-ok"; bDotTitle = "远端分支 " + (branchName || "?") + " 可达"; }
			if (!branchName) bDotTitle = "未设置分支名（点击设置）";

			const pushing = busy === "push" || busy === "both";
			// 胶囊内只留一个指示灯：推送中（且是本胶囊为激活目标）时指示灯变蓝脉冲
			const mainDotCls = (pushing && target === "main") ? "conn-push" : dotCls;
			const branchDotCls = (pushing && target === "branch") ? "conn-push" : bDotCls;
			const pushTitle = (label) => pushing ? (label + " · 正在推送…") : label;

			// 点击 main 胶囊 → 切回主支推送；点击分支胶囊 → 立即切换高亮到分支，
			// 若尚未设置分支名则同时弹出内联编辑条确认名字（确定=生效，取消=回退 main）。
			const clickMain = () => { setBranchEdit(false); switchTarget("main"); refresh(true, true); };
			const clickBranch = () => {
				switchTarget("branch");
				if (!branchName) {
					// sandbox iframe 里 window.prompt 被禁（返回 null），改用面板内联输入条
					setBranchInput(defaultBranchName());
					setBranchEdit(true);
					return;
				}
				setBranchEdit(false);
				refresh(true, true);
			};
			const commitBranchInput = () => {
				const v = branchInput.trim();
				if (!branchNameValid(v)) { setNotice({ kind: "err", text: "分支名不合法（须字母数字开头，允许 . _ / -）" }); return; }
				setBranch(v);
				setBranchEdit(false);
				switchTarget("branch");
				refresh(true, true);
			};
			const cancelBranchInput = () => { setBranchEdit(false); switchTarget("main"); };
			// 重命名分支：右键或双击打开编辑条，预填当前分支名（须先设置过分支名）
			const renameBranch = (e) => {
				if (e && e.preventDefault) e.preventDefault();
				setBranchInput(branchName || defaultBranchName());
				setBranchEdit(true);
			};

			const posStyle = pos ? { left: pos.left + "px", top: pos.top + "px", right: "auto", transform: "none" } : undefined;

			return h("div", {
					className: "dsh-git-componentanel-root",
					style: Object.assign({}, posStyle, { "--dsh-git-panel-alpha": String(opacity) }),
				},
				h("div", { className: "dsh-git-componentanel-header", onPointerDown: startDrag },
					h("span", { className: "dsh-git-componentanel-logo", title: "Git 面板" },
						h(BranchIcon, { width: 14, height: 14 }),
					),
					status
						? h("span", {
								className: "dsh-git-componentanel-branch" + (target === "main" ? " active" : ""),
								title: pushTitle(connTitle) + "（点击切换推送目标）",
								role: "button",
								tabIndex: 0,
								onClick: clickMain,
								onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); clickMain(); } },
							},
								h("span", { className: "dsh-git-componentanel-dot " + mainDotCls }),
								h("span", null, curBranchName + branchMeta),
							)
						: h("span", { className: "dsh-git-componentanel-branch" }, curBranchName),
					h("span", {
							className: "dsh-git-componentanel-branch" + (target === "branch" ? " active" : ""),
							title: pushTitle(bDotTitle) + "（点击切换推送目标 · 右键/双击重命名分支）",
							role: "button",
							tabIndex: 0,
							onClick: clickBranch,
							onDoubleClick: renameBranch,
							onContextMenu: renameBranch,
							onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); clickBranch(); } },
						},
							h("span", { className: "dsh-git-componentanel-dot " + branchDotCls }),
							h("span", null, branchName || "分支…"),
						),
					h("div", { style: { flex: 1 } }),
					h("button", {
						className: "dsh-git-componentanel-icobtn" + (loading ? " loading" : ""),
						onClick: () => refresh(false, true),
						disabled: busy !== null,
						title: "刷新（重新探测连接）",
						"aria-label": "刷新",
					}, "↻"),
					h("button", {
						className: "dsh-git-componentanel-icobtn",
						onClick: runVerify,
						disabled: busy !== null,
						title: "验证有效性（检查 .git 信息并显示完整报错）",
						"aria-label": "验证有效性",
					}, "✓"),
					(total === 0)
						? h("button", {
								className: "dsh-git-componentanel-icobtn" + (busy === "push" ? " loading" : ""),
								onClick: runPush,
								disabled: busy !== null,
								title: "重新推送",
								"aria-label": "重新推送",
							}, "⇡")
						: null,
					h("button", {
						className: "dsh-git-componentanel-icobtn",
						onClick: () => setCollapsed(true),
						title: "折叠",
						"aria-label": "折叠",
					}, "»"),
				),
				branchEdit
					? h("div", { className: "dsh-git-componentanel-branch-edit" },
							h("span", { className: "dsh-git-componentanel-branch-edit-label" }, "推送分支名"),
							h("input", {
								className: "dsh-git-componentanel-branch-edit-input",
								value: branchInput,
								autoFocus: true,
								placeholder: "feature-0916",
								onChange: (e) => setBranchInput(e.target.value),
								onKeyDown: (e) => { if (e.key === "Enter") { e.stopPropagation(); commitBranchInput(); } if (e.key === "Escape") { e.stopPropagation(); cancelBranchInput(); } },
							}),
							h("button", { className: "dsh-git-componentanel-btn primary", onClick: commitBranchInput }, "确定"),
							h("button", { className: "dsh-git-componentanel-btn outline", onClick: cancelBranchInput }, "取消"),
						)
					: null,
				body,
				(status !== null)
					? h("div", { className: "dsh-git-componentanel-commit" },
							h("textarea", {
								className: "dsh-git-componentanel-textarea",
								placeholder: "提交信息（留空将用 AI 自动生成）",
								value: message,
								rows: 2,
								disabled: busy !== null,
								onChange: (e) => setMessage(e.target.value),
								onKeyDown: (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runCommit(false); },
							}),
							h("div", { className: "dsh-git-componentanel-btns" },
								h("button", { className: "dsh-git-componentanel-btn primary", onClick: () => runCommit(false), disabled: !canCommit },
									busy === "commit" ? "提交中…" : "提交"),
								h("button", { className: "dsh-git-componentanel-btn outline", onClick: () => runCommit(true), disabled: !canCommit },
									busy === "both" ? "提交并推送中…" : (target === "branch" && branchName ? "提交并推送(分支)" : "提交并推送")),
							),
							h("div", { className: "dsh-git-componentanel-footer" },
								h("button", { className: "dsh-git-componentanel-push", onClick: runPush, disabled: busy !== null },
									busy === "push" ? "推送中…" : (target === "branch" && branchName ? "推送(分支)" : "推送")),
								notice
									? h("span", { className: "dsh-git-componentanel-notice " + notice.kind, title: notice.text }, notice.text)
									: h("span", { className: "dsh-git-componentanel-notice info" }, "Ctrl/⌘ + Enter 提交 · 留空 AI 生成"),
							),
						)
					: null,
			);
		};

		// ---- 附属插件：缺少源插件的提示条 ----
		// 本插件是 dsh-git-component 的附属增强，要求源插件必须已安装。
		// host 半检测到源插件缺失时不注册任何 git 路由，只注册
		// /git-component-remx/dependency 状态路由；本组件渲染缺失提示
		// + 安装命令（可复制）+ 源插件 GitHub 下载链接，并支持折叠。
		const MissingSourcePanel = (props) => {
			const info = props.info || {};
			const [collapsed, setCollapsed] = React.useState(false);
			const [copied, setCopied] = React.useState(false);
			const copyCmd = () => {
				try {
					const ta = document.createElement("textarea");
					ta.value = info.installCmd || "";
					document.body.appendChild(ta);
					ta.select();
					document.execCommand("copy");
					document.body.removeChild(ta);
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				} catch {}
			};
			if (collapsed) {
				return h("div", { className: "dsh-git-componentanel-root collapsed missing", onClick: () => setCollapsed(false), title: "缺少源插件 dsh-git-component（点击展开）" },
					h("div", { className: "dsh-git-componentanel-missing-mini" }, "⚠"),
				);
			}
			return h("div", { className: "dsh-git-componentanel-root missing" },
				h("div", { className: "dsh-git-componentanel-missing" },
					h("div", { className: "dsh-git-componentanel-missing-head" },
						h("span", { className: "dsh-git-componentanel-missing-title" }, "缺少源插件 dsh-git-component"),
						h("button", { className: "dsh-git-componentanel-icobtn", onClick: () => setCollapsed(true), title: "折叠", "aria-label": "折叠" }, "»"),
					),
					h("p", { className: "dsh-git-componentanel-missing-desc" },
						"本插件是源插件 dsh-git-component 的附属增强，必须安装源插件后才能使用 Git 面板。"),
					h("pre", { className: "dsh-git-componentanel-missing-cmd" }, info.installCmd || "dsh plugin --profile web add github:nieyunliang/dsh-git-component"),
					h("div", { className: "dsh-git-componentanel-missing-btns" },
						h("button", { className: "dsh-git-componentanel-btn primary", onClick: copyCmd }, copied ? "已复制 ✓" : "复制安装命令"),
						info.downloadUrl
							? h("a", { className: "dsh-git-componentanel-btn outline dsh-git-componentanel-missing-link", href: info.downloadUrl, target: "_blank", rel: "noopener noreferrer" }, "打开 GitHub 下载源插件 ↗")
							: null,
					),
					h("p", { className: "dsh-git-componentanel-missing-hint" },
						"安装并重启后，刷新页面即可正常使用。"),
				),
			);
		};

		// 依赖门卫：先请求 /git-component-remx/dependency 判断源插件是否就绪。
		// 就绪 → 渲染 GitPanel；缺失 → 渲染 MissingSourcePanel；请求失败
		// （旧版 host 未注册该路由）→ 视为就绪，避免误报。
		const GitPanelEntry = (props) => {
			const [dep, setDep] = React.useState({ checking: true, missing: false, info: null });
			React.useEffect(() => {
				let alive = true;
				fetch("/git-component-remx/dependency")
					.then((r) => r.json())
					.then((j) => {
						if (!alive) return;
						if (j && j.ok === false) setDep({ checking: false, missing: true, info: j });
						else setDep({ checking: false, missing: false, info: null });
					})
					.catch(() => { if (alive) setDep({ checking: false, missing: false, info: null }); });
				return () => { alive = false; };
			}, []);
			if (dep.checking) return null;
			if (dep.missing) return h(MissingSourcePanel, { info: dep.info });
			return h(GitPanel, props);
		};

		function apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === undefined) return;
			bindSettingsScope(ctx);
			console.log("[git-component] client apply: registering shell.overlay panel + settings row");
			ctx.effect(() => injectCss(CSS));
			slots.inject("shell.overlay", () => slots.register(
				{ name: "shell.overlay", id: "git-component", order: 90 },
				(props) => h(GitPanelEntry, props),
			));

			// 设置页开关行（settings.section）：enabled 关闭 → 面板不渲染。
			// 用 useSyncExternalStore 订阅 settingsScope + localStorage 双通道，
			// 与 GitPanel 面板状态完全一致；勾选即 setEnabled 持久化（实时保存）。
			const GitSettingsRow = () => {
				const enabled = React.useSyncExternalStore(subscribeEnabled, isEnabled, isEnabled);
				const toggle = (e) => setEnabled(!!e.target.checked);
				const opacity = React.useSyncExternalStore(subscribeOpacity, getOpacity, getOpacity);
				// 滑块用内部 state 承载拖动值：onChange 立即 setSliderVal + setOpacity（写
				// localStorage + 通知本地订阅总线），再经 useEffect 与外部 opacity 同步。
				// 拖动过程不依赖外部快照（settingsScope 不可写/跨窗口 storage）的滞后刷新，
				// 受控 value 即时跟随，绝不弹回；面板侧 GitPanel 订阅同一总线实时渲染。
				const [sliderVal, setSliderVal] = React.useState(opacity);
				React.useEffect(() => { setSliderVal(opacity); }, [opacity]);
				const changeOpacity = (e) => {
					const n = parseInt(e.target.value, 10) || 0;
					setSliderVal(n);
					setOpacity(n);
				};
				return h("div", { className: "dsh-git-componentanel-settings" },
					h("h2", { className: "dsh-git-componentanel-settings-title" }, "Git 面板"),
					h("label", { className: "dsh-git-componentanel-settings-row" }, [
						h("input", { key: "cb", type: "checkbox", checked: enabled, onChange: toggle }),
						h("span", { key: "l", className: "dsh-git-componentanel-settings-label" }, "启用右侧 Git 面板"),
					]),
					h("div", { key: "op", className: "dsh-git-componentanel-settings-range" }, [
						h("div", { key: "head", className: "dsh-git-componentanel-settings-range-head" }, [
							h("span", { key: "t" }, "面板透明度（透明 → 云母磨砂）"),
							h("span", { key: "v", className: "dsh-git-componentanel-settings-range-val" }, String(opacity) + " / 100"),
						]),
						h("input", { key: "slider", type: "range", min: 0, max: 100, step: 1, value: sliderVal, onChange: changeOpacity }),
					]),
					h("p", { key: "d", className: "dsh-git-componentanel-settings-desc" }, "0 完全透明；100 云母磨砂（不透明 + 背景模糊）。关闭开关后不再显示面板；面板默认隐藏，检测到当前目录是 Git 仓库时才显示。"),
				);
			};
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "git-component",
				order: 90,
				label: "Git 面板"
			}, GitSettingsRow));
		}

		exports.name = "dsh-git-component-remx";
		exports.inject = ["slots", "settingsScope"];
		exports.apply = apply;
		return module.exports;
	}
});
