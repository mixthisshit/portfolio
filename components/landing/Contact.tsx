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
      ? [{ icon: Globe, label: "Сайт", value: personal.siteUrl.replace("https://", ""), href: personal.siteUrl }]
      : []),
  ];

  return (
    <section
      id="contact"
      className="container-page scroll-mt-20 py-20 sm:py-28"
    >
      <MotionFade>
        <div className="card overflow-hidden">
          <div className="bg-grad-radial p-8 sm:p-12">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Контакты
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Готов обсудить роль, стажировку или продуктовую задачу
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted text-pretty">
              Быстрее всего отвечу в Telegram. Можно также написать на почту — отвечу в течение дня.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(({ icon: Icon, label, value, href }) => {
                const Inner = (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-grad-accent text-white">
                      <Icon size={16} />
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {label}
                      </div>
                      <div className="text-sm font-medium text-foreground">{value}</div>
                    </div>
                  </div>
                );
                return href ? (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="card card-hover p-4"
                  >
                    {Inner}
                  </a>
                ) : (
                  <div key={label} className="card p-4">
                    {Inner}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MotionFade>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>
          © {new Date().getFullYear()} {personal.fullName}
        </span>
        <span>Сайт собран на Next.js · обновляется через админку</span>
      </footer>
    </section>
  );
}
