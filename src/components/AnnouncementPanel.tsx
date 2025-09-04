// components/AnnouncementPanel.tsx
import { useState } from "react";
import Link from "next/link";

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
        >公告訊息
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
            <Link
              href="https://www.mohw.gov.tw/cp-16-79408-1.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors"
            >
              青壯的心誰傾聽？心理健康支持擴大方案來了！ 衛福部「15-45歲青壯世代心理健康支持方案」8月1日上路
            </Link>
            
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-800"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>
            <hr className="mb-3"/>
            <div className="space-y-3 text-sm leading-6">
            <p>
              衛福部推出心理健康支持方案，針對 <b>15–45 歲青壯年</b> 提供
              <b>每人最多 3 次免費心理諮商</b>。首次到場請攜帶身分證或健保卡。
            </p>

            <div className="rounded-md bg-green-50 border border-green-200 p-3 text-green-900">
              <b>📞 如何預約？</b>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>
                  可以使用本網站地圖，<b>找有名額並且離自家最近的合作診所</b>（心理治療所/身心科診所皆可）
                </li>
                <li>
                  用 <b>電話／LINE／診所官網</b> 向該診所預約。
                  <br />
                  📌 預約時<b>務必說明「我要使用 15–45 歲心理健康支持方案」</b>。
                </li>
                <li>
                  請於首次到場時<b>攜帶身分證或健保卡</b>。
                </li>
                <li>
                  現場會安排<b>專業評估與諮商</b>，若需要進一步治療，將協助轉介至合作醫療院所。
                </li>
              </ol>
            </div>
            <details className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            <summary className="cursor-pointer font-medium">🙋‍♀️ 為什麼會做這個網站？</summary>
            <div className="mt-2 space-y-2">
              <p>
                衛福部在 2023 年推出「<b>15–45 歲心理健康支持方案</b>」，補助每人最多 3 次<b>免費心理諮商</b>。
                但官方查詢網站
                <a
                  href="https://sps.mohw.gov.tw/mhs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 hover:text-blue-800 mx-1"
                >
                  sps.mohw.gov.tw/mhs
                </a>
                使用上不夠直覺，對一般民眾來說，難以快速找到附近有名額的合作機構。
              </p>
              <p>
                所以做了這個網站，希望協助需要心理支持的人，<b>更方便地查詢</b>可預約的診所與資源。
                這是一個<b>非商業的公益 side project</b>，資料來自各縣市衛生局與官方公告，會盡力保持更新。
              </p>
              <p>
                如果你也覺得這個計畫重要，<b>歡迎分享給需要的朋友</b> ❤️
              </p>
            </div>
          </details>

            <details className="rounded-md bg-slate-50 p-3">
              <summary className="cursor-pointer font-medium">🙋 常見問題</summary>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <b>要掛精神科嗎？</b> 不一定，合作心理機構即可安排諮商，視情況轉介。
                </li>
                <li>
                  <b>可線上諮商嗎？</b> 部分機構支援通訊諮商，請依該診所公告為主。
                </li>
                <li>
                  <b>可以多於 3 次嗎？</b> 補助上限為 3 次，第 4 次起需自費或使用其他資源。
                </li>
              </ul>
            </details>

            <div className="rounded-md bg-rose-50 p-3">
              <b>⚠️ 緊急或高風險請立即求助：</b>
              <br />
              安心專線 1925｜生命線 1995｜張老師 1980
            </div>

            <p className="text-xs text-slate-500">
              資料來源：衛福部心理健康支持方案／地方衛生局公開資訊。<br />
              本網站僅供快速查詢參考，方便需要的民眾查詢(或可點擊連結查詢-衛福部心理健康支持方案)，不取代專業醫療建議。
            </p>
          </div>
          </div>
        </div>
      )}
    </>
  );
}
