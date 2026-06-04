"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, LogIn } from "lucide-react";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="label-caps">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
          className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-border-strong focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="label-caps">Пароль</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
          className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-border-strong focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Вход...
          </>
        ) : (
          <>
            <LogIn size={15} strokeWidth={1.8} /> Войти
          </>
        )}
      </button>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </form>
  );
}
