import { useState, useRef, useEffect } from "react";

/**
 * What:
 * Provides the page views counter state for the home page.
 *
 * How:
 * Initializes `views` as `null`, fetches current views via GET, then conditionally
 * sends one POST per browser session with `sessionStorage` guard, while using
 * `mountedOnce` to avoid duplicate effect execution in React development mode.
 *
 * Why:
 * Keeps views counting side effects isolated from page UI logic while preserving
 * the existing runtime behavior and request sequence.
 */
export function useViewsCounter() {
  const [views, setViews] = useState<number | null>(null);
  const mountedOnce = useRef(false); // 防 React 開發模式重複執行

  useEffect(() => {
    if (mountedOnce.current) return;
    mountedOnce.current = true;

    (async () => {
      // 1) 先拿目前總數
      const r1 = await fetch('/api/views', { cache: 'no-store' });
      const d1 = await r1.json().catch(() => ({ views: 0 }));
      setViews(d1.views ?? 0);

      // 2) 每個瀏覽 session 只 +1 一次（避免單頁面路由切換狂加）
      if (!sessionStorage.getItem('viewed')) {
        const r2 = await fetch('/api/views', { method: 'POST', keepalive: true });
        const d2 = await r2.json().catch(() => null);
        if (d2?.views != null) setViews(d2.views);
        sessionStorage.setItem('viewed', '1');
      }
    })();
  }, []);

  return { views };
}
