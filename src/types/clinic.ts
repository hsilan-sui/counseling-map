// clinic.ts

// --- 型別定義 ---
export type Clinic = {
  id: string;                // 根據 county + org_name + address 產生的穩定 id
  county: string;
  org_name: string;
  org_url?: string | null;
  phone?: string | null;
  address: string;
  map_url?: string | null;
  lat: number;               // 已完成 geocode 的數值
  lng: number;               // 已完成 geocode 的數值
  pay_detail?: string | null;
  this_week: number;
  next_week: number;
  next_2_week: number;
  next_3_week: number;
  in_4_weeks: number;
  edit_date?: string | null;
  teleconsultation: boolean;
  has_quota: boolean;
  distance?: number;         // 可選：與使用者位置距離（公里）
};

// 原始資料（還沒強制要求有 id / lat / lng）
export type RawClinicRow = Omit<Clinic, 'id' | 'lat' | 'lng' | 'distance'> & {
  lat?: number | null;
  lng?: number | null;
};

// 兩種輸入形狀：A) 平面陣列  B) 包 rows
export type ClinicsArrayInput = RawClinicRow[];
export type ClinicsWrappedInput = { county?: string; total?: number; rows: RawClinicRow[] };
export type ClinicsInput = ClinicsArrayInput | ClinicsWrappedInput;

// --- 小工具：字串正規化（去空白、台→臺 以提升穩定性）---
function norm(s: string) {
  return (s || '').replace(/\s+/g, '').replace(/台/g, '臺');
}

// --- 穩定 id：FNV-1a 32-bit（瀏覽器/Node 通吃，無需 crypto）---
function fnv1a32(str: string): string {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ('00000000' + h.toString(16)).slice(-8);
}
export function makeClinicId(c: { county: string; org_name: string; address: string }): string {
  const key = `${norm(c.county)}|${norm(c.org_name)}|${norm(c.address)}`;
  return fnv1a32(key);
}

// --- 距離（公里）：Haversine ---
export type LatLng = { lat: number; lng: number };
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371; // km
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return R * c;
}

// --- 轉換器：把原始 JSON 轉成 Clinic[]（會略過缺少 lat/lng 的筆）---
export function toClinics(input: ClinicsInput, opts?: {
  // 若提供，會額外計算 distance（公里）
  from?: LatLng;
  // 缺少 lat/lng 時是否丟例外；預設 false = 直接略過該筆
  strict?: boolean;
}): Clinic[] {
  const rows: RawClinicRow[] = Array.isArray(input) ? input : (input?.rows ?? []);
  const out: Clinic[] = [];
  const strict = !!opts?.strict;

  for (const r of rows) {
    if (r.lat == null || r.lng == null) {
      if (strict) {
        throw new Error(`Missing lat/lng for: ${r.org_name} | ${r.address}`);
      }
      continue; // 略過尚未 geocode 的資料
    }
    const clinic: Clinic = {
      id: makeClinicId({ county: r.county, org_name: r.org_name, address: r.address }),
      county: r.county,
      org_name: r.org_name,
      org_url: r.org_url ?? null,
      phone: r.phone ?? null,
      address: r.address,
      map_url: r.map_url ?? null,
      lat: Number(r.lat),
      lng: Number(r.lng),
      pay_detail: r.pay_detail ?? null,
      this_week: Number(r.this_week),
      next_week: Number(r.next_week),
      next_2_week: Number(r.next_2_week),
      next_3_week: Number(r.next_3_week),
      in_4_weeks: Number(r.in_4_weeks),
      edit_date: r.edit_date ?? null,
      teleconsultation: Boolean(r.teleconsultation),
      has_quota: Boolean(r.has_quota),
    };
    if (opts?.from) {
      clinic.distance = haversineKm({ lat: clinic.lat, lng: clinic.lng }, opts.from);
    }
    out.push(clinic);
  }
  return out;
}

// --- 範例 ---
// const raw = JSON.parse(fs.readFileSync('clinics_wrapped_geocoded.json','utf8'));
// const clinics = toClinics(raw, { from: { lat: 25.034, lng: 121.564 } });
// console.log(clinics[0].id, clinics[0].distance);

// export type Clinic = {
//     id: string;   // ✅ 新增
//     county: string;
//     org_name: string;
//     org_url?: string | null;
//     phone?: string | null;
//     address: string;
//     map_url?: string | null;
//     lat: number;
//     lng: number;
//     pay_detail?: string | null;
//     this_week: number;
//     next_week: number;
//     next_2_week: number;
//     next_3_week: number;
//     in_4_weeks: number;
//     edit_date?: string | null;
//     teleconsultation: boolean;
//     has_quota: boolean;
//     distance?: number;
//   };
  