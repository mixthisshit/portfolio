import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/profile";
import { generateResume } from "@/lib/anthropic";
import { renderResumeDocx } from "@/lib/docx";
import { extractTemplate } from "@/lib/extract-template";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  let jobDescription = "";
  let userWishes = "";
  let templateText: string | undefined;
  let templateFilename: string | undefined;

  try {
    if (contentType.startsWith("multipart/form-data")) {
      const form = await req.formData();
      jobDescription = String(form.get("jobDescription") ?? "").trim();
      userWishes = String(form.get("userWishes") ?? "").trim();

      const file = form.get("template") as File | null;
      if (file && typeof file === "object" && "arrayBuffer" in file && file.size > 0) {
        const extracted = await extractTemplate(file);
        templateText = extracted.text;
        templateFilename = extracted.filename;
      }
    } else if (contentType.startsWith("application/json")) {
      const body = await req.json();
      jobDescription = String(body.jobDescription ?? "").trim();
      userWishes = String(body.userWishes ?? "").trim();
    } else {
      return NextResponse.json(
        { error: `Неподдерживаемый Content-Type: ${contentType}` },
        { status: 400 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Не удалось разобрать запрос: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  if (jobDescription.length < 30) {
    return NextResponse.json(
      { error: "Описание вакансии слишком короткое (нужно минимум 30 символов)" },
      { status: 400 },
    );
  }

  try {
    const profile = getProfile();
    const generated = await generateResume({
      profile,
      jobDescription,
      userWishes: userWishes || undefined,
      templateText,
      templateFilename,
    });
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
