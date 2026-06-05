import seed from "@/data/seed.json";
import { StoredProfileSchema, ProfileSchema, type Profile, type StoredProfile } from "./schema";
import { createSupabaseAdmin, hasSupabaseConfig } from "./supabase/server";
import { loadContent } from "./content";

const PROFILE_ID = "default";

/**
 * Часть профиля, которая хранится в Supabase / seed.json: personal, summary,
 * highlights, education, skills, courses, languages, activities, awards.
 */
async function getStoredProfile(): Promise<StoredProfile> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = createSupabaseAdmin();
      const { data, error } = await supabase
        .from("profile")
        .select("data")
        .eq("id", PROFILE_ID)
        .maybeSingle();

      if (!error && data?.data) {
        const parsed = StoredProfileSchema.safeParse(data.data);
        if (parsed.success) return parsed.data;
        console.warn(
          "[profile] supabase data не проходит StoredProfileSchema, fallback to seed:",
          parsed.error.message,
        );
      } else if (error) {
        console.warn(
          "[profile] supabase read error, fallback to seed:",
          error.message,
        );
      }
    } catch (e) {
      console.warn(
        "[profile] supabase fetch threw, fallback to seed:",
        (e as Error).message,
      );
    }
  }
  return StoredProfileSchema.parse(seed);
}

/**
 * Полный профиль = StoredProfile (Supabase) + content/ (cases, projects,
 * internships, hackathons). Используется сайтом и генератором резюме.
 */
export async function getProfile(): Promise<Profile> {
  const [stored, content] = await Promise.all([
    getStoredProfile(),
    Promise.resolve(loadContent()),
  ]);
  return ProfileSchema.parse({
    ...stored,
    cases: content.cases,
    projects: content.projects,
    internships: content.internships,
    hackathons: content.hackathons,
  });
}

/**
 * Синхронная версия для метаданных в layout.tsx — только из seed.json,
 * без обращения к БД и файловой системе.
 */
export function getStoredFromSeed(): StoredProfile {
  return StoredProfileSchema.parse(seed);
}
