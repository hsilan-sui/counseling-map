import dynamic from 'next/dynamic';
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from 'react';
import clinic from '../../public/clinic.json';
const clinics = clinic.rows;
// Leaflet 不能 SSR，要用 dynamic 關閉 SSR
//dynamic 很重要：因為 Leaflet 跟瀏覽器的 window 有關，不能 SSR（Server Side Render）
const Map = dynamic(() => import('../components/Map'), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  //綁定輸入框的內容，使用者打字的值
  const [searchInput, setSearchInput] = useState("");
  //使用者按下 Enter 或按鈕後，實際傳給 <Map> 的搜尋值
  const [confirmedSearch, setConfirmedSearch] = useState("");

  const handleSearch = () => {
    setConfirmedSearch(searchInput); // 確認搜尋後才觸發
  };

  

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="h-screen w-full">
        <div>
          
          <input 
          list="clinic-suggestions"
          className="text-black text-xl bg-white shadow-lg rounded-lg w-80 border-3 border-slate-400 p-2"
          type="text" 
          placeholder="搜尋診所名稱 或 診所地址" 
          value={searchInput} 
          onChange={(e) => setSearchInput(e.target.value)} 
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          style={{
            position: 'absolute',
            top: 20,
            left: 100,
            zIndex: 1000,

            
          }}
          />
          <datalist id="clinic-suggestions">
            {clinics.map(clinic => (
              <option key={clinic.org_name} value={clinic.org_name} />
            ))}
          </datalist>
          
        </div>
        
        <Map searchClinic={confirmedSearch}/>
      </div>
    </div>
  );
}
