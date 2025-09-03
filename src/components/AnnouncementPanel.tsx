// components/AnnouncementPanel.tsx
import { useState } from "react";

export default function AnnouncementPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 右上角小鈕 */}
      <div className="fixed top-4 right-4 z-[1100]">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-slate-800 text-white px-3 py-2 text-sm shadow hover:bg-slate-700"
          aria-label="開啟公告訊息"
        >
          公告訊息
        </button>
      </div>

      {/* 遮罩 + 面板 */}
      {open && (
        <div
          className="fixed inset-0 z-[1100] bg-black/40"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="absolute top-6 right-6 w-[min(520px,92vw)] bg-white rounded-lg shadow-xl p-5 text-slate-800"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold">15–45 歲青壯世代心理健康支持方案</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-800"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm leading-6">
              <p>政府補助 <b>每人 3 次免費心理諮商</b>。適用 15–45 歲，首次到場請攜帶身分證/健保卡。部分機構可能酌收掛號或行政費，依機構公告為準。</p>

              <ol className="list-decimal pl-5 space-y-1">
                <li><b>查詢機構</b>：在地圖上找「有名額」的合作機構。</li>
                <li><b>直接預約</b>：用電話/官網/LINE 向該機構預約，並告知「我要使用 <b>15–45 歲心理健康支持方案</b>」。</li>
                <li><b>帶證件</b>：身分證/健保卡。</li>
                <li><b>到場諮商</b>：若專業評估需要，機構將協助轉介到合作醫療院所。</li>
              </ol>

              <details className="rounded-md bg-slate-50 p-3">
                <summary className="cursor-pointer font-medium">常見疑問</summary>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><b>要先掛精神科嗎？</b> 不一定。一般先向合作機構預約；如評估需要，再由機構協助轉介。</li>
                  <li><b>可線上諮商嗎？</b> 依各機構有無核可通訊諮商/診察，請以機構公告為準。</li>
                  <li><b>超過 3 次？</b> 補助上限 3 次，之後依機構一般收費或其他資源。</li>
                </ul>
              </details>

              <div className="rounded-md bg-rose-50 p-3">
                <b>緊急/高風險請優先求助：</b> 安心專線 1925、生命線 1995、張老師 1980。
              </div>

              <p className="text-xs text-slate-500">
                資料來源：衛福部心理健康支持方案／地方衛生局公開資訊；本網站僅供便民查詢，不取代專業醫療建議。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
