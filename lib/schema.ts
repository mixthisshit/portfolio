import { z } from "zod";

const Relevance = z.object({
  pm: z.number().min(0).max(5),
  analyst: z.number().min(0).max(5),
  dev: z.number().min(0).max(5),
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

const ExperienceItem = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  city: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  relevance: Relevance,
});

const CaseItem = z.object({
  id: z.string(),
  name: z.string(),
  organizer: z.string(),
  partner: z.string().optional(),
  stage: z.string().optional(),
  team: z.string().optional(),
  role: z.string(),
  problem: z.string(),
  description: z.string(),
  bullets: z.array(z.string()).default([]),
  metrics: z.array(z.string()).default([]),
  result: z.string(),
  date: z.string(),
  tags: z.array(z.string()).default([]),
  relevance: Relevance,
  featured: z.boolean().default(false),
});

const ProjectItem = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  bullets: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
  url: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  category: z.enum(["product", "frontend", "analytics", "research", "academic"]),
  tags: z.array(z.string()).default([]),
  relevance: Relevance,
});

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

export const ProfileSchema = z.object({
  personal: Personal,
  summary: z.string(),
  highlights: z.array(z.string()).default([]),
  education: z.array(EducationItem).default([]),
  experience: z.array(ExperienceItem).default([]),
  cases: z.array(CaseItem).default([]),
  projects: z.array(ProjectItem).default([]),
  skills: z.object({
    technical: z.array(SkillItem).default([]),
    soft: z.array(z.string()).default([]),
  }),
  courses: z.array(CourseItem).default([]),
  languages: z.array(LanguageItem).default([]),
  activities: z.array(ActivityItem).default([]),
  awards: z.array(AwardItem).default([]),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type CaseItem = z.infer<typeof CaseItem>;
export type ProjectItem = z.infer<typeof ProjectItem>;
export type SkillItem = z.infer<typeof SkillItem>;
export type EducationItem = z.infer<typeof EducationItem>;
export type ExperienceItem = z.infer<typeof ExperienceItem>;
export type CourseItem = z.infer<typeof CourseItem>;
export type LanguageItem = z.infer<typeof LanguageItem>;
export type ActivityItem = z.infer<typeof ActivityItem>;
export type AwardItem = z.infer<typeof AwardItem>;
