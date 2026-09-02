export default function Footer() {
  const links = [
    { label: 'Instagram', href: 'https://www.instagram.com/t3ddy.cr3/', external: true },
    { label: 'Facebook', href: 'https://www.facebook.com/tedyyheree', external: true },
    { label: 'Behance', href: 'https://www.behance.net/t3ddy_04', external: true },
    { label: 'Email', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=hieutran8624.work%40gmail.com', external: true },
  ];

  return (
    <footer className="w-full mt-16 border-t border-outline">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">

        {/* Brand */}
        <div className="flex flex-col gap-2">
          <span className="font-headline text-[20px] tracking-[-0.02em] text-charcoal">
            t3d.foto
          </span>
          <p className="font-body text-[13px] text-muted max-w-[34ch] leading-[1.5]">
            Just a person who deeply obsessed with capturing the beauty of the souls.
          </p>
        </div>

        {/* Links + copyright */}
        <div className="flex flex-col items-start md:items-end gap-5">
          <div className="flex flex-wrap gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                className="font-body text-[13px] text-muted hover:text-charcoal transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="label-caps text-muted/60">
            © {new Date().getFullYear()} t3d.foto — All rights reserved
          </p>
        </div>

      </div>
    </footer>
  );
}
