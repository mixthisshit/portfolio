"use client";

import { useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { TemplatePicker } from "./TemplatePicker";
import type { TemplateSummary, TemplateId } from "@/lib/resume-templates";

type Tab = "job" | "wishes";

type Props = {
  templates: TemplateSummary[];
  defaultTemplateId: TemplateId;
};

export function GenerateForm({ templates, defaultTemplateId }: Props) {
  const [tab, setTab] = useState<Tab>("job");
  const [jd, setJd] = useState("");
  const [wishes, setWishes] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>(defaultTemplateId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd, userWishes: wishes, templateId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const asciiMatch = disposition.match(/filename="([^"]+)"/i);
      const filename = utf8Match
        ? decodeURIComponent(utf8Match[1])
        : (asciiMatch?.[1] ?? `resume-${Date.now()}.docx`);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  const TAB_BUTTON = (key: Tab, label: string, hint: string) => {
    const active = tab === key;
    return (
      <button
        type="button"
        onClick={() => setTab(key)}
        className={`flex flex-1 flex-col items-start gap-1 rounded-2xl border px-5 py-4 text-left transition-colors ${
          active
            ? "border-foreground bg-surface"
            : "border-border bg-surface/50 hover:border-border-strong"
        }`}
      >
        <span
          className={`text-[15px] font-medium ${active ? "text-foreground" : "text-muted"}`}
        >
          {label}
        </span>
        <span className="text-xs text-subtle">{hint}</span>
      </button>
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* === Шаблон === */}
      <div>
        <span className="label-caps">Шаблон резюме</span>
        <p className="mt-2 text-xs text-subtle">
          Кликни тот, что подходит вакансии. Результат будет выглядеть как превью.
        </p>
        <div className="mt-4">
          <TemplatePicker
            templates={templates}
            value={templateId}
            onChange={setTemplateId}
            disabled={loading}
          />
        </div>
      </div>

      {/* === Табы Вакансия / Пожелания === */}
      <div>
        <div className="flex gap-3">
          {TAB_BUTTON("job", "Вакансия", "обязательно · описание роли")}
          {TAB_BUTTON("wishes", "Пожелания", "опционально · как собрать резюме")}
        </div>

        {tab === "job" && (
          <label className="mt-5 block">
            <span className="label-caps">Описание вакансии</span>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Скопируй полное описание вакансии с hh.ru, Хабр Карьеры или сайта компании — чем подробнее, тем точнее подбор..."
              rows={14}
              className="mt-3 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-subtle focus:border-border-strong focus:outline-none"
              disabled={loading}
              required
              minLength={30}
            />
            <span className="mt-2 block text-xs text-subtle">
              Минимум 30 символов · Сейчас: {jd.length}
            </span>
          </label>
        )}

        {tab === "wishes" && (
          <label className="mt-5 block">
            <span className="label-caps">Пожелания к этой генерации</span>
            <textarea
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder={`Например:
• Сделай резюме короче, на одну страницу
• Выдели аналитический опыт первым
• Не упоминай проекты по фронтенду
• Подчеркни работу с метриками и гипотезами
• Используй более формальный тон`}
              rows={14}
              className="mt-3 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-subtle focus:border-border-strong focus:outline-none"
              disabled={loading}
            />
            <span className="mt-2 block text-xs text-subtle">
              Применяются поверх описания вакансии. Если поле пустое — общие правила.
            </span>
          </label>
        )}
      </div>

      {/* === Submit === */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <button
          type="submit"
          disabled={loading || jd.trim().length < 30}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Claude думает...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Сгенерировать резюме
            </>
          )}
        </button>
        {success && (
          <span className="inline-flex items-center gap-2 text-sm text-foreground/90">
            <Download size={14} className="text-accent" /> DOCX скачан
          </span>
        )}
        {jd.trim().length < 30 && (
          <span className="text-xs text-subtle">
            Сначала вставь описание вакансии (вкладка слева)
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <strong>Ошибка:</strong> {error}
          {(error.includes("OPENROUTER_API_KEY") || error.includes("ANTHROPIC_API_KEY")) && (
            <p className="mt-2 text-red-700">
              Положи <code className="font-mono">OPENROUTER_API_KEY</code> или{" "}
              <code className="font-mono">ANTHROPIC_API_KEY</code> в файл{" "}
              <code className="font-mono">.env.local</code> и перезапусти dev-сервер.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
