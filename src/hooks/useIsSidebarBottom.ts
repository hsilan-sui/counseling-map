import { useEffect, useState } from "react";

export function useIsSidebarBottom(bp = 1170) {
  const [isBottom, setIsBottom] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia(`(max-width:${bp - 1}px)`); // <1170
    const update = () => setIsBottom(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, [bp]);
  return isBottom;
}
