import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { GeneratedResume } from "../anthropic";
import type { ResumeTemplate } from "./types";

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
  if (date) {
    children.push(
      new Paragraph({
        spacing: { after: 0 },
        children: [
          new TextRun({ text: title, bold: true, size: 22, font: FONT }),
          new TextRun({ text: "    ", size: 22, font: FONT }),
          new TextRun({ text: date, size: 20, color: MUTED, italics: true, font: FONT }),
        ],
      }),
    );
  } else {
    children.push(
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text: title, bold: true, size: 22, font: FONT })],
      }),
    );
  }
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
  const children: Paragraph[] = [];

  // Headline
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 60 },
      children: [new TextRun({ text: resume.headline, bold: true, size: 36, font: FONT })],
    }),
  );

  // Contacts inline
  if (resume.contacts?.length) {
    const contactRuns = resume.contacts.flatMap((c, i) => {
      const sep = i > 0 ? "  •  " : "";
      const runs = [];
      if (sep) runs.push(new TextRun({ text: sep, color: MUTED, size: 20, font: FONT }));
      runs.push(
        new TextRun({ text: `${c.label}: `, color: MUTED, size: 20, font: FONT }),
        new TextRun({ text: c.value, size: 20, font: FONT }),
      );
      return runs;
    });
    children.push(new Paragraph({ spacing: { after: 200 }, children: contactRuns }));
  }

  if (resume.summary) {
    children.push(sectionTitle("О себе"));
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: resume.summary, size: 22, font: FONT })],
      }),
    );
  }

  if (resume.experience?.length) {
    children.push(sectionTitle("Опыт и кейсы"));
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
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: proj.description, size: 21, color: MUTED, font: FONT }),
            ],
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
            new TextRun({ text: `${s.category}: `, bold: true, size: 21, font: FONT }),
            new TextRun({ text: s.items.join(", "), size: 21, font: FONT }),
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
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="100%" height="100%">
  <rect width="160" height="220" fill="#fff"/>
  <rect x="14" y="18" width="76" height="10" fill="#1f1f2e"/>
  <rect x="14" y="34" width="118" height="5" fill="#a0a0b0"/>
  <rect x="14" y="48" width="80" height="3" fill="#5b5be5"/>
  <rect x="14" y="58" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="65" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="72" width="92" height="2" fill="#e7e7ee"/>
  <rect x="14" y="88" width="48" height="3" fill="#5b5be5"/>
  <rect x="14" y="98" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="105" width="100" height="2" fill="#e7e7ee"/>
  <rect x="14" y="112" width="110" height="2" fill="#e7e7ee"/>
  <rect x="14" y="119" width="80" height="2" fill="#e7e7ee"/>
  <rect x="14" y="135" width="48" height="3" fill="#5b5be5"/>
  <rect x="14" y="145" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="152" width="100" height="2" fill="#e7e7ee"/>
  <rect x="14" y="168" width="48" height="3" fill="#5b5be5"/>
  <rect x="14" y="178" width="118" height="2" fill="#e7e7ee"/>
  <rect x="14" y="185" width="100" height="2" fill="#e7e7ee"/>
  <rect x="14" y="192" width="80" height="2" fill="#e7e7ee"/>
</svg>`;

export const modernTemplate: ResumeTemplate = {
  id: "modern",
  name: "Modern",
  description:
    "Современный одностолбцовый. Sans-serif, фиолетовый акцент, разделители-линии под заголовками.",
  promptHint:
    "Стиль современный лаконичный. Summary 2-3 предложения. Буллеты компактные. Подходит для продуктовых/IT-вакансий.",
  previewSvg,
  render,
};
