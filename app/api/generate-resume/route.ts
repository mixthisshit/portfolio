import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/profile";
import { generateResume } from "@/lib/anthropic";
import { getTemplate, DEFAULT_TEMPLATE_ID } from "@/lib/resume-templates";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { jobDescription?: string; userWishes?: string; templateId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Невалидный JSON в теле запроса" }, { status: 400 });
  }

  const jobDescription = (body.jobDescription ?? "").trim();
  const userWishes = (body.userWishes ?? "").trim();
  const templateId = (body.templateId ?? DEFAULT_TEMPLATE_ID).trim();

  if (jobDescription.length < 30) {
    return NextResponse.json(
      { error: "Описание вакансии слишком короткое (нужно минимум 30 символов)" },
      { status: 400 },
    );
  }

  let template;
  try {
    template = getTemplate(templateId);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 400 },
    );
  }

  try {
    const profile = await getProfile();
    const generated = await generateResume({
      profile,
      jobDescription,
      userWishes: userWishes || undefined,
      templateHint: template.promptHint,
      templateName: template.name,
    });
    const buffer = await template.render(generated);

    const ts = Date.now();
    const utf8Name = `Резюме ${profile.personal.shortName} · ${template.name} ${ts}.docx`;
    const asciiName = `resume-${template.id}-${ts}.docx`;
    const contentDisposition = `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(utf8Name)}`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[generate-resume]", message, "\n", stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
