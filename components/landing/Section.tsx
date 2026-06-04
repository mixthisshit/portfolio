import { type ReactNode } from "react";
import { MotionFade } from "./MotionFade";

type Props = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Section({ id, eyebrow, title, description, children }: Props) {
  return (
    <section id={id} className="container-page scroll-mt-20 py-20 sm:py-28">
      <MotionFade>
        <header className="mb-12 max-w-2xl border-t border-border pt-10">
          {eyebrow && <span className="label-caps">{eyebrow}</span>}
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-muted text-pretty">
              {description}
            </p>
          )}
        </header>
      </MotionFade>
      {children}
    </section>
  );
}
