import { describe, it, expect, vi } from "vitest";
import { RxResumeClient } from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

const MOCK_USER = {
  id: "user-123",
  name: "Ata Can",
  username: "atacan",
  email: "ata@example.com",
  provider: "email",
  createdAt: "2026-07-13T12:00:00Z",
  updatedAt: "2026-07-13T12:00:00Z",
};

describe("AuthAPI", () => {
  it("should list providers, export account, and delete account", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(["email", "github"]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ user: MOCK_USER }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const providers = await client.auth.listProviders();
    expect(providers).toContain("github");

    const exported = await client.auth.exportAccount();
    expect(exported.user).toEqual(MOCK_USER);

    await client.auth.deleteAccount();
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/openapi/auth/account`,
      expect.objectContaining({ method: "DELETE" })
    );

    // Test python aliases
    expect(typeof client.auth.list_providers).toBe("function");
    expect(typeof client.auth.export_account).toBe("function");
    expect(typeof client.auth.delete_account).toBe("function");
  });

  it("should handle object dictionary returned by auth providers endpoint", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          credential: "Password",
          passkey: "Passkey",
          google: "Google",
          github: "GitHub",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    const client = new RxResumeClient({ baseUrl: BASE_URL, fetch: mockFetch });
    const providers = await client.auth.listProviders();
    expect(providers).toEqual(["credential", "passkey", "google", "github"]);
  });
});
