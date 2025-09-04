import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { Icon, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Clinic } from "@/types/clinic";

const taipeiCenter: LatLngExpression = [25.0478, 121.5319];

function useIsNarrow(bp = 1170) {
    const [narrow, setNarrow] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia(`(max-width:${bp}px)`);
      const onChange = () => setNarrow(mq.matches);
      onChange();
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }, [bp]);
    return narrow;
  }

// 使用者位置 marker
const userIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// 顏色 marker
const iconGreen = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const iconGrey = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 父層 center 變更時移動
function ControlledCenter({ center }: { center: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, Math.max(map.getZoom(), 14));
  }, [center, map]);
  return null;
}

// 電話/LINE 解析
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

export default function ClinicsMap(props: {
  visibleClinics: Clinic[];
  selectedId?: string | null;   // 用 c.id
  center?: [number, number] | null;
  onSelect?: (clinic: Clinic) => void;
  onUserLocate?: (lat: number, lng: number) => void;
  topSafePx?: number;
  sidebarAtBottom?: boolean;
}) {
  const { visibleClinics, selectedId, center, onSelect, onUserLocate, topSafePx = 24, sidebarAtBottom = false,  } = props;

  const [position, setPosition] = useState<LatLngExpression | null>(null);


  // 用 Map<id, ref>，避免排序後索引錯位
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map());

  const isNarrow = useIsNarrow(1170);
  const SAFE_TOP = isNarrow ? Math.max(topSafePx ?? 0, 180) : 24; // 小於1170時至少 180px
  const POPUP_OFFSET_Y = isNarrow ? 12 : 0;                       // 卡片再往下移一些

  
  // 抓定位
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        onUserLocate?.(lat, lng);
      },
      () => setPosition(null)
    );
  }, [onUserLocate]);

  // selectedId 變更時開對應 Popup（重試機制，避免時序問題）
  useEffect(() => {
    if (!selectedId) return;

    let tries = 0;
    let timer: any;

    const tryOpen = () => {
      const ref = markerRefs.current.get(selectedId);
      if (ref) {
        ref.openPopup();
      } else if (tries < 10) {
        tries += 1;
        timer = setTimeout(tryOpen, 50);
      }
    };

    tryOpen();
    return () => clearTimeout(timer);
  }, [selectedId, visibleClinics]);

  const initialCenter = useMemo<LatLngExpression>(() => {
    if (center) return center;
    if (position) return position;
    return taipeiCenter;
  }, [center, position]);

  const renderPopup = (c: Clinic) => {
    const { phones, lineIds } = parseContacts(c.phone);
    return (
      <div className="text-sm">
        {/* 標題列：診所名 + 距離 Badge */}
        <div
            className={`${
            c.has_quota ? "bg-green-500" : "bg-gray-400"
            } text-white text-base font-bold px-2 py-2 rounded-t flex items-center justify-between`}
        >
            <span className="truncate">{c.org_name}</span>
            {typeof c.distance === "number" && (
            <span className="ml-2 inline-flex items-center rounded-full bg-white/90 text-slate-800 px-2 py-0.5 text-[11px] font-semibold">
                距{c.distance.toFixed(1)} km
            </span>
            )}
        </div>
        <div className="text-gray-700 mt-2">
          📍 {c.address}
          {typeof c.distance === "number" && <span>（距離 {c.distance.toFixed(1)} km）</span>}
        </div>

        {phones.length > 0 && (
          <div className="mt-1">
            📞 電話：
            {phones.map((p, i) => (
              <span key={p.tel}>
                <a className="text-blue-600 underline" href={`tel:${p.tel}`}>{p.raw}</a>
                {i < phones.length - 1 ? "、" : ""}
              </span>
            ))}
          </div>
        )}

        {lineIds.length > 0 && (
          <div className="mt-1">
            💬 LINE：
            {lineIds.map((id, i) => {
              const url = `https://line.me/R/ti/p/${encodeURIComponent(id)}`;
              return (
                <span key={id}>
                  <a className="text-green-700 underline" href={url} target="_blank" rel="noreferrer" title="開啟 LINE">
                    {id}
                  </a>
                  {i < lineIds.length - 1 ? "、" : ""}
                </span>
              );
            })}
          </div>
        )}

        {c.pay_detail && <div className="mt-1">💲掛號費：{c.pay_detail}</div>}
        <div className="mt-1">
          🖇️ 狀態：{c.has_quota ? "✅ 有名額" : "❌ 無名額"}
          {c.teleconsultation ? "（支援遠距看診）" : ""}
        </div>

        {/* ✅ 只有當「左側欄改到下面」時，才在 Popup 顯示各週餘額 */}
        {sidebarAtBottom && c.has_quota && (
          <div className="mt-2">
            <div className="flex justify-between text-white font-bold text-xs">
              {[
                { label: "本週", value: c.this_week ?? 0, color: "bg-blue-500" },
                { label: "下週", value: c.next_week ?? 0, color: "bg-yellow-500" },
                { label: "第3週", value: c.next_2_week ?? 0, color: "bg-teal-500" },
                { label: "第4週", value: c.next_3_week ?? 0, color: "bg-purple-500" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center justify-center rounded-full text-center
                    w-[54px] h-[54px] ${value > 0 ? color : "bg-gray-300"}`}
                >
                  <div className="text-[10px]">{label}</div>
                  <div className="text-base">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 flex gap-2">
          {c.org_url && (
            <a className="px-2 py-1 text-white bg-pink-200 rounded" href={c.org_url} target="_blank" rel="noreferrer">
              官網
            </a>
          )}
          {c.map_url && (
            <a className="px-2 py-1 text-white bg-pink-200 rounded" href={c.map_url} target="_blank" rel="noreferrer">
              Google 地圖
            </a>
          )}
        </div>
        <div className="text-[11px] text-gray-400 mt-2">
                  更新：{c.edit_date || "尚未更新"}
        </div>
      </div>
    );
  };

  return (

    <MapContainer center={initialCenter} zoom={15} scrollWheelZoom style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* 受控中心 */}
      <ControlledCenter center={center ?? null} />

      {/* 使用者位置 */}
      {position ? (
        <>
          <Marker position={position} icon={userIcon}><Popup>你在這裡</Popup></Marker>
          <Circle center={position} radius={300} pathOptions={{ color: "blue", weight: 2, opacity: 0.8, fillColor: "lightblue", fillOpacity: 0.3 }} />
        </>
      ) : (
        <Marker position={taipeiCenter} icon={userIcon}><Popup>尚未取得定位，顯示預設位置</Popup></Marker>
      )}

      {/* 診所標記（座標已在 Home 時就校正過了，這裡直接用） */}
      {visibleClinics.map((c) => (
        <Marker
          key={c.id}
          position={[c.lat, c.lng]}
          icon={c.has_quota ? iconGreen : iconGrey}
          ref={(ref) => {
            if (ref) markerRefs.current.set(c.id, ref);
            else markerRefs.current.delete(c.id);
          }}
          eventHandlers={{ click: () => onSelect?.(c) }}
        >
          <Popup
            autoPan
            keepInView
            maxWidth={isNarrow ? 280 : 360}
            autoPanPaddingTopLeft={[16, SAFE_TOP]}
  autoPanPaddingBottomRight={[16, 24]}
  offset={[0, POPUP_OFFSET_Y]}
            >
            {renderPopup(c)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>

  );
}
