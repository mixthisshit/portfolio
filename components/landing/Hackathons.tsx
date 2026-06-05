import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";

export function Hackathons({ hackathons }: { hackathons: Profile["hackathons"] }) {
  if (!hackathons.length) return null;
  return (
    <Section
      id="hackathons"
      eyebrow="Хакатоны"
      title="Хакатоны и олимпиады"
      description="Командные спринты с быстрой проверкой идей."
    >
      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {hackathons.map((h, i) => (
          <MotionFade key={h.id} delay={i * 0.04}>
            <article className="border-t border-border pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium text-foreground">{h.name}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {h.organizer} · {h.date}
                    {h.team ? ` · «${h.team}»` : ""}
                  </p>
                </div>
                <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {h.result}
                </span>
              </div>
              {h.description && (
                <p className="mt-3 text-[15px] leading-relaxed text-muted text-pretty">
                  {h.description}
                </p>
              )}
              {h.whatIDid.length > 0 && (
                <ul className="mt-4 space-y-2 text-[15px] text-foreground/90">
                  {h.whatIDid.map((b, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <span className="text-accent">·</span>
                      <span className="text-pretty">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {h.stack.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {h.stack.map((s) => (
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
