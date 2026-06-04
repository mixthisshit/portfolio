"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#about", label: "О себе" },
  { href: "#cases", label: "Кейсы" },
  { href: "#projects", label: "Проекты" },
  { href: "#skills", label: "Навыки" },
  { href: "#education", label: "Образование" },
  { href: "#contact", label: "Контакты" },
];

export function Nav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <a href="#top" className="text-sm font-medium tracking-tight text-foreground">
          {name}
        </a>
        <nav className="hidden gap-7 text-sm text-muted md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-border-strong"
        >
          Связаться
        </a>
      </div>
    </header>
  );
}
