import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center w-full">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
        <div className="relative w-full aspect-[4/5] bg-surface-container-low overflow-hidden group">
          <img
            src="/ted_420.jpeg"
            alt="Photographer Portrait"
            className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="mt-4 flex gap-6 absolute bottom-[-40px] left-0">
            <span className="text-[10px] font-label tracking-[0.1em] uppercase text-outline">PORTRAIT NO. 042</span>
            <span className="text-[10px] font-label tracking-[0.1em] uppercase text-outline">ISO 100 / 35MM</span>
          </div>
        </div>

        <div className="flex flex-col pt-4 md:pt-12">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter mb-12 -ml-1 md:-ml-2 text-primary">
            HOANG HIEU.<br />PHOTO
          </h1>
          <div className="max-w-md space-y-8">
            <p className="text-on-surface font-body leading-relaxed text-lg font-light">
              Also known as t3d, I am a photographer based in Ho Chi Minh City, Vietnam, with a focus on cinematic imagery, street photography, and the quiet beauty found in everyday life.
            </p>
            <p className="text-on-surface-variant font-body leading-relaxed text-base font-light">
              My work focuses on light, atmosphere, and subtle human moments. Through each frame, I capture urban spaces, fleeting emotions, and ordinary scenes with a sense of mood, depth, and visual narrative.
            </p>

            <div className="pt-8">
              <Link to="/" className="inline-flex items-center gap-4 text-primary group">
                <span className="font-body text-[10px] tracking-[0.2em] uppercase border-b border-transparent group-hover:border-primary transition-all pb-1">
                  View Selected Works
                </span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="pt-16 border-t border-outline-variant/15">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-label tracking-[0.1em] uppercase text-outline mb-2">Contact Info</h4>
                  <ul className="text-[10px] font-label tracking-[0.1em] uppercase text-on-surface-variant space-y-1">
                    <li>0906104607</li>
                    <li>hieutran1112824@gmail.com</li>
                    <li>Base in HCMC</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-label tracking-[0.1em] uppercase text-outline mb-2">Inquiries</h4>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=hieutran1112824%40gmail.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-label tracking-[0.1em] uppercase text-on-surface-variant hover:text-primary transition-colors"
                  >
                    hieutran1112824@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
