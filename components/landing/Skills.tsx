import type { Profile, SkillItem } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";

const LEVEL_LABEL: Record<SkillItem["level"], string> = {
  basic: "база",
  intermediate: "уверенно",
  advanced: "продвинуто",
};

const LEVEL_DOTS: Record<SkillItem["level"], number> = {
  basic: 1,
  intermediate: 2,
  advanced: 3,
};

export function Skills({ skills }: { skills: Profile["skills"] }) {
  const grouped = skills.technical.reduce<Record<string, SkillItem[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <Section
      id="skills"
      eyebrow="Навыки"
      title="Чем владею"
      description="Базовый, но рабочий стек продуктового аналитика — от исследований и SQL до прототипов и автоматизации."
    >
      <div className="grid gap-x-12 gap-y-12 md:grid-cols-2">
        {Object.entries(grouped).map(([category, items], idx) => (
          <MotionFade key={category} delay={idx * 0.04}>
            <article>
              <h3 className="label-caps border-b border-border pb-3">{category}</h3>
              <ul className="mt-4 space-y-3">
                {items.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between gap-3 text-[15px]"
                  >
                    <span className="text-foreground">{s.name}</span>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      {LEVEL_LABEL[s.level]}
                      <span className="flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <span
                            key={d}
                            className={`h-1 w-3 rounded-full ${
                              d <= LEVEL_DOTS[s.level]
                                ? "bg-accent"
                                : "bg-border"
                            }`}
                          />
                        ))}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </MotionFade>
        ))}

        <MotionFade delay={0.2}>
          <article className="md:col-span-2">
            <h3 className="label-caps border-b border-border pb-3">Soft skills</h3>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills.soft.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </article>
        </MotionFade>
      </div>
    </Section>
  );
}
