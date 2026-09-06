"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-bg/85 backdrop-blur-md border-b border-fg/10">
      <div className="flex items-center justify-between px-6 sm:px-12 lg:px-20 py-5">
        <Link href="/" className="font-display text-lg sm:text-xl tracking-wide text-fg" onClick={() => setMenuOpen(false)}>
          HEXO<span className="text-magenta">FRAMES</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-8">
          {onHome ? (
            LINKS.map((link) => (
              <a key={link.href} href={link.href} className="font-mono text-xs uppercase tracking-widest text-muted hover:text-cyan transition-colors">
                {link.label}
              </a>
            ))
          ) : (
            <Link href="/" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-cyan transition-colors">
              ← Home
            </Link>
          )}
          <Link
            href="/gallery"
            className="font-mono text-xs uppercase tracking-widest px-4 py-2 bg-magenta text-bg font-bold hover:bg-cyan transition-colors"
          >
            View Work
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden font-mono text-xs uppercase tracking-widest px-3 py-2 border border-fg/30 text-fg"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-fg/10 px-6 py-6 flex flex-col gap-5 bg-bg">
          {onHome ? (
            LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-sm uppercase tracking-widest text-fg"
              >
                {link.label}
              </a>
            ))
          ) : (
            <Link href="/" onClick={() => setMenuOpen(false)} className="font-mono text-sm uppercase tracking-widest text-fg">
              ← Home
            </Link>
          )}
          <Link
            href="/gallery"
            onClick={() => setMenuOpen(false)}
            className="font-mono text-sm uppercase tracking-widest px-4 py-2.5 bg-magenta text-bg font-bold text-center"
          >
            View Work
          </Link>
        </nav>
      )}
    </header>
  );
}
