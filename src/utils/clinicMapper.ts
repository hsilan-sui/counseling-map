import { normalizeLatLng, countyByCoords } from "@/utils/geo";
import type { Clinic } from "@/types/clinic";

type ClinicWithGeo = Clinic & { geoCounty: string };

export function mapClinics(raw: any) {
  return ((raw as any).rows || []).map((c: any, i: number) => {
    const pos = normalizeLatLng(Number(c.lat), Number(c.lng));
    return {
      id: String(i + 1),
      ...c,
      lat: pos.lat,
      lng: pos.lng,
      geoCounty: countyByCoords(pos.lat, pos.lng),
    };
  });
}
