import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  WidthType,
} from "docx";
import type { GeneratedResume } from "../anthropic";
import type { ResumeTemplate } from "./types";
import { loadPhoto, photoCell } from "./photo";

const FONT = "Georgia";

function sectionTitle(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 280, after: 120 },
    border: {
      top: { color: "000000", size: 4, style: BorderStyle.SINGLE, space: 6 },
      bottom: { color: "000000", size: 4, style: BorderStyle.SINGLE, space: 6 },
    },
    children: [
      new TextRun({
        text: ` ${text.toUpperCase()} `,
        bold: true,
        size: 22,
        font: FONT,
      }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 22, font: FONT })],
  });
}

function itemHeader(title: string, date?: string, subtitle?: string) {
  const children: Paragraph[] = [];
  children.push(
    new Paragraph({
      spacing: { after: 0 },
      children: [
        new TextRun({ text: title, bold: true, size: 24, font: FONT }),
        ...(date
          ? [
              new TextRun({ text: "  —  ", size: 22, font: FONT }),
              new TextRun({ text: date, italics: true, size: 22, font: FONT }),
            ]
          : []),
      ],
    }),
  );
  if (subtitle) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: subtitle, italics: true, size: 22, font: FONT })],
      }),
    );
  }
  return children;
}

async function render(resume: GeneratedResume): Promise<Buffer> {
  const photo = loadPhoto();
  const children: (Paragraph | Table)[] = [];

  // Фото по центру, выше имени
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const photoOnlyTable = new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 1800, type: WidthType.DXA },
    columnWidths: [1800],
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
        children: [photoCell(photo, { widthPt: 90, heightPt: 90 })],
      }),
    ],
  });
  children.push(photoOnlyTable);
  children.push(
    new Paragraph({
      spacing: { before: 120, after: 0 },
      children: [],
    }),
  );

  // Имя по центру
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: resume.headline, bold: true, size: 36, font: FONT }),
      ],
    }),
  );

  // Контакты по центру
  if (resume.contacts?.length) {
    const text = resume.contacts.map((c) => c.value).join("  •  ");
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text, size: 20, font: FONT })],
      }),
    );
  }

  if (resume.summary) {
    children.push(sectionTitle("О себе"));
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 80 },
        children: [new TextRun({ text: resume.summary, size: 22, font: FONT })],
      }),
    );
  }

  if (resume.experience?.length) {
    children.push(sectionTitle("Опыт"));
    resume.experience.forEach((e) => {
      itemHeader(e.title, e.date, e.subtitle).forEach((p) => children.push(p));
      e.bullets.forEach((b) => children.push(bullet(b)));
    });
  }

  if (resume.projects?.length) {
    children.push(sectionTitle("Проекты"));
    resume.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({ text: proj.name, bold: true, size: 24, font: FONT }),
            ...(proj.stack?.length
              ? [
                  new TextRun({ text: "  —  ", size: 22, font: FONT }),
                  new TextRun({
                    text: proj.stack.join(", "),
                    italics: true,
                    size: 22,
                    font: FONT,
                  }),
                ]
              : []),
          ],
        }),
      );
      if (proj.description) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: proj.description, size: 22, font: FONT })],
          }),
        );
      }
      proj.bullets?.forEach((b) => children.push(bullet(b)));
    });
  }

  if (resume.skills?.length) {
    children.push(sectionTitle("Навыки"));
    resume.skills.forEach((s) => {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${s.category}. `, bold: true, size: 22, font: FONT }),
            new TextRun({ text: s.items.join(", "), size: 22, font: FONT }),
          ],
        }),
      );
    });
  }

  if (resume.education?.length) {
    children.push(sectionTitle("Образование"));
    resume.education.forEach((e) => {
      itemHeader(e.title, e.date, e.subtitle).forEach((p) => children.push(p));
      e.bullets?.forEach((b) => children.push(bullet(b)));
    });
  }

  if (resume.languages?.length) {
    children.push(sectionTitle("Языки"));
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: resume.languages.map((l) => `${l.name} (${l.level})`).join("  •  "),
            size: 22,
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
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="100%" height="100%">
  <rect width="160" height="220" fill="#fdfcf8"/>
  <rect x="65" y="12" width="30" height="30" fill="#e7e7ee" stroke="#1a1a1a" stroke-width="0.6"/>
  <text x="80" y="30" font-size="5" fill="#999" text-anchor="middle" font-family="Georgia, serif">Фото</text>
  <text x="80" y="55" font-family="Georgia, serif" font-size="9" font-weight="700" text-anchor="middle" fill="#1a1a1a">FIRST LAST</text>
  <text x="80" y="65" font-family="Georgia, serif" font-size="4" text-anchor="middle" fill="#666">email • phone • city</text>
  <line x1="20" y1="74" x2="140" y2="74" stroke="#1a1a1a" stroke-width="0.6"/>
  <text x="80" y="82" font-family="Georgia, serif" font-size="4" text-anchor="middle" fill="#1a1a1a" font-weight="700">ABOUT</text>
  <line x1="20" y1="86" x2="140" y2="86" stroke="#1a1a1a" stroke-width="0.6"/>
  <rect x="20" y="92" width="120" height="1.5" fill="#d8d3c8"/>
  <rect x="20" y="97" width="105" height="1.5" fill="#d8d3c8"/>
  <rect x="20" y="102" width="115" height="1.5" fill="#d8d3c8"/>
  <line x1="20" y1="114" x2="140" y2="114" stroke="#1a1a1a" stroke-width="0.6"/>
  <text x="80" y="122" font-family="Georgia, serif" font-size="4" text-anchor="middle" fill="#1a1a1a" font-weight="700">EXPERIENCE</text>
  <line x1="20" y1="126" x2="140" y2="126" stroke="#1a1a1a" stroke-width="0.6"/>
  <rect x="20" y="132" width="80" height="2.5" fill="#1a1a1a"/>
  <rect x="20" y="138" width="118" height="1.5" fill="#d8d3c8"/>
  <rect x="20" y="143" width="100" height="1.5" fill="#d8d3c8"/>
  <line x1="20" y1="155" x2="140" y2="155" stroke="#1a1a1a" stroke-width="0.6"/>
  <text x="80" y="163" font-family="Georgia, serif" font-size="4" text-anchor="middle" fill="#1a1a1a" font-weight="700">EDUCATION</text>
  <line x1="20" y1="167" x2="140" y2="167" stroke="#1a1a1a" stroke-width="0.6"/>
  <rect x="20" y="173" width="120" height="1.5" fill="#d8d3c8"/>
  <rect x="20" y="178" width="100" height="1.5" fill="#d8d3c8"/>
  <line x1="20" y1="190" x2="140" y2="190" stroke="#1a1a1a" stroke-width="0.6"/>
  <text x="80" y="198" font-family="Georgia, serif" font-size="4" text-anchor="middle" fill="#1a1a1a" font-weight="700">LANGUAGES</text>
  <line x1="20" y1="202" x2="140" y2="202" stroke="#1a1a1a" stroke-width="0.6"/>
</svg>`;

export const classicTemplate: ResumeTemplate = {
  id: "classic",
  name: "Classic",
  description:
    "Классический серифный. Имя по центру, заголовки секций между линиями. Безопасный выбор для консервативных компаний.",
  promptHint:
    "Стиль формальный, академический. Summary развёрнутее (3-4 предложения). Можно длинные буллеты с подробностями. Подходит для банков, консалтинга, гос.компаний.",
  previewSvg,
  render,
};
