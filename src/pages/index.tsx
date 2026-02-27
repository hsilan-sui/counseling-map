/**
 * 首頁 Home：清單、搜尋、篩選、距離排序、定位、地圖（先鎖定縣市再排序）
 */
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useRef } from "react";
import clinic from "@/data/clinics.json";
import LeftSidebar from "../components/LeftSidebar";
import AnnouncementPanel from "@/components/AnnouncementPanel";
import SmartButton from "@/components/SmartButton"; 
//import Footer from "@/components/Footer";
import ViewsBadge from "@/components/ViewsBadge";
import { useIsSidebarBottom } from "@/hooks/useIsSidebarBottom";
import { useViewsCounter } from "@/hooks/useViewsCounter";
import { mapClinics } from "@/utils/clinicMapper";
import type { ClinicWithGeo } from "@/utils/clinicMapper";
import { haversineDistance,  countyByCoords } from "@/utils/geo";

// 動態載入地圖（Leaflet 需關 SSR）
const ClinicsMap = dynamic(() => import("../components/Map"), { ssr: false });

// ✅ 宣告放在 import 之後
const ANNOUNCE_KEY = "announce:v2-2025-09-04";

// ---- 22 縣市重心（大略值）& 用「座標」推縣市（忽略 JSON 的 county）----
// 讀入時：補 id + 校正座標 + 帶上 geoCounty（之後排序/過濾都用它）
const clinicsAll = mapClinics(clinic);

// 距離上限（km）：避免極端錯誤座標混入
const DIST_LIMIT_KM = 30;


export default function Home() {
  const { views } = useViewsCounter();
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

  const toolbarRef = useRef<HTMLDivElement>(null);
  const [topSafe, setTopSafe] = useState(140); // 上方安全距（預設值先 140px）

  // Home component 內
  const isSidebarBottom = useIsSidebarBottom(768);


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

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const update = () => setTopSafe(el.getBoundingClientRect().height + 16); // +16 略加緩衝
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
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
      alert("請先點擊『清除排序』，再鍵入診所或地址名稱");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="h-screen w-full">
        <div className="flex">
          <div>
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
          </div>

          <ViewsBadge views={views} />

          
          {/* 地圖與搜尋 UI */}
          <div className="flex-grow w-full h-screen
          md:ml-80
          md:w-[calc(100%-20rem)]
          overflow-x-hidden relative">
                {/* Rwd_搜尋_start */}
         
          
          {/* 上方搜尋 & 篩選 */}
          <div
          ref={toolbarRef}
          className="
            absolute z-[1000] top-8 flex items-center gap-2 pointer-events-none
            max-[1169px]:left-4 max-[1169px]:right-4
            max-[1169px]:flex-col max-[1169px]:items-stretch max-[1169px]:gap-3
            min-[1170px]:left-auto min-[1170px]:right-6
            min-[1170px]:flex-row min-[1170px]:items-center min-[1170px]:gap-2
          "
>
            {/* 合體：輸入框 + 內嵌按鈕 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative max-[1170px]:w-full pointer-events-auto"
            >
              <input
                list="clinic-suggestions"
                className="
                  max-[1170px]:ps-8
                  text-black text-base md:text-lg bg-white shadow-lg rounded-lg
                  w-80 md:ms-4 border border-slate-300 p-2 pr-24
                  max-[1170px]:w-full max-[1170px]:w-90%
                "
                type="text"
                placeholder="搜尋診所名稱 或 地址"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="搜尋診所名稱或地址"
              />
              {/* 內嵌在輸入框右側的搜尋按鈕 */}
              <SmartButton
                type="submit"
                disabled={!searchInput.trim()}
                className="
                  absolute right-1 top-1 bottom-1 px-3 rounded-md bg-slate-800 text-white text-sm
                  shadow-md hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed
                "
                title="搜尋"
                aria-label="搜尋"
              >
                🔍 搜尋
              </SmartButton>
            </form>

            <datalist id="clinic-suggestions">
              {clinics.map((c) => (
                <option key={c.id} value={c.org_name} />
              ))}
            </datalist>

            {/* Rwd_離我最近_start（整段替換） */}
          <div
            className="
              flex gap-2 max-[1170px]:w-full
              max-[1170px]:flex-col
              min-[1170px]:flex-row min-[1170px]:items-center
            "
          >
          {/* 『離我最近 / 清除排序』這一組：≤1170 也維持橫排 */}
          <div
            className="
              pointer-events-auto flex items-start gap-2
              max-[1170px]:flex-row
              min-[1170px]:flex-row
            "
          >
            <SmartButton
              type="button"
              className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm shadow-md hover:bg-blue-700"
              onClick={sortClinicsByDistance}
            >
              離我最近
            </SmartButton>

            {Array.isArray(sortedByDistance) && sortedByDistance.length > 0 && (
              <SmartButton type="button"
                className="px-3 py-1 rounded-md bg-gray-400 text-white text-sm shadow-md hover:bg-gray-500"
                onClick={() => setSortedByDistance(null)}
              >
                清除排序
              </SmartButton>
            )}
          </div>

            {/* 『全部 / 有名額 / 無名額』這一組：>1170 橫排且不換行；≤1170 可換行 */}
            {/* 『全部 / 有名額 / 無名額』這一組：≤1170 也橫排（可換行），>1170 橫排且不換行 */}
          <div
            className="
              pointer-events-auto flex items-center gap-2 bg-white/90 shadow-md rounded-md px-2 py-1
              max-[1170px]:flex-row max-[1170px]:flex-wrap max-[1170px]:self-start max-[1170px]:w-auto max-[1170px]:grow-0
              min-[1170px]:flex-nowrap
            "
          >
              <SmartButton type="button"
                className={`px-2 py-1 rounded text-sm ${
                  filter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
                }`}
                onClick={() => setFilter("all")}
              >
                全部
              </SmartButton>
              <SmartButton type="button"
                className={`px-2 py-1 rounded text-sm ${
                  filter === "has" ? "bg-green-600 text-white" : "bg-green-100 text-green-700"
                }`}
                onClick={() => setFilter("has")}
              >
                有名額（{hasCount}）
              </SmartButton>
              <SmartButton type="button"
                className={`px-2 py-1 rounded text-sm ${
                  filter === "none" ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setFilter("none")}
              >
                無名額（{noneCount}）
              </SmartButton>
            </div>
          </div>
          {/* Rwd_離我最近_end */}
          </div>

            
            {/* 底部置中：公告按鈕（使用者可自行開啟） */}
          <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 z-[1200]" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)" }}>
            <SmartButton type="button" onClick={openAnnouncement} className="px-4 py-2 rounded-full bg-amber-300 text-amber-800 border border-amber-200 shadow hover:bg-amber-200 text-sm" title="查看公告">
              📢 公告訊息
            </SmartButton>
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
              topSafePx={topSafe}
              sidebarAtBottom={isSidebarBottom}
            />
             
          </div>
          
           {/* 頁尾：放在最外層容器最後 */}
            {/* <div className="hidden md:block fixed bottom-[env(safe-area-inset-bottom)] right-[env(safe-area-inset-right)] z-[1100] w-auto">
              <Footer
                orgName="hsilan-sui"
                repoUrl="https://github.com/hsilan-sui/counseling-map"
                contactEmail="suihsilan@gmail.com"
                className="!px-3 !py-2 !border !border-slate-200 !bg-white/95 rounded-tl-lg shadow-lg"
              />
            </div> */}
        </div>
                   
      </div>

      {/* 置中公告（首次自動顯示，之後可手動開啟） */}
      {showAnnouncement && (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 max-[768px]:items-start max-[768px]:pt-12">
        <div className="absolute inset-0 bg-black/40" onClick={closeAnnouncement} />
        <div className="relative w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto">
            {/* sticky header（關閉鈕永遠看得到） */}
            <div className="pointer-events-auto sticky top-0 z-10 flex justify-end p-3 bg-white border-b">
              <SmartButton type="button"
                onClick={closeAnnouncement}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md"
                aria-label="關閉公告"
                title="關閉"
              >
                &times;
              </SmartButton>
            </div>

            {/* 內容要包在可捲動容器裡 */}
            <div className="p-4">
              <AnnouncementPanel />
            </div>
          </div>
          
        </div>

      </div>
    )}

    </div>
  );
}
