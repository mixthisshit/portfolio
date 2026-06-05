import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { StoredProfileSchema } from "@/lib/schema";
import { createSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase/server";
import seed from "@/data/seed.json";
import { signOut } from "./actions";

export const metadata = { title: "Админка — Профиль" };
export const dynamic = "force-dynamic";

async function loadStored() {
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from("profile")
      .select("data")
      .eq("id", "default")
      .maybeSingle();
    if (data?.data) {
      const parsed = StoredProfileSchema.safeParse(data.data);
      if (parsed.success) return parsed.data;
    }
  }
  return StoredProfileSchema.parse(seed);
}

export default async function AdminPage() {
  const stored = await loadStored();
  const initialJson = JSON.stringify(stored, null, 2);

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Админка</span>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-foreground">
            Профиль
          </h1>
          <p className="mt-1 text-sm text-muted">
            Личное, скиллы, образование, активности. Кейсы/проекты/стажировки/хакатоны
            живут в папке <code className="font-mono text-xs">content/</code> и правятся через git.
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            Выйти
          </button>
        </form>
      </div>

      <ProfileEditor initialJson={initialJson} />
    </main>
  );
}
