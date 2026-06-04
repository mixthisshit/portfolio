import type { Profile } from "@/lib/schema";
import { Section } from "./Section";
import { MotionFade } from "./MotionFade";

export function About({ profile }: { profile: Profile }) {
  return (
    <Section
      id="about"
      eyebrow="О себе"
      title="Продакт-менеджмент через данные и гипотезы"
      description="Учусь на Инноватике в ИТМО. Большая часть моего практического опыта — командные продуктовые кейсы: исследования, гипотезы, метрики и решения. Двигаю в сторону Product / Product Analytics."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <MotionFade>
          <article className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Что делаю хорошо
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/90">
              {profile.skills.soft.slice(0, 5).map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-accent">▹</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </article>
        </MotionFade>

        <MotionFade delay={0.1}>
          <article className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Чем работаю
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.technical.slice(0, 8).map((s) => (
                <span key={s.name} className="chip">
                  {s.name}
                </span>
              ))}
            </div>
          </article>
        </MotionFade>

        <MotionFade delay={0.2}>
          <article className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Куда смотрю
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground/90 text-pretty">
              Product Manager / Product Analyst в продуктовых компаниях. Интересны
              финтех, B2B SaaS, AI-продукты. Хочу делать решения на стыке
              исследований, аналитики и быстрого прототипирования.
            </p>
          </article>
        </MotionFade>
      </div>
    </Section>
  );
}
