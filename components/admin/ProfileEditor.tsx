"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, Check, RefreshCw } from "lucide-react";
import { saveProfile } from "@/app/admin/actions";

export function ProfileEditor({ initialJson }: { initialJson: string }) {
  const [json, setJson] = useState(initialJson);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "success" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  const dirty = json !== initialJson;

  const onSave = () => {
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const res = await saveProfile(json);
      if (res.ok) {
        setStatus({ kind: "success" });
        setTimeout(() => setStatus({ kind: "idle" }), 3000);
      } else {
        setStatus({ kind: "error", message: res.error });
      }
    });
  };

  const onReset = () => {
    if (!dirty || confirm("Откатить несохранённые изменения?")) {
      setJson(initialJson);
      setStatus({ kind: "idle" });
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        spellCheck={false}
        rows={32}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-foreground focus:border-border-strong focus:outline-none"
        disabled={pending}
      />

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || pending}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Сохраняю...
            </>
          ) : (
            <>
              <Save size={15} strokeWidth={1.8} /> Сохранить
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={13} strokeWidth={1.8} /> Сбросить
        </button>

        {status.kind === "success" && (
          <span className="inline-flex items-center gap-2 text-sm text-foreground/90">
            <Check size={14} className="text-accent" /> Сохранено
          </span>
        )}
        {dirty && status.kind === "idle" && (
          <span className="text-xs text-subtle">Есть несохранённые изменения</span>
        )}
      </div>

      {status.kind === "error" && (
        <pre className="overflow-x-auto rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-800">
{status.message}
        </pre>
      )}
    </div>
  );
}
