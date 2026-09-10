# Reactive Resume Demo Backend

A standalone, zero-dependency Node.js mock API and proxy backend server designed for pair-testing and demonstrating the **`reactive-resume-api-client-js`** SDK.

---

## Highlights

- **Zero External Dependencies**: Built with native Node.js standard libraries (`node:http`, `node:fs`, `node:path`, `node:crypto`).
- **Complete Reactive Resume OpenAPI Coverage**: Implements all SDK endpoints with in-memory persistence and realistic developer data.
- **Built-in CORS Engine**: Automatic preflight handling (`OPTIONS 204`) and `Access-Control-Allow-Origin: *` headers for all browser requests.
- **Transparent Reverse Proxy**: Bypasses Cloudflare / browser CORS restrictions when forwarding to live instances via `/proxy?url=...`.
- **Integrated PDF Generation**: Emits valid binary PDF streams for resume preview and download testing.
- **Unified Dual Serving**: Serves the OpenAPI REST backend and the Hallmark-designed Web Demo frontend together on a single port (`3000`).

---

## Quick Start

### 1. Start the Demo Backend

**Using Docker (Unified Container):**
```bash
# Start container in background
docker compose up -d

# Or via npm script
npm run docker:up

# View logs
docker compose logs -f

# Stop container
docker compose down
```

**Using Node.js Directly:**
```bash
# Using npm
npm run demo:backend

# Or via npm start
npm start

# Or directly with node
node demo/backend/server.js
```

The server starts on port `3000` (configurable via `PORT=3001 node demo/backend/server.js` or `PORT=3001 docker compose up`).

### 2. Access Web Demo & API
- **Web Demo Interface**: [http://localhost:3000](http://localhost:3000)
- **API Base URL**: `http://localhost:3000` (or `/api/openapi`)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

---

## OpenAPI Endpoints Reference

| Category | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| **Statistics** | `GET` | `/api/openapi/statistics/users` | Platform registered user count |
| | `GET` | `/api/openapi/statistics/github/stars` | GitHub repository stars count |
| | `GET` | `/api/openapi/statistics/resumes` | Total compiled resumes count |
| **Flags** | `GET` | `/api/openapi/flags` | Feature flag state toggles |
| **Auth** | `GET` | `/api/openapi/auth/providers` | Active auth providers (email, github, google...) |
| | `GET` | `/api/openapi/auth/account/export` | Complete account data export package |
| **Resumes** | `GET` | `/api/openapi/resumes` | List all resumes |
| | `POST` | `/api/openapi/resumes` | Create new resume |
| | `GET` | `/api/openapi/resumes/:id` | Get single resume details |
| | `DELETE` | `/api/openapi/resumes/:id` | Delete resume |
| | `GET` | `/api/openapi/resumes/:id/pdf` | Generate and download compiled PDF |
| | `POST` | `/api/openapi/resumes/:id/duplicate` | Clone resume |
| | `POST` | `/api/openapi/resumes/:id/lock` | Lock/unlock resume |
| | `GET` | `/api/openapi/resumes/:id/statistics` | Resume views and download metrics |
| **Applications** | `GET` | `/api/openapi/applications` | List job application pipeline |
| | `POST` | `/api/openapi/applications` | Log new job application |
| | `DELETE` | `/api/openapi/applications/:id` | Delete job application |
| | `GET` | `/api/openapi/applications/stats` | Applications stage breakdown |
| **AI Providers** | `GET` | `/api/openapi/ai-providers` | List configured LLM providers |
| | `POST` | `/api/openapi/ai-providers` | Add new provider configuration |
| | `POST` | `/api/openapi/ai-providers/:id/test` | Test provider connectivity & latency |
| | `DELETE` | `/api/openapi/ai-providers/:id` | Remove provider configuration |
| **AI & Agent** | `POST` | `/api/openapi/ai/analyze-resume` | Evaluate ATS score, strengths, and tips |
| | `POST` | `/api/openapi/ai/chat` | Interactive resume assistant chat |
| | `GET` | `/api/openapi/agent/threads` | List autonomous agent threads |
| | `POST` | `/api/openapi/agent/threads` | Initiate new agent thread |
| | `POST` | `/api/openapi/agent/threads/:id/archive` | Archive agent thread |
| | `DELETE` | `/api/openapi/agent/threads/:id` | Delete agent thread |
| **Proxy** | `GET,POST..`| `/proxy?url=<target>` | Forward cross-origin request to remote server |

---

## SDK Integration Example

```typescript
import { RxResumeClient } from "reactive-resume-api-client-js";

// Point the SDK directly to your local demo backend
const client = new RxResumeClient({
  baseUrl: "http://localhost:3000",
  apiKey: "local-demo-token",
});

// List all resumes
const resumes = await client.resumes.list();
console.log(`Loaded ${resumes.length} resumes from local demo backend`);

// Fetch platform statistics
const userCount = await client.statistics.getUsersCount();
console.log(`Total users: ${userCount}`);
```
