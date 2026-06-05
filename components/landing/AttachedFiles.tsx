import { FileText, FileImage, FileArchive, File as FileIcon } from "lucide-react";
import type { ContentFile } from "@/lib/schema";

const ICON_BY_EXT: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  pptx: FileText,
  xlsx: FileText,
  txt: FileText,
  md: FileText,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  webp: FileImage,
  gif: FileImage,
  svg: FileImage,
  zip: FileArchive,
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

type Props = {
  files: ContentFile[];
  type: "case" | "project" | "internship" | "hackathon";
  slug: string;
  label?: string;
};

const TYPE_PLURAL = {
  case: "cases",
  project: "projects",
  internship: "internships",
  hackathon: "hackathons",
} as const;

export function AttachedFiles({ files, type, slug, label = "Файлы" }: Props) {
  if (!files.length) return null;
  return (
    <div>
      <div className="label-caps">{label}</div>
      <ul className="mt-3 space-y-1.5">
        {files.map((f) => {
          const Icon = ICON_BY_EXT[f.ext] ?? FileIcon;
          const href = `/api/content-file/${TYPE_PLURAL[type]}/${slug}/${encodeURIComponent(f.name)}`;
          return (
            <li key={f.name}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-foreground transition-colors hover:text-accent"
              >
                <Icon size={14} strokeWidth={1.8} className="shrink-0 text-subtle" />
                <span className="truncate">{f.name}</span>
                <span className="ml-auto text-xs text-subtle">{fmtSize(f.size)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
