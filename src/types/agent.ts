/**
 * TypeScript definitions representing AI Agent operations.
 */

export interface AgentThread {
  id: string;
  userId?: string;
  aiProviderId?: string | null;
  sourceResumeId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateThreadOptions {
  aiProviderId?: string | null;
  sourceResumeId?: string | null;
}

export interface ArchiveThreadOptions {
  aiProviderId?: string | null;
  sourceResumeId?: string | null;
}

export interface SendMessageOptions {
  attachmentIds?: string[];
}

export interface CreateAttachmentOptions {
  threadId: string;
  filename: string;
  mediaType: string;
  data: string;
}
