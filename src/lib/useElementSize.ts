import { useEffect, useRef, useState } from "react";

/** Tracks an element's live pixel width via ResizeObserver — used to position game tiles with explicit pixel coordinates instead of relying on layout-measurement-based animation, which is less reliable under rapid consecutive updates. */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setSize(el.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
