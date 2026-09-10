import { describe, it, expect, vi } from "vitest";
import { RxResumeClient } from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

describe("FlagsAPI", () => {
  it("should list feature flags", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ isSignupsDisabled: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const flags = await client.flags.list();
    expect(flags.isSignupsDisabled).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/flags`,
      expect.objectContaining({ method: "GET" })
    );
  });
});
