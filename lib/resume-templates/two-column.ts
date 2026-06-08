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
const SIDEBAR_BG = "1F2937"; // тёмно-серый
const SIDEBAR_TEXT = "F3F4F6"; // светлый
const SIDEBAR_MUTED = "9CA3AF";
const ACCENT = "F59E0B"; // янтарный
const MAIN_TEXT = "1F2937";
const MAIN_MUTED = "6B7280";

// --- helpers для сайдбара (тёмная колонка) ---

function sidebarTitle(text: string) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 20,
        color: ACCENT,
        font: FONT,
      }),
    ],
  });
}

function sidebarLine(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: `${label}\n`, color: SIDEBAR_MUTED, size: 16, font: FONT }),
      new TextRun({ text: value, color: SIDEBAR_TEXT, size: 18, font: FONT, break: 1 }),
    ],
  });
}

function sidebarText(text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        size: opts.size ?? 18,
        color: opts.color ?? SIDEBAR_TEXT,
        font: FONT,
      }),
    ],
  });
}

// --- helpers для основной колонки ---

function mainTitle(text: string) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: { bottom: { color: ACCENT, size: 8, style: BorderStyle.SINGLE, space: 4 } },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        color: MAIN_TEXT,
        font: FONT,
      }),
    ],
  });
}

function mainBullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 20, color: MAIN_TEXT, font: FONT })],
  });
}

function mainItemHeader(title: string, date?: string, subtitle?: string) {
  const out: Paragraph[] = [
    new Paragraph({
      spacing: { after: 0 },
      children: [
        new TextRun({ text: title, bold: true, size: 22, color: MAIN_TEXT, font: FONT }),
        ...(date
          ? [
              new TextRun({ text: "    ", size: 22, font: FONT }),
              new TextRun({
                text: date,
                size: 18,
                italics: true,
                color: MAIN_MUTED,
                font: FONT,
              }),
            ]
          : []),
      ],
    }),
  ];
  if (subtitle) {
    out.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: subtitle, size: 18, color: MAIN_MUTED, font: FONT }),
        ],
      }),
    );
  }
  return out;
}

async function render(resume: GeneratedResume): Promise<Buffer> {
  const photo = loadPhoto();
  // === Содержимое сайдбара ===
  const sidebar: Paragraph[] = [];

  // Фото в самом верху сайдбара
  sidebar.push(photoParagraph(photo, 130));
  sidebar.push(new Paragraph({ spacing: { after: 200 }, children: [] }));

  // Имя крупно в сайдбаре
  sidebar.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: resume.headline.split("—")[0]?.trim() ?? resume.headline,
          bold: true,
          size: 28,
          color: SIDEBAR_TEXT,
          font: FONT,
        }),
      ],
    }),
  );
  const titlePart = resume.headline.split("—")[1]?.trim();
  if (titlePart) {
    sidebar.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: titlePart, size: 18, color: ACCENT, font: FONT }),
        ],
      }),
    );
  }

  // Контакты
  if (resume.contacts?.length) {
    sidebar.push(sidebarTitle("Контакты"));
    resume.contacts.forEach((c) => sidebar.push(sidebarLine(c.label, c.value)));
  }

  // Навыки
  if (resume.skills?.length) {
    sidebar.push(sidebarTitle("Навыки"));
    resume.skills.forEach((s) => {
      sidebar.push(sidebarText(s.category, { bold: true, size: 18, color: ACCENT }));
      sidebar.push(sidebarText(s.items.join(", "), { size: 17 }));
    });
  }

  // Языки
  if (resume.languages?.length) {
    sidebar.push(sidebarTitle("Языки"));
    resume.languages.forEach((l) => {
      sidebar.push(sidebarText(`${l.name} — ${l.level}`, { size: 18 }));
    });
  }

  // === Содержимое основной колонки ===
  const main: Paragraph[] = [];

  if (resume.summary) {
    main.push(mainTitle("О себе"));
    main.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: resume.summary, size: 20, color: MAIN_TEXT, font: FONT })],
      }),
    );
  }

  if (resume.experience?.length) {
    main.push(mainTitle("Опыт и кейсы"));
    resume.experience.forEach((e) => {
      mainItemHeader(e.title, e.date, e.subtitle).forEach((p) => main.push(p));
      e.bullets.forEach((b) => main.push(mainBullet(b)));
    });
  }

  if (resume.projects?.length) {
    main.push(mainTitle("Проекты"));
    resume.projects.forEach((proj) => {
      main.push(
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({ text: proj.name, bold: true, size: 22, color: MAIN_TEXT, font: FONT }),
            ...(proj.stack?.length
              ? [
                  new TextRun({ text: "    ", size: 22, font: FONT }),
                  new TextRun({
                    text: proj.stack.join(" · "),
                    size: 17,
                    italics: true,
                    color: MAIN_MUTED,
                    font: FONT,
                  }),
                ]
              : []),
          ],
        }),
      );
      if (proj.description) {
        main.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: proj.description, size: 19, color: MAIN_MUTED, font: FONT }),
            ],
          }),
        );
      }
      proj.bullets?.forEach((b) => main.push(mainBullet(b)));
    });
  }

  if (resume.education?.length) {
    main.push(mainTitle("Образование"));
    resume.education.forEach((e) => {
      mainItemHeader(e.title, e.date, e.subtitle).forEach((p) => main.push(p));
      e.bullets?.forEach((b) => main.push(mainBullet(b)));
    });
  }

  // === Таблица с двумя колонками ===
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const tableBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideHorizontal: noBorder,
    insideVertical: noBorder,
  };

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [3200, 6800],
    borders: tableBorders,
    rows: [
      new TableRow({
        cantSplit: false,
        children: [
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: SIDEBAR_BG },
            margins: { top: 400, bottom: 400, left: 350, right: 350 },
            verticalAlign: VerticalAlign.TOP,
            children: sidebar,
          }),
          new TableCell({
            width: { size: 68, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 400, left: 500, right: 500 },
            verticalAlign: VerticalAlign.TOP,
            children: main,
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: resume.headline,
    title: `Резюме · ${resume.headline}`,
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } },
        },
        children: [table],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="100%" height="100%">
  <rect width="160" height="220" fill="#fff"/>
  <rect x="0" y="0" width="55" height="220" fill="#1f2937"/>
  <rect x="13" y="10" width="28" height="28" fill="#374151" stroke="#f59e0b" stroke-width="0.6"/>
  <text x="27" y="27" font-size="4" fill="#9ca3af" text-anchor="middle" font-family="Calibri">Фото</text>
  <rect x="6" y="46" width="42" height="5" fill="#f3f4f6"/>
  <rect x="6" y="54" width="32" height="3" fill="#f59e0b"/>
  <rect x="6" y="70" width="28" height="3" fill="#f59e0b"/>
  <rect x="6" y="78" width="42" height="2" fill="#9ca3af"/>
  <rect x="6" y="83" width="38" height="2" fill="#f3f4f6"/>
  <rect x="6" y="90" width="42" height="2" fill="#9ca3af"/>
  <rect x="6" y="95" width="36" height="2" fill="#f3f4f6"/>
  <rect x="6" y="108" width="28" height="3" fill="#f59e0b"/>
  <rect x="6" y="116" width="42" height="2" fill="#f3f4f6"/>
  <rect x="6" y="121" width="38" height="2" fill="#f3f4f6"/>
  <rect x="6" y="126" width="40" height="2" fill="#f3f4f6"/>
  <rect x="6" y="138" width="28" height="3" fill="#f59e0b"/>
  <rect x="6" y="146" width="40" height="2" fill="#f3f4f6"/>
  <rect x="6" y="151" width="36" height="2" fill="#f3f4f6"/>
  <rect x="6" y="166" width="28" height="3" fill="#f59e0b"/>
  <rect x="6" y="174" width="38" height="2" fill="#f3f4f6"/>
  <rect x="62" y="14" width="40" height="3" fill="#1f2937"/>
  <line x1="62" y1="20" x2="148" y2="20" stroke="#f59e0b" stroke-width="0.8"/>
  <rect x="62" y="24" width="86" height="2" fill="#d1d5db"/>
  <rect x="62" y="30" width="70" height="2" fill="#d1d5db"/>
  <rect x="62" y="36" width="78" height="2" fill="#d1d5db"/>
  <rect x="62" y="50" width="50" height="3" fill="#1f2937"/>
  <line x1="62" y1="56" x2="148" y2="56" stroke="#f59e0b" stroke-width="0.8"/>
  <rect x="62" y="60" width="60" height="3" fill="#1f2937"/>
  <rect x="62" y="67" width="86" height="2" fill="#d1d5db"/>
  <rect x="62" y="72" width="78" height="2" fill="#d1d5db"/>
  <rect x="62" y="78" width="72" height="2" fill="#d1d5db"/>
  <rect x="62" y="92" width="56" height="3" fill="#1f2937"/>
  <rect x="62" y="99" width="86" height="2" fill="#d1d5db"/>
  <rect x="62" y="104" width="80" height="2" fill="#d1d5db"/>
  <rect x="62" y="118" width="40" height="3" fill="#1f2937"/>
  <line x1="62" y1="124" x2="148" y2="124" stroke="#f59e0b" stroke-width="0.8"/>
  <rect x="62" y="128" width="70" height="2" fill="#d1d5db"/>
  <rect x="62" y="134" width="60" height="2" fill="#d1d5db"/>
  <rect x="62" y="148" width="50" height="3" fill="#1f2937"/>
  <line x1="62" y1="154" x2="148" y2="154" stroke="#f59e0b" stroke-width="0.8"/>
  <rect x="62" y="158" width="80" height="2" fill="#d1d5db"/>
  <rect x="62" y="163" width="74" height="2" fill="#d1d5db"/>
  <rect x="62" y="168" width="68" height="2" fill="#d1d5db"/>
</svg>`;

export const twoColumnTemplate: ResumeTemplate = {
  id: "two-column",
  name: "Two-Column",
  description:
    "Двухколоночный с тёмным сайдбаром. Контакты, навыки и языки слева, опыт и проекты справа. Янтарный акцент.",
  promptHint:
    "Стиль современный плотный. Summary 2 предложения. Навыки сгруппируй компактно (короткие категории). Подходит для tech/startup вакансий.",
  previewSvg,
  render,
};
