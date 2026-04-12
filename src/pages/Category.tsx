import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PortfolioGrid from '../components/PortfolioGrid';
import { portfolioCategories, portfolioItems, type PortfolioCategory } from '../data/portfolioItems';

function normalizeCategory(value: string) {
  return value.trim().toLowerCase().replace(/[-_\s]+/g, '');
}

function resolveCategory(raw: string | undefined): PortfolioCategory | null {
  if (!raw) return null;
  const normalized = normalizeCategory(raw);

  for (const category of portfolioCategories) {
    if (normalizeCategory(category) === normalized) return category;
  }

  return null;
}

export default function Category() {
  const { category: rawCategory } = useParams();

  const category = useMemo(() => resolveCategory(rawCategory), [rawCategory]);

  const items = useMemo(() => {
    if (!category) return [];
    return portfolioItems.filter((item) => item.category === category);
  }, [category]);

  return (
    <main className="pt-40 pb-24 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto w-full">
      <PortfolioGrid items={items} />
    </main>
  );
}
