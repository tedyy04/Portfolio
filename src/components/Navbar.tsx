import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { portfolioCategories } from '../data/portfolioItems';

export default function Navbar() {
  const location = useLocation();
  const [categoryOpen, setCategoryOpen] = useState(false);

  const categoryNavItems = portfolioCategories
    .map((c) => ({
      label: c.toUpperCase(),
      path: `/category/${encodeURIComponent(c)}`,
    }));

  const afterCategoryItems = [
    { label: 'CONTACT', path: '/contact' },
    { label: 'ABOUT', path: '/about' },
  ];

  const isCategorySectionActive = location.pathname.startsWith('/category/');
  const isAlbumSectionActive = location.pathname === '/album' || location.pathname.startsWith('/album/');

  const navItemClass = (isActive: boolean) =>
    `liquid-hover liquid-focus inline-flex items-center align-middle leading-none font-body text-[10px] tracking-[0.1em] uppercase transition-all duration-300 hover:scale-105 hover:text-primary border-b pb-1 ${
      isActive ? 'text-primary border-primary' : 'text-outline border-transparent'
    }`;

  return (
    <nav className="fixed top-0 w-full flex flex-col items-center py-6 px-6 md:px-12 z-50 glass-nav">
      <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
          }}
          className="text-xl font-headline font-bold tracking-tighter text-primary"
        >
          T3D.FOTO
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <Link
            to="/"
            className={navItemClass(location.pathname === '/')}
          >
            WORK
          </Link>

          <Link
            to="/album"
            className={navItemClass(isAlbumSectionActive)}
          >
            ALBUM
          </Link>

          <div className="relative group">
            <button
              type="button"
              onClick={() => setCategoryOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={categoryOpen}
              className={`${navItemClass(isCategorySectionActive)} appearance-none bg-transparent border-0 p-0`}
            >
              CATEGORY
            </button>

            <div
              role="menu"
              className={`absolute left-1/2 top-full -translate-x-1/2 min-w-44 rounded-xl glass-panel bg-surface/30 pt-3 pb-2 transition-all duration-200 ${
                categoryOpen
                  ? 'visible opacity-100 translate-y-0'
                  : 'invisible opacity-0 translate-y-2'
              } group-hover:visible group-hover:opacity-100 group-hover:translate-y-0`}
            >
              {categoryNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    role="menuitem"
                    onClick={() => setCategoryOpen(false)}
                    className={`liquid-focus block mx-2 px-3 py-2 rounded-lg font-body text-[10px] tracking-[0.1em] uppercase transition-colors duration-200 hover:text-primary hover:bg-surface/[0.18] focus-visible:bg-surface/[0.18] ${
                      isActive ? 'text-primary' : 'text-outline'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {afterCategoryItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={navItemClass(isActive)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
