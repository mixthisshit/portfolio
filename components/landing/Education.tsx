import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";
import { GraduationCap, BookOpen, Globe } from "lucide-react";

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
      <div className="grid gap-5 lg:grid-cols-3">
        <MotionFade>
          <article className="card lg:col-span-2 p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <GraduationCap size={14} /> Высшее образование
            </div>
            <div className="mt-4 space-y-4">
              {profile.education.map((e) => (
                <div key={e.id}>
                  <h3 className="text-lg font-semibold text-foreground">
                    {e.institution} · {e.program}
                  </h3>
                  <p className="text-sm text-muted">
                    {e.degree} · {e.faculty} · {e.startYear}—{e.endYear ?? "наст. вр."}
                    {e.current && (
                      <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                        учусь сейчас
                      </span>
                    )}
                  </p>
                  {e.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm text-foreground/90">
                      {e.highlights.map((h, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-accent">▹</span>
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

        <MotionFade delay={0.1}>
          <article className="card p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <BookOpen size={14} /> Курсы
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {profile.courses.map((c) => (
                <li key={c.id}>
                  <div className="font-medium text-foreground">{c.name}</div>
                  <div className="text-xs text-muted">
                    {c.provider} · {STATUS_LABEL[c.status]}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <Globe size={14} /> Языки
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {profile.languages.map((l) => (
                <li key={l.name} className="flex justify-between">
                  <span className="text-foreground">{l.name}</span>
                  <span className="text-muted">{l.level}</span>
                </li>
              ))}
            </ul>
          </article>
        </MotionFade>
      </div>
    </Section>
  );
}
