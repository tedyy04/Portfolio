import { useEffect, useMemo, useRef, useState } from "react";

type RevealProps = React.HTMLAttributes<HTMLDivElement> & {
  delayMs?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
};

export default function Reveal({
  delayMs = 0,
  once = true,
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  className,
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  });

  const mergedStyle = useMemo(() => {
    const next: React.CSSProperties = { ...style };
    if (delayMs > 0) next.transitionDelay = `${delayMs}ms`;
    return next;
  }, [style, delayMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (revealed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, revealed, rootMargin, threshold]);

  const mergedClassName = [
    "reveal",
    revealed ? "reveal--in" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div ref={ref} className={mergedClassName} style={mergedStyle} {...rest} />;
}
