import { describe, it, expect, vi } from "vitest";
import { RxResumeClient } from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

describe("StatisticsAPI", () => {
  it("should get users count, github stars, and resumes count", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 100 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ stars: 5000 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 250 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const users = await client.statistics.getUsersCount();
    expect(users).toEqual({ count: 100 });

    const stars = await client.statistics.getGithubStars();
    expect(stars).toEqual({ stars: 5000 });

    const resumes = await client.statistics.getResumesCount();
    expect(resumes).toEqual({ count: 250 });

    // Test python aliases
    expect(typeof client.statistics.get_users_count).toBe("function");
    expect(typeof client.statistics.get_github_stars).toBe("function");
    expect(typeof client.statistics.get_resumes_count).toBe("function");
  });
});
