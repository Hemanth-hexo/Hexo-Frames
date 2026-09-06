"use client";

import { Suspense, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Nav from "@/components/Nav";
import ContactForm from "@/components/ContactForm";
import { worldCategories, PhotoItem, WorldCategory } from "@/data/categories";

function LazySection({ children }: { children: React.ReactNode }) {
  const [isNearViewport, setIsNearViewport] = useState(false);
  // A callback ref fires the instant the node mounts, so the observer is
  // attached in the same tick React commits it — an object ref read inside
  // useEffect can miss that first paint under a Suspense boundary (this
  // page's ?category deep link needs one, for useSearchParams), leaving
  // ref.current still null when the effect runs and the section stuck on
  // its placeholder forever.
  const observerRef = useRef<IntersectionObserver | null>(null);
  const setRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observerRef.current.observe(node);
  }, []);

  return (
    <div ref={setRef} className="min-h-[350px] w-full">
      {isNearViewport ? children : <div className="h-[400px] w-full bg-bg" />}
    </div>
  );
}

const validCategories = worldCategories.filter((cat) => cat.photos && cat.photos.length > 0);

function GalleryContent() {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const initialCategory = validCategories.some((c) => c.id === requestedCategory)
    ? requestedCategory!
    : "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedPhoto, setSelectedPhoto] = useState<{ photo: PhotoItem; catTitle: string } | null>(null);
  // Flexbox can't shrink-wrap a container to one child's size while a
  // sibling caption "stretches to match" — align-self: stretch still
  // contributes the caption's own content width to the container's
  // auto-size per the flex spec, not just the image's. Measuring the
  // rendered image directly and applying that as an explicit width is the
  // only way the caption reliably matches the photo, portrait or landscape.
  const [lightboxImgWidth, setLightboxImgWidth] = useState<number | null>(null);

  const displayedCategories: WorldCategory[] =
    selectedCategory === "all" ? validCategories : validCategories.filter((cat) => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col font-sans selection:bg-magenta selection:text-bg">
      <Nav />

      <main className="max-w-6xl mx-auto w-full px-6 sm:px-12 lg:px-20 pt-32 sm:pt-40 pb-12 flex-1">
        <div className="mb-14 sm:mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-magenta">
            The archive · {worldCategories.reduce((acc, cat) => acc + cat.photos.length, 0)} frames
          </span>
          <h1 className="font-display text-4xl sm:text-6xl mt-4 uppercase leading-[1.05]">Photographic Collections</h1>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-3 mb-16 sm:mb-24">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-colors cursor-pointer ${
              selectedCategory === "all" ? "bg-magenta text-bg border-magenta font-bold" : "border-fg/20 text-fg/70 hover:border-cyan hover:text-cyan"
            }`}
          >
            All
          </button>
          {validCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-colors cursor-pointer ${
                selectedCategory === cat.id ? "bg-magenta text-bg border-magenta font-bold" : "border-fg/20 text-fg/70 hover:border-cyan hover:text-cyan"
              }`}
            >
              {cat.name.split("/")[1]?.trim() || cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-24 sm:space-y-32">
          {displayedCategories.map((cat) => (
            <section key={cat.id} className="space-y-10">
              <div className="border-b border-fg/10 pb-6">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  {cat.subtitle} · {cat.photos.length} {cat.photos.length === 1 ? "frame" : "frames"}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl mt-2 uppercase">{cat.title}</h2>
              </div>

              <LazySection>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {cat.photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => {
                        setLightboxImgWidth(null);
                        setSelectedPhoto({ photo, catTitle: cat.title });
                      }}
                      className="group text-left cursor-pointer"
                    >
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-bg-raised">
                        <Image
                          src={photo.src}
                          alt={photo.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                        />
                      </div>
                      <div className="pt-4">
                        <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted block">
                          {photo.location}
                        </span>
                        <h3 className="font-sans font-semibold text-lg mt-1 group-hover:text-cyan transition-colors">
                          {photo.title}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>
              </LazySection>
            </section>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-bg-raised cursor-default overflow-hidden max-h-[90vh] flex flex-col border border-fg/10"
            style={{ width: lightboxImgWidth ?? undefined, maxWidth: "92vw", visibility: lightboxImgWidth ? "visible" : "hidden" }}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-20 bg-magenta text-bg w-9 h-9 font-mono flex items-center justify-center text-sm hover:bg-cyan transition-colors cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="relative max-w-[92vw] max-h-[64vh] overflow-hidden bg-bg">
              <img
                key={selectedPhoto.photo.id}
                src={selectedPhoto.photo.src}
                alt={selectedPhoto.photo.title}
                onLoad={(e) => setLightboxImgWidth(e.currentTarget.getBoundingClientRect().width)}
                style={{ display: "block", maxHeight: "64vh", width: "auto", maxWidth: "92vw" }}
              />
            </div>

            {/* A caption block, not a side panel — explicitly measured to
                match the image's own rendered width (which can be as
                narrow as a portrait crop): pure flexbox auto-sizing can't
                do this, since align-self:stretch still counts a sibling's
                own content width toward the container's auto size per the
                flex spec, not just the image's. */}
            <div className="w-full px-6 py-6 border-t border-fg/10">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-magenta block">
                {selectedPhoto.photo.location}
              </span>
              <h3 className="font-sans font-semibold text-xl mt-1">{selectedPhoto.photo.title}</h3>
              <p className="font-sans text-sm text-fg/70 mt-2 leading-relaxed">{selectedPhoto.photo.description}</p>
              <div className="flex gap-6 font-mono text-xs border-t border-fg/10 mt-4 pt-4">
                <div>
                  <span className="text-muted block text-[0.6rem] uppercase tracking-widest">Camera</span>
                  <span className="font-bold text-cyan">{selectedPhoto.photo.camera}</span>
                </div>
                <div>
                  <span className="text-muted block text-[0.6rem] uppercase tracking-widest">Settings</span>
                  <span className="font-bold text-cyan">{selectedPhoto.photo.settings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      <section className="border-t border-fg/10 bg-bg-raised">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-20 sm:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-magenta">
              Let&rsquo;s create together
            </span>
            <h2 className="font-display text-4xl sm:text-5xl mt-4 uppercase">Inquiries &amp; collaborations.</h2>
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
      </section>

      <footer className="bg-bg-raised text-muted px-6 sm:px-12 lg:px-20 py-7 text-center font-mono text-[0.65rem] uppercase tracking-widest border-t border-fg/10">
        © {new Date().getFullYear()} HexoFrames Portfolio
      </footer>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={null}>
      <GalleryContent />
    </Suspense>
  );
}
