# Counseling Map｜全台心理諮商地圖
- 為什麼要寫這個網站？
    - 衛福部在 2023 年推出「15–45 歲心理健康支持方案，補助每人最多 3 次免費心理諮商。
    - 但官方查詢網站`https://sps.mohw.gov.tw/mhs`，使用上不夠直覺，對一般民眾來說，難以快速找到附近有名額的合作機構。也搞不太清楚這個方案與流程。
    - 所以做了這個網站，希望協助需要心理支持的民眾，更方便地查詢可預約的診所與資源。
    - 這是一個非商業的公益 side project資料來自各縣市衛生局與官方公告，會盡力保持更新。
    - 如果你也覺得這個計畫重要，<b>歡迎分享給需要的朋友❤️

> 以 **Next.js + TypeScript + Tailwind CSS + Leaflet（OpenStreetMap）** 打造的開源地圖工具。  
> 支援「定位最近診所」、「名額篩選」、「名稱/地址搜尋」、「RWD（1170/768 斷點）」與「資料座標自動校正」。

---

## 功能

- 📍 **定位與排序**：讀取瀏覽器 Geolocation，依距離由近到遠（預設僅納入 30 km 內）。
- 🔍 **搜尋**：診所名稱 / 地址搜尋，搭配 `<datalist>` 提示。
- ✅ **名額篩選**：全部 / 有名額 / 無名額。
- 🗺️ **地圖**：Leaflet + OpenStreetMap（**不用 Google Maps、不用金鑰**）。
- 🧭 **座標自動校正**：偵測 `lat/lng` 反寫自動交換。
- 🧩 **縣市推斷**：以座標比對 22 縣市重心，統一為 `geoCounty` 用於排序/顯示。
- 📢 **公告**：首次顯示，之後以 `localStorage` 記錄已讀（`announce:v2-2025-09-04`）。
- 📱 **RWD**：兩段重點斷點  
  - `< 1170px`：工具列直排、元件自動換行  
  - `< 768px`：手機 UI（字級/間距更緊湊）

---

## 線上展示

- Demo：`https://<your-vercel-url>.vercel.app/` （部署後填入）

---

## 技術棧

- **Next.js**（Pages Router）
- **TypeScript**
- **Tailwind CSS**
- **Leaflet / react-leaflet**
- 靜態資料：`public/clinic.json`

---

## 安裝與啟動

```bash
# 1) 安裝依賴
npm i

# 2) 開發模式
npm run dev
# http://localhost:3000

# 3) 正式建置與啟動
npm run build
npm start
```

--- 

## 專案結構
```
public/
  clinic.json
  full_taiwan.json
  favicon.ico
src/
  components/
    AnnouncementPanel.tsx
    LeftSidebar.tsx
    Map.tsx
    RecenterMapWithSearch.tsx
  pages/
    _app.tsx
    _document.tsx
    index.tsx
  styles/
    globals.css
  types/
    clinic.ts
.eslint.config.mjs

```

--- 

## 資料格式（public/clinic.json）
```json
{
  "county": "臺北市",
  "total": 136,
  "rows": [
    {
      "county": "臺北市",
      "org_name": "李政洋身心診所",
      "org_url": "https://www.leepsyclinic.com/",
      "phone": "02-27620086、02-27473339",
      "address": "臺北市松山區三民路84號.健康路345號及民生東路5段192號2樓之3",
      "map_url": "https://www.google.com.tw/maps/place/...",
      "pay_detail": "掛號費600元",
      "this_week": 0,
      "next_week": 1,
      "next_2_week": 1,
      "next_3_week": 4,
      "in_4_weeks": 6,
      "edit_date": "2025/09/01",
      "teleconsultation": true,
      "has_quota": true,
      "lat": 25.0564987,
      "lng": 121.5638555
    }
  ]
}

```

- 對應型別（src/types/clinic.ts 節錄）：
```tsx
export type Clinic = {
  id?: string;        // 讀入時補
  county: string;
  org_name: string;
  org_url?: string | null;
  phone?: string | null;
  address: string;
  map_url?: string | null;
  pay_detail?: string | null;
  this_week?: number;
  next_week?: number;
  next_2_week?: number;
  next_3_week?: number;
  in_4_weeks?: number;
  edit_date?: string;
  teleconsultation?: boolean;
  has_quota: boolean;
  lat: number;
  lng: number;
  // runtime 加值
  distance?: number;
};

```

## 前端核心（邏輯節錄）

- 1) 經緯度校正 & 距離（Haversine）
```tsx
const isTWLat = (lat: number) => lat >= 21 && lat <= 26.5;
const isTWLng = (lng: number) => lng >= 119 && lng <= 123.5;

export function normalizeLatLng(lat: number, lng: number) {
  const ok = isTWLat(lat) && isTWLng(lng);
  const swappedOk = isTWLat(lng) && isTWLng(lat);
  if (ok) return { lat, lng };
  if (!ok && swappedOk) return { lat: lng, lng: lat };
  return { lat, lng };
}

export function haversineDistance(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

```

- 2) 以座標推斷縣市（22 縣市重心最近者）
```tsx
const COUNTY_CENTROIDS = [ /* 基隆/北北基…金門/連江 */ ];
export function countyByCoords(lat: number, lng: number) {
  let best = COUNTY_CENTROIDS[0].name, bestD = Infinity;
  for (const c of COUNTY_CENTROIDS) {
    const d = haversineDistance(lat, lng, c.lat, c.lng);
    if (d < bestD) { best = c.name; bestD = d; }
  }
  return best;
}
```

- 3) 距離排序池與限制
```tsx
const DIST_LIMIT_KM = 30;

function sortClinicsByDistanceFrom(ulat: number, ulng: number, list: Clinic[]) {
  return [...list]
    .map(c => ({ ...c, distance: haversineDistance(ulat, ulng, c.lat, c.lng) }))
    .filter(c => c.distance! <= DIST_LIMIT_KM)
    .sort((a, b) => a.distance! - b.distance!);
}

```

- 4) RWD 工具列避讓（避免 Popup 被遮）
```tsx
// 以 ResizeObserver 量測工具列高度，傳入 Map 元件的 topSafePx
const toolbarRef = useRef<HTMLDivElement>(null);
const [topSafe, setTopSafe] = useState(140);

useEffect(() => {
  const el = toolbarRef.current;
  if (!el) return;
  const update = () => setTopSafe(el.getBoundingClientRect().height + 16);
  update();
  const ro = new ResizeObserver(update);
  ro.observe(el);
  window.addEventListener("resize", update);
  return () => { ro.disconnect(); window.removeEventListener("resize", update); };
}, []);

```

## RWD 規格
- ≥ 1170px（桌機）
    - 左側清單固定側欄 w-80（320px），地圖容器 md:ml-80

- < 1170px（平板）
    - 工具列 直排、寬度撐滿；篩選群組允許換行

- < 768px（手機）
    - 文字/間距縮小，操作按鈕更貼手

## 部署
```bash
npm run build
npm start

```
- 推薦 Vercel：零設定即可部署 Next.js。
- OSM 授權：請保留 `<TileLayer>` 的 attribution。

## 定時更新資料（GitHub Actions 範本）

## 授權
- 程式碼：MIT
- 地圖與地理資料：OpenStreetMap 貢獻者（須保留 attribution）

- 診所資料：public/clinic.json
    - 源自於政府衛福部心理諮商合作機構網站(`https://sps.mohw.gov.tw/mhs`)