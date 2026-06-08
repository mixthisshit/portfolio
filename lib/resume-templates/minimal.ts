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
const TEXT = "1A1A1A";
const MUTED = "888888";
const HAIR = "D8D8D8";

function sectionTitle(text: string) {
  return new Paragraph({
    spacing: { before: 320, after: 120 },
    children: [
      new TextRun({
        text: text.toLowerCase(),
        size: 18,
        color: MUTED,
        characterSpacing: 60,
        font: FONT,
      }),
    ],
  });
}

function bodyText(text: string, size = 20) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, size, color: TEXT, font: FONT })],
  });
}

function bullet(text: string) {
  return new Paragraph({
    spacing: { after: 40 },
    indent: { left: 200 },
    children: [
      new TextRun({ text: "—   ", color: MUTED, size: 20, font: FONT }),
      new TextRun({ text, size: 20, color: TEXT, font: FONT }),
    ],
  });
}

function itemHeader(title: string, date?: string, subtitle?: string) {
  const out: Paragraph[] = [
    new Paragraph({
      spacing: { after: 0 },
      children: [
        new TextRun({ text: title, size: 22, color: TEXT, font: FONT }),
        ...(date
          ? [
              new TextRun({ text: "    ", size: 22, font: FONT }),
              new TextRun({ text: date, size: 18, color: MUTED, font: FONT }),
            ]
          : []),
      ],
    }),
  ];
  if (subtitle) {
    out.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: subtitle, size: 18, color: MUTED, font: FONT })],
      }),
    );
  }
  return out;
}

async function render(resume: GeneratedResume): Promise<Buffer> {
  const photo = loadPhoto();
  const sections: (Paragraph | Table)[] = [];

  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

  // Header: [text | small photo]
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [8200, 1800],
    borders: {
      top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
      insideHorizontal: noBorder, insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 82, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 0, left: 0, right: 200 },
            verticalAlign: VerticalAlign.CENTER,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: resume.headline,
                    size: 32,
                    color: TEXT,
                    font: FONT,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 0 },
                children: (resume.contacts ?? []).flatMap((c, i) => {
                  const sep = i > 0 ? "    " : "";
                  return [
                    ...(sep ? [new TextRun({ text: sep, size: 18, font: FONT })] : []),
                    new TextRun({ text: c.value, size: 18, color: MUTED, font: FONT }),
                  ];
                }),
              }),
            ],
          }),
          photoCell(photo, { widthPt: 70, heightPt: 70, borderColor: HAIR }),
        ],
      }),
    ],
  });
  sections.push(headerTable);

  if (resume.summary) {
    sections.push(sectionTitle("О себе"));
    sections.push(bodyText(resume.summary, 22));
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
          spacing: { after: 40 },
          children: [
            new TextRun({ text: proj.name, size: 22, color: TEXT, font: FONT }),
            ...(proj.stack?.length
              ? [
                  new TextRun({ text: "    ", size: 22, font: FONT }),
                  new TextRun({
                    text: proj.stack.join(" · "),
                    size: 18,
                    color: MUTED,
                    font: FONT,
                  }),
                ]
              : []),
          ],
        }),
      );
      if (proj.description) sections.push(bodyText(proj.description, 20));
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
            new TextRun({ text: `${s.category}    `, color: MUTED, size: 18, font: FONT }),
            new TextRun({ text: s.items.join(", "), size: 20, color: TEXT, font: FONT }),
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
            text: resume.languages.map((l) => `${l.name} — ${l.level}`).join("    "),
            size: 20,
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
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1200, right: 1200 } } },
        children: sections,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="100%" height="100%">
  <rect width="160" height="220" fill="#fafafa"/>
  <text x="20" y="32" font-family="Calibri, sans-serif" font-size="9" fill="#1a1a1a">First Last</text>
  <text x="20" y="42" font-family="Calibri, sans-serif" font-size="4" fill="#888">email • phone • city</text>
  <rect x="118" y="14" width="26" height="26" fill="#f0f0f0" stroke="#d8d8d8" stroke-width="0.5"/>
  <text x="131" y="30" font-size="4" fill="#999" text-anchor="middle" font-family="Calibri">Фото</text>
  <text x="20" y="62" font-family="Calibri" font-size="3" fill="#888" letter-spacing="0.4">о себе</text>
  <rect x="20" y="68" width="120" height="1.5" fill="#d8d8d8"/>
  <rect x="20" y="73" width="105" height="1.5" fill="#d8d8d8"/>
  <rect x="20" y="78" width="115" height="1.5" fill="#d8d8d8"/>
  <text x="20" y="94" font-family="Calibri" font-size="3" fill="#888" letter-spacing="0.4">опыт</text>
  <rect x="20" y="100" width="80" height="2.5" fill="#1a1a1a"/>
  <rect x="20" y="106" width="60" height="1.5" fill="#888"/>
  <rect x="24" y="113" width="115" height="1.5" fill="#d8d8d8"/>
  <rect x="24" y="118" width="100" height="1.5" fill="#d8d8d8"/>
  <text x="20" y="134" font-family="Calibri" font-size="3" fill="#888" letter-spacing="0.4">проекты</text>
  <rect x="20" y="140" width="70" height="2.5" fill="#1a1a1a"/>
  <rect x="24" y="147" width="110" height="1.5" fill="#d8d8d8"/>
  <text x="20" y="162" font-family="Calibri" font-size="3" fill="#888" letter-spacing="0.4">навыки</text>
  <rect x="20" y="168" width="115" height="1.5" fill="#d8d8d8"/>
  <rect x="20" y="173" width="100" height="1.5" fill="#d8d8d8"/>
  <text x="20" y="188" font-family="Calibri" font-size="3" fill="#888" letter-spacing="0.4">образование</text>
  <rect x="20" y="194" width="105" height="1.5" fill="#d8d8d8"/>
  <rect x="20" y="199" width="80" height="1.5" fill="#d8d8d8"/>
</svg>`;

export const minimalTemplate: ResumeTemplate = {
  id: "minimal",
  name: "Minimal",
  description:
    "Минималистичный, много воздуха. Без линий и цвета. Подписи секций мелким lowercase. Фото справа в шапке.",
  promptHint:
    "Стиль сдержанный, без украшений. Summary 2 предложения, лаконично. Буллеты короткие — 1 строка на каждый. Подходит для дизайн/UX/креативных вакансий.",
  previewSvg,
  render,
};
