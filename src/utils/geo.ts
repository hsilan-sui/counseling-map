const isTWLat = (lat: number) => lat >= 21 && lat <= 26.5;
const isTWLng = (lng: number) => lng >= 119 && lng <= 123.5;

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function normalizeLatLng(lat: number, lng: number) {
  const ok = isTWLat(lat) && isTWLng(lng);
  const swappedOk = isTWLat(lng) && isTWLng(lat);
  if (ok) return { lat, lng };
  if (!ok && swappedOk) return { lat: lng, lng: lat }; // 交換
  return { lat, lng };
}

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

export function countyByCoords(lat: number, lng: number): string {
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
