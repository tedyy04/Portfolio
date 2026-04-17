import { useState } from 'react';
import Lightbox from './Lightbox';
import type { PortfolioItem } from '../data/portfolioItems';
import Reveal from './Reveal';

type LightboxOrigin = {
  src: string;
  rect: { top: number; left: number; width: number; height: number };
};

interface PortfolioGridProps {
  items: PortfolioItem[];
}

export default function PortfolioGrid({ items }: PortfolioGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOrigin, setLightboxOrigin] = useState<LightboxOrigin | null>(null);

  const openLightbox = (index: number, origin?: LightboxOrigin | null) => {
    setCurrentImageIndex(index);
    setLightboxOrigin(origin ?? null);
    setLightboxOpen(true);
  };

  return (
    <>
      <section className="masonry-grid">
        {items.map((item, index) => (
          <Reveal
            key={item.id}
            onClick={(e) => {
              const container = e.currentTarget as HTMLElement;
              const img = container.querySelector('img');
              const rect = img?.getBoundingClientRect();

              if (rect) {
                openLightbox(index, {
                  src: item.src,
                  rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                });
              } else {
                openLightbox(index);
              }
            }}
            className="masonry-item group relative cursor-pointer overflow-hidden rounded-2xl glass-frame liquid-hover image-frame-hover transition-all duration-500"
            delayMs={(index % 9) * 45}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-[1.02]"
            />
            {item.tags?.[0] && (
              <div className="absolute top-4 left-4 transition-opacity duration-300 opacity-90 group-hover:opacity-100">
                <span className="glass-chip font-label text-[9px] tracking-[0.2em] uppercase">
                  {item.tags[0]}
                </span>
              </div>
            )}

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
              <span className="glass-chip font-label text-[9px] tracking-[0.2em] uppercase">
                {item.label}
              </span>
            </div>
          </Reveal>
        ))}
      </section>

      {lightboxOpen && (
        <Lightbox
          items={items}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(index) => setCurrentImageIndex(index)}
          origin={lightboxOrigin}
          onConsumeOrigin={() => setLightboxOrigin(null)}
        />
      )}
    </>
  );
}
