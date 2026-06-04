"use client";

import { useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";

export function GenerateForm() {
  const [jd, setJd] = useState("");
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
        body: JSON.stringify({ jobDescription: jd }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `resume-${Date.now()}.docx`;

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

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Описание вакансии
        </span>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Скопируй полное описание вакансии с hh.ru, Хабр Карьеры или сайта компании — чем подробнее, тем точнее подбор..."
          rows={14}
          className="mt-2 w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted focus:border-accent/60 focus:outline-none"
          disabled={loading}
          required
          minLength={30}
        />
        <span className="mt-1 block text-xs text-muted">
          Минимум 30 символов. Сейчас: {jd.length}
        </span>
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading || jd.trim().length < 30}
          className="inline-flex items-center gap-2 rounded-full bg-grad-accent px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <strong>Ошибка:</strong> {error}
          {error.includes("ANTHROPIC_API_KEY") && (
            <p className="mt-2 text-red-200/80">
              Добавь ключ в файл <code className="font-mono">.env.local</code> в корне проекта и
              перезапусти dev-сервер.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
