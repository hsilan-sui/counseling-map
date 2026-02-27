---
# 執行規範 Pure Frontend Structural Refactor Governance.v1
---

# AGENTS.md

This file defines the engineering rules and AI governance for this project.
本文件定義本專案的工程規範與 AI 行為準則。

---

# 1️⃣ Project Context ｜專案背景

**Framework:** Next.js (Pages Router)
**Styling:** Tailwind CSS
**Data Source:** Local JSON (`src/data/clinics.json`)
**Backend:** None (Pure Frontend Project)

### Project Nature

This is a pure frontend refactor practice project.
本專案為純前端重構練習專案。

### Core Goal

Improve structure, clarity, and scalability **without changing UI behavior**.
在不改變 UI 行為與畫面的前提下，提升專案結構、可讀性與可擴充性。

---

# 2️⃣ Refactor Principles ｜重構原則

* Do NOT change UI appearance unless explicitly requested.
  除非明確要求，禁止修改 UI 外觀。

* Do NOT introduce new major libraries.
  禁止引入新的大型套件。

* Each refactor must focus on ONE responsibility only.
  每次重構只處理單一責任。

* Avoid modifying more than 2–3 files per task.
  每次任務修改檔案數量不得超過 2–3 個。

* Keep behavior identical before and after refactor.
  重構前後功能行為必須完全一致。

* Refactor must be incremental and reversible.
  重構必須可回滾且逐步進行。

---

# 3️⃣ Architectural Constraints ｜架構限制

* Separate data logic from UI components.
  資料處理邏輯必須與 UI 元件分離。

* Move filtering, search, and computation logic into hooks or pure functions.
  篩選、搜尋與計算邏輯應抽離為 hooks 或純函式。

* Keep components small and reusable.
  元件應保持小型化與可重用。

* No global mutable state.
  禁止使用可變動的全域狀態。

* Avoid tight coupling between Map and Sidebar.
  Map 與 Sidebar 不得高度耦合。

* Prefer pure functions over side effects.
  優先使用純函式，避免副作用。

---

# 4️⃣ Comment Standard (MANDATORY) ｜註解標準（強制）

All exported functions and hooks MUST include structured documentation.
所有對外匯出的函式與 hooks 必須附帶結構化註解。

### Required Sections ｜必備段落

* **What** – What this function does
  說明此函式的功能

* **How** – How it works (logic summary)
  說明其核心運作邏輯

* **Why** – Why it is designed this way
  說明設計決策與原因

### Format Requirement ｜格式要求

Use clear English JSDoc format.
使用清楚的英文 JSDoc 格式撰寫。

---

# 5️⃣ Execution Safety Rule (MANDATORY) ｜可運行安全規則（強制）

Every change must leave the project in a runnable state.
每一次修改後，專案必須保持可正常執行。

## Required Conditions ｜必要條件

* The project must compile without errors.
  專案必須能成功編譯。

* `npm run dev` must start successfully.
  必須能正常啟動開發伺服器。

* No runtime errors in browser console.
  瀏覽器 Console 不得出現錯誤。

* No broken rendering or blank screen.
  畫面不得崩潰或白屏。

* Existing behavior must remain unchanged.
  原有功能必須完全一致。

---

## Refactor Safety Process ｜安全重構流程

### Before Refactor

* Confirm current behavior manually.
  先確認目前行為。

### After Refactor

* Verify UI behavior manually.
  手動驗證畫面與功能。

* Check browser console for errors.
  檢查 Console 是否有錯誤。

If any error occurs:

* Revert immediately.
  立即回退。

---

# 6️⃣ Delivery Format ｜交付格式

When making changes, AI must provide:

AI 在提交修改時必須提供：

1. **Summary of changes**
   修改摘要

2. **Risk analysis**
   風險分析

3. **How to verify behavior remains correct**
   驗證功能未改變的方法

4. **Suggested commit message**
   建議的 Commit 訊息

---

# 7️⃣ Branch Governance ｜分支治理規則

* Never push directly to main branch.
  禁止直接推送至 main 分支。

* Assume all work is done in a refactor branch.
  預設所有工作皆於 refactor branch 進行。

* Keep commits small and atomic.
  Commit 必須小且具單一責任。

* One concern per commit.
  每個 commit 只處理一個問題。

---

# 8️⃣ Stability First Principle ｜穩定優先原則

Refactor is not a race.
重構不是比速度。

Stability > Speed
穩定性優先於速度。

Clarity > Cleverness
清晰度優先於炫技。

Maintainability > Micro-optimization
可維護性優先於微優化。

---

# 9️⃣ AI Governance Philosophy ｜AI 協作哲學

AI is an assistant, not an authority.
AI 是輔助者，不是決策者。

Human must verify all changes.
所有修改必須由人類驗證。

Architecture decisions must remain consistent with project constraints.
架構決策必須符合本專案既定限制。



