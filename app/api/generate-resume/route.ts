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
    const profile = await getProfile();
    const generated = await generateResume({
      profile,
      jobDescription,
      userWishes: userWishes || undefined,
      templateText,
      templateFilename,
    });
    const buffer = await renderResumeDocx(generated);

    // Имя файла. Юникод-вариант для современных браузеров (RFC 5987),
    // ASCII-фолбэк для старых клиентов. Без этого Node fetch отказывается
    // ставить Cyrillic в Content-Disposition.
    const ts = Date.now();
    const utf8Name = `Резюме ${profile.personal.shortName} ${ts}.docx`;
    const asciiName = `resume-${ts}.docx`;
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
