import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";

export function Internships({ internships }: { internships: Profile["internships"] }) {
  if (!internships.length) return null;
  return (
    <Section
      id="internships"
      eyebrow="Опыт"
      title="Стажировки и работа"
      description="Профессиональный опыт — здесь."
    >
      <div className="space-y-8">
        {internships.map((it, i) => (
          <MotionFade key={it.id} delay={i * 0.04}>
            <article className="border-t border-border pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {it.role} · {it.company}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {it.date}
                    {it.endDate ? ` — ${it.endDate}` : it.current ? " — наст. вр." : ""}
                    {it.city ? ` · ${it.city}` : ""}
                  </p>
                </div>
                {it.current && (
                  <span className="inline-block rounded-full border border-accent/40 px-2 py-0.5 text-[10px] font-medium text-accent">
                    сейчас
                  </span>
                )}
              </div>
              {it.description && (
                <p className="mt-3 text-[15px] leading-relaxed text-muted text-pretty">
                  {it.description}
                </p>
              )}
              {it.whatIDid.length > 0 && (
                <ul className="mt-4 space-y-2 text-[15px] text-foreground/90">
                  {it.whatIDid.map((b, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <span className="text-accent">·</span>
                      <span className="text-pretty">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {it.stack.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {it.stack.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </MotionFade>
        ))}
      </div>
    </Section>
  );
}
