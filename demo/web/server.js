import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

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

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    res.end();
    return;
  }

  const reqUrl = req.url.split("?")[0];

  // Local Proxy Handler (Bypasses browser CORS for live instance testing)
  if (reqUrl === "/proxy") {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const targetUrl = parsedUrl.searchParams.get("url");

    if (!targetUrl) {
      res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ error: "Missing 'url' query parameter" }));
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
        res.writeHead(502, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ error: `Proxy error: ${err.message}` }));
      }
    });
    return;
  }

  const relativePath = reqUrl === "/" ? "index.html" : reqUrl.replace(/^\/+/, "");
  const filePath = path.join(__dirname, relativePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\x1b[32m✔ Reactive Resume Web Demo running at http://localhost:${PORT}\x1b[0m`);
});
