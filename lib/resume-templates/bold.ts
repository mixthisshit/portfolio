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
  ShadingType,
  VerticalAlign,
} from "docx";
import type { GeneratedResume } from "../anthropic";
import type { ResumeTemplate } from "./types";
import { loadPhoto, photoParagraph } from "./photo";

const FONT = "Calibri";
const HERO_BG = "111827"; // тёмно-синий-чёрный
const HERO_TEXT = "FFFFFF";
const HERO_ACCENT = "EF4444"; // красный
const TEXT = "111827";
const MUTED = "6B7280";
const ACCENT = "EF4444";

function sectionTitle(text: string) {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: "▌ ",
        bold: true,
        size: 26,
        color: ACCENT,
        font: FONT,
      }),
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 24,
        color: TEXT,
        font: FONT,
      }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 21, color: TEXT, font: FONT })],
  });
}

function itemHeader(title: string, date?: string, subtitle?: string) {
  const out: Paragraph[] = [
    new Paragraph({
      spacing: { after: 0 },
      children: [
        new TextRun({ text: title, bold: true, size: 23, color: TEXT, font: FONT }),
      ],
    }),
  ];
  if (subtitle || date) {
    const parts: TextRun[] = [];
    if (subtitle) parts.push(new TextRun({ text: subtitle, size: 19, color: MUTED, font: FONT }));
    if (subtitle && date) parts.push(new TextRun({ text: "  ·  ", size: 19, color: MUTED, font: FONT }));
    if (date) parts.push(new TextRun({ text: date, size: 19, italics: true, color: ACCENT, font: FONT }));
    out.push(new Paragraph({ spacing: { after: 60 }, children: parts }));
  }
  return out;
}

async function render(resume: GeneratedResume): Promise<Buffer> {
  const photo = loadPhoto();
  const sections: (Paragraph | Table)[] = [];

  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

  // === HERO BLOCK: тёмная плашка во всю ширину с фото и крупным именем ===
  const heroTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2400, 7600],
    borders: {
      top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
      insideHorizontal: noBorder, insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 24, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: HERO_BG },
            margins: { top: 500, bottom: 500, left: 500, right: 200 },
            verticalAlign: VerticalAlign.CENTER,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [photoParagraph(photo, 100)],
          }),
          new TableCell({
            width: { size: 76, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: HERO_BG },
            margins: { top: 500, bottom: 500, left: 400, right: 500 },
            verticalAlign: VerticalAlign.CENTER,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: (resume.headline.split("—")[0] ?? resume.headline).trim(),
                    bold: true,
                    size: 44,
                    color: HERO_TEXT,
                    font: FONT,
                  }),
                ],
              }),
              ...(resume.headline.split("—")[1]
                ? [
                    new Paragraph({
                      spacing: { after: 120 },
                      children: [
                        new TextRun({
                          text: resume.headline.split("—")[1].trim().toUpperCase(),
                          size: 22,
                          color: HERO_ACCENT,
                          characterSpacing: 80,
                          font: FONT,
                        }),
                      ],
                    }),
                  ]
                : []),
              new Paragraph({
                spacing: { after: 0 },
                children: (resume.contacts ?? []).flatMap((c, i) => {
                  const sep = i > 0 ? "    •    " : "";
                  return [
                    ...(sep ? [new TextRun({ text: sep, color: "9CA3AF", size: 18, font: FONT })] : []),
                    new TextRun({ text: c.value, size: 19, color: "F3F4F6", font: FONT }),
                  ];
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
  sections.push(heroTable);

  // отступ после hero
  sections.push(new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }));

  if (resume.summary) {
    sections.push(sectionTitle("О себе"));
    sections.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: resume.summary, size: 22, color: TEXT, font: FONT })],
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
            new TextRun({ text: proj.name, bold: true, size: 22, color: TEXT, font: FONT }),
            ...(proj.stack?.length
              ? [
                  new TextRun({ text: "  —  ", color: MUTED, size: 22, font: FONT }),
                  new TextRun({
                    text: proj.stack.join(" / "),
                    size: 19,
                    color: ACCENT,
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
            children: [new TextRun({ text: proj.description, size: 20, color: MUTED, font: FONT })],
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
            new TextRun({ text: `${s.category} `, bold: true, size: 21, color: TEXT, font: FONT }),
            new TextRun({ text: "— ", color: MUTED, size: 21, font: FONT }),
            new TextRun({ text: s.items.join(", "), size: 21, color: TEXT, font: FONT }),
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
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: resume.languages.map((l) => `${l.name} — ${l.level}`).join("    •    "),
            size: 21,
            color: TEXT,
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
        properties: { page: { margin: { top: 0, bottom: 720, left: 0, right: 0 } } },
        children: [
          heroTable,
          // wrapper-таблица для остального контента с внутренними полями
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [10000],
            borders: {
              top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
              insideHorizontal: noBorder, insideVertical: noBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    margins: { top: 400, bottom: 400, left: 800, right: 800 },
                    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                    children: sections.slice(1).filter((s): s is Paragraph => s instanceof Paragraph),
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="100%" height="100%">
  <rect width="160" height="220" fill="#fff"/>
  <rect x="0" y="0" width="160" height="56" fill="#111827"/>
  <rect x="10" y="10" width="36" height="36" fill="#1f2937" stroke="#ef4444" stroke-width="0.6"/>
  <text x="28" y="30" font-size="4" fill="#9ca3af" text-anchor="middle" font-family="Calibri">Фото</text>
  <text x="54" y="22" font-family="Calibri, sans-serif" font-size="11" font-weight="700" fill="#fff">FIRST LAST</text>
  <text x="54" y="32" font-family="Calibri" font-size="4" fill="#ef4444" letter-spacing="0.5">PRODUCT MANAGER</text>
  <text x="54" y="42" font-family="Calibri" font-size="3.5" fill="#f3f4f6">email • phone • city</text>
  <text x="12" y="72" font-family="Calibri" font-size="5" font-weight="700" fill="#ef4444">▌</text>
  <text x="18" y="72" font-family="Calibri" font-size="5" font-weight="700" fill="#111827">О СЕБЕ</text>
  <rect x="12" y="78" width="135" height="1.5" fill="#d8d8d8"/>
  <rect x="12" y="83" width="115" height="1.5" fill="#d8d8d8"/>
  <text x="12" y="98" font-family="Calibri" font-size="5" font-weight="700" fill="#ef4444">▌</text>
  <text x="18" y="98" font-family="Calibri" font-size="5" font-weight="700" fill="#111827">ОПЫТ</text>
  <rect x="12" y="104" width="90" height="2.4" fill="#111827"/>
  <rect x="12" y="110" width="70" height="1.5" fill="#6b7280"/>
  <rect x="12" y="116" width="135" height="1.5" fill="#d8d8d8"/>
  <rect x="12" y="121" width="120" height="1.5" fill="#d8d8d8"/>
  <text x="12" y="136" font-family="Calibri" font-size="5" font-weight="700" fill="#ef4444">▌</text>
  <text x="18" y="136" font-family="Calibri" font-size="5" font-weight="700" fill="#111827">ПРОЕКТЫ</text>
  <rect x="12" y="142" width="80" height="2" fill="#111827"/>
  <rect x="12" y="148" width="130" height="1.5" fill="#d8d8d8"/>
  <text x="12" y="162" font-family="Calibri" font-size="5" font-weight="700" fill="#ef4444">▌</text>
  <text x="18" y="162" font-family="Calibri" font-size="5" font-weight="700" fill="#111827">НАВЫКИ</text>
  <rect x="12" y="168" width="130" height="1.5" fill="#d8d8d8"/>
  <rect x="12" y="173" width="120" height="1.5" fill="#d8d8d8"/>
  <text x="12" y="188" font-family="Calibri" font-size="5" font-weight="700" fill="#ef4444">▌</text>
  <text x="18" y="188" font-family="Calibri" font-size="5" font-weight="700" fill="#111827">ЯЗЫКИ</text>
  <rect x="12" y="194" width="100" height="1.5" fill="#d8d8d8"/>
</svg>`;

export const boldTemplate: ResumeTemplate = {
  id: "bold",
  name: "Bold",
  description:
    "Тёмная шапка во всю ширину с крупным фото и именем, красные акценты-полоски. Эффектный, запоминается.",
  promptHint:
    "Стиль уверенный, акцентный. Summary короткое, но с цифрами/достижением. Буллеты можно длинные, с метриками. Подходит для senior/lead вакансий и творческих компаний.",
  previewSvg,
  render,
};
