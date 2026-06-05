import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { resolveContentFile, type ContentType } from "@/lib/content";

export const runtime = "nodejs";

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
};

const ALLOWED_TYPES: ContentType[] = ["case", "project", "internship", "hackathon"];
const TYPE_FROM_PLURAL: Record<string, ContentType> = {
  cases: "case",
  projects: "project",
  internships: "internship",
  hackathons: "hackathon",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { type: string; slug: string; filename: string } },
) {
  const type =
    TYPE_FROM_PLURAL[params.type] ??
    (ALLOWED_TYPES.includes(params.type as ContentType)
      ? (params.type as ContentType)
      : null);
  if (!type) {
    return NextResponse.json({ error: "Unknown content type" }, { status: 404 });
  }

  const filePath = resolveContentFile(type, params.slug, params.filename);
  if (!filePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = await readFile(filePath);
  const ext = params.filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buffer.length),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
