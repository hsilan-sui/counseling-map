import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClinicWithGeo } from "@/utils/clinicMapper";
import { haversineDistance, countyByCoords } from "@/utils/geo";

// 距離上限（km）：避免極端錯誤座標混入
const DIST_LIMIT_KM = 30;

/**
 * What:
 * Manages clinic location-related state and behaviors, including geolocation
 * bootstrapping and distance-based sorting.
 *
 * How:
 * Keeps `userLatLng`, `mapCenter`, `preferredCounty`, and `sortedByDistance`
 * state in one hook; applies the existing distance sorting flow; resets sorted
 * results when filter changes; and performs one-time browser geolocation on mount.
 *
 * Why:
 * Isolates geolocation and distance-sorting concerns from page composition while
 * preserving existing state shapes and runtime behavior.
 */
export function useClinicLocation(params: {
  clinics: ClinicWithGeo[];
  filter: "all" | "has" | "none";
  selectedClinicId: string | null;
  setSelectedClinicId: Dispatch<SetStateAction<string | null>>;
}) {
  const { clinics, filter, selectedClinicId, setSelectedClinicId } = params;

  const [userLatLng, setUserLatLng] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [preferredCounty, setPreferredCounty] = useState<string | null>(null);
  const [sortedByDistance, setSortedByDistance] = useState<ClinicWithGeo[] | null>(null);

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

  // filter 改變 → 清排序 / 校正 selected
  useEffect(() => {
    setSortedByDistance(null);
    if (selectedClinicId) {
      const exists = (sortedByDistance ?? clinics).some((c) => c.id === selectedClinicId);
      if (!exists) setSelectedClinicId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
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

  const onUserLocate = (lat: number, lng: number) => {
    setUserLatLng([lat, lng]);
  };

  const moveMapTo = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
  };

  const clearPreferredSort = () => {
    setPreferredCounty(null);
    setSortedByDistance(null);
  };

  const clearDistanceSort = () => {
    setSortedByDistance(null);
  };

  return {
    mapCenter,
    preferredCounty,
    sortedByDistance,
    sortClinicsByDistance,
    onUserLocate,
    moveMapTo,
    clearPreferredSort,
    clearDistanceSort,
  };
}
