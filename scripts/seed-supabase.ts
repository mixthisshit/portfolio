/**
 * Одноразовая заливка data/seed.json в Supabase.
 * Использует SUPABASE_SERVICE_ROLE_KEY — обходит RLS.
 *
 * Запуск:
 *   npx tsx scripts/seed-supabase.ts
 *
 * Можно перезапускать сколько угодно — делает upsert по id='default'.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { StoredProfileSchema } from "../lib/schema";
import seed from "../data/seed.json";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Не хватает NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY в .env.local");
  process.exit(1);
}

(async () => {
  const parsed = StoredProfileSchema.safeParse(seed);
  if (!parsed.success) {
    console.error("❌ seed.json не проходит StoredProfileSchema:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from("profile")
    .upsert({ id: "default", data: parsed.data });

  if (error) {
    console.error("❌ Ошибка записи в Supabase:", error.message);
    console.error("   Убедись, что миграция запущена (supabase/migrations/0001_init.sql).");
    process.exit(1);
  }

  console.log("✅ Профиль залит в Supabase (id=default)");
  console.log(`   - технических навыков: ${parsed.data.skills.technical.length}`);
  console.log(`   - soft skills: ${parsed.data.skills.soft.length}`);
  console.log(`   - активностей: ${parsed.data.activities.length}`);
  console.log("ℹ️  Кейсы и проекты теперь в content/, не в Supabase.");
})();
