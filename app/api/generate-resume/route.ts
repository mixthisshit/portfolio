import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/profile";
import { generateResume } from "@/lib/anthropic";
import { renderResumeDocx } from "@/lib/docx";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { jobDescription?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Невалидный JSON в теле запроса" }, { status: 400 });
  }

  const jobDescription = (body.jobDescription ?? "").trim();
  if (jobDescription.length < 30) {
    return NextResponse.json(
      { error: "Описание вакансии слишком короткое (нужно минимум 30 символов)" },
      { status: 400 },
    );
  }

  try {
    const profile = getProfile();
    const generated = await generateResume(profile, jobDescription);
    const buffer = await renderResumeDocx(generated);

    const slug = profile.personal.fullName
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `resume-${slug}-${Date.now()}.docx`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    console.error("[generate-resume]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
