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

const FONT = "Arial";
const TEXT = "1A1A1A";
const MUTED = "555555";
const ACCENT = "0F766E"; // тёмный teal

function sectionTitle(text: string) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    border: { bottom: { color: ACCENT, size: 4, style: BorderStyle.SINGLE, space: 2 } },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 18,
        color: ACCENT,
        font: FONT,
      }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 20 },
    children: [new TextRun({ text, size: 18, color: TEXT, font: FONT })],
  });
}

function itemHeader(title: string, date?: string, subtitle?: string) {
  const out: Paragraph[] = [
    new Paragraph({
      spacing: { after: 0 },
      children: [
        new TextRun({ text: title, bold: true, size: 19, color: TEXT, font: FONT }),
        ...(date
          ? [
              new TextRun({ text: "  ·  ", size: 18, color: MUTED, font: FONT }),
              new TextRun({ text: date, size: 17, color: MUTED, italics: true, font: FONT }),
            ]
          : []),
      ],
    }),
  ];
  if (subtitle) {
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: subtitle, size: 17, color: MUTED, font: FONT })],
      }),
    );
  }
  return out;
}

async function render(resume: GeneratedResume): Promise<Buffer> {
  const photo = loadPhoto();
  const sections: (Paragraph | Table)[] = [];

  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

  // Header: [photo | name+contacts]
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1700, 8300],
    borders: {
      top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
      insideHorizontal: noBorder, insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          photoCell(photo, { widthPt: 70, heightPt: 70, borderColor: ACCENT }),
          new TableCell({
            width: { size: 83, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 0, left: 240, right: 0 },
            verticalAlign: VerticalAlign.CENTER,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({ text: resume.headline, bold: true, size: 28, color: TEXT, font: FONT }),
                ],
              }),
              new Paragraph({
                spacing: { after: 0 },
                children: (resume.contacts ?? []).flatMap((c, i) => {
                  const sep = i > 0 ? " · " : "";
                  return [
                    ...(sep ? [new TextRun({ text: sep, color: MUTED, size: 17, font: FONT })] : []),
                    new TextRun({ text: c.value, size: 17, color: TEXT, font: FONT }),
                  ];
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
  sections.push(headerTable);

  if (resume.summary) {
    sections.push(sectionTitle("О себе"));
    sections.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: resume.summary, size: 18, color: TEXT, font: FONT })],
      }),
    );
  }

  if (resume.experience?.length) {
    sections.push(sectionTitle("Опыт"));
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
            new TextRun({ text: proj.name, bold: true, size: 18, color: TEXT, font: FONT }),
            ...(proj.stack?.length
              ? [
                  new TextRun({ text: "  ·  ", color: MUTED, size: 18, font: FONT }),
                  new TextRun({ text: proj.stack.join(", "), size: 17, color: MUTED, italics: true, font: FONT }),
                ]
              : []),
          ],
        }),
      );
      if (proj.description) {
        sections.push(
          new Paragraph({
            spacing: { after: 20 },
            children: [new TextRun({ text: proj.description, size: 17, color: MUTED, font: FONT })],
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
          spacing: { after: 30 },
          children: [
            new TextRun({ text: `${s.category}: `, bold: true, size: 18, color: TEXT, font: FONT }),
            new TextRun({ text: s.items.join(", "), size: 18, color: TEXT, font: FONT }),
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
            text: resume.languages.map((l) => `${l.name} (${l.level})`).join(" · "),
            size: 18,
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
    styles: { default: { document: { run: { font: FONT, size: 18 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 540, bottom: 540, left: 720, right: 720 } } },
        children: sections,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="100%" height="100%">
  <rect width="160" height="220" fill="#fff"/>
  <rect x="10" y="10" width="26" height="26" fill="#e7eded" stroke="#0f766e" stroke-width="0.6"/>
  <text x="23" y="26" font-size="4" fill="#999" text-anchor="middle" font-family="Arial">Фото</text>
  <text x="42" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#1a1a1a">First Last</text>
  <text x="42" y="32" font-family="Arial, sans-serif" font-size="4" fill="#555">email · phone · city</text>
  <text x="10" y="50" font-family="Arial, sans-serif" font-size="4" font-weight="700" fill="#0f766e">О СЕБЕ</text>
  <line x1="10" y1="52" x2="150" y2="52" stroke="#0f766e" stroke-width="0.5"/>
  <rect x="10" y="56" width="138" height="1.3" fill="#d0d0d0"/>
  <rect x="10" y="60" width="125" height="1.3" fill="#d0d0d0"/>
  <text x="10" y="74" font-family="Arial, sans-serif" font-size="4" font-weight="700" fill="#0f766e">ОПЫТ</text>
  <line x1="10" y1="76" x2="150" y2="76" stroke="#0f766e" stroke-width="0.5"/>
  <rect x="10" y="80" width="90" height="2.4" fill="#1a1a1a"/>
  <rect x="10" y="85" width="70" height="1.3" fill="#555"/>
  <rect x="10" y="91" width="138" height="1.3" fill="#d0d0d0"/>
  <rect x="10" y="95" width="125" height="1.3" fill="#d0d0d0"/>
  <rect x="10" y="99" width="130" height="1.3" fill="#d0d0d0"/>
  <text x="10" y="112" font-family="Arial, sans-serif" font-size="4" font-weight="700" fill="#0f766e">ПРОЕКТЫ</text>
  <line x1="10" y1="114" x2="150" y2="114" stroke="#0f766e" stroke-width="0.5"/>
  <rect x="10" y="118" width="70" height="2" fill="#1a1a1a"/>
  <rect x="10" y="123" width="138" height="1.3" fill="#d0d0d0"/>
  <rect x="10" y="127" width="120" height="1.3" fill="#d0d0d0"/>
  <text x="10" y="140" font-family="Arial, sans-serif" font-size="4" font-weight="700" fill="#0f766e">НАВЫКИ</text>
  <line x1="10" y1="142" x2="150" y2="142" stroke="#0f766e" stroke-width="0.5"/>
  <rect x="10" y="146" width="138" height="1.3" fill="#d0d0d0"/>
  <rect x="10" y="150" width="130" height="1.3" fill="#d0d0d0"/>
  <rect x="10" y="154" width="128" height="1.3" fill="#d0d0d0"/>
  <text x="10" y="168" font-family="Arial, sans-serif" font-size="4" font-weight="700" fill="#0f766e">ОБРАЗОВАНИЕ</text>
  <line x1="10" y1="170" x2="150" y2="170" stroke="#0f766e" stroke-width="0.5"/>
  <rect x="10" y="174" width="120" height="1.3" fill="#d0d0d0"/>
  <rect x="10" y="178" width="90" height="1.3" fill="#d0d0d0"/>
  <text x="10" y="192" font-family="Arial, sans-serif" font-size="4" font-weight="700" fill="#0f766e">ЯЗЫКИ</text>
  <line x1="10" y1="194" x2="150" y2="194" stroke="#0f766e" stroke-width="0.5"/>
  <rect x="10" y="198" width="100" height="1.3" fill="#d0d0d0"/>
</svg>`;

export const compactTemplate: ResumeTemplate = {
  id: "compact",
  name: "Compact",
  description:
    "Плотный одностраничник. Тёмно-зелёный акцент, маленький шрифт, узкие поля. Фото в левом верхнем углу.",
  promptHint:
    "Стиль очень компактный. Summary ОДНО предложение. Буллеты максимум 3 на блок, по строке каждый. Цель — уместить всё на одну страницу A4. Подходит для откликов где явно просят одностраничное резюме.",
  previewSvg,
  render,
};
