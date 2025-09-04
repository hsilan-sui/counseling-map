import type { Clinic } from "@/types/clinic";

type Props = {
  clinics: Clinic[];
  selectedId?: string | null;              // 用 c.id
  onSelect: (clinic: Clinic) => void;      // 回傳整筆 clinic
  totalAll: number;
  totalHas: number;
  totalNone: number;
};

export default function LeftSidebar({
  clinics,
  selectedId,
  onSelect,
  totalAll,
  totalHas,
  totalNone,
}: Props) {
  return (
    <aside className="w-80 h-screen overflow-y-auto bg-white border-r border-gray-200 p-4 z-[1001] fixed left-0 top-0">
      <h2 className="text-center text-xl font-bold mb-2 text-gray-800">合作心理諮商所</h2>
      <hr className="mb-3" />
      <div className="flex gap-2 text-xs mb-3">
        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">全部 {totalAll}</span>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">有名額 {totalHas}</span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">無名額 {totalNone}</span>
      </div>
      <hr className="mb-3" />

      <ul className="space-y-2">
        {clinics.map((c) => {
          const active = selectedId === c.id;

          return (
            <li
              key={c.id}
              className={[
                "cursor-pointer text-sm rounded-md px-2 py-2 transition-colors bg-white shadow border border-gray-200 mb-4 hover:shadow-md",
                active ? "bg-blue-50 text-blue-800 border border-blue-200" : "text-gray-700 hover:bg-slate-50",
              ].join(" ")}
              onClick={() => onSelect(c)}
            >
              {/* 標題列 */}
              <div className={`${c.has_quota ? "bg-green-500" : "bg-gray-400"} text-white text-base font-bold p-2 rounded-t`}>
                {c.org_name}
              </div>

              {/* 內容 */}
              <div className="p-3 text-sm text-gray-800 space-y-1">
                {/* 電話 */}
                {c.phone && (
                  <div>
                    📞 <a className="text-blue-600 underline" href={`tel:${c.phone}`}>{c.phone}</a>
                  </div>
                )}

                {/* 地址 + 距離 */}
                <div>
                  📍 {c.address}
                  {typeof c.distance === "number" && (
                    <span className="text-gray-500 text-xs">（{c.distance.toFixed(1)} km）</span>
                  )}
                </div>

                {/* 掛號費 */}
                {c.pay_detail && (
                  <div>
                    💲 掛號費：{c.pay_detail}
                  </div>
                )}

                {/* 名額狀態 */}
                <div>
                  🖇️ 狀態：{c.has_quota ? "✅ 有名額" : "❌ 無名額"}
                  {c.teleconsultation ? "（支援遠距）" : ""}
                </div>

                {/* 本月各週名額（僅在 has_quota 為 true 顯示） */}
                {c.has_quota && (
              <div className="flex justify-between mt-2 text-white font-bold text-xs">
                {[
                  { label: "本週", value: c.this_week, color: "bg-blue-500" },
                  { label: "下週", value: c.next_week, color: "bg-yellow-500" },
                  { label: "第3週", value: c.next_2_week, color: "bg-teal-500" },
                  { label: "第4週", value: c.next_3_week, color: "bg-purple-500" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center justify-center w-[60px] h-[60px] rounded-full text-center ${
                      value > 0 ? color : "bg-gray-300"
                    }`}
                  >
                    <div className="text-[10px]">{label}</div>
                    <div className="text-lg">{value}</div>
                  </div>
                ))}
              </div>
            )}



                {/* 連結按鈕 */}
                <div className="mt-2 flex gap-2 text-xs">
                  {c.org_url && (
                    <a className="px-2 py-1 text-white bg-pink-300 rounded" href={c.org_url} target="_blank" rel="noreferrer">
                      官網
                    </a>
                  )}
                  {c.map_url && (
                    <a className="px-2 py-1 text-white bg-pink-300 rounded" href={c.map_url} target="_blank" rel="noreferrer">
                      地圖
                    </a>
                  )}
                </div>

                {/* 最後更新時間 */}
                <div className="text-[11px] text-gray-400 mt-2">
                  更新：{c.edit_date || '尚未更新'}
                </div>
              </div>
            </li>

          );
        })}
      </ul>
    </aside>
  );
}
