/**
 * TypeScript definitions representing AI Providers and AI tools.
 */

export interface AiProvider {
  id: string;
  userId?: string;
  label: string;
  model: string;
  apiKey?: string;
  baseURL?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateAiProviderOptions {
  label: string;
  model: string;
  apiKey: string;
  baseURL?: string;
}

export interface UpdateAiProviderOptions {
  label?: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
  [key: string]: unknown;
}

export interface ParseFileInput {
  name: string;
  data: string;
}

export interface AIFileParseOptions {
  fileName: string;
  fileData: string;
  providerId: string;
}
