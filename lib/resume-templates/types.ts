import type { GeneratedResume } from "../anthropic";

export type TemplateId = "modern" | "classic" | "two-column";

export type ResumeTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  /** Краткая шпаргалка для Claude — какой стиль/тон/длина подходят шаблону. */
  promptHint: string;
  /** Маленькая SVG-превьюшка для пикера (ширина 160, высота 220). */
  previewSvg: string;
  render: (resume: GeneratedResume) => Promise<Buffer>;
};
