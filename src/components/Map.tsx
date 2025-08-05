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

// 📌 修正 marker icon 不顯示（Patch）
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// 🔧 自訂 Marker icon
// const userIcon = new L.Icon({
//     iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//     iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//     shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41],
//   });
//定義Marker Icon 
//建立一個「你在這裡」的 marker 樣式，使用 Leaflet 預設藍色大頭針圖案
const userIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', //icon 的圖片連結（你可換成自訂圖片）
    iconSize: [25, 41],//icon 寬高大小
    iconAnchor: [12, 41], //定位點在哪（[12, 41] 是圖釘底部中心點）
    popupAnchor: [1, -34], //彈出訊息的參考點
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', //陰影圖片（讓圖釘更立體）
    shadowSize: [41, 41],
})

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

    return (
        <MapContainer
        center={position || taipeiCenter}
        zoom={13}
        scrollWheelZoom={true} //是否可用滑鼠滾輪縮放
        style={{ height: '100vh', width: '100%', zIndex: 1 }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'/>

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
        </MapContainer>
    )
}