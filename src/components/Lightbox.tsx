import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ExifSummary } from '../data/portfolioItems';
import { getExifSummary } from '../utils/exif';
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
  const mainImageRef = useRef<HTMLImageElement | null>(null);

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

  if (!portalTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex flex-col bg-surface-container-lowest/90 backdrop-blur-xl">
      <header className="flex justify-between items-center w-full px-8 py-8 md:px-12">
        <div className="flex items-center gap-6">
          <span className="text-xs font-label tracking-[0.2em] text-on-surface-variant uppercase">
            {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <h1 className="font-headline font-extrabold text-xl tracking-tighter text-primary">T3D.FOTO</h1>
        </div>
        <button
          onClick={onClose}
          className="group flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors duration-300 focus-visible:outline-none"
        >
          <span className="font-label text-[10px] tracking-[0.1em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">CLOSE</span>
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </header>

      <section className="flex-grow relative flex items-center justify-center px-[5%] md:px-[15%] pb-24 pt-8">
        <button
          onClick={handlePrev}
          className="absolute left-5 md:left-10 z-10 group w-14 h-14 md:w-16 md:h-16 rounded-full glass-frame flex items-center justify-center text-on-surface-variant hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined block leading-none text-3xl md:text-[34px] font-extralight">chevron_left</span>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-5 md:right-10 z-10 group w-14 h-14 md:w-16 md:h-16 rounded-full glass-frame flex items-center justify-center text-on-surface-variant hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined block leading-none text-3xl md:text-[34px] font-extralight">chevron_right</span>
        </button>

        <div className="relative w-full h-full flex items-center justify-center group">
          <div className="relative w-fit max-w-full mx-auto">
            <img
              ref={mainImageRef}
              src={currentItem.src}
              alt={currentItem.alt}
              className="block mx-auto object-contain max-h-[70vh] max-w-full w-auto shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />

            <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 w-full min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-3 min-w-0 mb-2">
                  <h2 className="font-headline text-2xl text-primary tracking-tight leading-none min-w-0">{currentItem.label}</h2>
                  {currentItem.tags?.[0] && (
                    <span className="glass-chip font-label text-[9px] tracking-[0.2em] uppercase flex-shrink-0">
                      {currentItem.tags[0]}
                    </span>
                  )}
                </div>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed break-words">{currentItem.alt}</p>
              </div>

              <div className="flex flex-col items-start md:items-end border-l md:border-l-0 md:border-r border-outline-variant/30 pl-4 md:pl-0 md:pr-4 min-w-0">
                <span className="font-label text-[10px] tracking-[0.15em] text-on-surface-variant uppercase">TECHNICAL SPECS</span>
                <div className="flex flex-wrap gap-3 mt-1 md:justify-end">
                  <span className="font-label text-[11px] text-primary tracking-wider break-words">
                    {exif?.camera ?? '—'}
                  </span>
                  <span className="text-outline-variant">|</span>
                  <span className="font-label text-[11px] text-primary tracking-wider break-words">
                    {exif?.lens ?? '—'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-2 md:justify-end">
                  <span className="font-label text-[11px] text-primary tracking-wider break-words">
                    {exif?.aperture ?? '—'}
                  </span>
                  <span className="text-outline-variant">|</span>
                  <span className="font-label text-[11px] text-primary tracking-wider break-words">
                    {exif?.shutterSpeed ?? '—'}
                  </span>
                  <span className="text-outline-variant">|</span>
                  <span className="font-label text-[11px] text-primary tracking-wider break-words">
                    {typeof exif?.iso === 'number' ? `ISO ${exif.iso}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-4 md:mx-6 mb-4 rounded-2xl glass-panel bg-surface/[0.18] py-5">
        <div className="flex items-center gap-6 px-6 md:px-8 overflow-x-auto no-scrollbar">
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onNavigate(index)}
              className={`flex-shrink-0 w-20 aspect-square cursor-pointer transition-all rounded-xl overflow-hidden glass-frame ${
                currentIndex === index
                  ? 'border-2 border-primary opacity-100 grayscale-0 thumb-active'
                  : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <img src={item.src} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </footer>
    </div>,
    portalTarget
  );
}
