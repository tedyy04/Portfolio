import { useState } from 'react';
import Lightbox from './Lightbox';
import type { PortfolioItem } from '../data/portfolioItems';

interface PortfolioGridProps {
  items: PortfolioItem[];
}

export default function PortfolioGrid({ items }: PortfolioGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <section className="masonry-grid">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => openLightbox(index)}
            className="masonry-item group relative cursor-pointer overflow-hidden image-frame-hover transition-all duration-500"
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-[1.02]"
            />
            {item.tags?.[0] && (
              <div className="absolute top-4 left-4 transition-opacity duration-300 opacity-90 group-hover:opacity-100">
                <span className="font-label text-[9px] tracking-[0.2em] uppercase text-primary bg-primary/15 border border-primary/25 backdrop-blur-sm px-2 py-1">
                  {item.tags[0]}
                </span>
              </div>
            )}

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
              <span className="font-label text-[9px] tracking-[0.2em] uppercase text-primary bg-surface/40 backdrop-blur-sm px-2 py-1">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {lightboxOpen && (
        <Lightbox
          items={items}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(index) => setCurrentImageIndex(index)}
        />
      )}
    </>
  );
}
