/**
 * 首頁 Home：清單、搜尋、篩選、距離排序、定位、地圖（先鎖定縣市再排序）
 */
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import clinic from "../../public/clinic.json";
import LeftSidebar from "../components/LeftSidebar";
import type { Clinic } from "@/types/clinic";

// 讀入時自動補上 id（從 1 起）
const clinicsAll: Clinic[] = ((clinic as any).rows || []).map(
  (c: any, i: number) => ({ id: String(i + 1), ...c })
);

// —— 工具：距離、經緯度校正（處理 lat/lng 被寫反）、臺/台 正規化 —— //
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const isTWLat = (lat: number) => lat >= 21 && lat <= 26.5;
const isTWLng = (lng: number) => lng >= 119 && lng <= 123.5;
function normalizeLatLng(lat: number, lng: number) {
  const ok = isTWLat(lat) && isTWLng(lng);
  const swappedOk = isTWLat(lng) && isTWLng(lat);
  if (ok) return { lat, lng };
  if (!ok && swappedOk) return { lat: lng, lng: lat }; // 交換
  return { lat, lng };
}
// 統一「台/臺」——只把開頭的「台」換成「臺」
const normCountyName = (name?: string | null) =>
  (name || "").replace(/^台/, "臺");

// 由使用者座標推估所在縣市：取附近(Top20)做多數決；樣本少時用最近一筆
function inferCountyFromLocation(ulat: number, ulng: number): string | null {
  const aug = clinicsAll
    .map((c) => {
      const p = normalizeLatLng(c.lat, c.lng);
      return { county: normCountyName(c.county), d: haversineDistance(ulat, ulng, p.lat, p.lng) };
    })
    .sort((a, b) => a.d - b.d);

  if (!aug.length) return null;

  const top = aug.slice(0, 20);
  const within15 = top.filter((x) => x.d <= 15); // 15km 內
  const pickFrom = within15.length >= 3 ? within15 : top.slice(0, 5);

  const freq = new Map<string, number>();
  pickFrom.forEach((x) => freq.set(x.county, (freq.get(x.county) ?? 0) + 1));

  let best: string | null = null;
  let bestN = -1;
  for (const [k, v] of freq.entries()) {
    if (v > bestN) { best = k; bestN = v; }
  }
  return best ?? normCountyName(top[0].county);
}

// 動態載入地圖（Leaflet 需關 SSR）
const ClinicsMap = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<"all" | "has" | "none">("all");

  // 分離語意
  const [userLatLng, setUserLatLng] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  // 顯示在 UI 的「推測縣市」（僅顯示用）
  const [preferredCounty, setPreferredCounty] = useState<string | null>(null);

  // 距離排序結果（直接存陣列；其中 lat/lng 已替換為校正後）
  const [sortedByDistance, setSortedByDistance] = useState<Clinic[] | null>(null);

  // 篩選（依 has_quota/none）
  const clinics = useMemo(() => {
    if (filter === "has") return clinicsAll.filter((c) => c.has_quota);
    if (filter === "none") return clinicsAll.filter((c) => !c.has_quota);
    return clinicsAll;
  }, [filter]);

  // 顯示（排序優先）
  const clinicsToShow = useMemo(() => sortedByDistance ?? clinics, [clinics, sortedByDistance]);

  // 計數
  const hasCount = useMemo(() => clinicsAll.filter((c) => c.has_quota).length, []);
  const noneCount = useMemo(() => clinicsAll.filter((c) => !c.has_quota).length, []);

  // filter 改變 → 清排序 / 校正 selected
  useEffect(() => {
    setSortedByDistance(null);
    if (selectedClinicId) {
      const exists = clinicsToShow.some((c) => c.id === selectedClinicId);
      if (!exists) setSelectedClinicId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // 搜尋（移動中心採用校正後座標）
  const handleSearch = () => {
    const kw = searchInput.trim();
    if (!kw) return;

    const idx = clinicsToShow.findIndex(
      (c) => (c.org_name && c.org_name.includes(kw)) || (c.address && c.address.includes(kw))
    );
    if (idx >= 0) {
      const found = clinicsToShow[idx];
      setSelectedClinicId(found.id);
      const pos = normalizeLatLng(found.lat, found.lng);
      setMapCenter([pos.lat, pos.lng]);
    }
  };

  // 「離我最近」：先鎖定縣市，再只在該縣市內做距離排序（距離與座標都使用校正後）
  const sortClinicsByDistance = () => {
    if (!userLatLng) {
      alert("請先允許定位功能");
      return;
    }
    const [ulat, ulng] = userLatLng;

    // 1) 推估縣市（用全量資料較穩定）
    const county = inferCountyFromLocation(ulat, ulng);
    const countyNorm = county ? normCountyName(county) : null;
    setPreferredCounty(countyNorm);

    // 2) 在「目前篩選後的清單」中，限制同縣市（若為空則退回整個篩選清單）
    const base = clinics;
    const inCounty = countyNorm
      ? base.filter((c) => normCountyName(c.county) === countyNorm)
      : base;
    const candidates = inCounty.length ? inCounty : base;

    // 3) 以校正後座標計算距離並排序；把校正後座標和距離寫入暫存陣列（不改原 JSON）
    const sorted = [...candidates]
      .map((c) => {
        const pos = normalizeLatLng(c.lat, c.lng);
        return {
          ...c,
          lat: pos.lat,
          lng: pos.lng,
          distance: haversineDistance(ulat, ulng, pos.lat, pos.lng),
        };
      })
      .sort((a, b) => (a.distance! - b.distance!));

    setSortedByDistance(sorted);

    if (sorted.length) {
      const first = sorted[0];
      setSelectedClinicId(first.id);
      setMapCenter([first.lat, first.lng]); // first 已是校正後座標
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="h-screen w-full">
        <div className="flex">
          {/* 左側清單 */}
          <LeftSidebar
            clinics={clinicsToShow}
            selectedId={selectedClinicId}
            onSelect={(c) => {
              setSelectedClinicId(c.id);
              const pos = normalizeLatLng(c.lat, c.lng);
              setMapCenter([pos.lat, pos.lng]);
            }}
            totalAll={clinicsAll.length}
            totalHas={hasCount}
            totalNone={noneCount}
          />

          {/* 地圖與搜尋 UI */}
          <div className="flex-grow h-screen ml-80 relative">
            <div className="absolute z-[1000] top-5 left-28 flex gap-2 items-center">
              <input
                list="clinic-suggestions"
                className="text-black text-base md:text-lg bg-white shadow-lg rounded-lg w-80 border border-slate-300 p-2"
                type="text"
                placeholder="搜尋診所名稱 或 地址"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <datalist id="clinic-suggestions">
                {clinics.map((c) => (
                  <option key={c.id} value={c.org_name} />
                ))}
              </datalist>

              <button
                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm shadow-md hover:bg-blue-700"
                onClick={sortClinicsByDistance}
              >
                離我最近診所
              </button>

              {!!(sortedByDistance && sortedByDistance.length) && (
                <button
                  className="px-3 py-1 rounded-md bg-gray-400 text-white text-sm shadow-md hover:bg-gray-500"
                  onClick={() => setSortedByDistance(null)}
                >
                  清除排序
                </button>
              )}

              <div className="flex items-center gap-2 bg-white/90 shadow-md rounded-md px-2 py-1">
                <button
                  className={`px-2 py-1 rounded text-sm ${
                    filter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                  onClick={() => setFilter("all")}
                >
                  全部
                </button>
                <button
                  className={`px-2 py-1 rounded text-sm ${
                    filter === "has" ? "bg-green-600 text-white" : "bg-green-100 text-green-700"
                  }`}
                  onClick={() => setFilter("has")}
                >
                  有名額（{hasCount}）
                </button>
                <button
                  className={`px-2 py-1 rounded text-sm ${
                    filter === "none" ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setFilter("none")}
                >
                  無名額（{noneCount}）
                </button>

                {/* 顯示推測縣市（可拿掉） */}
                {preferredCounty && (
                  <span className="ml-3 text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                    已優先顯示：{preferredCounty}
                  </span>
                )}
              </div>
            </div>

            {/* 地圖 */}
            <ClinicsMap
              visibleClinics={clinicsToShow}
              selectedId={selectedClinicId}
              center={mapCenter}
              onSelect={(c) => {
                setSelectedClinicId(c.id);
                const pos = normalizeLatLng(c.lat, c.lng);
                setMapCenter([pos.lat, pos.lng]);
              }}
              onUserLocate={(lat, lng) => setUserLatLng([lat, lng])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
