import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="min-h-screen pt-36 pb-24 px-6 md:px-12 flex items-center justify-center w-full">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">

        {/* Portrait */}
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl border border-outline">
          <img
            src="/ted_420.jpeg"
            alt="Photographer Portrait"
            className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
          />
          <div className="absolute bottom-4 left-4 flex gap-4">
            <span className="inline-flex items-center rounded-full px-2.5 py-1 bg-surface/80 backdrop-blur-sm border border-outline text-charcoal font-label text-[10px] tracking-[0.05em] uppercase shadow-sm">
              Portrait No. 042
            </span>
            <span className="inline-flex items-center rounded-full px-2.5 py-1 bg-surface/80 backdrop-blur-sm border border-outline text-charcoal font-label text-[10px] tracking-[0.05em] uppercase shadow-sm">
              ISO 100 / 35mm
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col pt-4 md:pt-12">
          <h1 className="lovable-h1 text-charcoal mb-8 -ml-1">
            Hoang Hieu.<br />Photo
          </h1>

          <div className="max-w-md space-y-6">
            <p className="text-charcoal font-body leading-[1.38] text-[18px]">
              Also known as t3d, I'm a photographer based in Ho Chi Minh City — with a focus on cinematic imagery, street photography, and the quiet beauty found in everyday life.
            </p>
            <p className="text-muted font-body leading-[1.5] text-[16px]">
              My work focuses on light, atmosphere, and subtle human moments. Urban spaces, fleeting emotions, ordinary scenes — each with a sense of mood, depth, and visual narrative.
            </p>

            {/* Clean info tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                '📍 HCMC, Vietnam',
                '📷 Photography',
                '🎵 Lofi',
                '🌙 Night owl',
              ].map((text) => (
                <span
                  key={text}
                  className="inline-flex items-center rounded-full px-3 py-1 bg-charcoal-4 border border-outline text-charcoal font-body text-[14px]"
                >
                  {text}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Link
                to="/"
                className="lovable-button lovable-button-primary inline-flex items-center gap-2"
              >
                <span>View Selected Works</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            {/* Contact */}
            <div className="pt-10 mt-4 border-t border-outline">
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <h4 className="font-body text-[14px] text-muted mb-2">Contact</h4>
                  <ul className="text-[16px] font-body text-charcoal space-y-1">
                    <li>0906 104 607</li>
                    <li>Based in HCMC</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-body text-[14px] text-muted mb-2">Inquiries</h4>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=hieutran1112824%40gmail.com"
                    target="_blank"
                    rel="noreferrer"
                    className="lovable-link text-[16px]"
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

