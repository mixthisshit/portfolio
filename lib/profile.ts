import seed from "@/data/seed.json";
import { ProfileSchema, type Profile } from "./schema";
import { createSupabaseAdmin, hasSupabaseConfig } from "./supabase/server";

const PROFILE_ID = "default";

/**
 * Загружает профиль для рендера сайта.
 * 1. Если Supabase настроен — читает из таблицы `profile`.
 * 2. Если БД пустая / ошибка / Supabase не настроен — отдаёт seed.json.
 *
 * Кэшируется на уровне ISR (см. revalidate в page.tsx).
 */
export async function getProfile(): Promise<Profile> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = createSupabaseAdmin();
      const { data, error } = await supabase
        .from("profile")
        .select("data")
        .eq("id", PROFILE_ID)
        .maybeSingle();

      if (!error && data?.data) {
        return ProfileSchema.parse(data.data);
      }
      if (error) {
        console.warn("[profile] supabase read error, falling back to seed:", error.message);
      }
    } catch (e) {
      console.warn(
        "[profile] supabase fetch threw, falling back to seed:",
        (e as Error).message,
      );
    }
  }
  return ProfileSchema.parse(seed);
}

/**
 * Синхронная версия — только для seed.json. Используется в layout metadata,
 * где async недоступен.
 */
export function getProfileFromSeed(): Profile {
  return ProfileSchema.parse(seed);
}
