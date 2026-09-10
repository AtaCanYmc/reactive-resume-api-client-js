import { BaseAPI } from "./base.js";

/**
 * Feature Flags endpoints for Reactive Resume v4 API.
 */
export class FlagsAPI extends BaseAPI {
  /**
   * List all available feature flags.
   */
  async list(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>("/api/openapi/flags", {
      method: "GET",
    });
  }
}
