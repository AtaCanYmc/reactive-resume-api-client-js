import { describe, it, expect, vi } from "vitest";
import {
  RxResumeClient,
  ReactiveResumeClient,
  AuthenticationError,
  NotFoundError,
  ReactiveResumeAPIError,
  ReactiveResumeError,
} from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

describe("RxResumeClient Initialization and Authentication", () => {
  it("should initialize client with api_key in headers", () => {
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY });
    expect(client.headers["x-api-key"]).toBe(API_KEY);
    expect(client.headers["Authorization"]).toBeUndefined();
  });

  it("should initialize client with bearer token in headers", () => {
    const client = new RxResumeClient({ baseUrl: BASE_URL, token: "initial-token" });
    expect(client.headers["Authorization"]).toBe("Bearer initial-token");
    expect(client.headers["x-api-key"]).toBeUndefined();
  });

  it("should support apiKey with Bearer prefix as Authorization header", () => {
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: "Bearer token-123" });
    expect(client.headers["Authorization"]).toBe("Bearer token-123");
    expect(client.headers["x-api-key"]).toBeUndefined();

    client.setApiKey("Bearer updated-token");
    expect(client.headers["Authorization"]).toBe("Bearer updated-token");
  });

  it("should switch between token and api_key properly", () => {
    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY });
    expect(client.headers["x-api-key"]).toBe(API_KEY);

    client.setToken("new-jwt-token");
    expect(client.headers["Authorization"]).toBe("Bearer new-jwt-token");
    expect(client.headers["x-api-key"]).toBeUndefined();

    client.setApiKey("new-api-key");
    expect(client.headers["x-api-key"]).toBe("new-api-key");
    expect(client.headers["Authorization"]).toBeUndefined();

    // Test python aliases
    client.set_token("python-token");
    expect(client.headers["Authorization"]).toBe("Bearer python-token");

    client.set_api_key("python-key");
    expect(client.headers["x-api-key"]).toBe("python-key");
  });

  it("should export ReactiveResumeClient as an alias for RxResumeClient", () => {
    expect(ReactiveResumeClient).toBe(RxResumeClient);
  });
});

describe("RxResumeClient Error Handling", () => {
  it("should throw AuthenticationError on 401 response", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid Key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    await expect(client.resumes.list()).rejects.toThrow(AuthenticationError);
  });

  it("should throw NotFoundError on 404 response", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    await expect(client.resumes.list()).rejects.toThrow(NotFoundError);
  });

  it("should throw ReactiveResumeAPIError on 500 response", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    try {
      await client.resumes.list();
      expect.fail("Should have thrown ReactiveResumeAPIError");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ReactiveResumeAPIError);
      const apiErr = err as ReactiveResumeAPIError;
      expect(apiErr.statusCode).toBe(500);
    }
  });

  it("should throw ReactiveResumeError on network or connection timeout", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Connection timeout"));

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    try {
      await client.resumes.list();
      expect.fail("Should have thrown ReactiveResumeError");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ReactiveResumeError);
      expect((err as Error).message).toContain("Network or connection error occurred");
    }
  });

  it("should format string representation correctly with status code", () => {
    const err = new ReactiveResumeAPIError("Custom Error Message");
    expect(err.toString()).toBe("Custom Error Message");

    const errWithCode = new ReactiveResumeAPIError("Custom Error Message", 400);
    expect(errWithCode.toString()).toBe("Custom Error Message [Status 400]");
  });
});
