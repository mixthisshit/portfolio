"use client";

import type { TemplateSummary, TemplateId } from "@/lib/resume-templates";

type Props = {
  templates: TemplateSummary[];
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  disabled?: boolean;
};

export function TemplatePicker({ templates, value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {templates.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => !disabled && onChange(t.id)}
            disabled={disabled}
            className={`group flex flex-col gap-3 rounded-2xl border p-3 text-left transition-all ${
              active
                ? "border-foreground bg-surface ring-2 ring-foreground/10"
                : "border-border bg-surface/50 hover:border-border-strong"
            } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <div
                className="aspect-[160/220] w-full"
                dangerouslySetInnerHTML={{ __html: t.previewSvg }}
              />
            </div>
            <div className="flex items-center justify-between gap-2 px-1">
              <span
                className={`text-sm font-medium ${active ? "text-foreground" : "text-muted"}`}
              >
                {t.name}
              </span>
              {active && (
                <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                  выбран
                </span>
              )}
            </div>
            <p className="px-1 text-xs leading-snug text-subtle">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
