export default function Footer() {
  const links = [
    { label: 'INSTAGRAM', href: 'https://www.instagram.com/t3ddy.cr3/', external: true },
    { label: 'FACEBOOK', href: 'https://www.facebook.com/tedyyheree', external: true },
    { label: 'BEHANCE', href: 'https://www.behance.net/t3ddy_04', external: true },
    { label: 'EMAIL', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=hieutran1112824%40gmail.com', external: true },
  ];

  return (
    <footer className="mt-24 w-full px-6 pb-24">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-12 py-16">
        <div className="flex gap-12">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              className="liquid-hover liquid-focus font-body text-[10px] tracking-[0.1em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="font-body text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
          © T3D.FOTO ALL RIGHTS RESERVED
        </p>
      </div>
    </footer>
  );
}
