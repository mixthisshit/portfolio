import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  ContentSchemas,
  type CaseItem,
  type ProjectItem,
  type InternshipItem,
  type HackathonItem,
  type ContentFile,
} from "./schema";

export type ContentType = "case" | "project" | "internship" | "hackathon";

const CONTENT_DIR = path.join(process.cwd(), "content");
const FOLDERS: Record<ContentType, string> = {
  case: "cases",
  project: "projects",
  internship: "internships",
  hackathon: "hackathons",
};

/**
 * Парсит маркдаун-список вида:
 *   - первый пункт
 *   - второй пункт
 * в массив строк. Пустые строки и заголовки игнорируются.
 */
function parseBullets(md: string): string[] {
  return md
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") || line.startsWith("* "))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

function readIfExists(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function listFiles(filesDir: string): ContentFile[] {
  if (!fs.existsSync(filesDir)) return [];
  return fs
    .readdirSync(filesDir, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith("."))
    .map((d) => {
      const full = path.join(filesDir, d.name);
      const stat = fs.statSync(full);
      return {
        name: d.name,
        size: stat.size,
        ext: path.extname(d.name).slice(1).toLowerCase(),
      };
    });
}

/**
 * Читает одну папку контента и собирает её в типизированный объект.
 */
function loadItem<T extends ContentType>(
  type: T,
  slug: string,
):
  | (T extends "case"
      ? CaseItem
      : T extends "project"
        ? ProjectItem
        : T extends "internship"
          ? InternshipItem
          : HackathonItem)
  | null {
  const itemDir = path.join(CONTENT_DIR, FOLDERS[type], slug);
  if (!fs.existsSync(itemDir)) return null;

  const indexPath = path.join(itemDir, "index.md");
  const raw = readIfExists(indexPath);
  if (!raw) return null;

  const { data: frontmatter, content: body } = matter(raw);

  const whatIDidMd = readIfExists(path.join(itemDir, "what-i-did.md")) ?? "";
  const stackMd = readIfExists(path.join(itemDir, "stack.md")) ?? "";

  const files = listFiles(path.join(itemDir, "files"));

  const merged: Record<string, unknown> = {
    ...frontmatter,
    type,
    id: frontmatter.id ?? slug,
    description: body.trim(),
    whatIDid: parseBullets(whatIDidMd),
    stack: parseBullets(stackMd),
    files,
  };

  const schema = ContentSchemas[type];
  const parsed = schema.safeParse(merged);
  if (!parsed.success) {
    console.warn(
      `[content] ${type}/${slug}: не проходит схему\n${JSON.stringify(parsed.error.format(), null, 2)}`,
    );
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return parsed.data as any;
}

function listSlugs(type: ContentType): string[] {
  const dir = path.join(CONTENT_DIR, FOLDERS[type]);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);
}

export type ContentBundle = {
  cases: CaseItem[];
  projects: ProjectItem[];
  internships: InternshipItem[];
  hackathons: HackathonItem[];
};

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Загружает весь контент из content/. Возвращает 4 массива, отсортированных по date desc.
 */
export function loadContent(): ContentBundle {
  const cases = sortByDateDesc(
    listSlugs("case")
      .map((slug) => loadItem("case", slug))
      .filter((x): x is CaseItem => x !== null),
  );
  const projects = sortByDateDesc(
    listSlugs("project")
      .map((slug) => loadItem("project", slug))
      .filter((x): x is ProjectItem => x !== null),
  );
  const internships = sortByDateDesc(
    listSlugs("internship")
      .map((slug) => loadItem("internship", slug))
      .filter((x): x is InternshipItem => x !== null),
  );
  const hackathons = sortByDateDesc(
    listSlugs("hackathon")
      .map((slug) => loadItem("hackathon", slug))
      .filter((x): x is HackathonItem => x !== null),
  );
  return { cases, projects, internships, hackathons };
}

/**
 * Безопасное разрешение пути к файлу внутри content/, защита от directory traversal.
 * Возвращает абсолютный путь, если файл существует и лежит внутри content/.
 */
export function resolveContentFile(
  type: ContentType,
  slug: string,
  filename: string,
): string | null {
  const safeFilename = path.basename(filename);
  const candidate = path.join(CONTENT_DIR, FOLDERS[type], slug, "files", safeFilename);
  const resolved = path.resolve(candidate);
  if (!resolved.startsWith(path.resolve(CONTENT_DIR))) return null;
  if (!fs.existsSync(resolved)) return null;
  return resolved;
}
