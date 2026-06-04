import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Вход в админку" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="container-page flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <span className="label-caps">Админка</span>
        <h1 className="mt-3 text-2xl font-medium tracking-tight text-foreground">
          Вход
        </h1>
        <p className="mt-2 text-sm text-muted">
          Введи email и пароль, которыми зарегистрирован в Supabase Auth.
        </p>
        <div className="mt-8">
          <LoginForm next={searchParams.next ?? "/admin"} />
        </div>
      </div>
    </main>
  );
}
