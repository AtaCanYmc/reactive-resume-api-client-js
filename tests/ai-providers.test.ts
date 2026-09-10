import { describe, it, expect, vi } from "vitest";
import { RxResumeClient } from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

describe("AiProvidersAPI", () => {
  it("should list, create, delete, test, and update AI providers", async () => {
    const mockProviders = [{ name: "openai", enabled: true }];

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockProviders), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "provider-1", label: "GPT-4" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ enabled: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    // Test access via both client.aiProviders and client.ai_providers
    expect(client.ai_providers).toBe(client.aiProviders);

    const providers = await client.aiProviders.list();
    expect(providers).toHaveLength(1);
    expect(providers[0].name).toBe("openai");

    const newProvider = await client.aiProviders.create("GPT-4", "gpt-4", "sk-123");
    expect(newProvider.id).toBe("provider-1");

    await client.aiProviders.delete("provider-1");

    const testRes = await client.aiProviders.test("provider-1");
    expect(testRes).toBe(true);

    const updated = await client.aiProviders.update("provider-1", { enabled: false });
    expect(updated.enabled).toBe(false);
  });
});
