import { BaseAPI } from "./base.js";
import type { Application, ApplicationCreate } from "../types/index.js";

/**
 * Job applications tracker endpoints for Reactive Resume v4 API.
 */
export class ApplicationsAPI extends BaseAPI {
  /**
   * List all job applications.
   */
  async list(): Promise<Application[]> {
    const response = await this.client.request<
      Application[] | { data: Application[] }
    >("/api/openapi/applications", {
      method: "GET",
    });
    if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray(response) ? response : [];
  }

  /**
   * Retrieve a specific job application by ID.
   */
  async get(appId: string): Promise<Application> {
    return this.client.request<Application>(`/api/openapi/applications/${appId}`, {
      method: "GET",
    });
  }

  /**
   * Log/create a new job application.
   */
  async create(data: ApplicationCreate): Promise<Application> {
    return this.client.request<Application>("/api/openapi/applications", {
      method: "POST",
      body: data,
    });
  }

  /**
   * Delete a job application by ID.
   */
  async delete(appId: string): Promise<void> {
    await this.client.request<void>(`/api/openapi/applications/${appId}`, {
      method: "DELETE",
    });
  }

  /**
   * List all application tags.
   */
  async listTags(): Promise<string[]> {
    const response = await this.client.request<string[]>("/api/openapi/applications/tags", {
      method: "GET",
    });
    return Array.from(response);
  }

  /**
   * Get application pipeline statistics.
   */
  async getPipelineStats(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>("/api/openapi/applications/stats", {
      method: "GET",
    });
  }

  /**
   * Bulk import job applications.
   */
  async bulkImport(items: Record<string, unknown>[]): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>("/api/openapi/applications/import", {
      method: "POST",
      body: { items },
    });
  }

  // Python SDK method aliases
  list_tags = this.listTags.bind(this);
  get_pipeline_stats = this.getPipelineStats.bind(this);
  bulk_import = this.bulkImport.bind(this);
}
