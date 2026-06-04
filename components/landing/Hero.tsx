import { ArrowRight, Mail, Send } from "lucide-react";
import type { Profile } from "@/lib/schema";
import { MotionFade } from "./MotionFade";

export function Hero({ profile }: { profile: Profile }) {
  const { personal, summary, highlights } = profile;
  return (
    <section id="top" className="container-page relative pt-20 pb-16 sm:pt-32 sm:pb-24">
      <MotionFade>
        <span className="chip">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Открыт к стажировкам и фуллтайму · {personal.city}
        </span>
      </MotionFade>

      <MotionFade delay={0.08}>
        <h1 className="mt-8 text-balance text-5xl font-medium leading-[1.04] tracking-tight text-foreground sm:text-6xl">
          {personal.shortName}
        </h1>
        <p className="mt-4 text-xl font-normal text-muted sm:text-2xl">
          {personal.title}
        </p>
      </MotionFade>

      <MotionFade delay={0.15}>
        <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-[17px]">
          {summary}
        </p>
      </MotionFade>

      <MotionFade delay={0.2}>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#cases" className="btn-primary">
            Смотреть кейсы <ArrowRight size={15} strokeWidth={1.8} />
          </a>
          <a href={`mailto:${personal.email}`} className="btn-outline">
            <Mail size={15} strokeWidth={1.8} /> {personal.email}
          </a>
          <a
            href={`https://t.me/${personal.telegram.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
          >
            <Send size={15} strokeWidth={1.8} /> {personal.telegram}
          </a>
        </div>
      </MotionFade>

      <MotionFade delay={0.3}>
        <ul className="mt-16 grid grid-cols-1 gap-x-10 gap-y-5 border-t border-border pt-10 sm:grid-cols-2">
          {highlights.slice(0, 6).map((h, i) => (
            <li key={i} className="flex items-baseline gap-4 text-[15px] text-foreground/90">
              <span className="font-mono text-xs text-subtle tabular-nums">
                0{i + 1}
              </span>
              <span className="text-pretty leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>
      </MotionFade>
    </section>
  );
}
