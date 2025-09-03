import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import type { Clinic } from '@/types/clinic';

export default function RecenterMapWithSearch({
  searchClinic,
  clinics,
  markerRefs,
}: {
  searchClinic: string;
  clinics: Clinic[];
  markerRefs: React.MutableRefObject<(LeafletMarker | null)[]>;
}) {
  const map = useMap();

  useEffect(() => {
    const kw = (searchClinic || '').trim();
    if (!kw) return;

    const idx = clinics.findIndex(
      c => (c.org_name && c.org_name.includes(kw)) || (c.address && c.address.includes(kw))
    );
    if (idx < 0) return;

    const c = clinics[idx];
    map.flyTo([c.lat, c.lng], Math.max(map.getZoom(), 16), { duration: 0.6 });

    // 稍等飛行動畫，打開 popup
    const t = setTimeout(() => {
      markerRefs.current[idx]?.openPopup();
    }, 650);

    return () => clearTimeout(t);
  }, [searchClinic, clinics, map, markerRefs]);

  return null;
}
