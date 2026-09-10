/**
 * Reactive Resume Demo Backend Server.
 *
 * Provides:
 * 1. Full Reactive Resume OpenAPI Mock Endpoints (/api/openapi/*)
 * 2. Transparent CORS Reverse Proxy (/proxy?url=...)
 * 3. Static Web Demo Serving (fallback to demo/web)
 *
 * Zero external runtime dependencies - runs directly on native Node.js.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createInitialStore, generateMockPdfBytes } from "./data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(__dirname, "../web");
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".map": "application/json; charset=utf-8",
};

// Initialize in-memory database
const store = createInitialStore();

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  });
  res.end(body);
}

// Helper: send binary response (e.g. PDF)
function sendBinary(res, statusCode, buffer, contentType) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": buffer.length,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  });
  res.end(buffer);
}

// Helper: parse JSON request body
async function parseJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

// Helper: handle proxy forwarding
async function handleProxy(req, res, parsedUrl) {
  const targetUrl = parsedUrl.searchParams.get("url");

  if (!targetUrl) {
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      res.writeHead(302, { Location: "/" });
      res.end();
      return;
    }
    sendJson(res, 200, {
      status: "ok",
      service: "reactive-resume-proxy",
      message: "Proxy endpoint is active. Pass target URL via ?url= query parameter.",
      example: "/proxy?url=https%3A%2F%2Frxresu.me%2Fapi%2Fopenapi%2Fstatistics%2Fusers",
    });
    return;
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", async () => {
    try {
      const bodyBuffer = Buffer.concat(chunks);
      const headers = { ...req.headers };
      delete headers.host;
      delete headers.origin;
      delete headers.referer;
      delete headers.connection;
      delete headers["accept-encoding"];
      if (req.method === "GET" || req.method === "HEAD" || chunks.length === 0) {
        delete headers["content-length"];
      }

      const fetchInit = {
        method: req.method,
        headers,
        ...(chunks.length > 0 && req.method !== "GET" && req.method !== "HEAD" ? { body: bodyBuffer } : {}),
      };

      const proxyResponse = await fetch(targetUrl, fetchInit);
      const resHeaders = {};
      proxyResponse.headers.forEach((val, key) => {
        if (key !== "content-encoding" && key !== "transfer-encoding") {
          resHeaders[key] = val;
        }
      });
      resHeaders["access-control-allow-origin"] = "*";
      resHeaders["access-control-allow-headers"] = "*";
      resHeaders["access-control-allow-methods"] = "*";

      const responseBuffer = Buffer.from(await proxyResponse.arrayBuffer());
      res.writeHead(proxyResponse.status, resHeaders);
      res.end(responseBuffer);
    } catch (err) {
      sendJson(res, 502, { error: `Proxy forwarding error: ${err.message}` });
    }
  });
}

// Router for OpenAPI Mock Endpoints
async function handleApi(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // 1. Statistics
  if (pathname === "/api/openapi/statistics/users" && method === "GET") {
    return sendJson(res, 200, store.statistics.users);
  }
  if (pathname === "/api/openapi/statistics/github/stars" && method === "GET") {
    return sendJson(res, 200, store.statistics.stars);
  }
  if (pathname === "/api/openapi/statistics/resumes" && method === "GET") {
    return sendJson(res, 200, store.statistics.resumes);
  }

  // 2. Flags
  if (pathname === "/api/openapi/flags" && method === "GET") {
    return sendJson(res, 200, store.flags);
  }

  // 3. Auth
  if (pathname === "/api/openapi/auth/providers" && method === "GET") {
    return sendJson(res, 200, store.authProviders);
  }
  if (pathname === "/api/openapi/auth/account/export" && method === "GET") {
    return sendJson(res, 200, {
      exportedAt: new Date().toISOString(),
      user: {
        id: "usr-dev-001",
        name: "Ata Can Yaymacı",
        email: "ata@example.com",
        createdAt: "2024-01-15T09:00:00.000Z",
      },
      resumesCount: store.resumes.length,
      resumes: store.resumes,
      applicationsCount: store.applications.length,
      applications: store.applications,
      aiProvidersCount: store.aiProviders.length,
    });
  }

  // 4. Resumes
  if (pathname === "/api/openapi/resumes" && method === "GET") {
    return sendJson(res, 200, store.resumes);
  }
  if (pathname === "/api/openapi/resumes" && method === "POST") {
    const body = await parseJsonBody(req);
    const newResume = {
      id: `res-${randomUUID().slice(0, 8)}`,
      name: body.title || body.name || "Untitled Resume",
      slug: body.slug || `resume-${Date.now().toString().slice(-4)}`,
      userId: "user-dev-1",
      visibility: body.visibility || "private",
      locked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: body.basics ? { basics: body.basics } : (body.data || {}),
    };
    store.resumes.unshift(newResume);
    store.statistics.resumes++;
    return sendJson(res, 201, newResume);
  }
  if (pathname === "/api/openapi/resumes/tags" && method === "GET") {
    return sendJson(res, 200, ["Backend", "Cloud Native", "Distributed Systems", "Full Stack"]);
  }

  // Resume parameterized routes
  const resumePdfMatch = pathname.match(/^\/api\/openapi\/resumes\/([^/]+)\/pdf$/);
  if (resumePdfMatch && method === "GET") {
    const resumeId = resumePdfMatch[1];
    const resume = store.resumes.find((r) => r.id === resumeId) || { name: "Sample Resume" };
    const pdfBuffer = generateMockPdfBytes(resume.name);
    return sendBinary(res, 200, pdfBuffer, "application/pdf");
  }

  const resumeLockMatch = pathname.match(/^\/api\/openapi\/resumes\/([^/]+)\/lock$/);
  if (resumeLockMatch && method === "POST") {
    const resumeId = resumeLockMatch[1];
    const resume = store.resumes.find((r) => r.id === resumeId);
    if (resume) {
      resume.locked = !resume.locked;
      resume.updatedAt = new Date().toISOString();
      return sendJson(res, 200, resume);
    }
    return sendJson(res, 404, { message: "Resume not found" });
  }

  const resumeDupMatch = pathname.match(/^\/api\/openapi\/resumes\/([^/]+)\/duplicate$/);
  if (resumeDupMatch && method === "POST") {
    const resumeId = resumeDupMatch[1];
    const original = store.resumes.find((r) => r.id === resumeId);
    if (original) {
      const cloned = {
        ...JSON.parse(JSON.stringify(original)),
        id: `res-${randomUUID().slice(0, 8)}`,
        name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.resumes.unshift(cloned);
      return sendJson(res, 201, cloned);
    }
    return sendJson(res, 404, { message: "Resume not found" });
  }

  const resumeStatsMatch = pathname.match(/^\/api\/openapi\/resumes\/([^/]+)\/statistics$/);
  if (resumeStatsMatch && method === "GET") {
    return sendJson(res, 200, { views: 1840, downloads: 412 });
  }

  const resumeIdMatch = pathname.match(/^\/api\/openapi\/resumes\/([^/]+)$/);
  if (resumeIdMatch) {
    const resumeId = resumeIdMatch[1];
    const index = store.resumes.findIndex((r) => r.id === resumeId);

    if (method === "GET") {
      if (index >= 0) return sendJson(res, 200, store.resumes[index]);
      return sendJson(res, 404, { message: "Resume not found" });
    }
    if (method === "DELETE") {
      if (index >= 0) {
        store.resumes.splice(index, 1);
        return sendJson(res, 200, { success: true });
      }
      return sendJson(res, 404, { message: "Resume not found" });
    }
  }

  // 5. Applications
  if (pathname === "/api/openapi/applications" && method === "GET") {
    return sendJson(res, 200, store.applications);
  }
  if (pathname === "/api/openapi/applications" && method === "POST") {
    const body = await parseJsonBody(req);
    const newApp = {
      id: `app-${randomUUID().slice(0, 8)}`,
      company: body.company || "New Company",
      position: body.position || "Software Role",
      stage: body.stage || "Applied",
      summary: body.summary || "",
      date: new Date().toISOString(),
    };
    store.applications.unshift(newApp);
    return sendJson(res, 201, newApp);
  }
  if (pathname === "/api/openapi/applications/tags" && method === "GET") {
    return sendJson(res, 200, ["Engineering", "Remote", "Principal"]);
  }
  if (pathname === "/api/openapi/applications/stats" && method === "GET") {
    const counts = { total: store.applications.length, applied: 0, interviewing: 0, offered: 0, rejected: 0 };
    store.applications.forEach((a) => {
      const s = (a.stage || "").toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return sendJson(res, 200, counts);
  }

  const appIdMatch = pathname.match(/^\/api\/openapi\/applications\/([^/]+)$/);
  if (appIdMatch) {
    const appId = appIdMatch[1];
    const index = store.applications.findIndex((a) => a.id === appId);

    if (method === "GET") {
      if (index >= 0) return sendJson(res, 200, store.applications[index]);
      return sendJson(res, 404, { message: "Application not found" });
    }
    if (method === "DELETE") {
      if (index >= 0) {
        store.applications.splice(index, 1);
        return sendJson(res, 200, { success: true });
      }
      return sendJson(res, 404, { message: "Application not found" });
    }
  }

  // 6. AI Providers
  if (pathname === "/api/openapi/ai-providers" && method === "GET") {
    return sendJson(res, 200, store.aiProviders);
  }
  if (pathname === "/api/openapi/ai-providers" && method === "POST") {
    const body = await parseJsonBody(req);
    const newProvider = {
      id: `aip-${randomUUID().slice(0, 8)}`,
      label: body.label || "AI Provider",
      model: body.model || "default",
      apiKey: body.apiKey || "",
      baseURL: body.baseURL || "https://api.openai.com/v1",
      createdAt: new Date().toISOString(),
    };
    store.aiProviders.push(newProvider);
    return sendJson(res, 201, newProvider);
  }

  const aiProviderTestMatch = pathname.match(/^\/api\/openapi\/ai-providers\/([^/]+)\/test$/);
  if (aiProviderTestMatch && method === "POST") {
    return sendJson(res, 200, { success: true, latencyMs: 145, message: "AI Provider latency verified." });
  }

  const aiProviderIdMatch = pathname.match(/^\/api\/openapi\/ai-providers\/([^/]+)$/);
  if (aiProviderIdMatch && method === "DELETE") {
    const providerId = aiProviderIdMatch[1];
    const index = store.aiProviders.findIndex((p) => p.id === providerId);
    if (index >= 0) {
      store.aiProviders.splice(index, 1);
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 404, { message: "Provider not found" });
  }

  // 7. AI & Studio
  if (pathname === "/api/openapi/ai/analyze-resume" && method === "POST") {
    return sendJson(res, 200, {
      score: 96,
      atsMatch: "98%",
      tone: "Technical & High-Impact",
      summary: "Exceptional architecture leadership, quantified microservices throughput, and clean cloud-native impact.",
      strengths: [
        "Quantified high-throughput microservices architecture (50k+ req/sec)",
        "Concrete cloud infrastructure migration decreasing deploy latency by 70%",
        "End-to-end SDK authoring and active open-source tool contributions",
      ],
      recommendations: [
        "Highlight cross-functional architectural governance and patent contributions",
        "Include metrics regarding observability tooling and incident MTTR reduction",
      ],
    });
  }
  if (pathname === "/api/openapi/ai/chat" && method === "POST") {
    const body = await parseJsonBody(req);
    const prompt = (body.prompt || "").toLowerCase();
    let reply = "I analyzed your technical resume section. Recommend quantifying accomplishments with specific scale metrics (e.g. throughput, latency, cloud efficiency).";
    if (prompt.includes("staff") || prompt.includes("lead")) {
      reply = "For Staff / Lead roles, emphasize cross-team technical initiatives, architectural governance, and system resilience over daily task completions.";
    } else if (prompt.includes("ats")) {
      reply = "ATS optimization complete: Ensure industry-standard headings ('Experience', 'Skills', 'Summary') and clean bullet points without nested tables.";
    }
    return sendJson(res, 200, { content: reply, response: reply });
  }

  // 8. Agent Threads
  if (pathname === "/api/openapi/agent/threads" && method === "GET") {
    return sendJson(res, 200, store.agentThreads);
  }
  if (pathname === "/api/openapi/agent/threads" && method === "POST") {
    const body = await parseJsonBody(req);
    const newThread = {
      id: `th-${randomUUID().slice(0, 8)}`,
      title: body.title || "Autonomous Agent Task",
      status: "active",
      sourceResumeId: body.sourceResumeId || "res-001",
      aiProviderId: body.aiProviderId || "aip-001",
      createdAt: new Date().toISOString(),
      messages: [
        { role: "user", content: "Autonomous task initialized." },
        { role: "assistant", content: "Agent is auditing resume sections for ATS compliance and technical impact." },
      ],
    };
    store.agentThreads.unshift(newThread);
    return sendJson(res, 201, newThread);
  }

  const agentArchiveMatch = pathname.match(/^\/api\/openapi\/agent\/threads\/([^/]+)\/archive$/);
  if (agentArchiveMatch && method === "POST") {
    const threadId = agentArchiveMatch[1];
    const thread = store.agentThreads.find((t) => t.id === threadId);
    if (thread) {
      thread.status = "archived";
      return sendJson(res, 200, thread);
    }
    return sendJson(res, 404, { message: "Thread not found" });
  }

  const agentThreadIdMatch = pathname.match(/^\/api\/openapi\/agent\/threads\/([^/]+)$/);
  if (agentThreadIdMatch && method === "DELETE") {
    const threadId = agentThreadIdMatch[1];
    const index = store.agentThreads.findIndex((t) => t.id === threadId);
    if (index >= 0) {
      store.agentThreads.splice(index, 1);
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 404, { message: "Thread not found" });
  }

  // Health check
  if (pathname === "/health" || pathname === "/api/health") {
    return sendJson(res, 200, {
      status: "ok",
      service: "reactive-resume-demo-backend",
      uptimeSeconds: Math.floor(process.uptime()),
      version: "1.0.1",
      timestamp: new Date().toISOString(),
    });
  }

  return false;
}

// Create unified server
const server = http.createServer(async (req, res) => {
  // Global CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  // 1. Check Proxy Route
  if (pathname === "/proxy") {
    await handleProxy(req, res, parsedUrl);
    return;
  }

  // 2. Check OpenAPI Mock Routes
  const handled = await handleApi(req, res, parsedUrl);
  if (handled !== false) {
    return;
  }

  // 3. Fallback: Static Web Demo files (demo/web)
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.join(WEB_DIR, relativePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendJson(res, 404, { error: "Route or file not found", path: pathname });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n======================================================`);
  console.log(`  Reactive Resume Demo Backend Server`);
  console.log(`  Port:      ${PORT}`);
  console.log(`  Web Demo:  http://localhost:${PORT}`);
  console.log(`  API Base:  http://localhost:${PORT}/api/openapi`);
  console.log(`  Proxy URL: http://localhost:${PORT}/proxy?url=...`);
  console.log(`  Health:    http://localhost:${PORT}/health`);
  console.log(`======================================================\n`);
});
