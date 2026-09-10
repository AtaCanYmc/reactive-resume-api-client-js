import { BaseAPI } from "./base.js";

/**
 * Global Statistics endpoints for Reactive Resume v4 API.
 */
export class StatisticsAPI extends BaseAPI {
  /**
   * Retrieve total number of users.
   */
  async getUsersCount(): Promise<unknown> {
    return this.client.request<unknown>("/api/openapi/statistics/users", {
      method: "GET",
    });
  }

  /**
   * Retrieve GitHub star count.
   */
  async getGithubStars(): Promise<unknown> {
    return this.client.request<unknown>("/api/openapi/statistics/github/stars", {
      method: "GET",
    });
  }

  /**
   * Retrieve total number of resumes.
   */
  async getResumesCount(): Promise<unknown> {
    return this.client.request<unknown>("/api/openapi/statistics/resumes", {
      method: "GET",
    });
  }

  // Python SDK method aliases
  get_users_count = this.getUsersCount.bind(this);
  get_github_stars = this.getGithubStars.bind(this);
  get_resumes_count = this.getResumesCount.bind(this);
}
