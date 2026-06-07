import { modernTemplate } from "./modern";
import { classicTemplate } from "./classic";
import { twoColumnTemplate } from "./two-column";
import type { ResumeTemplate, TemplateId } from "./types";

export type { ResumeTemplate, TemplateId };

const ALL = [modernTemplate, classicTemplate, twoColumnTemplate] as const;

const BY_ID: Record<TemplateId, ResumeTemplate> = {
  modern: modernTemplate,
  classic: classicTemplate,
  "two-column": twoColumnTemplate,
};

export const DEFAULT_TEMPLATE_ID: TemplateId = "modern";

/** Список шаблонов для показа в галерее (без рендерера — он не сериализуется в client). */
export type TemplateSummary = {
  id: TemplateId;
  name: string;
  description: string;
  previewSvg: string;
};

export function listTemplates(): TemplateSummary[] {
  return ALL.map(({ id, name, description, previewSvg }) => ({
    id,
    name,
    description,
    previewSvg,
  }));
}

export function getTemplate(id: string): ResumeTemplate {
  const t = BY_ID[id as TemplateId];
  if (!t) throw new Error(`Неизвестный шаблон: ${id}`);
  return t;
}
