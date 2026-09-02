import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { portfolioCategories } from '../data/portfolioItems';

export default function Navbar() {
  const location = useLocation();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setCategoryOpen(false);
  }, [location.pathname]);

  const categoryNavItems = portfolioCategories.map((c) => ({
    label: c,
    path: `/category/${encodeURIComponent(c)}`,
  }));

  const isCategorySectionActive = location.pathname.startsWith('/category/');
  const isAlbumSectionActive =
    location.pathname === '/album' || location.pathname.startsWith('/album/');

  const navItemClass = (isActive: boolean) =>
    `inline-flex items-center align-middle font-body text-[15px] transition-all duration-200 outline-none ${
      isActive
        ? 'text-primary underline decoration-1 underline-offset-4'
        : 'text-charcoal-83 hover:text-primary hover:underline hover:decoration-1 hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:rounded'
    }`;

  return (
    <nav
      className={`fixed top-0 w-full flex flex-col items-center z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/92 backdrop-blur-md border-b border-outline'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-7xl flex justify-between items-center px-6 md:px-12 py-4">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
          }}
          className="font-headline text-[22px] tracking-[-0.02em] text-primary select-none outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:rounded"
        >
          t3d.foto
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          <Link to="/" className={navItemClass(location.pathname === '/')}>
            Gallery
          </Link>

          <Link to="/album" className={navItemClass(isAlbumSectionActive)}>
            Album
          </Link>

          {/* Category dropdown */}
          <div className="relative group">
            <button
              type="button"
              id="category-menu-btn"
              onClick={() => setCategoryOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={categoryOpen}
              aria-controls="category-menu"
              className={`${navItemClass(isCategorySectionActive)} appearance-none bg-transparent border-0 p-0`}
            >
              Category
            </button>

            <div
              id="category-menu"
              role="menu"
              aria-labelledby="category-menu-btn"
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

          <Link to="/about" className={navItemClass(location.pathname === '/about')}>
            About
          </Link>

          <Link
            to="/contact"
            className="lovable-button lovable-button-primary ml-1 text-[14px] py-2 px-4"
          >
            Let's work
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          id="mobile-menu-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:rounded"
        >
          <span
            className={`block w-5 h-[1.5px] bg-charcoal transition-all duration-300 origin-center ${
              mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-charcoal transition-all duration-300 ${
              mobileOpen ? 'opacity-0 scale-x-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-charcoal transition-all duration-300 origin-center ${
              mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden w-full overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        } bg-surface/96 backdrop-blur-md border-b border-outline`}
      >
        <div className="flex flex-col px-6 py-6 gap-5">
          <Link to="/" className={navItemClass(location.pathname === '/')}>
            Gallery
          </Link>
          <Link to="/album" className={navItemClass(isAlbumSectionActive)}>
            Album
          </Link>
          <div>
            <button
              type="button"
              onClick={() => setCategoryOpen((prev) => !prev)}
              className={`${navItemClass(isCategorySectionActive)} appearance-none bg-transparent border-0 p-0 w-full text-left`}
            >
              Category
            </button>
            {categoryOpen && (
              <div className="mt-2 ml-3 flex flex-col gap-1">
                {categoryNavItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`font-body text-[14px] py-1.5 transition-colors duration-200 ${
                      location.pathname === item.path ? 'text-primary font-medium' : 'text-charcoal-83'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/about" className={navItemClass(location.pathname === '/about')}>
            About
          </Link>
          <Link to="/contact" className="lovable-button lovable-button-primary text-[14px] py-2 px-5 self-start">
            Let's work
          </Link>
        </div>
      </div>
    </nav>
  );
}
