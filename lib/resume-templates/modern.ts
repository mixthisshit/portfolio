import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
} from "docx";
import type { GeneratedResume } from "../anthropic";
import type { ResumeTemplate } from "./types";
import { loadPhoto, photoCell } from "./photo";

const FONT = "Calibri";
const ACCENT = "5B5BE5";
const MUTED = "555555";

function sectionTitle(text: string) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { color: ACCENT, size: 6, style: BorderStyle.SINGLE, space: 4 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        color: ACCENT,
        font: FONT,
      }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 21, font: FONT })],
  });
}

function itemHeader(title: string, date?: string, subtitle?: string) {
  const children: Paragraph[] = [];
  children.push(
    new Paragraph({
      spacing: { after: 0 },
      children: [
        new TextRun({ text: title, bold: true, size: 22, font: FONT }),
        ...(date
          ? [
              new TextRun({ text: "    ", size: 22, font: FONT }),
              new TextRun({ text: date, size: 20, color: MUTED, italics: true, font: FONT }),
            ]
          : []),
      ],
    }),
  );
  if (subtitle) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: subtitle, size: 20, color: MUTED, font: FONT })],
      }),
    );
  }
  return children;
}

async function render(resume: GeneratedResume): Promise<Buffer> {
  const photo = loadPhoto();
  const sections: (Paragraph | Table)[] = [];

  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

  // Header: [text | photo] таблица
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [7500, 2500],
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 0, left: 0, right: 200 },
            verticalAlign: VerticalAlign.CENTER,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: resume.headline, bold: true, size: 36, font: FONT }),
                ],
              }),
              new Paragraph({
                spacing: { after: 0 },
                children: (resume.contacts ?? []).flatMap((c, i) => {
                  const sep = i > 0 ? "  •  " : "";
                  const runs = [];
                  if (sep) runs.push(new TextRun({ text: sep, color: MUTED, size: 20, font: FONT }));
                  runs.push(
                    new TextRun({ text: `${c.label}: `, color: MUTED, size: 20, font: FONT }),
                    new TextRun({ text: c.value, size: 20, font: FONT }),
                  );
                  return runs;
                }),
              }),
            ],
          }),
          photoCell(photo, { widthPt: 80, heightPt: 80, borderColor: ACCENT }),
        ],
      }),
    ],
  });
  sections.push(headerTable);

  if (resume.summary) {
    sections.push(sectionTitle("О себе"));
    sections.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: resume.summary, size: 22, font: FONT })],
      }),
    );
  }

  if (resume.experience?.length) {
    sections.push(sectionTitle("Опыт и кейсы"));
    resume.experience.forEach((e) => {
      itemHeader(e.title, e.date, e.subtitle).forEach((p) => sections.push(p));
      e.bullets.forEach((b) => sections.push(bullet(b)));
    });
  }

  if (resume.projects?.length) {
    sections.push(sectionTitle("Проекты"));
    resume.projects.forEach((proj) => {
      sections.push(
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({ text: proj.name, bold: true, size: 22, font: FONT }),
            ...(proj.stack?.length
              ? [
                  new TextRun({ text: "    ", size: 22, font: FONT }),
                  new TextRun({
                    text: proj.stack.join(" · "),
                    size: 20,
                    color: MUTED,
                    italics: true,
                    font: FONT,
                  }),
                ]
              : []),
          ],
        }),
      );
      if (proj.description) {
        sections.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: proj.description, size: 21, color: MUTED, font: FONT }),
            ],
          }),
        );
      }
      proj.bullets?.forEach((b) => sections.push(bullet(b)));
    });
  }

  if (resume.skills?.length) {
    sections.push(sectionTitle("Навыки"));
    resume.skills.forEach((s) => {
      sections.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${s.category}: `, bold: true, size: 21, font: FONT }),
            new TextRun({ text: s.items.join(", "), size: 21, font: FONT }),
          ],
        }),
      );
    });
  }

  if (resume.education?.length) {
    sections.push(sectionTitle("Образование"));
    resume.education.forEach((e) => {
      itemHeader(e.title, e.date, e.subtitle).forEach((p) => sections.push(p));
      e.bullets?.forEach((b) => sections.push(bullet(b)));
    });
  }

  if (resume.languages?.length) {
    sections.push(sectionTitle("Языки"));
    sections.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: resume.languages.map((l) => `${l.name} — ${l.level}`).join("  •  "),
            size: 21,
            font: FONT,
          }),
        ],
      }),
    );
  }

  const doc = new Document({
    creator: resume.headline,
    title: `Резюме · ${resume.headline}`,
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
        children: sections,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="100%" height="100%">
  <rect width="160" height="220" fill="#fff"/>
  <rect x="14" y="18" width="76" height="10" fill="#1f1f2e"/>
  <rect x="14" y="34" width="80" height="4" fill="#a0a0b0"/>
  <rect x="14" y="40" width="70" height="3" fill="#a0a0b0"/>
  <rect x="116" y="18" width="30" height="30" fill="#e7e7ee" stroke="#5b5be5" stroke-width="0.6"/>
  <text x="131" y="36" font-size="6" fill="#999" text-anchor="middle" font-family="Calibri, sans-serif">Фото</text>
  <rect x="14" y="56" width="80" height="3" fill="#5b5be5"/>
  <rect x="14" y="66" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="73" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="80" width="92" height="2" fill="#e7e7ee"/>
  <rect x="14" y="96" width="48" height="3" fill="#5b5be5"/>
  <rect x="14" y="106" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="113" width="100" height="2" fill="#e7e7ee"/>
  <rect x="14" y="120" width="110" height="2" fill="#e7e7ee"/>
  <rect x="14" y="127" width="80" height="2" fill="#e7e7ee"/>
  <rect x="14" y="143" width="48" height="3" fill="#5b5be5"/>
  <rect x="14" y="153" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="160" width="100" height="2" fill="#e7e7ee"/>
  <rect x="14" y="176" width="48" height="3" fill="#5b5be5"/>
  <rect x="14" y="186" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="193" width="100" height="2" fill="#e7e7ee"/>
  <rect x="14" y="200" width="80" height="2" fill="#e7e7ee"/>
</svg>`;

export const modernTemplate: ResumeTemplate = {
  id: "modern",
  name: "Modern",
  description:
    "Современный одностолбцовый. Sans-serif, фиолетовый акцент, фото справа в шапке.",
  promptHint:
    "Стиль современный лаконичный. Summary 2-3 предложения. Буллеты компактные. Подходит для продуктовых/IT-вакансий.",
  previewSvg,
  render,
};
