import { GenerateForm } from "@/components/generate/GenerateForm";
import { Nav } from "@/components/landing/Nav";
import { getProfile } from "@/lib/profile";

export const metadata = {
  title: "Генератор резюме",
  description: "Сборка резюме под конкретную вакансию",
};

export default async function GeneratePage() {
  const profile = await getProfile();
  return (
    <main className="min-h-screen">
      <Nav name={profile.personal.shortName} />
      <section className="container-page py-20 sm:py-28">
        <span className="label-caps">Внутренний инструмент</span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
          Генератор резюме под вакансию
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-pretty">
          Вставь описание вакансии. Claude выберет релевантные блоки из твоего профиля,
          переформулирует буллеты под язык вакансии и соберёт .docx — открыть в Word
          и подправить вручную, если нужно.
        </p>

        <div className="mt-10">
          <GenerateForm />
        </div>
      </section>
    </main>
  );
}
