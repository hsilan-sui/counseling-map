type ViewsBadgeProps = {
    views: number | null;
    className?: string;
  };
  
  export default function ViewsBadge({ views, className }: ViewsBadgeProps) {
    if (views == null) return null; // 還沒拿到數字就不顯示，避免 SSR/CSR 不一致
  
    return (
      <div
        className={[
          "fixed z-[1200] text-xs bg-black/60 text-white px-3 py-1 rounded",
          "right-[max(1rem,env(safe-area-inset-right))]",
          "top-[max(0.5rem,env(safe-area-inset-top))]",
          className || "",
        ].join(" ")}
        aria-live="polite"
      >
        👀 瀏覽人次：{views.toLocaleString()}
      </div>
    );
  }
  