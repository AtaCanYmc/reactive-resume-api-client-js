import { BaseAPI } from "./base.js";

/**
 * Authentication and account endpoints for Reactive Resume v4 API.
 */
export class AuthAPI extends BaseAPI {
  /**
   * List all configured authentication providers.
   */
  async listProviders(): Promise<string[]> {
    const response = await this.client.request<string[]>("/api/openapi/auth/providers", {
      method: "GET",
    });
    return Array.from(response);
  }

  /**
   * Export user account data.
   */
  async exportAccount(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>("/api/openapi/auth/account/export", {
      method: "GET",
    });
  }

  /**
   * Delete user account.
   */
  async deleteAccount(): Promise<void> {
    await this.client.request<void>("/api/openapi/auth/account", {
      method: "DELETE",
    });
  }

  // Python SDK method aliases
  list_providers = this.listProviders.bind(this);
  export_account = this.exportAccount.bind(this);
  delete_account = this.deleteAccount.bind(this);
}
