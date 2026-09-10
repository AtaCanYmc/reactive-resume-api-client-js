/**
 * Mock datasets and fetch interceptor for the Reactive Resume Web Demo Sandbox.
 */

export const MOCK_RESUMES = [
  {
    id: "res-001",
    name: "Ata Can Yaymacı - Senior Backend Engineer",
    slug: "atacan-backend",
    userId: "user-dev-1",
    visibility: "public",
    locked: false,
    data: {
      basics: {
        name: "Ata Can Yaymacı",
        headline: "Senior Software Engineer & Systems Architect",
        email: "ata@example.com",
        phone: "+90 555 123 4567",
        location: "Istanbul, Turkey",
        website: "https://github.com/AtaCanYmc",
        profiles: [
          { network: "GitHub", username: "AtaCanYmc", url: "https://github.com/AtaCanYmc" },
          { network: "LinkedIn", username: "atacan-yaymaci", url: "https://linkedin.com/in/atacan-yaymaci" },
        ],
      },
      sections: {
        summary: {
          id: "summary",
          name: "Summary",
          columns: 1,
          visible: true,
          content: "Experienced Backend Engineer specializing in high-throughput distributed systems, Node.js, TypeScript, Python, and cloud infrastructure.",
        },
        experience: {
          id: "experience",
          name: "Experience",
          columns: 1,
          visible: true,
          items: [
            {
              id: "exp-1",
              visible: true,
              company: "Global Tech Labs",
              position: "Staff Software Engineer",
              date: "2023 - Present",
              location: "Remote",
              summary: "Architected microservices handling 50k+ req/sec. Authored core developer toolkits and open-source SDKs.",
            },
            {
              id: "exp-2",
              visible: true,
              company: "CloudScale Systems",
              position: "Senior Backend Developer",
              date: "2020 - 2023",
              location: "Istanbul",
              summary: "Led migration from monolith to containerized Kubernetes services, decreasing deployment times by 70%.",
            },
          ],
        },
        skills: {
          id: "skills",
          name: "Skills",
          columns: 2,
          visible: true,
          items: [
            { id: "sk-1", name: "TypeScript / Node.js", level: "Expert", keywords: ["TypeScript", "Node.js", "Bun", "ESM"] },
            { id: "sk-2", name: "Python", level: "Advanced", keywords: ["FastAPI", "Pydantic", "AsyncIO"] },
            { id: "sk-3", name: "Databases & Cloud", level: "Advanced", keywords: ["PostgreSQL", "Redis", "Docker", "AWS"] },
          ],
        },
      },
    },
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-09-08T14:30:00Z",
  },
  {
    id: "res-002",
    name: "Alex Rivera - Full Stack Developer",
    slug: "alex-rivera-cv",
    userId: "user-dev-2",
    visibility: "private",
    locked: false,
    data: {
      basics: {
        name: "Alex Rivera",
        headline: "Frontend & Full Stack Engineer",
        email: "alex@rivera.dev",
        phone: "+1 415 555 0199",
        location: "San Francisco, CA",
        website: "https://alexrivera.dev",
        profiles: [{ network: "GitHub", username: "arivera", url: "https://github.com/arivera" }],
      },
      sections: {
        experience: {
          id: "experience",
          name: "Experience",
          columns: 1,
          visible: true,
          items: [
            {
              id: "exp-3",
              visible: true,
              company: "DesignTech Studios",
              position: "Frontend Lead",
              date: "2022 - Present",
              location: "San Francisco",
              summary: "Built accessible, high-performance web applications using React, Next.js, and Tailwind CSS.",
            },
          ],
        },
      },
    },
    createdAt: "2026-04-12T08:15:00Z",
    updatedAt: "2026-08-20T11:00:00Z",
  },
  {
    id: "res-003",
    name: "Elena Rostova - Machine Learning Specialist",
    slug: "elena-ml-ai",
    userId: "user-dev-3",
    visibility: "public",
    locked: true,
    data: {
      basics: {
        name: "Elena Rostova",
        headline: "AI / ML Researcher & Engineer",
        email: "elena@ai-labs.org",
        phone: "+44 20 7946 0912",
        location: "London, UK",
        website: "https://elenarostova.ai",
        profiles: [{ network: "GitHub", username: "erostova", url: "https://github.com/erostova" }],
      },
      sections: {
        experience: {
          id: "experience",
          name: "Experience",
          columns: 1,
          visible: true,
          items: [
            {
              id: "exp-4",
              visible: true,
              company: "DeepNeural AI",
              position: "Research Scientist",
              date: "2021 - Present",
              location: "London",
              summary: "Fine-tuning open-weights LLMs for domain-specific medical and legal document analysis.",
            },
          ],
        },
      },
    },
    createdAt: "2026-05-18T16:45:00Z",
    updatedAt: "2026-09-02T09:20:00Z",
  },
];

export const MOCK_APPLICATIONS = [
  {
    id: "app-101",
    userId: "user-dev-1",
    company: "Stripe",
    position: "Staff Backend Infrastructure Engineer",
    stage: "Interviewing",
    date: "2026-09-01T14:00:00Z",
    summary: "System design round completed. High-throughput ledger discussion.",
    url: "https://stripe.com/jobs",
    createdAt: "2026-09-01T14:00:00Z",
    updatedAt: "2026-09-07T18:00:00Z",
  },
  {
    id: "app-102",
    userId: "user-dev-1",
    company: "Vercel",
    position: "Senior DX & Platform Engineer",
    stage: "Offered",
    date: "2026-08-20T10:00:00Z",
    summary: "Offer received! Negotiating start date and equity details.",
    url: "https://vercel.com/careers",
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-09-05T12:00:00Z",
  },
  {
    id: "app-103",
    userId: "user-dev-1",
    company: "GitHub",
    position: "Core Actions Platform Developer",
    stage: "Applied",
    date: "2026-09-04T09:30:00Z",
    summary: "Submitted application via referral.",
    url: "https://github.com/about/careers",
    createdAt: "2026-09-04T09:30:00Z",
    updatedAt: "2026-09-04T09:30:00Z",
  },
  {
    id: "app-104",
    userId: "user-dev-1",
    company: "Supabase",
    position: "Cloud Infrastructure Architect",
    stage: "Applied",
    date: "2026-09-06T15:10:00Z",
    summary: "Applied for remote position.",
    url: "https://supabase.com/careers",
    createdAt: "2026-09-06T15:10:00Z",
    updatedAt: "2026-09-06T15:10:00Z",
  },
  {
    id: "app-105",
    userId: "user-dev-1",
    company: "Anthropic",
    position: "Research Platform Engineer",
    stage: "Rejected",
    date: "2026-07-15T11:00:00Z",
    summary: "Position closed internally.",
    url: "https://anthropic.com/careers",
    createdAt: "2026-07-15T11:00:00Z",
    updatedAt: "2026-08-01T16:00:00Z",
  },
];

export const MOCK_STATS = {
  users: { count: 38450 },
  stars: { stars: 19820 },
  resumes: { count: 82400 },
};

export const MOCK_FLAGS = {
  isSignupsDisabled: false,
  isEmailAuthDisabled: false,
  isStorageQuotaExceeded: false,
  isAiAgentEnabled: true,
  isPdfExportEnabled: true,
};

/**
 * Creates a minimal valid PDF byte sequence representing a sample resume document.
 */
export function generateMockPdfBytes(title = "Reactive Resume Sample Document") {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 130 >>
stream
BT
/F1 18 Tf
50 720 Td
(${title}) Tj
/F1 11 Tf
0 -30 Td
(Generated via reactive-resume-api-client-js SDK in Sandbox Mode) Tj
0 -20 Td
(Date: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000236 00000 n 
0000000418 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
495
%%EOF`;

  return new TextEncoder().encode(content);
}

/**
 * Mock fetch factory for sandbox mode in the web demo.
 */
export function createMockFetch() {
  const resumes = JSON.parse(JSON.stringify(MOCK_RESUMES));
  const applications = JSON.parse(JSON.stringify(MOCK_APPLICATIONS));

  return async function mockFetch(urlStr, init = {}) {
    const url = new URL(urlStr);
    const path = url.pathname;
    const method = (init.method || "GET").toUpperCase();

    // Emulate realistic network latency
    await new Promise((res) => setTimeout(res, 120));

    // 1. Resumes
    if (path === "/api/openapi/resumes" && method === "GET") {
      return new Response(JSON.stringify(resumes), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path.startsWith("/api/openapi/resumes/") && path.endsWith("/pdf") && method === "GET") {
      const resumeId = path.split("/")[4];
      const match = resumes.find((r) => r.id === resumeId) || { name: "Resume Document" };
      const bytes = generateMockPdfBytes(match.name);
      return new Response(bytes, {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      });
    }

    if (path.startsWith("/api/openapi/resumes/") && method === "GET") {
      const resumeId = path.split("/")[4];
      const match = resumes.find((r) => r.id === resumeId);
      if (match) {
        return new Response(JSON.stringify(match), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ message: "Resume not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/api/openapi/resumes" && method === "POST") {
      const body = JSON.parse(init.body || "{}");
      const newResume = {
        id: `res-${Date.now().toString().slice(-4)}`,
        name: body.title || "Untitled Resume",
        slug: body.slug || `resume-${Date.now().toString().slice(-4)}`,
        userId: "user-dev-1",
        visibility: "public",
        locked: false,
        data: {
          basics: body.basics || {},
          sections: body.sections || {},
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      resumes.unshift(newResume);
      return new Response(JSON.stringify(newResume), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/api/openapi/resumes/import" && method === "POST") {
      const body = JSON.parse(init.body || "{}");
      const imported = {
        id: `res-imp-${Date.now().toString().slice(-4)}`,
        name: body.title || "Imported Resume",
        slug: body.slug || `imported-${Date.now().toString().slice(-4)}`,
        userId: "user-dev-1",
        visibility: "public",
        locked: false,
        data: {
          basics: body.basics || {},
          sections: body.sections || {},
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      resumes.unshift(imported);
      return new Response(JSON.stringify(imported), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path.startsWith("/api/openapi/resumes/") && method === "DELETE") {
      const resumeId = path.split("/")[4];
      const index = resumes.findIndex((r) => r.id === resumeId);
      if (index !== -1) resumes.splice(index, 1);
      return new Response(null, { status: 204 });
    }

    // 2. Applications
    if (path === "/api/openapi/applications" && method === "GET") {
      return new Response(JSON.stringify(applications), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/api/openapi/applications" && method === "POST") {
      const body = JSON.parse(init.body || "{}");
      const newApp = {
        id: `app-${Date.now().toString().slice(-4)}`,
        userId: "user-dev-1",
        company: body.company || "Unknown",
        position: body.position || "Position",
        stage: body.stage || "Applied",
        date: body.date || new Date().toISOString(),
        summary: body.summary || "",
        url: body.url || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      applications.unshift(newApp);
      return new Response(JSON.stringify(newApp), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path.startsWith("/api/openapi/applications/") && method === "DELETE") {
      const appId = path.split("/")[4];
      const idx = applications.findIndex((a) => a.id === appId);
      if (idx !== -1) applications.splice(idx, 1);
      return new Response(null, { status: 204 });
    }

    if (path === "/api/openapi/applications/stats" && method === "GET") {
      const stats = {
        total: applications.length,
        applied: applications.filter((a) => a.stage === "Applied").length,
        interviewing: applications.filter((a) => a.stage === "Interviewing").length,
        offered: applications.filter((a) => a.stage === "Offered").length,
        rejected: applications.filter((a) => a.stage === "Rejected").length,
      };
      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Global Statistics & Flags
    if (path === "/api/openapi/statistics/users") {
      return new Response(JSON.stringify(MOCK_STATS.users), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path === "/api/openapi/statistics/github/stars") {
      return new Response(JSON.stringify(MOCK_STATS.stars), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path === "/api/openapi/statistics/resumes") {
      return new Response(JSON.stringify(MOCK_STATS.resumes), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path === "/api/openapi/flags") {
      return new Response(JSON.stringify(MOCK_FLAGS), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Default fallback
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}
