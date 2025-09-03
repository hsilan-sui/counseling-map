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
      <h2 className="text-xl font-bold mb-2 text-gray-800">合作診所</h2>

      <div className="flex gap-2 text-xs mb-3">
        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">全部 {totalAll}</span>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">有名額 {totalHas}</span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">無名額 {totalNone}</span>
      </div>

      <ul className="space-y-2">
        {clinics.map((c) => {
          const active = selectedId === c.id;
          return (
            <li
              key={c.id}
              className={[
                "cursor-pointer text-sm rounded-md px-2 py-2 transition-colors",
                active ? "bg-blue-50 text-blue-800 border border-blue-200" : "text-gray-700 hover:bg-slate-50",
              ].join(" ")}
              onClick={() => onSelect(c)}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    c.has_quota ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span className="font-medium line-clamp-1">{c.org_name}</span>
              </div>
              <div className="text-[11px] text-gray-500 line-clamp-1">{c.address}</div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
