import { describe, it, expect, vi } from "vitest";
import { RxResumeClient, ResumeImportData } from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

const MOCK_RESUME = {
  id: "resume-123",
  name: "Ata Can - CV",
  slug: "ata-can-cv",
  userId: "user-123",
  visibility: "public",
  locked: false,
  data: {
    basics: {
      name: "Ata Can",
      headline: "Architect",
      email: "ata@example.com",
      phone: "555",
      website: "",
      location: "",
      picture: "",
      profiles: [],
    },
    sections: {},
  },
  createdAt: "2026-07-13T12:00:00Z",
  updatedAt: "2026-07-13T12:00:00Z",
};

describe("ResumesAPI", () => {
  it("should list resumes directly and with pagination wrapper", async () => {
    // 1. Array response
    let mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([MOCK_RESUME]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    let client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });
    let resumes = await client.resumes.list();
    expect(resumes).toHaveLength(1);
    expect(resumes[0].id).toBe("resume-123");
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/api/openapi/resumes`, expect.anything());

    // 1b. Paginated { data: [...] } wrapper
    mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [MOCK_RESUME] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });
    resumes = await client.resumes.list();
    expect(resumes).toHaveLength(1);
    expect(resumes[0].id).toBe("resume-123");
  });

  it("should retrieve a specific resume by ID", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(MOCK_RESUME), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });
    const resume = await client.resumes.get("resume-123");
    expect(resume.name).toBe("Ata Can - CV");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/resumes/resume-123`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("should create and import resume", async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(MOCK_RESUME), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });
    const importData: ResumeImportData = { title: "Ata Can - CV" };

    const newResume = await client.resumes.create(importData);
    expect(newResume.id).toBe("resume-123");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/resumes`,
      expect.objectContaining({ method: "POST" })
    );

    const importedResume = await client.resumes.importResume(importData);
    expect(importedResume.id).toBe("resume-123");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/resumes/import`,
      expect.objectContaining({ method: "POST" })
    );

    // Test alias
    const importedAlias = await client.resumes.import_resume(importData);
    expect(importedAlias.id).toBe("resume-123");
  });

  it("should update resume via PATCH and PUT", async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(MOCK_RESUME), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const updated = await client.resumes.update("resume-123", { name: "New Name" });
    expect(updated.id).toBe("resume-123");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/resumes/resume-123`,
      expect.objectContaining({ method: "PATCH" })
    );

    const updatedPut = await client.resumes.updatePut("resume-123", { name: "New Name" });
    expect(updatedPut.id).toBe("resume-123");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/resumes/resume-123`,
      expect.objectContaining({ method: "PUT" })
    );

    // Test alias
    const updatedPutAlias = await client.resumes.update_put("resume-123", { name: "New Name" });
    expect(updatedPutAlias.id).toBe("resume-123");
  });

  it("should delete resume", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    await client.resumes.delete("resume-123");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/resumes/resume-123`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("should construct PDF URL", () => {
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY });
    expect(client.resumes.getPdfUrl("resume-123")).toBe(
      `${BASE_URL}/api/openapi/resumes/resume-123/pdf`
    );
    expect(client.resumes.get_pdf_url("resume-123")).toBe(
      `${BASE_URL}/api/openapi/resumes/resume-123/pdf`
    );
  });

  it("should list tags", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(["work", "tech"]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const tags = await client.resumes.tags();
    expect(tags).toContain("work");
    expect(tags).toContain("tech");
  });

  it("should manage password (set, remove, verify)", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    await client.resumes.setPassword("resume-123", "secret");
    await client.resumes.removePassword("resume-123");
    const verified = await client.resumes.verifyPassword("resume-123", "secret");
    expect(verified).toBe(true);
  });

  it("should retrieve public resume", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(MOCK_RESUME), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const pub = await client.resumes.getPublicResume("atacan", "cv");
    expect(pub.id).toBe("resume-123");
  });

  it("should get analysis, versions, duplicate, lock", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ grammar: 90 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "v1" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(MOCK_RESUME), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const analysis = await client.resumes.getLatestAnalysis("resume-123");
    expect(analysis.grammar).toBe(90);

    const versions = await client.resumes.getVersions("resume-123");
    expect(versions).toHaveLength(1);

    const dup = await client.resumes.duplicate("resume-123", "Dup", "dup-slug");
    expect(dup.id).toBe("resume-123");

    await client.resumes.lock("resume-123", true);
  });

  it("should download PDF bytes", async () => {
    const sampleBytes = new TextEncoder().encode("%PDF-1.4 sample content");
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(sampleBytes, {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      })
    );
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const pdf = await client.resumes.downloadPdf("resume-123");
    expect(pdf).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(pdf)).toBe("%PDF-1.4 sample content");
  });

  it("should get statistics and daily statistics", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ views: 10, downloads: 2, history: {} }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ views: 5, downloads: 1, history: {} }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const stats = await client.resumes.getStatistics("resume-123");
    expect(stats.views).toBe(10);
    expect(stats.downloads).toBe(2);

    const daily = await client.resumes.getDailyStatistics("resume-123", 30);
    expect(daily.views).toBe(5);
  });
});
