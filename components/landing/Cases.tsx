import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";
import { Trophy, TrendingUp, Users } from "lucide-react";

export function Cases({ profile }: { profile: Profile }) {
  if (!profile.cases.length) return null;

  return (
    <Section
      id="cases"
      eyebrow="Главные кейсы"
      title="Changellenge Cup IT 2026 — топ-5 из 244"
      description="С командой Eclipse прошли отборочный этап с проектом для ОТП Банка и вышли в финал, где работали с Альфа-Бизнесом."
    >
      <div className="space-y-6">
        {profile.cases.map((c, idx) => (
          <MotionFade key={c.id} delay={idx * 0.05}>
            <article className="card card-hover overflow-hidden">
              <div className="border-b border-border bg-grad-radial p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-semibold text-foreground">{c.organizer}</span>
                      {c.partner && <span>· партнёр: {c.partner}</span>}
                      {c.stage && <span>· {c.stage}</span>}
                      <span>· {c.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {c.name}
                    </h3>
                    <p className="text-sm text-muted">
                      Команда {c.team ? `«${c.team}»` : ""} · роль: {c.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-grad-accent px-4 py-2 text-xs font-semibold text-white shadow-card">
                    <Trophy size={14} /> {c.result}
                  </div>
                </div>
              </div>

              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Задача
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90 text-pretty">
                    {c.problem}
                  </p>

                  <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-accent">
                    Что сделал
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                    {c.bullets.map((b, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span className="text-pretty">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <aside className="space-y-6">
                  {c.metrics.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                        <TrendingUp size={12} /> Прогнозные метрики
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {c.metrics.map((m) => (
                          <div
                            key={m}
                            className="rounded-xl border border-border bg-background/40 p-3 text-xs font-medium text-foreground"
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                      <Users size={12} /> Инструменты и темы
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          </MotionFade>
        ))}
      </div>
    </Section>
  );
}
