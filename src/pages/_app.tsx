
//_app.tsx:全站頁面的「外框」，包住所有頁面，所有頁面的「共同入口點」，會自動包住每個頁面元件
import 'leaflet/dist/leaflet.css'; //引入全域Leaflet 樣式
import "@/styles/globals.css";//引入全域 CSS Tailwind
import type { AppProps } from "next/app";

//AppProps: TypeScript 型別：告訴這個 component 會收到哪些 props
//Component:	就是每個 pages/*.tsx 頁面的實體元件 就是當前頁面元件，例如 /index.tsx、/about.tsx
//pageProps:是該頁面可能會接收到的資料（例如 SSR 傳進來的 props）
export default function App({ Component, pageProps }: AppProps) {
  //請把每個頁面 render 在這裡」，讓 _app.tsx 能包住它
  return <Component {...pageProps} />;
}
