import { BaseAPI } from "./base.js";
import type {
  AgentThread,
  ArchiveThreadOptions,
  CreateAttachmentOptions,
  CreateThreadOptions,
} from "../types/index.js";

/**
 * AI Agent operations and thread management for Reactive Resume v4 API.
 */
export class AgentAPI extends BaseAPI {
  /**
   * List all active agent threads.
   */
  async listThreads(): Promise<AgentThread[]> {
    const response = await this.client.request<AgentThread[]>("/api/openapi/agent/threads", {
      method: "GET",
    });
    return Array.from(response);
  }

  /**
   * Get details of a specific agent thread by ID.
   */
  async getThread(threadId: string): Promise<AgentThread> {
    return this.client.request<AgentThread>(`/api/openapi/agent/threads/${threadId}`, {
      method: "GET",
    });
  }

  /**
   * Delete an agent thread by ID.
   */
  async deleteThread(threadId: string): Promise<void> {
    await this.client.request<void>(`/api/openapi/agent/threads/${threadId}`, {
      method: "DELETE",
    });
  }

  /**
   * Create a new agent thread.
   */
  async createThread(options?: CreateThreadOptions): Promise<AgentThread> {
    const payload: Record<string, unknown> = {};
    if (options?.aiProviderId !== undefined) {
      payload.aiProviderId = options.aiProviderId;
    }
    if (options?.sourceResumeId !== undefined) {
      payload.sourceResumeId = options.sourceResumeId;
    }
    return this.client.request<AgentThread>("/api/openapi/agent/threads", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Get or create an in-resume agent thread.
   */
  async getOrCreateThreadForResume(options?: CreateThreadOptions): Promise<AgentThread> {
    const payload: Record<string, unknown> = {};
    if (options?.aiProviderId !== undefined) {
      payload.aiProviderId = options.aiProviderId;
    }
    if (options?.sourceResumeId !== undefined) {
      payload.sourceResumeId = options.sourceResumeId;
    }
    return this.client.request<AgentThread>("/api/openapi/agent/threads/for-resume", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Send an agent message.
   */
  async sendMessage(
    threadId: string,
    message: unknown,
    attachmentIds?: string[]
  ): Promise<Record<string, unknown>> {
    const payload: Record<string, unknown> = {
      threadId,
      message,
    };
    if (attachmentIds !== undefined) {
      payload.attachmentIds = attachmentIds;
    }
    return this.client.request<Record<string, unknown>>("/api/openapi/agent/messages/send", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Archive an agent thread.
   */
  async archiveThread(
    threadId: string,
    options?: ArchiveThreadOptions
  ): Promise<Record<string, unknown>> {
    const payload: Record<string, unknown> = {};
    if (options?.aiProviderId !== undefined) {
      payload.aiProviderId = options.aiProviderId;
    }
    if (options?.sourceResumeId !== undefined) {
      payload.sourceResumeId = options.sourceResumeId;
    }
    return this.client.request<Record<string, unknown>>(
      `/api/openapi/agent/threads/${threadId}/archive`,
      {
        method: "POST",
        body: payload,
      }
    );
  }

  /**
   * Stop active agent run.
   */
  async stopRun(
    threadId: string,
    partialMessage?: unknown
  ): Promise<Record<string, unknown>> {
    const payload: Record<string, unknown> = {
      threadId,
    };
    if (partialMessage !== undefined) {
      payload.partialMessage = partialMessage;
    }
    return this.client.request<Record<string, unknown>>("/api/openapi/agent/messages/stop", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Resume agent message stream.
   */
  async resumeMessageStream(threadId: string): Promise<unknown> {
    return this.client.request<unknown>(
      `/api/openapi/agent/messages/resume?threadId=${encodeURIComponent(threadId)}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Create an agent attachment.
   */
  async createAttachment(options: CreateAttachmentOptions): Promise<Record<string, unknown>>;
  async createAttachment(
    threadId: string,
    filename: string,
    mediaType: string,
    data: string
  ): Promise<Record<string, unknown>>;
  async createAttachment(
    threadIdOrOptions: string | CreateAttachmentOptions,
    filename?: string,
    mediaType?: string,
    data?: string
  ): Promise<Record<string, unknown>> {
    let payload: CreateAttachmentOptions;
    if (typeof threadIdOrOptions === "object") {
      payload = threadIdOrOptions;
    } else {
      payload = {
        threadId: threadIdOrOptions,
        filename: filename!,
        mediaType: mediaType!,
        data: data!,
      };
    }
    return this.client.request<Record<string, unknown>>("/api/openapi/agent/attachments", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Delete an agent attachment.
   */
  async deleteAttachment(attachmentId: string): Promise<void> {
    await this.client.request<void>(`/api/openapi/agent/attachments/${attachmentId}`, {
      method: "DELETE",
    });
  }

  /**
   * Restore agent action snapshot.
   */
  async revertAction(actionId: string): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(
      `/api/openapi/agent/actions/${actionId}/revert`,
      {
        method: "POST",
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
}
