import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";

export function Activities({ activities }: { activities: Profile["activities"] }) {
  if (!activities.length) return null;
  return (
    <Section
      id="activities"
      eyebrow="Помимо учёбы"
      title="Активности и интересы"
      description="То, что показывает дисциплину, лидерство и нерабочий контекст."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {activities.map((a, i) => (
          <MotionFade key={a.id} delay={i * 0.05}>
            <article className="card card-hover h-full p-6">
              <h3 className="text-base font-semibold text-foreground">{a.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                {a.description}
              </p>
              {a.bullets.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm text-foreground/90">
                  {a.bullets.map((b, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-accent">▹</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </MotionFade>
        ))}
      </div>
    </Section>
  );
}
