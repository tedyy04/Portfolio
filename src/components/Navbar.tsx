import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { portfolioCategories } from '../data/portfolioItems';

export default function Navbar() {
  const location = useLocation();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categoryNavItems = portfolioCategories
    .map((c) => ({
      label: c,
      path: `/category/${encodeURIComponent(c)}`,
    }));

  const afterCategoryItems = [
    { label: 'Contact', path: '/contact' },
    { label: 'About', path: '/about' },
  ];

  const isCategorySectionActive = location.pathname.startsWith('/category/');
  const isAlbumSectionActive = location.pathname === '/album' || location.pathname.startsWith('/album/');

  const navItemClass = (isActive: boolean) =>
    `inline-flex items-center align-middle font-body text-[16px] transition-all duration-200 outline-none ${
      isActive
        ? 'text-primary underline decoration-1 underline-offset-4'
        : 'text-charcoal-83 hover:text-primary hover:underline hover:decoration-1 hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:rounded'
    }`;

  return (
    <nav className={`fixed top-0 w-full flex flex-col items-center z-50 transition-all duration-300 ${scrolled ? 'bg-surface/90 backdrop-blur-md border-b border-outline' : 'bg-transparent'}`}>
      <div className="w-full max-w-7xl flex justify-between items-center px-6 md:px-12 py-5">
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
          }}
          className="font-headline font-semibold text-primary select-none outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:rounded"
          style={{ fontSize: '24px', letterSpacing: '-0.9px' }}
        >
          t3d.foto
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={navItemClass(location.pathname === '/')}>
            Gallery
          </Link>

          <Link to="/album" className={navItemClass(isAlbumSectionActive)}>
            Album
          </Link>

          <div className="relative group">
            <button
              type="button"
              onClick={() => setCategoryOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={categoryOpen}
              className={`${navItemClass(isCategorySectionActive)} appearance-none bg-transparent border-0 p-0`}
            >
              Category
            </button>

            <div
              role="menu"
              className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 min-w-44 rounded-lg bg-surface border border-outline shadow-sm pt-2 pb-2 transition-all duration-200 ${
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
                    className={`block mx-2 px-3 py-2 rounded-md font-body text-[14px] outline-none transition-colors duration-200 hover:bg-charcoal-4 focus-visible:bg-charcoal-4 focus-visible:ring-2 focus-visible:ring-focus-ring ${
                      isActive ? 'text-primary font-medium' : 'text-charcoal-83'
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
              <Link key={item.label} to={item.path} className={navItemClass(isActive)}>
                {item.label}
              </Link>
            );
          })}
          
          <Link to="/contact" className="lovable-button lovable-button-primary ml-2 text-[14px] py-1.5 px-4 font-medium">
            Let's work
          </Link>
        </div>
      </div>
    </nav>
  );
}

