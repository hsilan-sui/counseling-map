/**
 * 首頁 Home：清單、搜尋、篩選、距離排序、定位、地圖（先鎖定縣市再排序）
 */
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import clinic from "../../public/clinic.json";
import LeftSidebar from "../components/LeftSidebar";
import AnnouncementPanel from "@/components/AnnouncementPanel";
import type { Clinic } from "@/types/clinic";

// ✅ 宣告放在 import 之後
const ANNOUNCE_KEY = "announce:v2-2025-09-04";

// ---- local type：在 Home 內部多帶一個 geoCounty，不動全域型別 ----
type ClinicWithGeo = Clinic & { geoCounty: string };

// ---- 工具：距離、經緯度校正（處理 lat/lng 被寫反）----
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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

// ---- 22 縣市重心（大略值）& 用「座標」推縣市（忽略 JSON 的 county）----
const COUNTY_CENTROIDS = [
  { name: "基隆市", lat: 25.128, lng: 121.741 },
  { name: "臺北市", lat: 25.037, lng: 121.564 },
  { name: "新北市", lat: 25.016, lng: 121.465 },
  { name: "桃園市", lat: 24.993, lng: 121.301 },
  { name: "新竹市", lat: 24.804, lng: 120.971 },
  { name: "新竹縣", lat: 24.703, lng: 121.125 },
  { name: "苗栗縣", lat: 24.56, lng: 120.82 },
  { name: "臺中市", lat: 24.147, lng: 120.673 },
  { name: "彰化縣", lat: 24.075, lng: 120.542 },
  { name: "南投縣", lat: 23.96, lng: 120.971 },
  { name: "雲林縣", lat: 23.707, lng: 120.538 },
  { name: "嘉義市", lat: 23.48, lng: 120.449 },
  { name: "嘉義縣", lat: 23.458, lng: 120.255 },
  { name: "臺南市", lat: 23.0, lng: 120.227 },
  { name: "高雄市", lat: 22.627, lng: 120.301 },
  { name: "屏東縣", lat: 22.551, lng: 120.548 },
  { name: "宜蘭縣", lat: 24.702, lng: 121.738 },
  { name: "花蓮縣", lat: 23.991, lng: 121.601 },
  { name: "臺東縣", lat: 22.984, lng: 121.332 },
  { name: "澎湖縣", lat: 23.571, lng: 119.579 },
  { name: "金門縣", lat: 24.436, lng: 118.318 },
  { name: "連江縣", lat: 26.16, lng: 119.95 },
];
function countyByCoords(lat: number, lng: number): string {
  let best = COUNTY_CENTROIDS[0].name;
  let bestD = Infinity;
  for (const c of COUNTY_CENTROIDS) {
    const d = haversineDistance(lat, lng, c.lat, c.lng);
    if (d < bestD) {
      bestD = d;
      best = c.name;
    }
  }
  return best;
}

// 讀入時：補 id + 校正座標 + 帶上 geoCounty（之後排序/過濾都用它）
const clinicsAll: ClinicWithGeo[] = ((clinic as any).rows || []).map((c: any, i: number) => {
  const pos = normalizeLatLng(Number(c.lat), Number(c.lng));
  return {
    id: String(i + 1),
    ...c,
    lat: pos.lat,
    lng: pos.lng,
    geoCounty: countyByCoords(pos.lat, pos.lng),
  } as ClinicWithGeo;
});

// 距離上限（km）：避免極端錯誤座標混入
const DIST_LIMIT_KM = 30;

// 動態載入地圖（Leaflet 需關 SSR）
const ClinicsMap = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  //預設顯示All
  //const [filter, setFilter] = useState<"all" | "has" | "none">("all");

  //預設顯示 有名額 
  const [filter, setFilter] = useState<"all" | "has" | "none">("has");
  // 分離語意
  const [userLatLng, setUserLatLng] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  // 僅顯示用
  const [preferredCounty, setPreferredCounty] = useState<string | null>(null);

  // 距離排序結果（直接存陣列；lat/lng 已是校正後）
  const [sortedByDistance, setSortedByDistance] = useState<ClinicWithGeo[] | null>(null);

  // 公告顯示狀態（首次顯示一次）
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // 篩選（依 has_quota/none）
  const clinics = useMemo<ClinicWithGeo[]>(() => {
    if (filter === "has") return clinicsAll.filter((c) => c.has_quota);
    if (filter === "none") return clinicsAll.filter((c) => !c.has_quota);
    return clinicsAll;
  }, [filter]);

  // 顯示（排序優先）
  const clinicsToShow = useMemo<ClinicWithGeo[]>(
    () => sortedByDistance ?? clinics,
    [clinics, sortedByDistance]
  );

  // 計數（全量）
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

  // 啟動一次：稽核資料
  useEffect(() => {
    const wrongs = clinicsAll.filter((c) => c.county && c.geoCounty && c.county !== c.geoCounty);
    if (wrongs.length) {
      console.log(
        "⚠️ JSON 內『地址縣市』與『座標推縣市』不一致的筆數 =",
        wrongs.length,
        wrongs.slice(0, 5).map((x) => ({
          name: x.org_name,
          county_text: x.county,
          county_geo: x.geoCounty,
          lat: x.lat,
          lng: x.lng,
        }))
      );
    }
  }, []);

  // helper：用指定座標排序最近診所 + 選取 + 置中
  const sortClinicsByDistanceFrom = (ulat: number, ulng: number) => {
    const userCounty = countyByCoords(ulat, ulng);
    setPreferredCounty(userCounty);

    const sameCounty = clinics.filter((c) => c.geoCounty === userCounty);
    const pool = sameCounty.length ? sameCounty : clinics;

    const sorted = [...pool]
      .map((c) => ({ ...c, distance: haversineDistance(ulat, ulng, c.lat, c.lng) }))
      .filter((c) => c.distance! <= DIST_LIMIT_KM)
      .sort((a, b) => a.distance! - b.distance!);

    setSortedByDistance(sorted);

    if (sorted.length) {
      const first = sorted[0];
      setSelectedClinicId(first.id);
      setMapCenter([first.lat, first.lng]);
    }
  };

  // 「離我最近」按鈕（使用已知 userLatLng）
  const sortClinicsByDistance = () => {
    if (!userLatLng) {
      alert("請先允許定位功能");
      return;
    }
    const [ulat, ulng] = userLatLng;
    sortClinicsByDistanceFrom(ulat, ulng);
  };

  // ✅ 首次載入：只檢查；不要在這裡寫入 localStorage（Strict Mode 兩次執行會吃掉首次顯示）
  useEffect(() => {
    try {
      const seen = localStorage.getItem(ANNOUNCE_KEY);
      if (seen !== "1") setShowAnnouncement(true);
    } catch {
      // 無痕模式可能報錯，忽略
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          setUserLatLng([latitude, longitude]);
          // 直接用拿到的座標進行排序（避免 setState 非同步）
          sortClinicsByDistanceFrom(latitude, longitude);
        },
        (err) => {
          console.warn("定位失敗/被拒：", err.message);
          if (!mapCenter) setMapCenter([23.6978, 120.9605]); // 台灣中心
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 👍 開關公告的處理：關閉時才標記已讀
  const openAnnouncement = () => setShowAnnouncement(true);
  const closeAnnouncement = () => {
    try {
      localStorage.setItem(ANNOUNCE_KEY, "1");
    } catch {}
    setShowAnnouncement(false);
  };

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
      setMapCenter([found.lat, found.lng]); // 已為校正座標
      setSearchInput("");                   // ✅ 成功後清空輸入框
    } else {
      // （可選）找不到時給點回饋
      alert("找不到符合的診所或地址");
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
              setMapCenter([c.lat, c.lng]); // 已為校正座標
            }}
            totalAll={clinicsAll.length}
            totalHas={hasCount}
            totalNone={noneCount}
            preferredCounty={preferredCounty}
            onClearPreferred={() => {
              setPreferredCounty(null);
              setSortedByDistance(null);
            }}
            filter={filter}
            onChangeFilter={setFilter}
          />

          {/* 地圖與搜尋 UI */}
          <div className="flex-grow h-screen ml-80 relative">
            {/* 上方搜尋 & 篩選 */}
            <div className="absolute z-[1000] top-5 left-28 flex gap-2 items-center">
              {/* 合體：輸入框 + 內嵌按鈕 */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="relative"
              >
                <input
                  list="clinic-suggestions"
                  className="text-black text-base md:text-lg bg-white shadow-lg rounded-lg w-80 border border-slate-300 p-2 pr-24"
                  type="text"
                  placeholder="搜尋診所名稱 或 地址"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label="搜尋診所名稱或地址"
                />
                {/* 內嵌在輸入框右側的搜尋按鈕 */}
                <button
                  type="submit"
                  disabled={!searchInput.trim()}
                  className="absolute right-1 top-1 bottom-1 px-3 rounded-md bg-slate-800 text-white text-sm shadow-md hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="搜尋"
                  aria-label="搜尋"
                >
                  🔍 搜尋
                </button>
              </form>


              
             
              <datalist id="clinic-suggestions">
                {clinics.map((c) => (
                  <option key={c.id} value={c.org_name} />
                ))}
              </datalist>

              <div className="flex flex-col items-start gap-2">
                <button
                  className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm shadow-md hover:bg-blue-700"
                  onClick={sortClinicsByDistance}
                >
                  離我最近
                </button>

                {Array.isArray(sortedByDistance) && sortedByDistance.length > 0 && (
                  <button
                    className="px-3 py-1 rounded-md bg-gray-400 text-white text-sm shadow-md hover:bg-gray-500"
                    onClick={() => setSortedByDistance(null)}
                  >
                    清除排序
                  </button>
                )}
              </div>

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
              </div>
            </div>

            {/* 底部置中：公告按鈕（使用者可自行開啟） */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1100]">
              <button
                onClick={openAnnouncement}
                className="px-4 py-2 rounded-full bg-amber-300 text-amber-800 border border-amber-200 shadow hover:bg-amber-200 text-sm"
                title="查看公告"
              >
                📢 公告訊息
              </button>
            </div>

            {/* 地圖 */}
            <ClinicsMap
              visibleClinics={clinicsToShow}
              selectedId={selectedClinicId}
              center={mapCenter}
              onSelect={(c) => {
                setSelectedClinicId(c.id);
                setMapCenter([c.lat, c.lng]);
              }}
              onUserLocate={(lat, lng) => setUserLatLng([lat, lng])}
            />
          </div>
        </div>
      </div>

      {/* 置中公告（首次自動顯示，之後可手動開啟） */}
      {showAnnouncement && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeAnnouncement} />
          <div className="relative w-full max-w-xl mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="flex justify-end">
                <button
                  onClick={closeAnnouncement}
                  className="text-slate-500 hover:text-slate-700 text-xl leading-none"
                  aria-label="關閉公告"
                  title="關閉"
                >
                  ×
                </button>
              </div>
              {/* 只放內容版 */}
              <AnnouncementPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
