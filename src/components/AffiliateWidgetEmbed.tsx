import { useEffect, useRef } from "react";

/**
 * Mounts a third-party widget `<script>` (e.g. a Travelpayouts embed) at
 * this exact point in the page. These widgets render wherever their own
 * script tag sits in the DOM, which JSX can't do directly — React never
 * executes a `<script>` written into markup — so this recreates that by
 * creating a real script element and appending it into a ref'd container.
 */
export function AffiliateWidgetEmbed({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.charset = "utf-8";
    container.appendChild(script);
    return () => {
      container.innerHTML = "";
    };
  }, [src]);

  return <div ref={containerRef} />;
}
