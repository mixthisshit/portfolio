import Anthropic from "@anthropic-ai/sdk";
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

const MODEL = "claude-sonnet-4-5-20250929";

const SYSTEM_PROMPT = `Ты ассистент, который собирает русскоязычное резюме под конкретную вакансию.

Правила:
1. Используй ТОЛЬКО факты из переданного профиля. НЕ выдумывай должности, метрики, технологии, проекты, цифры. Если факта нет — не пиши его.
2. Подсвечивай блоки, наиболее релевантные описанию вакансии (учитывай теги, relevance.pm/analyst/dev, формулировки в bullets).
3. Переформулируй буллеты на язык вакансии — используй те же ключевые слова, что в описании, но смысл не меняй.
4. Структурируй опыт по принципу «действие → инструмент → измеримый результат», где есть метрики.
5. Summary — 2-3 предложения, конкретно про этого кандидата и про эту вакансию.
6. Не более 5 пунктов в bullets каждого блока, оставляй самое важное.
7. Skills — группы по 3-6 элементов, только те, что упомянуты в профиле и релевантны вакансии.

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

export async function generateResume(
  profile: Profile,
  jobDescription: string,
): Promise<GeneratedResume> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY не задан в .env.local");
  }

  const client = new Anthropic({ apiKey });

  const userMessage = `## Профиль кандидата (JSON):
${JSON.stringify(profile, null, 2)}

## Описание вакансии:
${jobDescription}

Собери резюме под эту вакансию по правилам из system-промпта. Верни только JSON.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude не вернул текстовый ответ");
  }

  const raw = textBlock.text.trim();
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("В ответе Claude не найден JSON");
  }

  const jsonStr = raw.slice(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(jsonStr) as GeneratedResume;
  } catch (e) {
    throw new Error(`Не удалось распарсить JSON от Claude: ${(e as Error).message}`);
  }
}
