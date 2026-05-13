import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import Album from './pages/Album';
import About from './pages/About';
import Contact from './pages/Contact';

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(content, { autoAlpha: 1, y: 0, filter: 'none' });
      return;
    }

    gsap.killTweensOf([overlay, content]);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.set(overlay, { autoAlpha: 0 })
      .set(content, { autoAlpha: 0, y: 10, filter: 'blur(10px)' })
      .to(overlay, { autoAlpha: 1, duration: 0.12, ease: 'power2.out' }, 0)
      .to(overlay, { autoAlpha: 0, duration: 0.38, ease: 'power2.out' }, 0.14)
      .to(content, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.58 }, 0.05);

    return () => {
      tl.kill();
    };
  }, [location.pathname]);

  return (
    <div className="relative">
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[60] opacity-0 liquid-route-overlay"
      />
      <div ref={contentRef}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/album" element={<Album />} />
          <Route path="/album/*" element={<Album />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </div>
  );
}

function NavbarWithRouteReset() {
  const location = useLocation();
  return <Navbar key={location.pathname} />;
}

function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.25;

    const tryPlay = async () => {
      try {
        await audio.play();
      } catch {
        // Autoplay can be blocked until a user gesture happens.
        const onFirstGesture = () => {
          audio.play().catch(() => {
            // ignore
          });
        };

        window.addEventListener('pointerdown', onFirstGesture, { once: true });
        window.addEventListener('keydown', onFirstGesture, { once: true });
      }
    };

    tryPlay();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <NavbarWithRouteReset />
        <audio ref={audioRef} src="/audio/background.mp3" loop preload="none" autoPlay />
        <AnimatedRoutes />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
