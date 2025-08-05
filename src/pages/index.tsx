import dynamic from 'next/dynamic';
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

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
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="h-screen w-full">
        <Map />
      </div>
    </div>
  );
}
