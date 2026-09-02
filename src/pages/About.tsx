import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="min-h-screen pt-36 pb-24 px-6 md:px-12 flex items-center justify-center w-full">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">

        {/* Portrait */}
        <div
          className="relative w-full aspect-[4/5] overflow-hidden rounded-xl border border-outline"
          style={{ boxShadow: 'rgba(60, 50, 30, 0.1) 0px 16px 48px, rgba(60, 50, 30, 0.05) 0px 2px 8px' }}
        >
          <img
            src="/ted_420.jpeg"
            alt="Hoang Hieu — photographer portrait"
            className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
          />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="glass-chip">Portrait No. 042</span>
            <span className="glass-chip">ISO 100 / 35mm</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col pt-4 md:pt-10">
          <p className="label-caps mb-5">Photographer</p>
          <h1 className="lovable-h1 text-charcoal mb-7 -ml-[2px]">
            Hoang Hieu.<br />Photo
          </h1>

          <div className="max-w-[52ch] space-y-5">
            <p className="text-charcoal font-body leading-[1.55] text-[18px]">
              Also known as t3d, I'm a photographer based in Ho Chi Minh City — with a focus on
              cinematic imagery, street photography, and the quiet beauty found in everyday life.
            </p>
            <p className="text-muted font-body leading-[1.6] text-[16px]">
              My work focuses on light, atmosphere, and subtle human moments. Urban spaces, fleeting
              emotions, ordinary scenes — each with a sense of mood, depth, and visual narrative.
            </p>
          </div>

          {/* Tags — plain text, no emoji */}
          <div className="flex flex-wrap gap-2 mt-7">
            {[
              'HCMC, Vietnam',
              'Photography',
              'Lofi',
              'Night owl',
            ].map((text) => (
              <span
                key={text}
                className="inline-flex items-center rounded-md px-3 py-1.5 bg-charcoal-4 border border-outline text-charcoal font-body text-[13px] font-medium"
              >
                {text}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link
              to="/"
              className="lovable-button lovable-button-primary inline-flex items-center gap-2"
            >
              <span>View selected works</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {/* Contact details */}
          <div className="pt-10 mt-6 border-t border-outline">
            <div className="grid grid-cols-2 gap-8 mt-6">
              <div>
                <h4 className="label-caps mb-3">Contact</h4>
                <ul className="text-[16px] font-body text-charcoal space-y-1.5">
                  <li>0906 104 607</li>
                  <li className="text-muted text-[14px]">Based in HCMC</li>
                </ul>
              </div>
              <div>
                <h4 className="label-caps mb-3">Inquiries</h4>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=hieutran8624.work%40gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  className="lovable-link text-[15px]"
                >
                  hieutran8624.work<br />@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
