import {
  AuthenticationError,
  NotFoundError,
  ReactiveResumeAPIError,
  ReactiveResumeError,
} from "./errors.js";
import { AuthAPI } from "./api/auth.js";
import { ResumesAPI } from "./api/resumes.js";
import { StatisticsAPI } from "./api/statistics.js";
import { AgentAPI } from "./api/agent.js";
import { AiProvidersAPI } from "./api/ai-providers.js";
import { FlagsAPI } from "./api/flags.js";
import { AIAPI } from "./api/ai.js";
import { ApplicationsAPI } from "./api/applications.js";
import type { RequestOptions, RxResumeClientOptions } from "./types/common.js";

/**
 * Modern, type-safe API Client for Reactive Resume v4.
 *
 * Built with native fetch, supporting Node 20+, Bun, Deno, and modern browsers with zero runtime dependencies.
 */
export class RxResumeClient {
  readonly baseUrl: string;
  readonly timeout: number;
  private readonly _fetch: typeof fetch;
  private readonly _headers: Record<string, string>;

  // Sub-modules
  readonly auth: AuthAPI;
  readonly resumes: ResumesAPI;
  readonly statistics: StatisticsAPI;
  readonly agent: AgentAPI;
  readonly aiProviders: AiProvidersAPI;
  readonly ai_providers: AiProvidersAPI;
  readonly flags: FlagsAPI;
  readonly ai: AIAPI;
  readonly applications: ApplicationsAPI;

  constructor(options: RxResumeClientOptions) {
    if (!options || !options.baseUrl) {
      throw new Error("baseUrl is required to initialize RxResumeClient.");
    }

    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeout = options.timeout ?? 30000;
    this._fetch = options.fetch ?? globalThis.fetch;

    this._headers = {
      Accept: "application/json",
      "User-Agent": "rxresume-js/0.1.0",
      ...(options.headers || {}),
    };

    if (options.apiKey) {
      this._headers["x-api-key"] = options.apiKey;
    } else if (options.token) {
      this._headers["Authorization"] = `Bearer ${options.token}`;
    }

    // Initialize API modules
    this.auth = new AuthAPI(this);
    this.resumes = new ResumesAPI(this);
    this.statistics = new StatisticsAPI(this);
    this.agent = new AgentAPI(this);
    this.aiProviders = new AiProvidersAPI(this);
    this.ai_providers = this.aiProviders;
    this.flags = new FlagsAPI(this);
    this.ai = new AIAPI(this);
    this.applications = new ApplicationsAPI(this);
  }

  /**
   * Access the current active headers.
   */
  get headers(): Readonly<Record<string, string>> {
    return this._headers;
  }

  /**
   * Update client headers with a new Bearer token.
   */
  setToken(token: string): void {
    this._headers["Authorization"] = `Bearer ${token}`;
    delete this._headers["x-api-key"];
  }

  /**
   * Update client headers with a new API key.
   */
  setApiKey(apiKey: string): void {
    this._headers["x-api-key"] = apiKey;
    delete this._headers["Authorization"];
  }

  // Python SDK method aliases
  set_token = this.setToken.bind(this);
  set_api_key = this.setApiKey.bind(this);

  /**
   * Execute an HTTP request with automatic error mapping.
   */
  async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this._executeRequest<T>(path, options, false);
  }

  /**
   * Execute an HTTP request and return raw bytes (Uint8Array).
   */
  async requestBinary(path: string, options: RequestOptions = {}): Promise<Uint8Array> {
    return this._executeRequest<Uint8Array>(path, options, true);
  }

  private async _executeRequest<T>(
    path: string,
    options: RequestOptions,
    asBinary: boolean
  ): Promise<T> {
    const url = new URL(
      path.startsWith("http://") || path.startsWith("https://")
        ? path
        : `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`
    );

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      ...this._headers,
      ...(options.headers || {}),
    };

    let body: BodyInit | undefined = undefined;
    if (options.body !== undefined && options.body !== null) {
      if (
        typeof options.body === "string" ||
        options.body instanceof ArrayBuffer ||
        options.body instanceof Uint8Array ||
        (typeof FormData !== "undefined" && options.body instanceof FormData) ||
        (typeof Blob !== "undefined" && options.body instanceof Blob)
      ) {
        body = options.body as BodyInit;
      } else {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        body = JSON.stringify(options.body);
      }
    }

    const timeoutMs = options.timeout ?? this.timeout;
    let signal: AbortSignal | undefined;
    let abortController: AbortController | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      signal = AbortSignal.timeout(timeoutMs);
    } else if (typeof AbortController !== "undefined") {
      abortController = new AbortController();
      signal = abortController.signal;
      timeoutId = setTimeout(() => abortController?.abort(), timeoutMs);
    }

    let response: Response;
    try {
      response = await this._fetch(url.toString(), {
        method: options.method || "GET",
        headers,
        body,
        signal,
      });
    } catch (error: unknown) {
      const err = error as Error;
      throw new ReactiveResumeError(
        `Network or connection error occurred: ${err?.message || String(error)}`
      );
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    if (!response.ok) {
      await this._handleErrorResponse(response);
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as unknown as T;
    }

    if (asBinary) {
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer) as unknown as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer) as unknown as T;
  }

  private async _handleErrorResponse(response: Response): Promise<never> {
    const statusCode = response.status;
    let errorData: unknown = null;
    let text = "";

    try {
      text = await response.text();
      errorData = JSON.parse(text);
    } catch {
      errorData = text;
    }

    let message = "";
    if (errorData && typeof errorData === "object") {
      const obj = errorData as Record<string, unknown>;
      message = (obj.message || obj.error || JSON.stringify(obj)) as string;
    } else {
      message = String(errorData || response.statusText);
    }

    if (statusCode === 401 || statusCode === 403) {
      throw new AuthenticationError(
        `Authentication failed: ${message}`,
        statusCode,
        errorData
      );
    } else if (statusCode === 404) {
      throw new NotFoundError(
        `Resource not found: ${message}`,
        statusCode,
        errorData
      );
    } else {
      throw new ReactiveResumeAPIError(
        `API error: ${message}`,
        statusCode,
        errorData
      );
    }
  }
}

/**
 * Alias for RxResumeClient
 */
export const ReactiveResumeClient = RxResumeClient;
