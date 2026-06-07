/**
 * Тонкая абстракция над LLM-провайдером.
 *
 * Приоритет: OpenRouter (если задан OPENROUTER_API_KEY) → Anthropic
 * (если задан ANTHROPIC_API_KEY) → ошибка.
 *
 * Модели можно переопределить через env:
 *   OPENROUTER_MODEL   — по умолчанию anthropic/claude-sonnet-4.5
 *   ANTHROPIC_MODEL    — по умолчанию claude-sonnet-4-5-20250929
 *
 * OpenRouter API совместим с OpenAI Chat Completions, поэтому используем openai SDK
 * с другим baseURL. Anthropic — родной @anthropic-ai/sdk (с prompt caching).
 */
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type Provider = "openrouter" | "anthropic";

const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-sonnet-4.5";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";

export function activeProvider(): Provider {
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  throw new Error(
    "Не задан ни OPENROUTER_API_KEY, ни ANTHROPIC_API_KEY в .env.local. Положи один из них и перезапусти сервер.",
  );
}

export type LLMCall = {
  system: string;
  userMessage: string;
  maxTokens?: number;
};

export async function callLLM({ system, userMessage, maxTokens = 4096 }: LLMCall): Promise<string> {
  const provider = activeProvider();

  if (provider === "openrouter") {
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        // OpenRouter рекомендует передавать referer и title для статистики.
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-mixthishit.vercel.app",
        "X-Title": "Mertehin Portfolio · Resume Generator",
      },
    });

    const model = process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;
    const completion = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("OpenRouter не вернул текстовый ответ");
    return text;
  }

  // Прямой Anthropic API (с кэшированием system-промпта)
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Anthropic не вернул текстовый блок");
  }
  return block.text;
}
