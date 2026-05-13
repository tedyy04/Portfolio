import { useState } from 'react';
import type { AlbumItem } from '../data/albums';
import Lightbox from './Lightbox';
import Reveal from './Reveal';

type LightboxOrigin = {
  src: string;
  rect: { top: number; left: number; width: number; height: number };
};

interface AlbumGridProps {
  items: AlbumItem[];
}

export default function AlbumGrid({ items }: AlbumGridProps) {
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
              className="block w-full h-auto transition-all duration-700 ease-in-out group-hover:scale-[1.01]"
              loading="lazy"
            />
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
          showDetails={false}
        />
      )}
    </>
  );
}
