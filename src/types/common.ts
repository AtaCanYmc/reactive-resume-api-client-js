/**
 * Configuration options and common interfaces for Reactive Resume Client.
 */

export interface RxResumeClientOptions {
  /**
   * The base URL of the Reactive Resume instance (e.g., https://rxresu.me).
   */
  baseUrl: string;

  /**
   * API Key for x-api-key header authentication.
   */
  apiKey?: string;

  /**
   * Bearer Token for Authorization header authentication.
   */
  token?: string;

  /**
   * Request timeout in milliseconds (default: 30000ms / 30s).
   */
  timeout?: number;

  /**
   * Custom fetch implementation (optional, defaults to globalThis.fetch).
   */
  fetch?: typeof fetch;

  /**
   * Additional custom headers to include with every request.
   */
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}
