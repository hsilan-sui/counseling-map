//* Map.tsx 新增地圖元件
//MapContainer 是 Leaflet 的地圖容器
//TileLayer 是地圖底圖，我們使用免費的 OpenStreetMap
//center 是地圖預設中心位置
import { MapContainer, TileLayer } from 'react-leaflet';
//安裝 TypeScript 型別檔 npm install --save-dev @types/leaflet
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const taipeiCenter: LatLngExpression = [25.0478, 121.5319]; // 台北車站中心

export default function Map() {
    return (
        <MapContainer
        center={taipeiCenter}
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'/>
        </MapContainer>
    )
}