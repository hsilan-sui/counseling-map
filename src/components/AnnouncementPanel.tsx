// components/AnnouncementPanel.tsx
import Link from "next/link";
import AnnouncementFooter from "./AnnouncementFooter";


export default function AnnouncementPanel() {
  return (
    <div className="space-y-3 text-sm leading-6 text-slate-800">
      {/* 標題連結 */}
      <div className="flex items-start justify-between">
        <Link
          href="https://www.mohw.gov.tw/cp-16-79408-1.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold hover:text-blue-600 transition-colors"
        >
          青壯的心誰傾聽？心理健康支持擴大方案來了！ 衛福部「15-45歲青壯世代心理健康支持方案」8月1日上路
        </Link>
      </div>
      <hr className="mb-2" />

      {/* 方案簡述 */}
      <p>
        衛福部推出心理健康支持方案，針對 <b>15–45 歲青壯年</b> 提供
        <b>每人最多 3 次免費心理諮商</b>。首次到場請攜帶身分證或健保卡。
      </p>

      {/* 如何預約 */}
      <div className="rounded-md bg-green-50 border border-green-200 p-3 text-green-900">
        <b>📞 如何預約？</b>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>
            使用本網站地圖，<b>找有名額且離你最近的合作診所</b>（心理治療所／身心科診所皆可）。
          </li>
          <li>
            以 <b>電話／LINE／診所官網</b> 向該診所預約。<br />
            📌 預約時<b>務必說「我要使用 15–45 歲心理健康支持方案」</b>。
          </li>
          <li>
            首次到場請<b>攜帶身分證或健保卡</b>。
          </li>
          <li>
            現場會安排<b>專業評估與諮商</b>；若需要進一步治療，將協助轉介至合作醫療院所。
          </li>
        </ol>
      </div>

      {/* 你提供的段落：為什麼會做這個網站？ */}
      <details className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
      <summary className="text-base font-medium touch-manipulation select-none outline-none focus-visible:ring-2 focus-visible:ring-slate-300">🙋‍♀️ 為什麼做這個網站？</summary>
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
            所以額外做了這個網站，希望協助需要心理支持的人，<b>更方便地查詢</b>可預約的診所與資源。
            這是一個<b>非商業的公益個人side project</b>，資料來自各縣市衛生局與官方公告，會盡力保持更新。
          </p>
          <p>
            如果你也覺得這個計畫重要，<b>歡迎分享給需要的朋友</b> ❤️
          </p>
        </div>
      </details>

      {/* 常見問題 */}
      <details className="rounded-md bg-slate-50 p-3">
        <summary className="text-base font-medium touch-manipulation select-none outline-none focus-visible:ring-2 focus-visible:ring-slate-300">🙋 常見問題</summary>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <b>要掛精神科嗎？</b> 不一定，合作心理機構即可安排諮商，視情況轉介。
          </li>
          <li>
            <b>可線上諮商嗎？</b> 部分機構支援通訊諮商，請依診所公告為準。
          </li>
          <li>
            <b>可以多於 3 次嗎？</b> 補助上限為 3 次，第 4 次起需自費或使用其他資源。
          </li>
        </ul>
      </details>

      {/* 緊急聯絡 */}
      <div className="rounded-md bg-rose-50 p-3">
        <b>⚠️ 緊急或高風險請立即求助：</b>
        <br />
        安心專線 1925｜生命線 1995｜張老師 1980
      </div>

      {/* 免責 */}
      {/* Footer */}
      <AnnouncementFooter />
    </div>
  );
}
