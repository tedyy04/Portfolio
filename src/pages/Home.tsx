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
    <main className="pt-40 pb-24 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto w-full">
      <PortfolioGrid items={items} />

      <Reveal className="mt-40 mb-20 text-center max-w-2xl mx-auto glass-panel rounded-2xl px-8 py-12">
        <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-8 text-primary">
          THE CINEMATIC NEGATIVE
        </h2>
        <p className="font-body text-sm leading-relaxed text-on-surface-variant">
          Capturing the quiet, focused intensity of the modern world. Every frame is a narrative preserved in obsidian layers. A private gallery for the discerning eye.
        </p>
      </Reveal>

    </main>
  );
}
