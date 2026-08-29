import { useMemo, useState } from 'react';
import { portfolioCategories, portfolioItems } from '../data/portfolioItems';
import PortfolioGrid from '../components/PortfolioGrid';
import Reveal from '../components/Reveal';

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandomStable<T>(list: T[], count: number, rng: () => number): T[] {
  if (count <= 0) return [];
  if (list.length <= count) return list.slice();

  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr.slice(0, count);
}

export default function Home() {
  const FEATURED_PER_CATEGORY = 4;
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 32));

  const items = useMemo(() => {
    return portfolioCategories
      .filter((category) => category.toLowerCase() !== 'other')
      .flatMap((category) => {
        const pool = portfolioItems.filter((item) => item.category === category && !item.hideOnHome);
        const categorySeed = xmur3(`${seed}:${category}`)();
        const rng = mulberry32(categorySeed);
        return pickRandomStable(pool, FEATURED_PER_CATEGORY, rng);
      });
  }, [seed]);

  return (
    <main className="pt-32 pb-32 w-full">
      {/* Hero Section */}
      <section className="px-6 md:px-12 lg:px-20 max-w-[1200px] mx-auto pt-20 pb-32 flex flex-col items-start justify-center">
        <Reveal>
          <h1 className="lovable-h1 text-charcoal mb-6 max-w-4xl">
            THE CINEMATIC NEGATIVE
          </h1>
          <p className="text-[18px] text-muted font-body max-w-2xl leading-[1.38] mb-10">
            Capturing the quiet, focused intensity of the modern world. Every frame is a narrative preserved in obsidian layers. A private gallery for the discerning eye.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/album" className="lovable-button lovable-button-primary">
              View Albums
            </a>
            <a href="/about" className="lovable-button lovable-button-ghost">
              Read Profile
            </a>
          </div>
        </Reveal>
      </section>

      {/* Grid Section */}
      <section className="px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
        <div className="mb-12 flex justify-between items-end border-b border-outline pb-6">
          <h2 className="lovable-h3 text-charcoal">Selected Works</h2>
        </div>
        <PortfolioGrid items={items} />
      </section>
      
      {/* Footer / CTA */}
      <section className="mt-40 mb-20 text-center max-w-3xl mx-auto px-6">
        <Reveal>
          <h2 className="lovable-h2 text-charcoal mb-6">
            Let's create something together.
          </h2>
          <p className="font-body text-[18px] leading-[1.38] text-muted mb-10">
            Based in Ho Chi Minh City, available for selected projects worldwide.
          </p>
          <a href="/contact" className="lovable-button lovable-button-primary">
            Get in touch
          </a>
        </Reveal>
      </section>
    </main>
  );
}
