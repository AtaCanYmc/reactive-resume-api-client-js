// src/errors.ts
var ReactiveResumeError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ReactiveResumeError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var ValidationError = class extends ReactiveResumeError {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
};
var ReactiveResumeAPIError = class extends ReactiveResumeError {
  statusCode;
  responseBody;
  constructor(message, statusCode, responseBody) {
    super(message);
    this.name = "ReactiveResumeAPIError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
  toString() {
    const codeStr = this.statusCode ? ` [Status ${this.statusCode}]` : "";
    return `${this.message}${codeStr}`;
  }
};
var AuthenticationError = class extends ReactiveResumeAPIError {
  constructor(message, statusCode = 401, responseBody) {
    super(message, statusCode, responseBody);
    this.name = "AuthenticationError";
  }
};
var NotFoundError = class extends ReactiveResumeAPIError {
  constructor(message, statusCode = 404, responseBody) {
    super(message, statusCode, responseBody);
    this.name = "NotFoundError";
  }
};

// src/api/base.ts
var BaseAPI = class {
  client;
  constructor(client) {
    this.client = client;
  }
};

// src/api/auth.ts
var AuthAPI = class extends BaseAPI {
  /**
   * List all configured authentication providers.
   */
  async listProviders() {
    const response = await this.client.request("/api/openapi/auth/providers", {
      method: "GET"
    });
    if (Array.isArray(response)) {
      return response.map(String);
    }
    if (response && typeof response === "object") {
      return Object.keys(response);
    }
    return [];
  }
  /**
   * Export user account data.
   */
  async exportAccount() {
    return this.client.request("/api/openapi/auth/account/export", {
      method: "GET"
    });
  }
  /**
   * Delete user account.
   */
  async deleteAccount() {
    await this.client.request("/api/openapi/auth/account", {
      method: "DELETE"
    });
  }
  // Python SDK method aliases
  list_providers = this.listProviders.bind(this);
  export_account = this.exportAccount.bind(this);
  delete_account = this.deleteAccount.bind(this);
};

// src/api/resumes.ts
var ResumesAPI = class extends BaseAPI {
  /**
   * List all resumes for the authenticated user.
   */
  async list() {
    const response = await this.client.request("/api/openapi/resumes", {
      method: "GET"
    });
    if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray(response) ? response : [];
  }
  /**
   * Retrieve a specific resume by ID.
   */
  async get(resumeId) {
    return this.client.request(`/api/openapi/resumes/${resumeId}`, {
      method: "GET"
    });
  }
  /**
   * Create a new resume.
   */
  async create(data) {
    return this.client.request("/api/openapi/resumes", {
      method: "POST",
      body: data
    });
  }
  /**
   * Import a resume.
   */
  async importResume(data) {
    return this.client.request("/api/openapi/resumes/import", {
      method: "POST",
      body: data
    });
  }
  /**
   * Update a resume using PATCH.
   */
  async update(resumeId, data) {
    return this.client.request(`/api/openapi/resumes/${resumeId}`, {
      method: "PATCH",
      body: data
    });
  }
  /**
   * Update a resume using PUT.
   */
  async updatePut(resumeId, data) {
    return this.client.request(`/api/openapi/resumes/${resumeId}`, {
      method: "PUT",
      body: data
    });
  }
  /**
   * Delete a resume by ID.
   */
  async delete(resumeId) {
    await this.client.request(`/api/openapi/resumes/${resumeId}`, {
      method: "DELETE"
    });
  }
  /**
   * Get the URL to download the PDF for a specific resume.
   */
  getPdfUrl(resumeId) {
    return `${this.client.baseUrl}/api/openapi/resumes/${resumeId}/pdf`;
  }
  /**
   * List all unique tags among the user's resumes.
   */
  async tags() {
    const response = await this.client.request("/api/openapi/resumes/tags", {
      method: "GET"
    });
    return Array.from(response);
  }
  /**
   * Set a password for a resume.
   */
  async setPassword(resumeId, password) {
    await this.client.request(`/api/openapi/resumes/${resumeId}/password`, {
      method: "PUT",
      body: { password }
    });
  }
  /**
   * Remove password security from a resume.
   */
  async removePassword(resumeId) {
    await this.client.request(`/api/openapi/resumes/${resumeId}/password`, {
      method: "DELETE"
    });
  }
  /**
   * Verify the password of a protected resume.
   */
  async verifyPassword(resumeId, password) {
    const response = await this.client.request(
      `/api/openapi/resumes/${resumeId}/password`,
      {
        method: "POST",
        body: { password }
      }
    );
    return response.success ?? true;
  }
  /**
   * Get a public resume by username and slug.
   */
  async getPublicResume(username, slug) {
    return this.client.request(`/api/openapi/resumes/${username}/${slug}`, {
      method: "GET"
    });
  }
  /**
   * Get the latest AI analysis for a resume.
   */
  async getLatestAnalysis(resumeId) {
    return this.client.request(`/api/openapi/resumes/${resumeId}/analysis`, {
      method: "GET"
    });
  }
  /**
   * Get the version history of a resume.
   */
  async getVersions(resumeId) {
    const response = await this.client.request(
      `/api/openapi/resumes/${resumeId}/versions`,
      {
        method: "GET"
      }
    );
    return Array.from(response);
  }
  /**
   * Duplicate an existing resume.
   */
  async duplicate(resumeId, name, slug, tags = []) {
    return this.client.request(`/api/openapi/resumes/${resumeId}/duplicate`, {
      method: "POST",
      body: { name, slug, tags }
    });
  }
  /**
   * Lock or unlock a resume.
   */
  async lock(resumeId, isLocked) {
    await this.client.request(`/api/openapi/resumes/${resumeId}/lock`, {
      method: "POST",
      body: { isLocked }
    });
  }
  /**
   * Download the compiled PDF bytes for a resume.
   */
  async downloadPdf(resumeId) {
    return this.client.requestBinary(`/api/openapi/resumes/${resumeId}/pdf`, {
      method: "GET"
    });
  }
  /**
   * Retrieve view and download statistics for a specific resume.
   */
  async getStatistics(resumeId) {
    return this.client.request(`/api/openapi/resumes/${resumeId}/statistics`, {
      method: "GET"
    });
  }
  /**
   * Retrieve daily interaction statistics for a specific resume.
   */
  async getDailyStatistics(resumeId, day = 30) {
    return this.client.request(
      `/api/openapi/resumes/${resumeId}/statistics/daily?day=${day}`,
      {
        method: "GET"
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
};

// src/api/statistics.ts
var StatisticsAPI = class extends BaseAPI {
  /**
   * Retrieve total number of users.
   */
  async getUsersCount() {
    return this.client.request("/api/openapi/statistics/users", {
      method: "GET"
    });
  }
  /**
   * Retrieve GitHub star count.
   */
  async getGithubStars() {
    return this.client.request("/api/openapi/statistics/github/stars", {
      method: "GET"
    });
  }
  /**
   * Retrieve total number of resumes.
   */
  async getResumesCount() {
    return this.client.request("/api/openapi/statistics/resumes", {
      method: "GET"
    });
  }
  // Python SDK method aliases
  get_users_count = this.getUsersCount.bind(this);
  get_github_stars = this.getGithubStars.bind(this);
  get_resumes_count = this.getResumesCount.bind(this);
};

// src/api/agent.ts
var AgentAPI = class extends BaseAPI {
  /**
   * List all active agent threads.
   */
  async listThreads() {
    const response = await this.client.request("/api/openapi/agent/threads", {
      method: "GET"
    });
    return Array.from(response);
  }
  /**
   * Get details of a specific agent thread by ID.
   */
  async getThread(threadId) {
    return this.client.request(`/api/openapi/agent/threads/${threadId}`, {
      method: "GET"
    });
  }
  /**
   * Delete an agent thread by ID.
   */
  async deleteThread(threadId) {
    await this.client.request(`/api/openapi/agent/threads/${threadId}`, {
      method: "DELETE"
    });
  }
  /**
   * Create a new agent thread.
   */
  async createThread(options) {
    const payload = {};
    if (options?.aiProviderId !== void 0) {
      payload.aiProviderId = options.aiProviderId;
    }
    if (options?.sourceResumeId !== void 0) {
      payload.sourceResumeId = options.sourceResumeId;
    }
    return this.client.request("/api/openapi/agent/threads", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Get or create an in-resume agent thread.
   */
  async getOrCreateThreadForResume(options) {
    const payload = {};
    if (options?.aiProviderId !== void 0) {
      payload.aiProviderId = options.aiProviderId;
    }
    if (options?.sourceResumeId !== void 0) {
      payload.sourceResumeId = options.sourceResumeId;
    }
    return this.client.request("/api/openapi/agent/threads/for-resume", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Send an agent message.
   */
  async sendMessage(threadId, message, attachmentIds) {
    const payload = {
      threadId,
      message
    };
    if (attachmentIds !== void 0) {
      payload.attachmentIds = attachmentIds;
    }
    return this.client.request("/api/openapi/agent/messages/send", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Archive an agent thread.
   */
  async archiveThread(threadId, options) {
    const payload = {};
    if (options?.aiProviderId !== void 0) {
      payload.aiProviderId = options.aiProviderId;
    }
    if (options?.sourceResumeId !== void 0) {
      payload.sourceResumeId = options.sourceResumeId;
    }
    return this.client.request(
      `/api/openapi/agent/threads/${threadId}/archive`,
      {
        method: "POST",
        body: payload
      }
    );
  }
  /**
   * Stop active agent run.
   */
  async stopRun(threadId, partialMessage) {
    const payload = {
      threadId
    };
    if (partialMessage !== void 0) {
      payload.partialMessage = partialMessage;
    }
    return this.client.request("/api/openapi/agent/messages/stop", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Resume agent message stream.
   */
  async resumeMessageStream(threadId) {
    return this.client.request(
      `/api/openapi/agent/messages/resume?threadId=${encodeURIComponent(threadId)}`,
      {
        method: "GET"
      }
    );
  }
  async createAttachment(threadIdOrOptions, filename, mediaType, data) {
    let payload;
    if (typeof threadIdOrOptions === "object") {
      payload = threadIdOrOptions;
    } else {
      payload = {
        threadId: threadIdOrOptions,
        filename,
        mediaType,
        data
      };
    }
    return this.client.request("/api/openapi/agent/attachments", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Delete an agent attachment.
   */
  async deleteAttachment(attachmentId) {
    await this.client.request(`/api/openapi/agent/attachments/${attachmentId}`, {
      method: "DELETE"
    });
  }
  /**
   * Restore agent action snapshot.
   */
  async revertAction(actionId) {
    return this.client.request(
      `/api/openapi/agent/actions/${actionId}/revert`,
      {
        method: "POST"
      }
    );
  }
  // Python SDK method aliases
  list_threads = this.listThreads.bind(this);
  get_thread = this.getThread.bind(this);
  delete_thread = this.deleteThread.bind(this);
  create_thread = this.createThread.bind(this);
  get_or_create_thread_for_resume = this.getOrCreateThreadForResume.bind(this);
  send_message = this.sendMessage.bind(this);
  archive_thread = this.archiveThread.bind(this);
  stop_run = this.stopRun.bind(this);
  resume_message_stream = this.resumeMessageStream.bind(this);
  create_attachment = this.createAttachment.bind(this);
  delete_attachment = this.deleteAttachment.bind(this);
  revert_action = this.revertAction.bind(this);
};

// src/api/ai-providers.ts
var AiProvidersAPI = class extends BaseAPI {
  /**
   * List all configured AI Providers.
   */
  async list() {
    const response = await this.client.request(
      "/api/openapi/ai-providers",
      {
        method: "GET"
      }
    );
    if (Array.isArray(response)) {
      return response;
    }
    return response ? [response] : [];
  }
  async create(labelOrOptions, model, apiKey, baseURL = "") {
    let payload;
    if (typeof labelOrOptions === "object") {
      payload = {
        label: labelOrOptions.label,
        model: labelOrOptions.model,
        apiKey: labelOrOptions.apiKey,
        baseURL: labelOrOptions.baseURL ?? ""
      };
    } else {
      payload = {
        label: labelOrOptions,
        model,
        apiKey,
        baseURL
      };
    }
    return this.client.request("/api/openapi/ai-providers", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Delete an AI provider configuration.
   */
  async delete(providerId) {
    await this.client.request(`/api/openapi/ai-providers/${providerId}`, {
      method: "DELETE"
    });
  }
  /**
   * Test the connection of a saved AI provider.
   */
  async test(providerId) {
    const response = await this.client.request(
      `/api/openapi/ai-providers/${providerId}/test`,
      {
        method: "POST"
      }
    );
    return response.success ?? true;
  }
  /**
   * Update an AI provider configuration.
   */
  async update(providerId, data) {
    return this.client.request(`/api/openapi/ai-providers/${providerId}`, {
      method: "PATCH",
      body: data
    });
  }
};

// src/api/flags.ts
var FlagsAPI = class extends BaseAPI {
  /**
   * List all available feature flags.
   */
  async list() {
    return this.client.request("/api/openapi/flags", {
      method: "GET"
    });
  }
};

// src/api/ai.ts
var AIAPI = class extends BaseAPI {
  /**
   * Parse a PDF file into resume data.
   *
   * @param fileName - Name of the file (e.g., "resume.pdf").
   * @param fileData - Base64 or string data representation of the file.
   * @param providerId - The ID of the configured AI provider.
   */
  async parsePdf(fileName, fileData, providerId) {
    const payload = {
      file: { name: fileName, data: fileData },
      aiProviderId: providerId
    };
    return this.client.request("/api/openapi/ai/parse-pdf", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Parse a DOCX file into resume data.
   *
   * @param fileName - Name of the file (e.g., "resume.docx").
   * @param fileData - Base64 or string data representation of the file.
   * @param providerId - The ID of the configured AI provider.
   */
  async parseDocx(fileName, fileData, providerId) {
    const payload = {
      file: { name: fileName, data: fileData },
      aiProviderId: providerId
    };
    return this.client.request("/api/openapi/ai/parse-docx", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Chat with AI to modify resume.
   */
  async chat(payload) {
    return this.client.request("/api/openapi/ai/chat", {
      method: "POST",
      body: payload
    });
  }
  /**
   * Analyze a resume and persist the latest analysis.
   *
   * @param resumeId - The ID of the resume to analyze.
   * @param providerId - The ID of the configured AI provider.
   */
  async analyzeResume(resumeId, providerId) {
    const payload = {
      resumeId,
      aiProviderId: providerId
    };
    return this.client.request("/api/openapi/ai/analyze-resume", {
      method: "POST",
      body: payload
    });
  }
  // Python SDK method aliases
  parse_pdf = this.parsePdf.bind(this);
  parse_docx = this.parseDocx.bind(this);
  analyze_resume = this.analyzeResume.bind(this);
};

// src/api/applications.ts
var ApplicationsAPI = class extends BaseAPI {
  /**
   * List all job applications.
   */
  async list() {
    const response = await this.client.request("/api/openapi/applications", {
      method: "GET"
    });
    if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray(response) ? response : [];
  }
  /**
   * Retrieve a specific job application by ID.
   */
  async get(appId) {
    return this.client.request(`/api/openapi/applications/${appId}`, {
      method: "GET"
    });
  }
  /**
   * Log/create a new job application.
   */
  async create(data) {
    return this.client.request("/api/openapi/applications", {
      method: "POST",
      body: data
    });
  }
  /**
   * Delete a job application by ID.
   */
  async delete(appId) {
    await this.client.request(`/api/openapi/applications/${appId}`, {
      method: "DELETE"
    });
  }
  /**
   * List all application tags.
   */
  async listTags() {
    const response = await this.client.request("/api/openapi/applications/tags", {
      method: "GET"
    });
    return Array.from(response);
  }
  /**
   * Get application pipeline statistics.
   */
  async getPipelineStats() {
    return this.client.request("/api/openapi/applications/stats", {
      method: "GET"
    });
  }
  /**
   * Bulk import job applications.
   */
  async bulkImport(items) {
    return this.client.request("/api/openapi/applications/import", {
      method: "POST",
      body: { items }
    });
  }
  // Python SDK method aliases
  list_tags = this.listTags.bind(this);
  get_pipeline_stats = this.getPipelineStats.bind(this);
  bulk_import = this.bulkImport.bind(this);
};

// src/client.ts
var RxResumeClient = class {
  baseUrl;
  timeout;
  _fetch;
  _headers;
  // Sub-modules
  auth;
  resumes;
  statistics;
  agent;
  aiProviders;
  ai_providers;
  flags;
  ai;
  applications;
  constructor(options) {
    if (!options || !options.baseUrl) {
      throw new Error("baseUrl is required to initialize RxResumeClient.");
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeout = options.timeout ?? 3e4;
    this._fetch = options.fetch ?? globalThis.fetch;
    const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
    this._headers = {
      Accept: "application/json",
      ...isBrowser ? {} : { "User-Agent": "reactive-resume-api-client-js/1.0.1" },
      ...options.headers || {}
    };
    if (options.apiKey) {
      if (options.apiKey.startsWith("Bearer ") || options.apiKey.startsWith("bearer ")) {
        this._headers["Authorization"] = options.apiKey;
      } else {
        this._headers["x-api-key"] = options.apiKey;
      }
    } else if (options.token) {
      this._headers["Authorization"] = `Bearer ${options.token}`;
    }
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
  get headers() {
    return this._headers;
  }
  /**
   * Update client headers with a new Bearer token.
   */
  setToken(token) {
    this._headers["Authorization"] = `Bearer ${token}`;
    delete this._headers["x-api-key"];
  }
  /**
   * Update client headers with a new API key.
   */
  setApiKey(apiKey) {
    if (apiKey.startsWith("Bearer ") || apiKey.startsWith("bearer ")) {
      this._headers["Authorization"] = apiKey;
      delete this._headers["x-api-key"];
    } else {
      this._headers["x-api-key"] = apiKey;
      delete this._headers["Authorization"];
    }
  }
  // Python SDK method aliases
  set_token = this.setToken.bind(this);
  set_api_key = this.setApiKey.bind(this);
  /**
   * Execute an HTTP request with automatic error mapping.
   */
  async request(path, options = {}) {
    return this._executeRequest(path, options, false);
  }
  /**
   * Execute an HTTP request and return raw bytes (Uint8Array).
   */
  async requestBinary(path, options = {}) {
    return this._executeRequest(path, options, true);
  }
  async _executeRequest(path, options, asBinary) {
    const url = new URL(
      path.startsWith("http://") || path.startsWith("https://") ? path : `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`
    );
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== void 0 && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }
    const headers = {
      ...this._headers,
      ...options.headers || {}
    };
    let body = void 0;
    if (options.body !== void 0 && options.body !== null) {
      if (typeof options.body === "string" || options.body instanceof ArrayBuffer || options.body instanceof Uint8Array || typeof FormData !== "undefined" && options.body instanceof FormData || typeof Blob !== "undefined" && options.body instanceof Blob) {
        body = options.body;
      } else {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        body = JSON.stringify(options.body);
      }
    }
    const timeoutMs = options.timeout ?? this.timeout;
    let signal;
    let abortController;
    let timeoutId;
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      signal = AbortSignal.timeout(timeoutMs);
    } else if (typeof AbortController !== "undefined") {
      abortController = new AbortController();
      signal = abortController.signal;
      timeoutId = setTimeout(() => abortController?.abort(), timeoutMs);
    }
    let response;
    try {
      response = await this._fetch(url.toString(), {
        method: options.method || "GET",
        headers,
        body,
        signal
      });
    } catch (error) {
      const err = error;
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
      return void 0;
    }
    if (asBinary) {
      const buffer2 = await response.arrayBuffer();
      return new Uint8Array(buffer2);
    }
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
  async _handleErrorResponse(response) {
    const statusCode = response.status;
    let errorData = null;
    let text = "";
    try {
      text = await response.text();
      errorData = JSON.parse(text);
    } catch {
      errorData = text;
    }
    let message = "";
    if (errorData && typeof errorData === "object") {
      const obj = errorData;
      message = obj.message || obj.error || JSON.stringify(obj);
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
};
var ReactiveResumeClient = RxResumeClient;

export { AIAPI, AgentAPI, AiProvidersAPI, ApplicationsAPI, AuthAPI, AuthenticationError, FlagsAPI, NotFoundError, ReactiveResumeAPIError, ReactiveResumeClient, ReactiveResumeError, ResumesAPI, RxResumeClient, StatisticsAPI, ValidationError };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map