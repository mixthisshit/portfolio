"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase/server";
import { StoredProfileSchema } from "@/lib/schema";

export type SaveResult = { ok: true } | { ok: false; error: string };

/**
 * Принимает строку JSON-профиля от админа, валидирует, сохраняет в Supabase,
 * сбрасывает кэш публичных страниц.
 */
export async function saveProfile(jsonString: string): Promise<SaveResult> {
  // Проверка авторизации.
  const auth = createSupabaseServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return { ok: false, error: "Не авторизован" };
  }

  // Парсинг JSON.
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { ok: false, error: `Невалидный JSON: ${(e as Error).message}` };
  }

  // Валидация по zod-схеме (только то, что хранится в Supabase).
  const validated = StoredProfileSchema.safeParse(parsed);
  if (!validated.success) {
    return {
      ok: false,
      error: `Не проходит схему:\n${JSON.stringify(validated.error.format(), null, 2)}`,
    };
  }

  // Запись в Supabase (через service_role, чтобы не зависеть от RLS).
  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from("profile")
    .upsert({ id: "default", data: validated.data });

  if (error) {
    return { ok: false, error: `Ошибка БД: ${error.message}` };
  }

  // Сбрасываем кэш всех публичных страниц.
  revalidatePath("/", "layout");

  return { ok: true };
}

/**
 * Выход из админки.
 */
export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
