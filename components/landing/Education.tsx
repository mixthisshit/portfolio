import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";

const STATUS_LABEL = {
  completed: "завершён",
  in_progress: "в процессе",
  planned: "запланирован",
} as const;

export function Education({ profile }: { profile: Profile }) {
  return (
    <Section
      id="education"
      eyebrow="Образование и курсы"
      title="Учусь продолжающе"
      description="Бакалавриат + параллельные курсы по фронтенду и Data Science."
    >
      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[1.4fr_1fr]">
        <MotionFade>
          <article>
            <h3 className="label-caps border-b border-border pb-3">
              Высшее образование
            </h3>
            <div className="mt-5 space-y-5">
              {profile.education.map((e) => (
                <div key={e.id}>
                  <h4 className="text-lg font-medium text-foreground">
                    {e.institution} · {e.program}
                  </h4>
                  <p className="mt-1 text-sm text-muted">
                    {e.degree} · {e.faculty} · {e.startYear}—{e.endYear ?? "наст. вр."}
                    {e.current && (
                      <span className="ml-2 inline-block rounded-full border border-accent/40 px-2 py-0.5 text-[10px] font-medium text-accent">
                        учусь сейчас
                      </span>
                    )}
                  </p>
                  {e.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-[15px] text-foreground/90">
                      {e.highlights.map((h, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-accent">·</span>
                          <span className="text-pretty">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </article>
        </MotionFade>

        <MotionFade delay={0.08}>
          <div className="space-y-10">
            <article>
              <h3 className="label-caps border-b border-border pb-3">Курсы</h3>
              <ul className="mt-4 space-y-3 text-[15px]">
                {profile.courses.map((c) => (
                  <li key={c.id}>
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted">
                      {c.provider} · {STATUS_LABEL[c.status]}
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <h3 className="label-caps border-b border-border pb-3">Языки</h3>
              <ul className="mt-4 space-y-2 text-[15px]">
                {profile.languages.map((l) => (
                  <li key={l.name} className="flex justify-between">
                    <span className="text-foreground">{l.name}</span>
                    <span className="text-muted">{l.level}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </MotionFade>
      </div>
    </Section>
  );
}
