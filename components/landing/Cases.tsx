import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";
import { AttachedFiles } from "./AttachedFiles";

export function Cases({ profile }: { profile: Profile }) {
  if (!profile.cases.length) return null;

  return (
    <Section
      id="cases"
      eyebrow="Главные кейсы"
      title="Changellenge Cup IT 2026 — топ-5 из 244"
      description="С командой Eclipse прошли отборочный этап с проектом для ОТП Банка и вышли в финал, где работали с Альфа-Бизнесом."
    >
      <div className="space-y-8">
        {profile.cases.map((c, idx) => (
          <MotionFade key={c.id} delay={idx * 0.05}>
            <article className="card card-hover overflow-hidden">
              <div className="border-b border-border p-7 sm:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                      <span className="font-medium text-foreground">{c.organizer}</span>
                      {c.partner && <span>· партнёр: {c.partner}</span>}
                      {c.stage && <span>· {c.stage}</span>}
                      <span>· {c.date}</span>
                    </div>
                    <h3 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                      {c.name}
                    </h3>
                    <p className="text-sm text-muted">
                      Команда {c.team ? `«${c.team}»` : ""} · роль: {c.role}
                    </p>
                  </div>
                  <div className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent">
                    {c.result}
                  </div>
                </div>
              </div>

              <div className="grid gap-10 p-7 sm:p-9 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <div className="label-caps">Задача</div>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground/90 text-pretty">
                    {c.problem}
                  </p>

                  <div className="mt-8 label-caps">Что сделал</div>
                  <ul className="mt-3 space-y-2.5 text-[15px] text-foreground/90">
                    {c.whatIDid.map((b, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent" />
                        <span className="text-pretty leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <aside className="space-y-8">
                  {c.metrics.length > 0 && (
                    <div>
                      <div className="label-caps">Прогнозные метрики</div>
                      <div className="mt-3 space-y-1.5">
                        {c.metrics.map((m) => (
                          <div
                            key={m}
                            className="flex items-baseline justify-between border-b border-border pb-1.5 text-sm text-foreground"
                          >
                            <span>{m.split(":")[0]}</span>
                            <span className="font-medium text-accent">
                              {m.split(":")[1]?.trim() ?? ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="label-caps">Инструменты и темы</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <AttachedFiles files={c.files} type="case" slug={c.id} />
                </aside>
              </div>
            </article>
          </MotionFade>
        ))}
      </div>
    </Section>
  );
}
