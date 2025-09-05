import Link from "next/link";

type AnnouncementFooterProps = {
  year?: number;
  orgName?: string;
  repoUrl?: string;
  contactEmail?: string;
  className?: string;
};

export default function AnnouncementFooter({
  year = new Date().getFullYear(),
  orgName = "hsilan-sui",
  repoUrl = "https://github.com/hsilan-sui/counseling-map",
  contactEmail = "suihsilan@gmail.com",
  className = "",
}: AnnouncementFooterProps) {
  return (
    <footer
      className={[
        "mt-6 text-center text-[11px] leading-5 text-slate-500/80",
        className,
      ].join(" ")}
      aria-label="公告內頁尾"
    >
      <p>
        © {year} {orgName} ｜ 本網站與衛福部無直接關聯，僅整理公開資訊。
      </p>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
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
          聯絡作者
        </a>
      </div>
    </footer>
  );
}
