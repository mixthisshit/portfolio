import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { GeneratedResume } from "./anthropic";

const FONT = "Calibri";
const ACCENT = "5B5BE5";
const MUTED = "555555";

function p(text: string, opts: Partial<{ bold: boolean; size: number; color: string; spacingAfter: number }> = {}) {
  return new Paragraph({
    spacing: { after: opts.spacingAfter ?? 60 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        size: opts.size ?? 22,
        color: opts.color,
        font: FONT,
      }),
    ],
  });
}

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
  const children = [];
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
    children.push(p(title, { bold: true, size: 22, spacingAfter: 0 }));
  }
  if (subtitle) {
    children.push(p(subtitle, { size: 20, color: MUTED, spacingAfter: 60 }));
  }
  return children;
}

export async function renderResumeDocx(resume: GeneratedResume): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Headline
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: resume.headline, bold: true, size: 36, font: FONT }),
      ],
    }),
  );

  // Contacts inline
  if (resume.contacts?.length) {
    const contactRuns = resume.contacts.flatMap((c, i) => {
      const isUrl = c.value.startsWith("http") || c.value.includes("@") || c.value.startsWith("+");
      const sep = i > 0 ? "  •  " : "";
      const runs = [];
      if (sep) runs.push(new TextRun({ text: sep, color: MUTED, size: 20, font: FONT }));
      runs.push(
        new TextRun({
          text: `${c.label}: `,
          color: MUTED,
          size: 20,
          font: FONT,
        }),
        new TextRun({
          text: c.value,
          color: isUrl ? ACCENT : undefined,
          size: 20,
          font: FONT,
        }),
      );
      return runs;
    });
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: contactRuns,
      }),
    );
  }

  // Summary
  if (resume.summary) {
    children.push(sectionTitle("О себе"));
    children.push(p(resume.summary, { size: 22, spacingAfter: 80 }));
  }

  // Experience
  if (resume.experience?.length) {
    children.push(sectionTitle("Опыт и кейсы"));
    resume.experience.forEach((e) => {
      itemHeader(e.title, e.date, e.subtitle).forEach((p) => children.push(p));
      e.bullets.forEach((b) => children.push(bullet(b)));
    });
  }

  // Projects
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
        children.push(p(proj.description, { size: 21, color: MUTED, spacingAfter: 40 }));
      }
      proj.bullets?.forEach((b) => children.push(bullet(b)));
    });
  }

  // Skills
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

  // Education
  if (resume.education?.length) {
    children.push(sectionTitle("Образование"));
    resume.education.forEach((e) => {
      itemHeader(e.title, e.date, e.subtitle).forEach((p) => children.push(p));
      e.bullets?.forEach((b) => children.push(bullet(b)));
    });
  }

  // Languages
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
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
