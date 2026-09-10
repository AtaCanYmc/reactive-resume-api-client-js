/**
 * TypeScript definitions representing resume data in Reactive Resume.
 */

export interface URLModel {
  label?: string;
  href?: string;
}

export interface Profile {
  id?: string | null;
  network?: string;
  username?: string;
  url?: URLModel | string;
}

export interface Basics {
  name?: string;
  headline?: string;
  email?: string;
  phone?: string;
  website?: URLModel | string;
  location?: string;
  picture?: string;
  profiles?: Profile[];
}

export interface Item {
  id: string;
  visible?: boolean;
}

export interface WorkItem extends Item {
  company?: string;
  position?: string;
  location?: string;
  date?: string;
  summary?: string;
  url?: URLModel | string;
}

export interface EducationItem extends Item {
  institution?: string;
  studyType?: string;
  study_type?: string;
  area?: string;
  score?: string;
  date?: string;
  summary?: string;
  url?: URLModel | string;
}

export interface ProjectItem extends Item {
  name?: string;
  description?: string;
  date?: string;
  summary?: string;
  keywords?: string[];
  url?: URLModel | string;
}

export interface SkillItem extends Item {
  name?: string;
  description?: string;
  level?: string;
  keywords?: string[];
}

export interface LanguageItem extends Item {
  name?: string;
  description?: string;
  level?: string;
}

export interface CertificationItem extends Item {
  name?: string;
  issuer?: string;
  date?: string;
  summary?: string;
  url?: URLModel | string;
}

export interface AwardItem extends Item {
  title?: string;
  awarder?: string;
  date?: string;
  summary?: string;
  url?: URLModel | string;
}

export interface InterestItem extends Item {
  name?: string;
  keywords?: string[];
}

export interface ReferenceItem extends Item {
  name?: string;
  relationship?: string;
  summary?: string;
  url?: URLModel | string;
}

export interface PublicationItem extends Item {
  name?: string;
  publisher?: string;
  date?: string;
  summary?: string;
  url?: URLModel | string;
}

export interface VolunteerItem extends Item {
  organization?: string;
  position?: string;
  location?: string;
  date?: string;
  summary?: string;
  url?: URLModel | string;
}

export interface CustomItem extends Item {
  title?: string;
  subtitle?: string;
  date?: string;
  summary?: string;
  url?: URLModel | string;
}

export interface Section<T = unknown> {
  id: string;
  name: string;
  columns?: number;
  visible?: boolean;
  items?: T[];
}

export interface ResumeData {
  basics?: Basics;
  sections?: Record<string, Section>;
}

export interface Resume {
  id: string;
  name: string;
  slug: string;
  userId?: string | null;
  user_id?: string | null;
  visibility?: "public" | "private" | string;
  locked?: boolean;
  data?: ResumeData | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface ResumeImportData {
  title: string;
  slug?: string | null;
  basics?: Partial<Basics> | null;
  sections?: Record<string, Section> | null;
  metadata?: Record<string, unknown> | null;
}
