/**
 * TypeScript definitions representing resume statistics in Reactive Resume.
 */

export interface ResumeStats {
  views: number;
  downloads: number;
  history?: Record<string, unknown>;
}
