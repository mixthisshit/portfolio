import { GenerateForm } from "@/components/generate/GenerateForm";
import { Nav } from "@/components/landing/Nav";
import { getProfile } from "@/lib/profile";
import { listTemplates, DEFAULT_TEMPLATE_ID } from "@/lib/resume-templates";

export const metadata = {
  title: "Генератор резюме",
  description: "Сборка резюме под конкретную вакансию",
};

export default async function GeneratePage() {
  const profile = await getProfile();
  const templates = listTemplates();
  return (
    <main className="min-h-screen">
      <Nav name={profile.personal.shortName} />
      <section className="container-page py-20 sm:py-28">
        <span className="label-caps">Внутренний инструмент</span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
          Генератор резюме под вакансию
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-pretty">
          Выбери шаблон, вставь описание вакансии. Claude подберёт релевантные блоки из
          твоего профиля, переформулирует под язык вакансии и соберёт .docx
          в выбранном стиле — открыть в Word и подправить вручную, если нужно.
        </p>

        <div className="mt-10">
          <GenerateForm templates={templates} defaultTemplateId={DEFAULT_TEMPLATE_ID} />
        </div>
      </section>
    </main>
  );
}
