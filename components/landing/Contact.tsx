import type { Profile } from "@/lib/schema";
import { Mail, Phone, Send, MapPin, Globe } from "lucide-react";
import { MotionFade } from "./MotionFade";

export function Contact({ personal }: { personal: Profile["personal"] }) {
  const items = [
    {
      icon: Mail,
      label: "Email",
      value: personal.email,
      href: `mailto:${personal.email}`,
    },
    {
      icon: Send,
      label: "Telegram",
      value: personal.telegram,
      href: `https://t.me/${personal.telegram.replace("@", "")}`,
    },
    {
      icon: Phone,
      label: "Телефон",
      value: personal.phone,
      href: `tel:${personal.phone.replace(/\s/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Город",
      value: personal.city,
      href: undefined,
    },
    ...(personal.siteUrl
      ? [
          {
            icon: Globe,
            label: "Сайт",
            value: personal.siteUrl.replace("https://", ""),
            href: personal.siteUrl,
          },
        ]
      : []),
  ];

  return (
    <section id="contact" className="container-page scroll-mt-20 py-20 sm:py-28">
      <MotionFade>
        <div className="border-t border-border pt-12">
          <span className="label-caps">Контакты</span>
          <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
            Готов обсудить роль, стажировку или продуктовую задачу
          </h2>
          <p className="mt-4 max-w-2xl text-base text-muted text-pretty">
            Быстрее всего отвечу в Telegram. Можно также написать на почту — отвечу в течение дня.
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ icon: Icon, label, value, href }) => {
              const Inner = (
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-accent">
                    <Icon size={15} strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="label-caps">{label}</div>
                    <div className="mt-0.5 text-[15px] font-medium text-foreground">
                      {value}
                    </div>
                  </div>
                </div>
              );
              return href ? (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="bg-surface p-5 transition-colors hover:bg-surface-2"
                >
                  {Inner}
                </a>
              ) : (
                <div key={label} className="bg-surface p-5">
                  {Inner}
                </div>
              );
            })}
          </div>
        </div>
      </MotionFade>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted">
        <span>
          © {new Date().getFullYear()} {personal.fullName}
        </span>
        <span>Сайт собран на Next.js · обновляется через правку seed.json</span>
      </footer>
    </section>
  );
}
