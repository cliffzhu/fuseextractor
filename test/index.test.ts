import { describe, it, expect, beforeAll } from "vitest";

describe("fuse-extractor", () => {
  let worker: any;

  beforeAll(async () => {
    // Import the worker for testing
    worker = (await import("../src/index.ts")).default;
  });

  it("should return service info on GET /", async () => {
    const request = new Request("http://localhost/", {
      method: "GET",
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.service).toBe("fuse-extractor");
  });

  it("should handle CORS preflight", async () => {
    const request = new Request("http://localhost/normalize", {
      method: "OPTIONS",
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should normalize keywords", async () => {
    const request = new Request("http://localhost/normalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "please signin to authenticate" }),
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.input).toBe("please signin to authenticate");
    expect(data.keywords).toContain("login");
    expect(data.keywords).toContain("auth");
  });

  it("should handle invalid JSON", async () => {
    const request = new Request("http://localhost/normalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("should return 404 for unknown routes", async () => {
    const request = new Request("http://localhost/unknown", {
      method: "POST",
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(404);
  });
});
