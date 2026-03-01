# SKILL.md

This file defines reusable AI skills for this project.
本檔定義本專案中 AI 的可重用技能與工作模式。

The goal is to maintain clean architecture, reduce coupling,
and keep UI components declarative.
目標是維持乾淨架構、降低耦合、保持 UI 元件純粹。

---

## 1️⃣ Refactor Skill

When refactoring:

- Preserve existing behavior.
- Do not change UI output unless explicitly requested.
- Improve separation of concerns.
- Reduce coupling between modules.
- Prefer extraction over inline expansion.
- Add JSDoc explaining:
  - What the function does
  - How it works
  - Why this design is chosen

重構時必須：

- 保持功能不變
- 除非明確要求，不修改 UI 行為
- 提升關注點分離
- 降低模組耦合
- 優先抽離邏輯，而非增加頁面內程式碼
- 為抽離邏輯加上 what / how / why 註解

---

## 2️⃣ Hook Extraction Skill

When logic inside a page exceeds simple state handling:

- Extract business logic into a custom hook.
- Hooks must not contain UI rendering.
- Hooks should return minimal, clean data.
- Avoid side effects unless necessary.
- Keep hooks reusable.

當頁面邏輯超出基本狀態管理時：

- 抽離為自訂 hook
- hook 不得包含 UI 渲染
- 回傳值保持簡潔
- 避免不必要副作用
- 保持可重用性

---

## 3️⃣ Page Responsibility Skill

Page components should:

- Focus on rendering.
- Manage high-level state only.
- Call hooks for data processing.
- Avoid direct filtering or transformation logic.

頁面元件應：

- 專注於畫面呈現
- 僅管理高階狀態
- 呼叫 hook 進行資料處理
- 避免直接撰寫篩選與轉換邏輯

---

## 4️⃣ Architecture Review Skill

When reviewing code:

- Identify mixed responsibilities.
- Detect tight coupling.
- Suggest extraction if logic exceeds 15–20 lines.
- Provide before / after structural comparison.
- Explain tradeoffs.

架構審查時：

- 找出責任混寫
- 偵測耦合
- 若邏輯超過 15–20 行建議抽離
- 提供前後結構對照
- 解釋取捨

---

## 5️⃣ Trace Logging Skill

After structural changes:

- Ensure TRACE.md is updated.
- Summarize architectural impact.
- Record commit reference.
- Add new rule to AGENTS.md if needed.

架構變動後：

- 確保 TRACE.md 已更新
- 紀錄架構影響
- 記錄 commit 參照
- 若產生新規則，更新 AGENTS.md

---

## 6️⃣ Code Clarity Skill

Always prefer:

- Clear naming over short naming.
- Explicit logic over clever tricks.
- Simplicity over premature optimization.
- Readability over micro-performance gains.

優先考量：

- 清楚命名
- 明確邏輯
- 簡潔設計
- 可讀性優於過早優化