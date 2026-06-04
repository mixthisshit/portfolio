import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Серверный клиент Supabase, привязанный к cookies текущего запроса.
 * Использует anon-ключ + сессию пользователя. Для всех server components
 * и server actions, которым нужен контекст залогиненного пользователя.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // В server components set() недоступен — игнорируем.
          }
        },
      },
    },
  );
}

/**
 * Админский клиент с service_role ключом. Обходит RLS.
 * ИСПОЛЬЗОВАТЬ ТОЛЬКО НА СЕРВЕРЕ. Никогда не передавать в client component.
 */
export function createSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
