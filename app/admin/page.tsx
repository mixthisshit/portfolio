import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { getProfile } from "@/lib/profile";
import { signOut } from "./actions";

export const metadata = { title: "Админка — Профиль" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await getProfile();
  const initialJson = JSON.stringify(profile, null, 2);

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Админка</span>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-foreground">
            Профиль
          </h1>
          <p className="mt-1 text-sm text-muted">
            Меняй JSON, сохраняй — сайт обновится через минуту (ISR кэш).
            Валидируется по zod-схеме перед записью.
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
