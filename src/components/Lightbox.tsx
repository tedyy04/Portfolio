import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ExifSummary } from '../data/portfolioItems';
import { getExifSummary } from '../utils/exif';

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
}

export default function Lightbox({ items, currentIndex, onClose, onNavigate }: LightboxProps) {
  const [runtimeExifBySrc, setRuntimeExifBySrc] = useState<{ src: string; exif: ExifSummary | null } | null>(null);

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
          className="group flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors duration-300"
        >
          <span className="font-label text-[10px] tracking-[0.1em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">CLOSE</span>
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </header>

      <section className="flex-grow relative flex items-center justify-center px-[5%] md:px-[15%] pb-24">
        <button
          onClick={handlePrev}
          className="absolute left-8 md:left-12 z-10 group p-4 text-on-surface-variant hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined text-4xl font-extralight">arrow_back_ios</span>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-8 md:right-12 z-10 group p-4 text-on-surface-variant hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined text-4xl font-extralight">arrow_forward_ios</span>
        </button>

        <div className="relative w-full h-full flex items-center justify-center group">
          <div className="relative w-fit max-w-full mx-auto">
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              className="block mx-auto object-contain max-h-[70vh] max-w-full w-auto shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />

            <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 w-full min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-3 min-w-0 mb-2">
                  <h2 className="font-headline text-2xl text-primary tracking-tight leading-none min-w-0">{currentItem.label}</h2>
                  {currentItem.tags?.[0] && (
                    <span className="font-label text-[9px] tracking-[0.2em] uppercase text-primary bg-primary/15 border border-primary/25 backdrop-blur-sm px-2 py-1 flex-shrink-0">
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

      <footer className="w-full bg-surface-container-lowest py-6 border-t border-outline-variant/10">
        <div className="flex items-center gap-6 px-12 overflow-x-auto no-scrollbar">
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onNavigate(index)}
              className={`flex-shrink-0 w-20 aspect-square cursor-pointer transition-all ${
                currentIndex === index
                  ? 'border-2 border-primary opacity-100 grayscale-0'
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
