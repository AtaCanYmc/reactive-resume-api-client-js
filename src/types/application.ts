/**
 * TypeScript definitions representing job applications in Reactive Resume.
 */

export type ApplicationStage = "Applied" | "Interviewing" | "Offered" | "Rejected" | string;

export interface Application {
  id: string;
  userId: string;
  user_id?: string;
  company: string;
  position: string;
  stage: ApplicationStage;
  date: string | Date;
  summary?: string;
  url?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface ApplicationCreate {
  company: string;
  position: string;
  stage?: ApplicationStage;
  date?: string | Date | null;
  summary?: string | null;
  url?: string | null;
}
