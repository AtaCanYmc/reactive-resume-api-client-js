/**
 * Reactive Resume Demo Backend Server (Express).
 *
 * Provides:
 * 1. Full Reactive Resume OpenAPI Mock Endpoints (/api/openapi/*)
 * 2. Transparent CORS Reverse Proxy (/proxy?url=...)
 * 3. Static Web Demo Serving (fallback to demo/web)
 *
 * Single runtime dependency: express.
 */

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createInitialStore, generateMockPdfBytes } from "./data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(__dirname, "../web");
const PORT = Number(process.env.PORT) || 3000;

const app = express();
const store = createInitialStore();

// --- CORS ---
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  });
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// --- Proxy (raw body, before JSON parser) ---
app.all("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    if (req.accepts("html")) return res.redirect("/");
    return res.json({
      status: "ok",
      service: "reactive-resume-proxy",
      message: "Proxy endpoint is active. Pass target URL via ?url= query parameter.",
      example: "/proxy?url=https%3A%2F%2Frxresu.me%2Fapi%2Fopenapi%2Fstatistics%2Fusers",
    });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
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
      ...(chunks.length > 0 && req.method !== "GET" && req.method !== "HEAD"
        ? { body: bodyBuffer }
        : {}),
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

    const buffer = Buffer.from(await proxyResponse.arrayBuffer());
    res.status(proxyResponse.status).set(resHeaders).send(buffer);
  } catch (err) {
    res.status(502).json({ error: `Proxy forwarding error: ${err.message}` });
  }
});

// --- Health ---
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    status: "ok",
    service: "reactive-resume-demo-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    version: "1.0.1",
    timestamp: new Date().toISOString(),
  });
});

// --- OpenAPI Mock Routes ---
const api = express.Router();
api.use(express.json());

// Statistics
api.get("/statistics/users", (req, res) => res.json(store.statistics.users));
api.get("/statistics/github/stars", (req, res) => res.json(store.statistics.stars));
api.get("/statistics/resumes", (req, res) => res.json(store.statistics.resumes));

// Flags
api.get("/flags", (req, res) => res.json(store.flags));

// Auth
api.get("/auth/providers", (req, res) => res.json(store.authProviders));
api.get("/auth/account/export", (req, res) => {
  res.json({
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
});

// Resumes (static paths before parameterized)
api.get("/resumes", (req, res) => res.json(store.resumes));
api.post("/resumes", (req, res) => {
  const { body } = req;
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
  res.status(201).json(newResume);
});
api.get("/resumes/tags", (req, res) => {
  res.json(["Backend", "Cloud Native", "Distributed Systems", "Full Stack"]);
});
api.get("/resumes/:id/pdf", (req, res) => {
  const resume = store.resumes.find((r) => r.id === req.params.id) || { name: "Sample Resume" };
  const pdfBuffer = generateMockPdfBytes(resume.name);
  res.type("application/pdf").send(pdfBuffer);
});
api.post("/resumes/:id/lock", (req, res) => {
  const resume = store.resumes.find((r) => r.id === req.params.id);
  if (!resume) return res.status(404).json({ message: "Resume not found" });
  resume.locked = !resume.locked;
  resume.updatedAt = new Date().toISOString();
  res.json(resume);
});
api.post("/resumes/:id/duplicate", (req, res) => {
  const original = store.resumes.find((r) => r.id === req.params.id);
  if (!original) return res.status(404).json({ message: "Resume not found" });
  const cloned = {
    ...JSON.parse(JSON.stringify(original)),
    id: `res-${randomUUID().slice(0, 8)}`,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.resumes.unshift(cloned);
  res.status(201).json(cloned);
});
api.get("/resumes/:id/statistics", (req, res) => {
  res.json({ views: 1840, downloads: 412 });
});
api.get("/resumes/:id", (req, res) => {
  const resume = store.resumes.find((r) => r.id === req.params.id);
  if (!resume) return res.status(404).json({ message: "Resume not found" });
  res.json(resume);
});
api.delete("/resumes/:id", (req, res) => {
  const index = store.resumes.findIndex((r) => r.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Resume not found" });
  store.resumes.splice(index, 1);
  res.json({ success: true });
});

// Applications (static paths before parameterized)
api.get("/applications", (req, res) => res.json(store.applications));
api.post("/applications", (req, res) => {
  const { body } = req;
  const newApp = {
    id: `app-${randomUUID().slice(0, 8)}`,
    company: body.company || "New Company",
    position: body.position || "Software Role",
    stage: body.stage || "Applied",
    summary: body.summary || "",
    date: new Date().toISOString(),
  };
  store.applications.unshift(newApp);
  res.status(201).json(newApp);
});
api.get("/applications/tags", (req, res) => {
  res.json(["Engineering", "Remote", "Principal"]);
});
api.get("/applications/stats", (req, res) => {
  const counts = { total: store.applications.length, applied: 0, interviewing: 0, offered: 0, rejected: 0 };
  store.applications.forEach((a) => {
    const s = (a.stage || "").toLowerCase();
    if (counts[s] !== undefined) counts[s]++;
  });
  res.json(counts);
});
api.get("/applications/:id", (req, res) => {
  const found = store.applications.find((a) => a.id === req.params.id);
  if (!found) return res.status(404).json({ message: "Application not found" });
  res.json(found);
});
api.delete("/applications/:id", (req, res) => {
  const index = store.applications.findIndex((a) => a.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Application not found" });
  store.applications.splice(index, 1);
  res.json({ success: true });
});

// AI Providers
api.get("/ai-providers", (req, res) => res.json(store.aiProviders));
api.post("/ai-providers", (req, res) => {
  const { body } = req;
  const newProvider = {
    id: `aip-${randomUUID().slice(0, 8)}`,
    label: body.label || "AI Provider",
    model: body.model || "default",
    apiKey: body.apiKey || "",
    baseURL: body.baseURL || "https://api.openai.com/v1",
    createdAt: new Date().toISOString(),
  };
  store.aiProviders.push(newProvider);
  res.status(201).json(newProvider);
});
api.post("/ai-providers/:id/test", (req, res) => {
  res.json({ success: true, latencyMs: 145, message: "AI Provider latency verified." });
});
api.delete("/ai-providers/:id", (req, res) => {
  const index = store.aiProviders.findIndex((p) => p.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Provider not found" });
  store.aiProviders.splice(index, 1);
  res.json({ success: true });
});

// AI & Studio
api.post("/ai/analyze-resume", (req, res) => {
  res.json({
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
});
api.post("/ai/chat", (req, res) => {
  const prompt = (req.body.prompt || "").toLowerCase();
  let reply = "I analyzed your technical resume section. Recommend quantifying accomplishments with specific scale metrics (e.g. throughput, latency, cloud efficiency).";
  if (prompt.includes("staff") || prompt.includes("lead")) {
    reply = "For Staff / Lead roles, emphasize cross-team technical initiatives, architectural governance, and system resilience over daily task completions.";
  } else if (prompt.includes("ats")) {
    reply = "ATS optimization complete: Ensure industry-standard headings ('Experience', 'Skills', 'Summary') and clean bullet points without nested tables.";
  }
  res.json({ content: reply, response: reply });
});

// Agent Threads
api.get("/agent/threads", (req, res) => res.json(store.agentThreads));
api.post("/agent/threads", (req, res) => {
  const { body } = req;
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
  res.status(201).json(newThread);
});
api.post("/agent/threads/:id/archive", (req, res) => {
  const thread = store.agentThreads.find((t) => t.id === req.params.id);
  if (!thread) return res.status(404).json({ message: "Thread not found" });
  thread.status = "archived";
  res.json(thread);
});
api.delete("/agent/threads/:id", (req, res) => {
  const index = store.agentThreads.findIndex((t) => t.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Thread not found" });
  store.agentThreads.splice(index, 1);
  res.json({ success: true });
});

app.use("/api/openapi", api);

// --- Start API ---
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  Reactive Resume Demo Backend Server (Express)`);
  console.log(`  API:       http://localhost:${PORT}/api/openapi`);
  console.log(`  Proxy:     http://localhost:${PORT}/proxy?url=...`);
  console.log(`  Health:    http://localhost:${PORT}/health`);
  console.log(`======================================================`);
});

// --- Start Web Demo (separate port) ---
const WEB_PORT = Number(process.env.WEB_PORT) || 3001;
const webApp = express();
webApp.use(express.static(WEB_DIR));
webApp.listen(WEB_PORT, () => {
  console.log(`  Web Demo:  http://localhost:${WEB_PORT}`);
  console.log(`======================================================\n`);
});
