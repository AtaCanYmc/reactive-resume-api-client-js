import { describe, it, expect, vi } from "vitest";
import { RxResumeClient, ApplicationCreate } from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

const MOCK_APP = {
  id: "app-123",
  userId: "user-123",
  company: "Google",
  position: "Staff Engineer",
  stage: "Interviewing",
  date: "2026-07-13T12:00:00Z",
  summary: "Interviews scheduled",
  url: "https://google.com/jobs",
  createdAt: "2026-07-13T12:00:00Z",
  updatedAt: "2026-07-13T12:00:00Z",
};

describe("ApplicationsAPI", () => {
  it("should list applications (both array and paginated format)", async () => {
    let mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([MOCK_APP]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    let client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });
    let apps = await client.applications.list();
    expect(apps).toHaveLength(1);
    expect(apps[0].company).toBe("Google");

    mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [MOCK_APP] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });
    apps = await client.applications.list();
    expect(apps).toHaveLength(1);
    expect(apps[0].company).toBe("Google");
  });

  it("should get application by ID", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(MOCK_APP), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const app = await client.applications.get("app-123");
    expect(app.id).toBe("app-123");
    expect(app.position).toBe("Staff Engineer");
  });

  it("should create application", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(MOCK_APP), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    );
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const payload: ApplicationCreate = {
      company: "Google",
      position: "Staff Engineer",
    };
    const app = await client.applications.create(payload);
    expect(app.id).toBe("app-123");
  });

  it("should delete application", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    await client.applications.delete("app-123");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/applications/app-123`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("should list tags, get pipeline stats, and bulk import", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(["tech", "finance"]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ total: 5 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const tags = await client.applications.listTags();
    expect(tags).toEqual(["tech", "finance"]);

    const stats = await client.applications.getPipelineStats();
    expect(stats).toEqual({ total: 5 });

    const res = await client.applications.bulkImport([{ company: "Meta", role: "SWE" }]);
    expect(res).toEqual({ success: true });
  });
});
