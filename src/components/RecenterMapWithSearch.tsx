import { useEffect } from 'react';
import { useMap } from 'react-leaflet'; 
import type { Popup } from 'leaflet';

type Props = {
    searchClinic: string;
    clinics: any[];
    popupRefs: React.MutableRefObject<(Popup | null)[]>;
  };

function RecenterMapWithSearch({ searchClinic, clinics, popupRefs }: Props) {
    const map = useMap();
  
    useEffect(() => {
      if (!searchClinic) return;
  
      const keyword = searchClinic.trim().toLowerCase();

      const matchedClinic = clinics.find(clinic => {
        const name = clinic.org_name?.toLowerCase() || "";
        const addr = clinic.address?.toLowerCase() || "";
        return name.includes(keyword) || addr.includes(keyword);
      });

      if (!matchedClinic) {
        alert(`找不到名稱或地址包含「${searchClinic}」的診所`);
        return;
      }

  
      if (matchedClinic) {
        map.flyTo([matchedClinic.lat, matchedClinic.lng], 16);
        // ✅ 改成這樣
        const index = clinics.findIndex(c => c === matchedClinic);// 找到該診所在陣列裡的 index
        const popup = popupRefs.current[index];
        if (popup) popup.openOn(map); // 自動開啟 popup
    }
    }, [searchClinic, clinics]);
  
    return null;
  }
  

  export default RecenterMapWithSearch;