import { createBrowserClient } from "@supabase/ssr";

/**
 * Браузерный клиент Supabase. Использует anon-ключ и хранит сессию в cookies.
 * Для использования в client components (например, форма логина).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
