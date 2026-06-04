import mammoth from "mammoth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_TEXT_LENGTH = 30_000; // chars, чтобы не раздувать промпт

export type ExtractedTemplate = {
  text: string;
  filename: string;
  truncated: boolean;
};

export async function extractTemplate(file: File): Promise<ExtractedTemplate> {
  if (file.size > MAX_BYTES) {
    throw new Error(
      `Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Максимум 5 МБ.`,
    );
  }

  const name = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  let text = "";

  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    text = result.value;
  } else if (name.endsWith(".txt") || name.endsWith(".md")) {
    text = new TextDecoder("utf-8").decode(arrayBuffer);
  } else if (name.endsWith(".doc")) {
    throw new Error(
      "Формат .doc не поддерживается. Сохрани файл как .docx в Word и приложи снова.",
    );
  } else if (name.endsWith(".pdf")) {
    throw new Error(
      "PDF пока не поддерживается. Конвертируй шаблон в .docx или .txt.",
    );
  } else {
    throw new Error(
      `Формат не поддерживается. Принимаются: .docx, .txt, .md. Загружен: ${file.name}`,
    );
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Не удалось извлечь текст из файла — он пустой или повреждён.");
  }

  const truncated = trimmed.length > MAX_TEXT_LENGTH;
  return {
    text: truncated ? trimmed.slice(0, MAX_TEXT_LENGTH) : trimmed,
    filename: file.name,
    truncated,
  };
}
