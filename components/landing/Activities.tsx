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
      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {activities.map((a, i) => (
          <MotionFade key={a.id} delay={i * 0.04}>
            <article className="border-t border-border pt-6">
              <h3 className="text-[17px] font-medium text-foreground">{a.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted text-pretty">
                {a.description}
              </p>
              {a.bullets.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-[15px] text-foreground/90">
                  {a.bullets.map((b, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <span className="text-accent">·</span>
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
