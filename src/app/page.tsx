import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import ContactForm from "@/components/ContactForm";
import { worldCategories } from "@/data/categories";

const workCategories = worldCategories.filter((cat) => cat.photos.length > 0);
const totalFrames = workCategories.reduce((sum, cat) => sum + cat.photos.length, 0);
// A genuinely widescreen frame with real color and energy, and — unlike a
// motion-blur artistic shot — one that reads instantly as "DJ setup" at a
// glance: the whole point of a hero image.
const heroPhoto = workCategories.find((cat) => cat.id === "concert")!.photos.find((p) => p.id === "conc-11")!;

// Tailwind's build-time scanner can't see inside a template literal like
// `text-${accent}` — it needs the full class name written out somewhere in
// the source to generate it, so the per-category accent is a lookup of
// complete, static class strings rather than a string built at runtime.
const ACCENTS = [
  { text: "text-magenta", bar: "bg-magenta" },
  { text: "text-cyan", bar: "bg-cyan" },
  { text: "text-amber", bar: "bg-amber" },
] as const;

export default function HomePage() {
  return (
    <div className="bg-bg text-fg">
      <Nav />

      {/* Hero */}
      <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
        <Image src={heroPhoto.src} alt={heroPhoto.title} fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg from-10% via-bg/50 via-40% to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-end px-6 sm:px-12 lg:px-20 pb-20 sm:pb-28 max-w-4xl">
          <span className="font-mono text-[0.7rem] sm:text-xs uppercase tracking-[0.25em] text-cyan mb-5 animate-riseIn">
            Photographer &amp; Videographer — Bengaluru, India
          </span>
          <h1 className="font-display text-fg text-[3.25rem] sm:text-[6.5rem] leading-[0.9] uppercase animate-riseIn [animation-delay:80ms]">
            Hemanth<br />
            <span className="text-magenta">Sarode</span>
          </h1>
          <p className="mt-7 font-sans text-fg/75 text-sm sm:text-lg max-w-md leading-relaxed animate-riseIn [animation-delay:160ms]">
            Wildlife, automotive heritage, live music, and street work — shot on a Sony a6400,
            {" "}{totalFrames} frames and counting.
          </p>
          <div className="mt-10 flex items-center gap-7 animate-riseIn [animation-delay:240ms]">
            <a href="#work" className="font-mono text-xs uppercase tracking-widest px-7 py-4 bg-magenta text-bg font-bold hover:bg-cyan transition-colors">
              View the work
            </a>
            <a href="#contact" className="font-mono text-xs uppercase tracking-widest text-fg/80 hover:text-cyan transition-colors">
              Get in touch →
            </a>
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-24 sm:py-32 scroll-mt-16">
        <div className="mb-16 sm:mb-20">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-magenta">
            Selected work · {totalFrames} frames
          </span>
          <h2 className="font-display text-4xl sm:text-6xl mt-4 uppercase leading-[1.05]">
            Ways of paying attention.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {workCategories.map((cat, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <Link
                key={cat.id}
                href={`/gallery?category=${cat.id}`}
                className={`group relative overflow-hidden bg-bg-raised block ${i === 0 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}
              >
                <Image
                  src={cat.photos[0].src}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg from-5% via-bg/20 via-35% to-transparent" />
                <div className={`absolute left-0 top-0 h-1 w-12 ${accent.bar}`} />
                <div className="absolute left-0 bottom-0 right-0 p-6 sm:p-9">
                  <span className={`font-mono text-[0.65rem] uppercase tracking-[0.2em] ${accent.text} block mb-2 font-bold`}>
                    {cat.photos.length} {cat.photos.length === 1 ? "frame" : "frames"}
                  </span>
                  <h3 className="font-display text-fg text-3xl sm:text-4xl uppercase leading-none">{cat.title}</h3>
                  <p className="font-sans text-fg/65 text-xs sm:text-sm mt-2.5 max-w-xs">{cat.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-fg/10 scroll-mt-16 bg-bg-raised">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-24 sm:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative aspect-video w-full overflow-hidden order-2 md:order-1">
            <Image
              src={workCategories.find((c) => c.id === "cars")!.photos[1].src}
              alt="Hemanth Sarode's work"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div className="order-1 md:order-2">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber">About</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-4 mb-6 uppercase leading-[1.05]">
              Contrast, mostly.
            </h2>
            <p className="text-fg/75 leading-relaxed mb-4">
              HexoFrames is built around a single interest: the contrast between the smooth,
              geometric craftsmanship of human engineering and the raw, unpredictable beauty of
              the natural world. Two passions, one lens — vintage automotive detail and wildlife
              safari work, with live music and street photography shot along the way.
            </p>
            <p className="text-fg/75 leading-relaxed">
              Based in Bengaluru, India — available for shoots and collaborations across the
              country.
            </p>
            <div className="mt-10 font-mono text-xs text-muted border-t border-fg/10 pt-6 grid grid-cols-2 gap-y-3 max-w-xs">
              <span className="uppercase tracking-widest">Camera</span>
              <span className="text-fg font-bold">Sony α6400</span>
              <span className="uppercase tracking-widest">Frames shot</span>
              <span className="text-fg font-bold">{totalFrames}+</span>
              <span className="uppercase tracking-widest">Based in</span>
              <span className="text-fg font-bold">Bengaluru, IN</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-fg/10 bg-bg scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-24 sm:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-magenta">
              Let&rsquo;s create together
            </span>
            <h2 className="font-display text-4xl sm:text-6xl mt-4 uppercase leading-[1.05]">
              Inquiries &amp; collaborations.
            </h2>
            <div className="flex flex-col gap-3 font-mono text-sm mt-8">
              <a href="mailto:hemanthsarode1@gmail.com" className="border-b border-cyan/40 hover:border-cyan hover:text-cyan pb-1.5 transition-colors w-fit">
                hemanthsarode1@gmail.com
              </a>
              <a
                href="https://instagram.com/hexo_frames"
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-cyan/40 hover:border-cyan hover:text-cyan pb-1.5 transition-colors w-fit"
              >
                @hexo_frames ↗
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 pb-10 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[0.65rem] text-muted uppercase tracking-widest">
          <span>© {new Date().getFullYear()} HexoFrames</span>
          <span>Shot on Sony α6400 · Bengaluru, India</span>
        </div>
      </section>
    </div>
  );
}
