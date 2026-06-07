/**
 * Сборка резюме под вакансию через LLM.
 * Имя файла историческое — провайдер выбирается в lib/llm.ts (OpenRouter | Anthropic).
 */
import { callLLM } from "./llm";
import type { Profile } from "./schema";

export type GeneratedResume = {
  headline: string;
  summary: string;
  experience: { title: string; subtitle?: string; date?: string; bullets: string[] }[];
  projects: { name: string; description: string; bullets: string[]; stack: string[] }[];
  skills: { category: string; items: string[] }[];
  education: { title: string; subtitle?: string; date?: string; bullets: string[] }[];
  languages: { name: string; level: string }[];
  contacts: { label: string; value: string }[];
};

export type GenerateInput = {
  profile: Profile;
  jobDescription: string;
  userWishes?: string;
  /** Подсказка LLM по стилю/тону выбранного шаблона — берётся из ResumeTemplate.promptHint. */
  templateHint?: string;
  /** Имя шаблона, чтобы Claude мог упомянуть/учесть. */
  templateName?: string;
};

const SYSTEM_PROMPT = `Ты ассистент, который собирает русскоязычное резюме под конкретную вакансию.

Правила:
1. Используй ТОЛЬКО факты из переданного профиля кандидата. НЕ выдумывай должности, метрики, технологии, проекты, цифры. Если факта нет — не пиши его.
2. Подсвечивай блоки, наиболее релевантные описанию вакансии (учитывай теги, relevance.pm/analyst/dev, формулировки в bullets).
3. Переформулируй буллеты на язык вакансии — используй те же ключевые слова и термины, что в описании, но смысл не меняй.
4. Структурируй опыт по принципу «действие → инструмент → измеримый результат», где есть метрики.
5. Summary — 2-3 предложения, конкретно про этого кандидата и под эту вакансию (если шаблон не требует иначе).
6. Не более 5 пунктов в bullets каждого блока, оставляй самое важное.
7. Skills — группы по 3-6 элементов, только те, что упомянуты в профиле и релевантны вакансии.

ЕСЛИ ВЫБРАН ШАБЛОН — подстрой длину summary, плотность буллетов, тональность под его указания.

ЕСЛИ ПОЛЬЗОВАТЕЛЬ ДАЛ ПОЖЕЛАНИЯ К ГЕНЕРАЦИИ:
- Они приоритетнее общих правил и подсказок шаблона (кроме п.1 — фактов выдумывать нельзя).
- Например: «сделай короче», «выдели аналитику», «убери проекты», «упомяни SQL первым».

Верни ТОЛЬКО JSON по такой схеме, без markdown-обёртки и комментариев:

{
  "headline": "ФИО — должность",
  "summary": "2-3 предложения о кандидате под эту вакансию",
  "experience": [
    { "title": "Роль и компания", "subtitle": "опционально", "date": "период", "bullets": ["...","..."] }
  ],
  "projects": [
    { "name": "Название", "description": "1 предложение", "bullets": ["..."], "stack": ["..."] }
  ],
  "skills": [
    { "category": "Категория", "items": ["..."] }
  ],
  "education": [
    { "title": "Программа, вуз", "subtitle": "опционально", "date": "годы", "bullets": ["..."] }
  ],
  "languages": [
    { "name": "Русский", "level": "Родной" }
  ],
  "contacts": [
    { "label": "Email", "value": "..." }
  ]
}`;

export async function generateResume(input: GenerateInput): Promise<GeneratedResume> {
  const { profile, jobDescription, userWishes, templateHint, templateName } = input;

  const wishesBlock = userWishes?.trim()
    ? `## Пожелания пользователя к этому конкретному резюме:\n${userWishes.trim()}`
    : `## Пожелания пользователя:\nНе указаны — следуй общим правилам.`;

  const templateBlock = templateHint?.trim()
    ? `## Выбранный шаблон: ${templateName ?? "?"}
${templateHint.trim()}`
    : `## Шаблон:\nНе выбран — используй универсальный стиль.`;

  const userMessage = `## Профиль кандидата (JSON):
${JSON.stringify(profile, null, 2)}

## Описание вакансии:
${jobDescription.trim()}

${wishesBlock}

${templateBlock}

Собери резюме под эту вакансию по правилам system-промпта. Верни только JSON.`;

  const raw = (await callLLM({ system: SYSTEM_PROMPT, userMessage })).trim();
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("В ответе LLM не найден JSON");
  }

  const jsonStr = raw.slice(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(jsonStr) as GeneratedResume;
  } catch (e) {
    throw new Error(`Не удалось распарсить JSON от LLM: ${(e as Error).message}`);
  }
}
