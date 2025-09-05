// components/Footer.tsx
import Link from "next/link";

type FooterProps = {
  year?: number;
  orgName?: string;
  repoUrl?: string;
  contactEmail?: string;
  className?: string;
};

export default function Footer({
  year = new Date().getFullYear(),
  orgName = "hsilan-sui",
  repoUrl = "https://github.com/hsilan-sui/counseling-map",
  contactEmail = "suihsilan@gmail.com",
  className = "",
}: FooterProps) {
  return (
    <footer
      className={[
        "w-full border-t border-slate-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "text-xs text-slate-500",
        "px-2 md:px-4",
        "py-2",
        className,
      ].join(" ")}
      aria-label="網站頁尾區塊"
    >
      {/* 全寬、靠右 */}
      <div className="w-full flex flex-col items-end gap-2 md:flex-row md:items-center md:justify-end">
        {/* 左側：版權＋免責 */}
        <div className="space-y-1 leading-5">
          <p>
            © {year} {orgName}｜本網站與衛福部無直接關聯，僅整理公開資訊。
          </p>
        </div>

        {/* 右側：連結列 */}
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="https://www.mohw.gov.tw/cp-16-79408-1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            方案公告（衛福部）
          </Link>
          <Link
            href="https://sps.mohw.gov.tw/mhs"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            衛福部方案查詢網站
          </Link>
          <Link
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            GitHub
          </Link>
          <a
            href={`mailto:${contactEmail}`}
            className="underline hover:text-slate-700"
          >
            問題回報
          </a>
        </nav>
      </div>
    </footer>
  );
}
