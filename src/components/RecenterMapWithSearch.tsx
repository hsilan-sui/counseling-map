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
  
      const matchedClinic = clinics.find(clinic =>
        clinic.name.includes(searchClinic) || clinic.address.includes(searchClinic)
      );
  
      if (matchedClinic) {
        map.flyTo([matchedClinic.lat, matchedClinic.lng], 16);
        const index = clinics.findIndex(c => c.id === matchedClinic.id); // 找到該診所在陣列裡的 index
        const popup = popupRefs.current[index];
        if (popup) popup.openOn(map); // 自動開啟 popup
    }
    }, [searchClinic, clinics]);
  
    return null;
  }
  

  export default RecenterMapWithSearch;