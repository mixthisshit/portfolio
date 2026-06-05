import { z } from "zod";

const Relevance = z.object({
  pm: z.number().min(0).max(5),
  analyst: z.number().min(0).max(5),
  dev: z.number().min(0).max(5),
});

const ContentFile = z.object({
  name: z.string(),
  size: z.number(),
  ext: z.string(),
});

const Personal = z.object({
  fullName: z.string(),
  shortName: z.string(),
  title: z.string(),
  email: z.string().email(),
  phone: z.string(),
  telegram: z.string(),
  city: z.string(),
  githubUrl: z.string().url().optional(),
  siteUrl: z.string().url().optional(),
});

const EducationItem = z.object({
  id: z.string(),
  institution: z.string(),
  faculty: z.string().optional(),
  degree: z.string(),
  program: z.string().optional(),
  city: z.string().optional(),
  startYear: z.number(),
  endYear: z.number().optional(),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
});

// ---- Файловый контент (content/) ----

const ContentBase = {
  id: z.string(),
  name: z.string(),
  date: z.string(),
  description: z.string().default(""), // тело index.md
  whatIDid: z.array(z.string()).default([]), // из what-i-did.md
  stack: z.array(z.string()).default([]), // из stack.md
  tags: z.array(z.string()).default([]),
  relevance: Relevance,
  cover: z.string().optional(), // имя файла в files/
  files: z.array(ContentFile).default([]),
};

const CaseItem = z.object({
  ...ContentBase,
  type: z.literal("case"),
  organizer: z.string(),
  partner: z.string().optional(),
  stage: z.string().optional(),
  team: z.string().optional(),
  role: z.string(),
  problem: z.string().optional(),
  result: z.string(),
  metrics: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

const ProjectItem = z.object({
  ...ContentBase,
  type: z.literal("project"),
  category: z.enum(["product", "frontend", "analytics", "research", "academic"]),
  url: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
});

const InternshipItem = z.object({
  ...ContentBase,
  type: z.literal("internship"),
  company: z.string(),
  role: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  city: z.string().optional(),
});

const HackathonItem = z.object({
  ...ContentBase,
  type: z.literal("hackathon"),
  organizer: z.string(),
  team: z.string().optional(),
  role: z.string(),
  result: z.string(),
  metrics: z.array(z.string()).default([]),
});

// ---- Профиль (Supabase + content) ----

const SkillItem = z.object({
  name: z.string(),
  level: z.enum(["basic", "intermediate", "advanced"]),
  category: z.string(),
  tags: z.array(z.string()).default([]),
});

const CourseItem = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  status: z.enum(["completed", "in_progress", "planned"]),
  year: z.number().optional(),
  tags: z.array(z.string()).default([]),
});

const LanguageItem = z.object({
  name: z.string(),
  level: z.string(),
});

const ActivityItem = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  bullets: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const AwardItem = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  year: z.number(),
  description: z.string().optional(),
});

// Хранится в Supabase. Не включает cases/projects/internships/hackathons —
// эти подтягиваются из content/ при сборке профиля.
export const StoredProfileSchema = z.object({
  personal: Personal,
  summary: z.string(),
  highlights: z.array(z.string()).default([]),
  education: z.array(EducationItem).default([]),
  skills: z.object({
    technical: z.array(SkillItem).default([]),
    soft: z.array(z.string()).default([]),
  }),
  courses: z.array(CourseItem).default([]),
  languages: z.array(LanguageItem).default([]),
  activities: z.array(ActivityItem).default([]),
  awards: z.array(AwardItem).default([]),
});

// Полный профиль = Supabase data + content/. Это то, что видит сайт и генератор.
export const ProfileSchema = StoredProfileSchema.extend({
  cases: z.array(CaseItem).default([]),
  projects: z.array(ProjectItem).default([]),
  internships: z.array(InternshipItem).default([]),
  hackathons: z.array(HackathonItem).default([]),
});

// Старая схема в seed.json (для обратной совместимости при первой миграции).
export const LegacyProfileSchema = ProfileSchema.passthrough();

export type StoredProfile = z.infer<typeof StoredProfileSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type CaseItem = z.infer<typeof CaseItem>;
export type ProjectItem = z.infer<typeof ProjectItem>;
export type InternshipItem = z.infer<typeof InternshipItem>;
export type HackathonItem = z.infer<typeof HackathonItem>;
export type SkillItem = z.infer<typeof SkillItem>;
export type EducationItem = z.infer<typeof EducationItem>;
export type CourseItem = z.infer<typeof CourseItem>;
export type LanguageItem = z.infer<typeof LanguageItem>;
export type ActivityItem = z.infer<typeof ActivityItem>;
export type AwardItem = z.infer<typeof AwardItem>;
export type ContentFile = z.infer<typeof ContentFile>;

export const ContentSchemas = {
  case: CaseItem,
  project: ProjectItem,
  internship: InternshipItem,
  hackathon: HackathonItem,
};
