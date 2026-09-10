import { BaseAPI } from "./base.js";

/**
 * AI function endpoints for parsing documents and resume analysis.
 */
export class AIAPI extends BaseAPI {
  /**
   * Parse a PDF file into resume data.
   *
   * @param fileName - Name of the file (e.g., "resume.pdf").
   * @param fileData - Base64 or string data representation of the file.
   * @param providerId - The ID of the configured AI provider.
   */
  async parsePdf(
    fileName: string,
    fileData: string,
    providerId: string
  ): Promise<Record<string, unknown>> {
    const payload = {
      file: { name: fileName, data: fileData },
      aiProviderId: providerId,
    };
    return this.client.request<Record<string, unknown>>("/api/openapi/ai/parse-pdf", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Parse a DOCX file into resume data.
   *
   * @param fileName - Name of the file (e.g., "resume.docx").
   * @param fileData - Base64 or string data representation of the file.
   * @param providerId - The ID of the configured AI provider.
   */
  async parseDocx(
    fileName: string,
    fileData: string,
    providerId: string
  ): Promise<Record<string, unknown>> {
    const payload = {
      file: { name: fileName, data: fileData },
      aiProviderId: providerId,
    };
    return this.client.request<Record<string, unknown>>("/api/openapi/ai/parse-docx", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Chat with AI to modify resume.
   */
  async chat(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>("/api/openapi/ai/chat", {
      method: "POST",
      body: payload,
    });
  }

  /**
   * Analyze a resume and persist the latest analysis.
   *
   * @param resumeId - The ID of the resume to analyze.
   * @param providerId - The ID of the configured AI provider.
   */
  async analyzeResume(
    resumeId: string,
    providerId: string
  ): Promise<Record<string, unknown>> {
    const payload = {
      resumeId,
      aiProviderId: providerId,
    };
    return this.client.request<Record<string, unknown>>("/api/openapi/ai/analyze-resume", {
      method: "POST",
      body: payload,
    });
  }

  // Python SDK method aliases
  parse_pdf = this.parsePdf.bind(this);
  parse_docx = this.parseDocx.bind(this);
  analyze_resume = this.analyzeResume.bind(this);
}
