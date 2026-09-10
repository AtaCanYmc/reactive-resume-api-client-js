import { describe, it, expect, vi } from "vitest";
import { RxResumeClient } from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

describe("AIAPI", () => {
  it("should parse pdf, parse docx, chat, and analyze resume", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ basics: { name: "Parsed PDF" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ basics: { name: "Parsed DOCX" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ reply: "AI response" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ grammar: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const pdfRes = await client.ai.parsePdf("resume.pdf", "base64data", "openai-id");
    expect((pdfRes.basics as { name: string }).name).toBe("Parsed PDF");

    const docxRes = await client.ai.parseDocx("resume.docx", "base64data", "openai-id");
    expect((docxRes.basics as { name: string }).name).toBe("Parsed DOCX");

    const chatRes = await client.ai.chat({ message: "hi" });
    expect(chatRes.reply).toBe("AI response");

    const analyzeRes = await client.ai.analyzeResume("resume-1", "openai-id");
    expect(analyzeRes.grammar).toEqual([]);

    // Test python aliases
    expect(typeof client.ai.parse_pdf).toBe("function");
    expect(typeof client.ai.parse_docx).toBe("function");
    expect(typeof client.ai.analyze_resume).toBe("function");
  });
});
