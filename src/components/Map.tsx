//* Map.tsx 新增地圖元件
//MapContainer 是 Leaflet 的地圖容器
//TileLayer 是地圖底圖，我們使用免費的 OpenStreetMap
//center 是地圖預設中心位置
import { MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet';
import { useEffect, useState } from 'react';
//安裝 TypeScript 型別檔 npm install --save-dev @types/leaflet
import type { LatLngExpression } from 'leaflet';
//Leaflet 的圖示（Marker 用的 icon）
import { Icon } from 'leaflet'; 
// import L from 'leaflet'; // 這裡要加上 Leaflet 原生物件
import 'leaflet/dist/leaflet.css';




//定義Marker Icon (定位icon)
//建立一個「你在這裡」的 marker 樣式，使用 Leaflet 預設藍色大頭針圖案
const userIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', //icon 的圖片連結（你可換成自訂圖片）
    iconSize: [25, 41],//icon 寬高大小
    iconAnchor: [12, 41], //定位點在哪（[12, 41] 是圖釘底部中心點）
    popupAnchor: [1, -34], //彈出訊息的參考點
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', //陰影圖片（讓圖釘更立體）
    shadowSize: [41, 41],
})

//診所Marker icon
const clinicIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // 你可以換圖
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
//   const clinicIcon = new Icon({
//     iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png', // 紅色醫療十字
//     iconSize: [30, 30],
//     iconAnchor: [15, 30],
//     popupAnchor: [0, -30],
//     shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//     shadowSize: [41, 41],
//   });
  

const taipeiCenter: LatLngExpression = [25.0478, 121.5319]; // 台北車站中心

// 地圖重新定位元件（RecenterMap 元件：讓地圖跟著位置移動）
function RecenterMap({ position }: { position: LatLngExpression }) {
    //用 useMap() 拿到 Leaflet 的地圖實體 map
    const map = useMap();
    useEffect(() => {
      //map.flyTo(position) → 地圖會用動畫飛到你的位置
      map.flyTo(position, map.getZoom());
    }, [position, map]);
    return null;
  }

export default function Map() {
    //「使用者的位置」，初始為 null，等 getCurrentPosition() 拿到資料後再更新
    const [position, setPosition] = useState<LatLngExpression | null>(null);

    // 暫時// 存放所有診所資料
    const [clinics, setClinics] = useState<any[]>([]);

    //抓使用者定位useEffect
    useEffect(() => {
        //檢查瀏覽器是否支援定位
        if(!navigator.geolocation) {
            alert('您的瀏覽器不支援定位功能');
            return;
        }
        //用 getCurrentPosition 抓使用者座標
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                console.log('使用者定位成功:', latitude, longitude);
                //抓到後用 setPosition 存進 position
                setPosition([latitude, longitude]);
            },
            (err) => {
                console.warn('定位失敗:', err);
                //若失敗就印出錯誤，並停留在預設中心（台北）
                alert('無法取得您的位置，將顯示預設地圖');
            }
        );
    }, []);

    //抓使用者定位後=> 讀取 診所資料
    // clinic.json (API取代)的 useEffect
    useEffect(() => {
        //設計功能
        const getClinicsData = async () => {
            try {
                /// 讀取 public/clinic.json
                const res = await fetch('/clinic.json'); 
                const data = await res.json();
                setClinics(data);
            } catch (error) {
                console.error('載入 clinic.json 錯誤:', error);
            }
        };
        getClinicsData();
    }, [])
    
    //在 MapContainer 裡面加上渲染所有診所 Marker 的程式碼
    return (
        <MapContainer
        center={position || taipeiCenter}
        zoom={13}
        scrollWheelZoom={true} //是否可用滑鼠滾輪縮放
        style={{ height: '100vh', width: '100%', zIndex: 1 }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'/>

            {/* 使用者定位 */}
            { position ? (
                 <>
                <Marker position={position} icon={userIcon}>
                    <Popup>你在這裡</Popup>
                </Marker>
                 <RecenterMap position={position} /> {/*  加這個 */}
                 </>
            ) : (
                <Marker position={taipeiCenter} icon={userIcon}>
                    <Popup>尚未取得定位，顯示預設位置</Popup>
                </Marker>
            )}

            {/* 所有心理機構 */}
            { clinics.map(clinic => (
                <Marker key={clinic.id} position={[clinic.lat, clinic.lng]} icon={clinicIcon}>
                    <Popup>
                        <strong>{clinic.name}</strong><br/>
                        {clinic.address}
                    </Popup>
                </Marker>
            ))

            }
        </MapContainer>
    )
}