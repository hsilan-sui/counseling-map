import type { Clinic } from "@/types/clinic";

type Props = {
  clinics: Clinic[];
  selectedId?: string | null;              // 用 c.id
  onSelect: (clinic: Clinic) => void;      // 回傳整筆 clinic
  totalAll: number;
  totalHas: number;
  totalNone: number;

  // 與主頁共用的 filter
  filter: "all" | "has" | "none";
  onChangeFilter: (f: "all" | "has" | "none") => void;

  preferredCounty?: string | null;
  onClearPreferred?: () => void;
};

// ✅ 與 Map 保持一致的電話/LINE 解析
function parseContacts(raw?: string | null) {
  const phones: { raw: string; tel: string }[] = [];
  const lineIds: string[] = [];
  if (!raw) return { phones, lineIds };
  const parts = String(raw)
    .replace(/\s+/g, " ")
    .split(/[,;、，；/／]|(?:\s{2,})/g)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const p of parts) {
    const mLine =
      p.match(/(?:^|[\s:：])(@[a-z0-9_.-]+)$/i) || p.match(/line(?:\s*id)?\s*[:：]?\s*(@[a-z0-9_.-]+)/i);
    if (mLine) { lineIds.push(mLine[1]); continue; }
    const tel = p.replace(/[^0-9+]/g, "");
    if (tel.length >= 6) phones.push({ raw: p, tel });
  }
  return { phones, lineIds };
}

export default function LeftSidebar({
  clinics,
  selectedId,
  onSelect,
  totalAll,
  totalHas,
  totalNone,
  preferredCounty,
  onClearPreferred,
  filter,
  onChangeFilter,
}: Props) {
  return (
    <aside className="w-80 h-screen overflow-y-auto bg-white border-r border-gray-200 p-4 z-[1001] fixed left-0 top-0">
      <h2 className="text-center text-xl font-bold mb-2 text-gray-800">分案合作心理諮商診所</h2>

      {/* 新增：優先縣市徽章 */}
      {preferredCounty && (
        <div className="mt-2 mb-2 flex items-center gap-2">
          <span className="inline-flex items-center text-xs px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700">
            已優先顯示：{preferredCounty}
          </span>
          {onClearPreferred && (
            <button
              type="button"
              onClick={onClearPreferred}
              className="text-xs text-blue-600 hover:underline"
            >
              清除
            </button>
          )}
        </div>
      )}

      <hr className="mb-3" />

      {/* 左欄自己的篩選按鈕（小尺寸） */}
      <div className="flex items-center gap-1 bg-white shadow-sm rounded-md px-1.5 py-1 mb-2">
        <button
          className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${
            filter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
          }`}
          onClick={() => onChangeFilter("all")}
        >
          全部（{totalAll}）
        </button>
        <button
          className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${
            filter === "has" ? "bg-green-600 text-white" : "bg-green-100 text-green-700"
          }`}
          onClick={() => onChangeFilter("has")}
        >
          有名額（{totalHas}）
        </button>
        <button
          className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${
            filter === "none" ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => onChangeFilter("none")}
        >
          無名額（{totalNone}）
        </button>
      </div>

      <hr className="mb-3" />

      <ul className="space-y-2">
        {clinics.map((c) => {
          const active = selectedId === c.id;
          const { phones, lineIds } = parseContacts(c.phone);

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
              <div className={`${c.has_quota ? "bg-green-500" : "bg-gray-400"} text-white text-base font-bold px-2 py-2 rounded-t flex items-center justify-between`}>
                <span className="truncate">{c.org_name}</span>
                {typeof c.distance === "number" && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-white/90 text-slate-800 px-2 py-0.5 text-[11px] font-semibold">
                    距{c.distance.toFixed(1)} km
                  </span>
                )}
              </div>

              {/* 內容 */}
              <div className="p-3 text-sm text-gray-800 space-y-2">
                {/* 地址 */}
                <div>📍 {c.address}</div>

                {/* 聯絡方式（電話/LINE 各自分行） */}
                {(phones.length > 0 || lineIds.length > 0) && (
                  <div className="space-y-1">
                    {phones.length > 0 && (
                      <div>
                        <div>📞 電話：</div>
                        <div className="pl-5 flex flex-col gap-1">
                          {phones.map((p) => (
                            <a
                              key={p.tel}
                              className="text-blue-600 underline break-all"
                              href={`tel:${p.tel}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {p.raw}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {lineIds.length > 0 && (
                      <div>
                        <div>💬 LINE：</div>
                        <div className="pl-5 flex flex-col gap-1">
                          {lineIds.map((id) => {
                            const url = `https://line.me/R/ti/p/${encodeURIComponent(id)}`;
                            return (
                              <a
                                key={id}
                                className="text-green-700 underline break-all"
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="開啟 LINE"
                              >
                                {id}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 掛號費 */}
                {c.pay_detail && <div>💲 掛號費：{c.pay_detail}</div>}

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
                {(c.org_url || c.map_url) && (
                  <div className="mt-2 flex gap-2 text-xs">
                    {c.org_url && (
                      <a
                        className="px-2 py-1 text-white bg-pink-300 rounded"
                        href={c.org_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        官網
                      </a>
                    )}
                    {c.map_url && (
                      <a
                        className="px-2 py-1 text-white bg-pink-300 rounded"
                        href={c.map_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        地圖
                      </a>
                    )}
                  </div>
                )}

                {/* 最後更新時間 */}
                <div className="text-[11px] text-gray-400 mt-2">
                  更新：{c.edit_date || "尚未更新"}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
