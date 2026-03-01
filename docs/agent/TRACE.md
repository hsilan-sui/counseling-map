---
# AI 工程紀錄本
# 設定post-commit
---

# docs/ai/TRACE.md

---

# AI Refactor Trace Log

# AI 重構追蹤紀錄

---

## 📅 2026-02-27

---

## 🎯 Goal

## 🎯 目標

Refactor clinic data filtering logic from `index.tsx` into a reusable custom hook.

將診所資料篩選邏輯從 `index.tsx` 抽離為可重用的自訂 hook。

Reason:

原因：

The page component is handling both UI rendering and data processing.

頁面元件同時處理 UI 與資料邏輯。

This violates separation of concerns.

這違反關注點分離原則。

---

## 🧠 Architecture Review Summary

## 🧠 架構分析摘要

Current State:

目前狀態：

* Search keyword filtering is inside page component.
* Category filtering is inside page component.
* Data transformation is done inline before render.

搜尋關鍵字篩選寫在頁面內。
分類篩選寫在頁面內。
資料轉換直接寫在 render 前。

Problems Identified:

發現問題：

1. UI and business logic tightly coupled
   UI 與商業邏輯高度耦合

2. Hard to reuse filtering logic elsewhere
   無法在其他頁面重用篩選邏輯

3. Hard to test independently
   無法單獨測試篩選邏輯

---

## 🧩 Proposed Refactor Plan

## 🧩 重構方案

Create a new hook:

建立新 hook：

```
src/hooks/useClinics.ts
```

Responsibilities of hook:

Hook 負責：

* Accept clinic data
* Accept search keyword
* Accept category filter
* Return filtered clinic list

接收診所資料
接收搜尋關鍵字
接收分類條件
回傳篩選後的資料

Page component should only:

頁面元件只負責：

* Rendering
* Passing state into hook
* Displaying results

渲染畫面
傳入狀態
顯示結果

---

## 🤖 Codex Execution Task

## 🤖 Codex 執行任務

1. Create file `useClinics.ts`
2. Move filtering logic into hook
3. Add JSDoc comments explaining:

   * What
   * How
   * Why
4. Ensure return value is clean and minimal

建立 hook
搬移邏輯
補上 JSDoc
保持乾淨 API

---

## 🔍 Verification Checklist

## 🔍 驗證清單

* Search still filters correctly
  搜尋功能正常

* Category filter still works
  分類篩選正常

* Map markers render correctly
  地圖標記正常

* No visual regression
  畫面無異常

* No console errors
  無錯誤訊息

---

## 📝 Commit Record

## 📝 Commit 紀錄

```
refactor: extract clinic filtering logic into useClinics hook
```

Type:

Refactor (no feature change)

---

## 📌 New Architectural Rule

## 📌 新增架構規範

Filtering and transformation logic must live in hooks, not page components.

篩選與資料轉換邏輯必須寫在 hooks 中，不可寫在頁面元件內。

Page components should remain declarative and presentation-focused.

頁面元件應保持宣告式與呈現導向。

Update AGENTS.md accordingly.

同步更新 AGENTS.md。

---

# 🧠 Reflection

# 🧠 重構反思

What improved:

改善點：

* Reduced coupling
  降低耦合

* Increased reusability
  提升可重用性

* Improved readability
  提升可讀性

* Easier unit testing in future
  未來可單獨測試

---

# 🔁 Future Improvement

# 🔁 未來可優化方向

* Add memoization for performance
  加入 memo 優化效能

* Add unit test for hook
  為 hook 撰寫單元測試

* Consider moving data sorting into hook as well
  未來可將排序邏輯也納入 hook


## 2026-02-27 17:57:39
- commit: 7285816
- message: refactor: test trace append

## 2026-02-27 23:07:22
- commit: 75fee2b
- message: refactor(home): extract views counter logic into useViewsCounter hook without behavior change
- Result:
  - Extracted useViewsCounter with zero behavior change.
  - Verified build success.
## 2026-02-27 23:15:40
- commit: f1a5a8d
- message: refactor(geo): extract pure geo utilities to utils

## 2026-02-27 23:16:33
- commit: 651b9da
- message: docs(trace): record geo utilities extraction

## 2026-02-27 23:25:16
- commit: bbe1b32
- message: refactor(hooks): extract useIsSidebarBottom

## 2026-02-27 23:36:40
- commit: 9692c99
- message: refactor(data): extract clinic mapping logic

## 2026-02-27 23:41:03
- commit: daccd5e
- message: refactor(data): tighten mapClinics input typing

## 2026-02-27 23:44:57
- commit: 87f2fb8
- message: refactor(types): move ClinicWithGeo to data layer

## 2026-03-01 14:55:35
- commit: 3dcb585
- message: refactor: extract clinicSelectors without behavior change

## 2026-03-01 15:08:18
- commit: f86cbd2
- message: refactor: fix the left fix change

## 2026-03-01 15:20:16
- commit: 808914e
- message: refactor: seal useClinicLocation boundary with semantic actions

## 2026-03-01 15:54:49
- commit: 5a4c5d4
- message: refactor: update news content

## 2026-03-01 16:14:36
- commit: 77d516a
- message: chore: finalize v2.0 architecture refactor version

## 2026-03-01 16:21:11
- commit: ecb0288
- message: docs: add note
