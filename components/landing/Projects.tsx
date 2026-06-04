"use client";

import { useMemo, useState } from "react";
import type { Profile, ProjectItem } from "@/lib/schema";
import { MotionFade } from "./MotionFade";
import { ExternalLink, Github } from "lucide-react";

const CATEGORIES: { key: ProjectItem["category"] | "all"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "product", label: "Продукт" },
  { key: "analytics", label: "Аналитика" },
  { key: "frontend", label: "Frontend" },
  { key: "research", label: "Research" },
  { key: "academic", label: "Учебные" },
];

export function Projects({ projects }: { projects: Profile["projects"] }) {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]["key"]>("all");

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects],
  );

  return (
    <section id="projects" className="container-page scroll-mt-20 py-20 sm:py-28">
      <MotionFade>
        <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Проекты
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pet- и учебные проекты
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted text-pretty">
              Мини-исследования, прототипы и эссе, которые я делал в свободное и учебное время.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const count =
                c.key === "all"
                  ? projects.length
                  : projects.filter((p) => p.category === c.key).length;
              if (c.key !== "all" && count === 0) return null;
              return (
                <button
                  key={c.key}
                  onClick={() => setFilter(c.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === c.key
                      ? "border-accent/70 bg-accent/10 text-foreground"
                      : "border-border bg-surface/40 text-muted hover:text-foreground"
                  }`}
                >
                  {c.label} {count > 0 && <span className="opacity-60">· {count}</span>}
                </button>
              );
            })}
          </div>
        </header>
      </MotionFade>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <MotionFade key={p.id} delay={i * 0.04}>
            <article className="card card-hover flex h-full flex-col gap-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {p.name}
                </h3>
                <div className="flex gap-2">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted transition-colors hover:text-accent"
                      aria-label="Открыть проект"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted transition-colors hover:text-accent"
                      aria-label="Код на GitHub"
                    >
                      <Github size={16} />
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted text-pretty">
                {p.description}
              </p>
              {p.stack.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {p.stack.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 text-[11px] text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </MotionFade>
        ))}
      </div>
    </section>
  );
}
