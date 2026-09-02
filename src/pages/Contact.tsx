import type { FormEvent } from "react";

export default function Contact() {
  const gmailComposeUrl = ({
    to,
    subject,
    body,
  }: {
    to: string;
    subject?: string;
    body?: string;
  }) => {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to,
    });

    if (subject) params.set("su", subject);
    if (body) params.set("body", body);

    return `https://mail.google.com/mail/?${params.toString()}`;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim() || "Inquiry";
    const message = String(data.get("message") ?? "").trim();

    const bodyLines = [
      name ? `Name: ${name}` : null,
      email ? `Email: ${email}` : null,
      "",
      message || "(No message)",
    ].filter((line): line is string => line !== null);

    const url = gmailComposeUrl({
      to: "hieutran8624.work@gmail.com",
      subject: `[Portfolio] ${subject}`,
      body: bodyLines.join("\n"),
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen pt-36 pb-24 px-6 md:px-12 flex flex-col items-center w-full">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24">

        {/* Left col — headline + info */}
        <div className="md:col-span-5 flex flex-col justify-start">
          <p className="label-caps mb-5">Contact</p>
          <h1 className="lovable-h1 text-charcoal mb-8">
            Let's capture<br />the void.
          </h1>
          <div className="space-y-6 max-w-[46ch]">
            <p className="text-on-surface-variant font-body text-[16px] leading-[1.6]">
              Currently based in HCMC, available for portraiture and concepts.
              Specializing in urban spaces, fleeting emotions, and ordinary scenes
              with a sense of mood, depth, and visual narrative.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <span className="label-caps">Direct inquiries</span>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=hieutran8624.work%40gmail.com"
                target="_blank"
                rel="noreferrer"
                className="lovable-link font-body text-[16px]"
              >
                hieutran8624.work@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Right col — form */}
        <div className="md:col-span-7">
          <form className="space-y-7" onSubmit={handleSubmit} noValidate>
            <div className="group relative">
              <label
                htmlFor="contact-name"
                className="label-caps mb-3 block group-focus-within:text-charcoal transition-colors"
              >
                Name
              </label>
              <input
                type="text"
                id="contact-name"
                name="name"
                placeholder="Your full name"
                required
                className="w-full bg-surface-bright border border-outline mt-2 px-4 py-3.5 text-charcoal font-body text-[16px] outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal transition-all duration-200 rounded-none placeholder:text-muted/60"
              />
            </div>
            <div className="group relative">
              <label
                htmlFor="contact-email"
                className="label-caps mb-3 block group-focus-within:text-charcoal transition-colors"
              >
                Email address
              </label>
              <input
                type="email"
                id="contact-email"
                name="email"
                placeholder="email@example.com"
                required
                className="w-full bg-surface-bright border border-outline mt-2 px-4 py-3.5 text-charcoal font-body text-[16px] outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal transition-all duration-200 rounded-none placeholder:text-muted/60"
              />
            </div>
            <div className="group relative">
              <label
                htmlFor="contact-subject"
                className="label-caps mb-3 block group-focus-within:text-charcoal transition-colors"
              >
                Subject
              </label>
              <select
                id="contact-subject"
                name="subject"
                className="w-full bg-surface-bright border border-outline mt-2 px-4 py-3.5 text-charcoal font-body text-[16px] outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal appearance-none transition-all duration-200 rounded-none"
              >
                <option>Portrait</option>
                <option>Concept / Creative</option>
                <option>Editorial</option>
                <option>Custom inquiry</option>
              </select>
            </div>
            <div className="group relative">
              <label
                htmlFor="contact-message"
                className="label-caps mb-3 block group-focus-within:text-charcoal transition-colors"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder="Describe your project or vision"
                className="w-full bg-surface-bright border border-outline mt-2 px-4 py-3.5 text-charcoal font-body text-[16px] outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal resize-none transition-all duration-200 rounded-none placeholder:text-muted/60"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="lovable-button lovable-button-primary inline-flex items-center gap-2"
              >
                Send message
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Work preview grid */}
      <section className="w-full max-w-5xl mt-32 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative aspect-video overflow-hidden rounded-xl group liquid-hover glass-frame">
          <img
            src="/images/concept/ted_142.jpeg"
            alt="Pre-grad concepts shoot"
            className="w-full h-full object-cover opacity-55 group-hover:opacity-80 group-hover:scale-[1.03] transition-all duration-700"
          />
          <div className="absolute bottom-6 left-6">
            <span className="glass-chip">Pre-grad concepts</span>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl group liquid-hover glass-frame">
          <img
            src="/images/concept/ted_761.jpeg"
            alt="Áo Dài concept shoot"
            className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-[1.03] transition-all duration-700"
          />
          <div className="absolute bottom-6 left-6">
            <span className="glass-chip">Áo Dài concept</span>
          </div>
        </div>
      </section>
    </main>
  );
}