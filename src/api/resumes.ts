import { BaseAPI } from "./base.js";
import type { Resume, ResumeImportData, ResumeStats } from "../types/index.js";

/**
 * Resumes management endpoints for Reactive Resume v4 API.
 */
export class ResumesAPI extends BaseAPI {
  /**
   * List all resumes for the authenticated user.
   */
  async list(): Promise<Resume[]> {
    const response = await this.client.request<Resume[] | { data: Resume[] }>("/api/openapi/resumes", {
      method: "GET",
    });
    if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray(response) ? response : [];
  }

  /**
   * Retrieve a specific resume by ID.
   */
  async get(resumeId: string): Promise<Resume> {
    return this.client.request<Resume>(`/api/openapi/resumes/${resumeId}`, {
      method: "GET",
    });
  }

  /**
   * Create a new resume.
   */
  async create(data: ResumeImportData): Promise<Resume> {
    return this.client.request<Resume>("/api/openapi/resumes", {
      method: "POST",
      body: data,
    });
  }

  /**
   * Import a resume.
   */
  async importResume(data: ResumeImportData): Promise<Resume> {
    return this.client.request<Resume>("/api/openapi/resumes/import", {
      method: "POST",
      body: data,
    });
  }

  /**
   * Update a resume using PATCH.
   */
  async update(resumeId: string, data: Record<string, unknown>): Promise<Resume> {
    return this.client.request<Resume>(`/api/openapi/resumes/${resumeId}`, {
      method: "PATCH",
      body: data,
    });
  }

  /**
   * Update a resume using PUT.
   */
  async updatePut(resumeId: string, data: Record<string, unknown>): Promise<Resume> {
    return this.client.request<Resume>(`/api/openapi/resumes/${resumeId}`, {
      method: "PUT",
      body: data,
    });
  }

  /**
   * Delete a resume by ID.
   */
  async delete(resumeId: string): Promise<void> {
    await this.client.request<void>(`/api/openapi/resumes/${resumeId}`, {
      method: "DELETE",
    });
  }

  /**
   * Get the URL to download the PDF for a specific resume.
   */
  getPdfUrl(resumeId: string): string {
    return `${this.client.baseUrl}/api/openapi/resumes/${resumeId}/pdf`;
  }

  /**
   * List all unique tags among the user's resumes.
   */
  async tags(): Promise<string[]> {
    const response = await this.client.request<string[]>("/api/openapi/resumes/tags", {
      method: "GET",
    });
    return Array.from(response);
  }

  /**
   * Set a password for a resume.
   */
  async setPassword(resumeId: string, password: string): Promise<void> {
    await this.client.request<void>(`/api/openapi/resumes/${resumeId}/password`, {
      method: "PUT",
      body: { password },
    });
  }

  /**
   * Remove password security from a resume.
   */
  async removePassword(resumeId: string): Promise<void> {
    await this.client.request<void>(`/api/openapi/resumes/${resumeId}/password`, {
      method: "DELETE",
    });
  }

  /**
   * Verify the password of a protected resume.
   */
  async verifyPassword(resumeId: string, password: string): Promise<boolean> {
    const response = await this.client.request<{ success?: boolean }>(
      `/api/openapi/resumes/${resumeId}/password`,
      {
        method: "POST",
        body: { password },
      }
    );
    return response.success ?? true;
  }

  /**
   * Get a public resume by username and slug.
   */
  async getPublicResume(username: string, slug: string): Promise<Resume> {
    return this.client.request<Resume>(`/api/openapi/resumes/${username}/${slug}`, {
      method: "GET",
    });
  }

  /**
   * Get the latest AI analysis for a resume.
   */
  async getLatestAnalysis(resumeId: string): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(`/api/openapi/resumes/${resumeId}/analysis`, {
      method: "GET",
    });
  }

  /**
   * Get the version history of a resume.
   */
  async getVersions(resumeId: string): Promise<Record<string, unknown>[]> {
    const response = await this.client.request<Record<string, unknown>[]>(
      `/api/openapi/resumes/${resumeId}/versions`,
      {
        method: "GET",
      }
    );
    return Array.from(response);
  }

  /**
   * Duplicate an existing resume.
   */
  async duplicate(
    resumeId: string,
    name: string,
    slug: string,
    tags: string[] = []
  ): Promise<Resume> {
    return this.client.request<Resume>(`/api/openapi/resumes/${resumeId}/duplicate`, {
      method: "POST",
      body: { name, slug, tags },
    });
  }

  /**
   * Lock or unlock a resume.
   */
  async lock(resumeId: string, isLocked: boolean): Promise<void> {
    await this.client.request<void>(`/api/openapi/resumes/${resumeId}/lock`, {
      method: "POST",
      body: { isLocked },
    });
  }

  /**
   * Download the compiled PDF bytes for a resume.
   */
  async downloadPdf(resumeId: string): Promise<Uint8Array> {
    return this.client.requestBinary(`/api/openapi/resumes/${resumeId}/pdf`, {
      method: "GET",
    });
  }

  /**
   * Retrieve view and download statistics for a specific resume.
   */
  async getStatistics(resumeId: string): Promise<ResumeStats> {
    return this.client.request<ResumeStats>(`/api/openapi/resumes/${resumeId}/statistics`, {
      method: "GET",
    });
  }

  /**
   * Retrieve daily interaction statistics for a specific resume.
   */
  async getDailyStatistics(resumeId: string, day = 30): Promise<ResumeStats> {
    return this.client.request<ResumeStats>(
      `/api/openapi/resumes/${resumeId}/statistics/daily?day=${day}`,
      {
        method: "GET",
      }
    );
  }

  // Python SDK method aliases
  import_resume = this.importResume.bind(this);
  update_put = this.updatePut.bind(this);
  get_pdf_url = this.getPdfUrl.bind(this);
  set_password = this.setPassword.bind(this);
  remove_password = this.removePassword.bind(this);
  verify_password = this.verifyPassword.bind(this);
  get_public_resume = this.getPublicResume.bind(this);
  get_latest_analysis = this.getLatestAnalysis.bind(this);
  get_versions = this.getVersions.bind(this);
  download_pdf = this.downloadPdf.bind(this);
  get_statistics = this.getStatistics.bind(this);
  get_daily_statistics = this.getDailyStatistics.bind(this);
}
