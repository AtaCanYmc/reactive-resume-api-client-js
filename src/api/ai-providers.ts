import { BaseAPI } from "./base.js";
import type {
  AiProvider,
  CreateAiProviderOptions,
  UpdateAiProviderOptions,
} from "../types/index.js";

/**
 * AI Providers management endpoints for Reactive Resume v4 API.
 */
export class AiProvidersAPI extends BaseAPI {
  /**
   * List all configured AI Providers.
   */
  async list(): Promise<AiProvider[]> {
    const response = await this.client.request<AiProvider[] | AiProvider>(
      "/api/openapi/ai-providers",
      {
        method: "GET",
      }
    );
    if (Array.isArray(response)) {
      return response;
    }
    return response ? [response] : [];
  }

  /**
   * Create a new AI provider configuration.
   */
  async create(options: CreateAiProviderOptions): Promise<AiProvider>;
  async create(
    label: string,
    model: string,
    apiKey: string,
    baseURL?: string
  ): Promise<AiProvider>;
  async create(
    labelOrOptions: string | CreateAiProviderOptions,
    model?: string,
    apiKey?: string,
    baseURL = ""
  ): Promise<AiProvider> {
    let payload: CreateAiProviderOptions;
    if (typeof labelOrOptions === "object") {
      payload = {
        label: labelOrOptions.label,
        model: labelOrOptions.model,
        apiKey: labelOrOptions.apiKey,
        baseURL: labelOrOptions.baseURL ?? "",
      };
    } else {
      payload = {
        label: labelOrOptions,
        model: model!,
        apiKey: apiKey!,
        baseURL,
      };
    }

    return this.client.request<AiProvider>("/api/openapi/ai-providers", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Delete an AI provider configuration.
   */
  async delete(providerId: string): Promise<void> {
    await this.client.request<void>(`/api/openapi/ai-providers/${providerId}`, {
      method: "DELETE",
    });
  }

  /**
   * Test the connection of a saved AI provider.
   */
  async test(providerId: string): Promise<boolean> {
    const response = await this.client.request<{ success?: boolean }>(
      `/api/openapi/ai-providers/${providerId}/test`,
      {
        method: "POST",
      }
    );
    return response.success ?? true;
  }

  /**
   * Update an AI provider configuration.
   */
  async update(
    providerId: string,
    data: UpdateAiProviderOptions | Record<string, unknown>
  ): Promise<AiProvider> {
    return this.client.request<AiProvider>(`/api/openapi/ai-providers/${providerId}`, {
      method: "PATCH",
      body: data,
    });
  }
}
