"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Sparkles, Upload, X, FileText } from "lucide-react";

type Tab = "job" | "wishes";

export function GenerateForm() {
  const [tab, setTab] = useState<Tab>("job");
  const [jd, setJd] = useState("");
  const [wishes, setWishes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("jobDescription", jd);
      form.append("userWishes", wishes);
      if (file) form.append("template", file);

      const res = await fetch("/api/generate-resume", {
        method: "POST",
        body: form,
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
          className={`text-[15px] font-medium ${
            active ? "text-foreground" : "text-muted"
          }`}
        >
          {label}
        </span>
        <span className="text-xs text-subtle">{hint}</span>
      </button>
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex gap-3">
        {TAB_BUTTON("job", "Вакансия", "обязательно · описание роли")}
        {TAB_BUTTON("wishes", "Пожелания", "опционально · как собрать резюме")}
      </div>

      {tab === "job" && (
        <label className="block">
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
        <label className="block">
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
            Пожелания применяются поверх описания вакансии и шаблона. Если поле пустое — используются общие правила.
          </span>
        </label>
      )}

      <div>
        <span className="label-caps">Шаблон резюме (опционально)</span>
        <p className="mt-2 text-xs text-subtle">
          Приложи .docx, .txt или .md — Claude повторит структуру и стиль шаблона, но факты возьмёт из твоего профиля.
        </p>

        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.txt,.md"
            onChange={onPickFile}
            disabled={loading}
            className="hidden"
            id="template-file"
          />
          {!file ? (
            <label
              htmlFor="template-file"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border-strong bg-surface px-5 py-3 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              <Upload size={15} strokeWidth={1.8} /> Прикрепить шаблон
            </label>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground">
              <FileText size={15} strokeWidth={1.8} className="text-accent" />
              <span>{file.name}</span>
              <span className="text-xs text-subtle">({Math.round(file.size / 1024)} КБ)</span>
              <button
                type="button"
                onClick={clearFile}
                className="ml-1 text-subtle transition-colors hover:text-foreground"
                aria-label="Убрать файл"
                disabled={loading}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

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
          {error.includes("ANTHROPIC_API_KEY") && (
            <p className="mt-2 text-red-700">
              Добавь ключ в файл <code className="font-mono">.env.local</code> в корне проекта и
              перезапусти dev-сервер.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
