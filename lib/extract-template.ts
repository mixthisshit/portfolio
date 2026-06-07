import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

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
  } else if (name.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const result = await extractText(pdf, { mergePages: true });
    // unpdf возвращает либо string, либо string[] в зависимости от mergePages
    text = Array.isArray(result.text) ? result.text.join("\n\n") : result.text;
  } else if (name.endsWith(".txt") || name.endsWith(".md")) {
    text = new TextDecoder("utf-8").decode(arrayBuffer);
  } else if (name.endsWith(".doc")) {
    throw new Error(
      "Формат .doc не поддерживается. Сохрани файл как .docx в Word и приложи снова.",
    );
  } else {
    throw new Error(
      `Формат не поддерживается. Принимаются: .pdf, .docx, .txt, .md. Загружен: ${file.name}`,
    );
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(
      "Не удалось извлечь текст из файла — возможно, это скан или защищённый PDF. Сохрани как .docx или попробуй PDF с распознаваемым текстом.",
    );
  }

  const truncated = trimmed.length > MAX_TEXT_LENGTH;
  return {
    text: truncated ? trimmed.slice(0, MAX_TEXT_LENGTH) : trimmed,
    filename: file.name,
    truncated,
  };
}
