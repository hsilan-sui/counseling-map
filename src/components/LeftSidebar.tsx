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
              onClick={() => onSelect(c)}
              className={[
                "group", // 讓子元素也能感知 hover
                "rounded-md shadow border transition overflow-hidden",
                "cursor-pointer", // 滑鼠指標變手指
                selectedId === c.id
                  ? "bg-blue-50 text-blue-800 border-blue-300"
                  : "bg-white text-blue-800 hover:bg-slate-20 border-gray-200",
              ].join(" ")}
            >

              {/* 標題列：診所名 + 顏色區分 */}
              <div
                className={`${
                  c.has_quota ? "bg-green-200" : "bg-gray-400"
                } text-black text-base font-bold p-2 rounded-t`}
              >
                {c.org_name}
              </div>

              {/* 主內容區 */}
              <div className="p-3 text-sm text-gray-800 space-y-1">
                <div className="font-bold">{c.phone || "未提供電話"}</div>
                <div>
                  {c.address}
                  {"distance" in c && typeof (c as any).distance === "number" && (
                    <span className="text-gray-500 text-xs">
                      {" "}
                      ・{(c as any).distance.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>

              {/* 名額區塊（只有 has_quota 才顯示） */}
              {c.has_quota && (
                <div className="grid grid-cols-2 gap-2 mt-2 text-white font-bold text-sm px-3">
                  <div
                    className={`${
                      c.this_week > 0 ? "bg-blue-500" : "bg-gray-400"
                    } rounded px-2 py-1 text-center`}
                  >
                    本週名額：{c.this_week}
                  </div>
                  <div
                    className={`${
                      c.next_week > 0 ? "bg-yellow-500" : "bg-gray-400"
                    } rounded px-2 py-1 text-center`}
                  >
                    下週名額：{c.next_week}
                  </div>
                  <div
                    className={`${
                      c.next_2_week > 0 ? "bg-teal-500" : "bg-gray-400"
                    } rounded px-2 py-1 text-center`}
                  >
                    第三週：{c.next_2_week}
                  </div>
                  <div
                    className={`${
                      c.next_3_week > 0 ? "bg-purple-500" : "bg-gray-400"
                    } rounded px-2 py-1 text-center`}
                  >
                    第四週：{c.next_3_week}
                  </div>
                </div>
              )}

              {/* 更新時間 */}
              <div className="text-[11px] text-gray-400 mt-2 px-3">
                更新：{c.edit_date || "未提供"}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
