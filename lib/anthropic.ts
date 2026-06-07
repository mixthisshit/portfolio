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
  templateText?: string;
  templateFilename?: string;
};

const SYSTEM_PROMPT = `Ты ассистент, который собирает русскоязычное резюме под конкретную вакансию.

Правила:
1. Используй ТОЛЬКО факты из переданного профиля кандидата. НЕ выдумывай должности, метрики, технологии, проекты, цифры. Если факта нет — не пиши его.
2. Подсвечивай блоки, наиболее релевантные описанию вакансии (учитывай теги, relevance.pm/analyst/dev, формулировки в bullets).
3. Переформулируй буллеты на язык вакансии — используй те же ключевые слова и термины, что в описании, но смысл не меняй.
4. Структурируй опыт по принципу «действие → инструмент → измеримый результат», где есть метрики.
5. Summary — 2-3 предложения, конкретно про этого кандидата и под эту вакансию.
6. Не более 5 пунктов в bullets каждого блока, оставляй самое важное.
7. Skills — группы по 3-6 элементов, только те, что упомянуты в профиле и релевантны вакансии.

ЕСЛИ ПОЛЬЗОВАТЕЛЬ ПРИЛОЖИЛ ТЕКСТ ШАБЛОНА:
- Внимательно изучи его структуру, тон, формулировки.
- Повтори структуру (порядок секций, наличие/отсутствие отдельных блоков) и стиль формулировок шаблона.
- НО факты бери только из профиля. Не копируй текст шаблона дословно.

ЕСЛИ ПОЛЬЗОВАТЕЛЬ ДАЛ ПОЖЕЛАНИЯ К ГЕНЕРАЦИИ:
- Они приоритетнее общих правил выше (кроме п.1 — фактов выдумывать нельзя).
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
  const { profile, jobDescription, userWishes, templateText, templateFilename } = input;

  const wishesBlock = userWishes?.trim()
    ? `## Пожелания пользователя к этому конкретному резюме:\n${userWishes.trim()}`
    : `## Пожелания пользователя:\nНе указаны — следуй общим правилам из system-промпта.`;

  const templateBlock = templateText?.trim()
    ? `## Шаблон/референс резюме (файл: ${templateFilename ?? "template"}):
Повтори структуру и стиль формулировок этого шаблона, но факты бери только из профиля.

---ТЕКСТ ШАБЛОНА НИЖЕ---
${templateText.trim()}
---КОНЕЦ ШАБЛОНА---`
    : `## Шаблон:\nНе приложен — используй стандартную структуру (summary → опыт/кейсы → проекты → навыки → образование → языки).`;

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
