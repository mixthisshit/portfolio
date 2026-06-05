import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";

export function About({ profile }: { profile: Profile }) {
  return (
    <Section
      id="about"
      eyebrow="О себе"
      title="Кто я и чем занимаюсь"
      description="Учусь на Инноватике в ИТМО. Большая часть моего практического опыта — командные продуктовые кейсы: исследования, гипотезы, метрики и решения. Двигаю в сторону Product Manager."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
        <MotionFade>
          <article className="h-full bg-surface p-7">
            <h3 className="label-caps">Что делаю хорошо</h3>
            <ul className="mt-5 space-y-2 text-[15px] text-foreground/90">
              {profile.skills.soft.slice(0, 5).map((s) => (
                <li key={s} className="flex gap-2.5">
                  <span className="text-accent">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </article>
        </MotionFade>

        <MotionFade delay={0.08}>
          <article className="h-full bg-surface p-7">
            <h3 className="label-caps">Чем работаю</h3>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {profile.skills.technical.slice(0, 8).map((s) => (
                <span key={s.name} className="chip">
                  {s.name}
                </span>
              ))}
            </div>
          </article>
        </MotionFade>

        <MotionFade delay={0.16}>
          <article className="h-full bg-surface p-7">
            <h3 className="label-caps">Куда смотрю</h3>
            <p className="mt-5 text-[15px] leading-relaxed text-foreground/90 text-pretty">
              Product Manager в продуктовых компаниях. Интересны финтех, B2B SaaS,
              AI-продукты. Делать решения на стыке исследований, аналитики и
              быстрого прототипирования.
            </p>
          </article>
        </MotionFade>
      </div>
    </Section>
  );
}
