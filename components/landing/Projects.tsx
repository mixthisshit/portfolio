"use client";

import { useMemo, useState } from "react";
import type { Profile, ProjectItem } from "@/lib/schema";
import { MotionFade } from "./MotionFade";
import { ArrowUpRight, Github } from "lucide-react";

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
        <div className="mb-12 border-t border-border pt-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="label-caps">Проекты</span>
              <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                Pet- и учебные проекты
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted text-pretty">
                Мини-исследования, прототипы и эссе, которые делал в свободное и учебное время.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
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
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    {c.label} <span className="opacity-60">· {count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </MotionFade>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <MotionFade key={p.id} delay={i * 0.04}>
            <article className="group flex h-full flex-col gap-4 bg-surface p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-medium tracking-tight text-foreground">
                  {p.name}
                </h3>
                <div className="flex gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted transition-colors hover:text-accent"
                      aria-label="Открыть проект"
                    >
                      <ArrowUpRight size={16} strokeWidth={1.8} />
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
                      <Github size={15} strokeWidth={1.8} />
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted text-pretty">
                {p.description}
              </p>
              {p.stack.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2 text-[11px] text-subtle">
                  {p.stack.slice(0, 5).map((s, idx) => (
                    <span key={s}>
                      {s}
                      {idx < p.stack.slice(0, 5).length - 1 && (
                        <span className="ml-1.5 opacity-50">·</span>
                      )}
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
