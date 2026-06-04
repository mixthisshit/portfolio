import { ArrowRight, Mail, Send } from "lucide-react";
import type { Profile } from "@/lib/schema";
import { MotionFade } from "./MotionFade";

export function Hero({ profile }: { profile: Profile }) {
  const { personal, summary, highlights } = profile;
  return (
    <section id="top" className="container-page relative pt-16 pb-12 sm:pt-24 sm:pb-20">
      <MotionFade>
        <span className="chip">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Открыт к стажировкам и фуллтайму — {personal.city}
        </span>
      </MotionFade>

      <MotionFade delay={0.1}>
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {personal.shortName.split(" ")[0]}{" "}
          <span className="text-gradient">{personal.shortName.split(" ")[1]}</span>
          <span className="block text-2xl font-medium text-muted sm:text-3xl mt-3">
            {personal.title}
          </span>
        </h1>
      </MotionFade>

      <MotionFade delay={0.15}>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          {summary}
        </p>
      </MotionFade>

      <MotionFade delay={0.2}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#cases"
            className="inline-flex items-center gap-2 rounded-full bg-grad-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:scale-[1.02]"
          >
            Смотреть кейсы <ArrowRight size={16} />
          </a>
          <a
            href={`mailto:${personal.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/60"
          >
            <Mail size={16} /> {personal.email}
          </a>
          <a
            href={`https://t.me/${personal.telegram.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/60"
          >
            <Send size={16} /> {personal.telegram}
          </a>
        </div>
      </MotionFade>

      <MotionFade delay={0.3}>
        <ul className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.slice(0, 6).map((h, i) => (
            <li
              key={i}
              className="card card-hover flex items-start gap-3 p-4 text-sm text-foreground/90"
            >
              <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grad-accent text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-pretty">{h}</span>
            </li>
          ))}
        </ul>
      </MotionFade>
    </section>
  );
}
