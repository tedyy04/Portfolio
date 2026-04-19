import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ExifSummary } from '../data/portfolioItems';
import { getExifSummary } from '../utils/exif';
import { getDeviceId } from '../utils/deviceId';
import gsap from 'gsap';

type LightboxOrigin = {
  src: string;
  rect: { top: number; left: number; width: number; height: number };
};

interface LightboxProps {
  items: {
    id: number;
    src: string;
    alt: string;
    label: string;
    tags?: string[];
    exif?: ExifSummary | null;
  }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  origin?: LightboxOrigin | null;
  onConsumeOrigin?: () => void;
}

export default function Lightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
  origin,
  onConsumeOrigin,
}: LightboxProps) {
  const [runtimeExifBySrc, setRuntimeExifBySrc] = useState<{ src: string; exif: ExifSummary | null } | null>(null);
  const [stats, setStats] = useState<{ views: number | null; likes: number | null; liked: boolean }>(() => ({
    views: null,
    likes: null,
    liked: false,
  }));
  const [likePending, setLikePending] = useState(false);
  const mainImageRef = useRef<HTMLImageElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);

  const portalTarget = useMemo(() => {
    if (typeof document === 'undefined') return null;
    let target = document.getElementById('modal-root');
    if (!target) {
      target = document.createElement('div');
      target.id = 'modal-root';
      document.body.appendChild(target);
    }
    return target;
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onNavigate]);

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const currentItem = items[currentIndex];
  const itemExif = currentItem?.exif ?? null;

  useLayoutEffect(() => {
    const o = origin;
    if (!o) return;
    if (!currentItem?.src || o.src !== currentItem.src) return;

    const imgEl = mainImageRef.current;
    if (!imgEl) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onConsumeOrigin?.();
      return;
    }

    const clone = document.createElement('img');
    clone.src = o.src;
    clone.alt = currentItem.alt ?? '';
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${o.rect.top}px`,
      left: `${o.rect.left}px`,
      width: `${o.rect.width}px`,
      height: `${o.rect.height}px`,
      objectFit: 'cover',
      zIndex: '1101',
      pointerEvents: 'none',
      transformOrigin: 'center',
      willChange: 'top,left,width,height,transform,opacity,filter',
      filter: 'none',
    } as CSSStyleDeclaration);

    document.body.appendChild(clone);

    const cleanup = () => {
      clone.remove();
      onConsumeOrigin?.();
    };

    const run = () => {
      const target = mainImageRef.current;
      if (!target) return cleanup();

      const rect = target.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || rect.width <= 1 || !Number.isFinite(rect.height) || rect.height <= 1) {
        return false;
      }

      gsap.set(target, { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          gsap.set(target, { autoAlpha: 1 });
          cleanup();
        },
      });

      tl.to(clone, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        duration: 0.65,
      });

      return true;
    };

    let cancelled = false;
    let tries = 0;

    const tryStart = () => {
      if (cancelled) return;
      tries += 1;
      const started = run();
      if (started) return;
      if (tries >= 20) {
        cleanup();
        return;
      }
      requestAnimationFrame(tryStart);
    };

    // Ensure layout has settled.
    requestAnimationFrame(() => requestAnimationFrame(tryStart));

    return () => {
      cancelled = true;
      gsap.killTweensOf(clone);
      cleanup();
    };
  }, [currentItem?.alt, currentItem?.src, onConsumeOrigin, origin]);

  useLayoutEffect(() => {
    const img = mainImageRef.current;
    const caption = captionRef.current;
    if (!img) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Don't fight the origin-zoom animation.
    if (origin && currentItem?.src && origin.src === currentItem.src) return;

    const targets = [img, caption].filter(Boolean);
    gsap.killTweensOf(targets);

    gsap.fromTo(
      img,
      { autoAlpha: 0, filter: 'blur(10px)', scale: 1.01 },
      { autoAlpha: 1, filter: 'blur(0px)', scale: 1, duration: 0.38, ease: 'power2.out' }
    );

    if (caption) {
      gsap.fromTo(
        caption,
        { autoAlpha: 0, y: 10, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.46, ease: 'power2.out', delay: 0.05 }
      );
    }
  }, [currentItem?.src, origin]);

  useEffect(() => {
    let cancelled = false;

    const src = currentItem?.src;
    if (!src) return;

    // Only skip runtime EXIF parsing when we already have a complete set of useful fields.
    // This allows partial overrides (e.g. only `lens`) to be merged with runtime EXIF.
    const hasCompleteItemExif = Boolean(
      itemExif &&
        itemExif.camera &&
        itemExif.lens &&
        itemExif.aperture &&
        itemExif.shutterSpeed &&
        typeof itemExif.iso === 'number'
    );
    if (hasCompleteItemExif) return;

    getExifSummary(src).then((summary) => {
      if (cancelled) return;
      setRuntimeExifBySrc({ src, exif: summary as ExifSummary | null });
    });

    return () => {
      cancelled = true;
    };
  }, [currentItem?.src, itemExif]);

  const runtimeExif = useMemo(() => {
    const src = currentItem?.src;
    if (!src) return null;
    if (!runtimeExifBySrc || runtimeExifBySrc.src !== src) return null;
    return runtimeExifBySrc.exif;
  }, [currentItem?.src, runtimeExifBySrc]);

  const exif = useMemo(() => {
    if (!runtimeExif && !itemExif) return null;
    // Prefer manual/generated values when present, otherwise fill from runtime parse.
    return { ...(runtimeExif ?? {}), ...(itemExif ?? {}) } as ExifSummary;
  }, [runtimeExif, itemExif]);

  useEffect(() => {
    let cancelled = false;

    const id = String(currentItem?.id ?? '').trim();
    if (!id) return;

    const deviceId = getDeviceId() ?? undefined;

    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, deviceId }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed');
        return (await r.json()) as { views: number; likes: number; liked: boolean };
      })
      .then((data) => {
        if (cancelled) return;
        setStats({ views: data.views ?? 0, likes: data.likes ?? 0, liked: Boolean(data.liked) });
      })
      .catch(() => {
        if (cancelled) return;
        setStats((prev) => ({ ...prev, views: prev.views ?? 0, likes: prev.likes ?? 0 }));
      });

    return () => {
      cancelled = true;
    };
  }, [currentItem?.id]);

  const { cameraLensLine, exposureLine } = useMemo(() => {
    const cameraLensParts: string[] = [];
    if (exif?.camera) cameraLensParts.push(exif.camera);
    if (exif?.lens) cameraLensParts.push(exif.lens);

    const exposureParts: string[] = [];
    if (exif?.aperture) exposureParts.push(exif.aperture);
    if (exif?.shutterSpeed) exposureParts.push(exif.shutterSpeed);
    if (typeof exif?.iso === 'number') exposureParts.push(`ISO ${exif.iso}`);

    return {
      cameraLensLine: cameraLensParts.length ? cameraLensParts.join(' | ') : '—',
      exposureLine: exposureParts.length ? exposureParts.join(' | ') : '—',
    };
  }, [exif]);

  const handleToggleLike = useCallback(() => {
    const id = String(currentItem?.id ?? '').trim();
    if (!id) return;
    if (likePending) return;

    const deviceId = getDeviceId();
    if (!deviceId) return;

    setLikePending(true);

    fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, deviceId }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed');
        return (await r.json()) as { views: number; likes: number; liked: boolean };
      })
      .then((data) => {
        setStats({ views: data.views ?? 0, likes: data.likes ?? 0, liked: Boolean(data.liked) });
      })
      .catch(() => {
        // Keep previous counts on error.
      })
      .finally(() => {
        setLikePending(false);
      });
  }, [currentItem?.id, likePending]);

  if (!portalTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex flex-col bg-surface-container-lowest/85 backdrop-blur-sm">
      <header className="flex justify-between items-center w-full px-8 py-6 md:px-12 md:py-7">
        <div className="flex items-center gap-6">
          <span className="text-xs font-label tracking-[0.2em] text-on-surface-variant uppercase">
            {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <h1 className="font-headline font-extrabold text-xl tracking-tighter text-primary">T3D.FOTO</h1>

          <div className="flex items-center gap-1">
            <span className="glass-chip-compact font-label text-[9px] tracking-[0.16em] uppercase text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] leading-none">visibility</span>
              {typeof stats.views === 'number' ? stats.views.toLocaleString() : '—'}
            </span>

            <button
              type="button"
              onClick={handleToggleLike}
              aria-pressed={stats.liked}
              disabled={likePending}
              className={`glass-chip-compact liquid-focus font-label text-[9px] tracking-[0.16em] uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                stats.liked ? 'border-primary/60 text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] leading-none">
                {stats.liked ? 'favorite' : 'favorite_border'}
              </span>
              {typeof stats.likes === 'number' ? stats.likes.toLocaleString() : '—'}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="group flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors duration-300 focus-visible:outline-none"
        >
          <span className="font-label text-[10px] tracking-[0.1em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">CLOSE</span>
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </header>

      <section className="flex-grow min-h-0 relative">
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-5 md:left-10 top-1/2 -translate-y-1/2 z-10 group w-14 h-14 md:w-16 md:h-16 rounded-full glass-frame items-center justify-center text-on-surface-variant hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined block leading-none text-3xl md:text-[34px] font-extralight">chevron_left</span>
        </button>
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-5 md:right-10 top-1/2 -translate-y-1/2 z-10 group w-14 h-14 md:w-16 md:h-16 rounded-full glass-frame items-center justify-center text-on-surface-variant hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined block leading-none text-3xl md:text-[34px] font-extralight">chevron_right</span>
        </button>

        <div className="lightbox-scroll h-full overflow-y-auto px-[5%] md:px-[15%] py-8 md:py-10">
          <div className="relative w-full min-h-full flex items-start justify-center group">
            <div className="relative w-fit max-w-full mx-auto">
              <img
                ref={mainImageRef}
                src={currentItem.src}
                alt={currentItem.alt}
                className="relative z-10 block mx-auto object-contain max-h-[70vh] max-w-full w-auto shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />

              <div ref={captionRef} className="relative z-10 mt-6 md:mt-7 flex flex-col md:flex-row md:items-end justify-between gap-8 w-full min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 min-w-0 mb-2">
                    <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight leading-none min-w-0">
                      {currentItem.label}
                    </h2>
                    {currentItem.tags?.[0] && (
                      <span className="glass-chip font-label text-[9px] tracking-[0.2em] uppercase flex-shrink-0">
                        {currentItem.tags[0]}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-[13px] text-on-surface-variant leading-relaxed break-words max-w-prose">
                    {currentItem.alt}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 min-w-0">
                  <span className="font-label text-[10px] tracking-[0.15em] text-on-surface-variant uppercase">TECHNICAL SPECS</span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-label text-[11px] text-primary/90 tracking-wider break-words md:text-right">{cameraLensLine}</span>
                    <span className="font-label text-[11px] text-primary/90 tracking-wider break-words md:text-right">{exposureLine}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>,
    portalTarget
  );
}
