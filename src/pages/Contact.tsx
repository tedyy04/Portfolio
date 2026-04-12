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
      to: "hieutran1112824@gmail.com",
      subject: `[Portfolio] ${subject}`,
      body: bodyLines.join("\n"),
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen pt-48 pb-24 px-6 md:px-12 flex flex-col items-center w-full">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-24">
        <div className="md:col-span-5 flex flex-col justify-start">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-8">
            LET'S<br />CAPTURE<br />THE VOID.
          </h1>
          <div className="space-y-6 max-w-sm">
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Currently based in HCMC, available for portraiture and concepts. Specializing in urban spaces, fleeting emotions, and ordinary scenes with a sense of mood, depth, and visual narrative.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <span className="font-label text-[10px] tracking-[0.1em] uppercase text-outline">Direct Inquiries</span>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=hieutran1112824%40gmail.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:text-outline transition-colors duration-300 text-lg"
              >
                hieutran1112824@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <form className="space-y-12" onSubmit={handleSubmit}>
            <div className="group relative">
              <label htmlFor="name" className="font-label text-[10px] tracking-[0.1em] uppercase text-outline group-focus-within:text-primary transition-colors">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your full name"
                className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-4 text-on-surface placeholder:text-surface-container-highest transition-all duration-500"
              />
            </div>
            <div className="group relative">
              <label htmlFor="email" className="font-label text-[10px] tracking-[0.1em] uppercase text-outline group-focus-within:text-primary transition-colors">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="email@example.com"
                className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-4 text-on-surface placeholder:text-surface-container-highest transition-all duration-500"
              />
            </div>
            <div className="group relative">
              <label htmlFor="subject" className="font-label text-[10px] tracking-[0.1em] uppercase text-outline group-focus-within:text-primary transition-colors">Subject</label>
              <select
                id="subject"
                name="subject"
                className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-4 text-on-surface appearance-none transition-all duration-500"
              >
                <option className="bg-surface text-on-surface">Portrait</option>
                <option className="bg-surface text-on-surface">Concept / Creative</option>
                <option className="bg-surface text-on-surface">Editorial</option>
                <option className="bg-surface text-on-surface">Custom Inquiry</option>
              </select>
            </div>
            <div className="group relative">
              <label htmlFor="message" className="font-label text-[10px] tracking-[0.1em] uppercase text-outline group-focus-within:text-primary transition-colors">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Describe your project or vision"
                className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-4 text-on-surface placeholder:text-surface-container-highest resize-none transition-all duration-500"
              ></textarea>
            </div>
            <div className="pt-8">
              <button
                type="submit"
                className="group flex items-center gap-4 bg-primary text-on-primary px-12 py-5 font-label text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-secondary transition-all duration-300"
              >
                Send Message
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <section className="w-full max-w-7xl mt-48 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative aspect-video overflow-hidden bg-surface-container-low group">
          <img
            src="/images/concept/ted_142.jpeg"
            alt="Pre-grad Concepts"
            className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute bottom-8 left-8">
            <span className="font-label text-[10px] tracking-[0.2em] text-primary uppercase">Pre-grad Concepts</span>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden bg-surface-container-low group">
          <img
            src="/images/concept/ted_761.jpeg"
            alt="Áo Dài Concept"
            className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute bottom-8 left-8">
            <span className="font-label text-[10px] tracking-[0.2em] text-primary uppercase">Áo Dài Concept</span>
          </div>
        </div>
      </section>
    </main>
  );
}