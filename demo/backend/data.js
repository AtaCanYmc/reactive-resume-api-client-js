/**
 * In-memory data store for the Reactive Resume Demo Backend.
 * Seeded with realistic developer data and provides CRUD helper operations.
 */

export function createInitialStore() {
  const resumes = [
    {
      id: "res-001",
      name: "Ata Can Yaymacı - Senior Backend Engineer",
      slug: "atacan-backend",
      userId: "user-dev-1",
      visibility: "public",
      locked: false,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        basics: {
          name: "Ata Can Yaymacı",
          headline: "Senior Software Engineer & Systems Architect",
          email: "ata@example.com",
          phone: "+90 555 123 4567",
          location: "Istanbul, Turkey",
          website: "https://github.com/AtaCanYmc",
        },
        sections: {
          summary: {
            id: "summary",
            name: "Summary",
            content: "Experienced Backend Engineer specializing in high-throughput distributed systems, Node.js, TypeScript, Python, and cloud infrastructure.",
          },
          experience: {
            id: "experience",
            name: "Experience",
            items: [
              {
                id: "exp-1",
                company: "Global Tech Labs",
                position: "Staff Software Engineer",
                date: "2023 - Present",
                summary: "Architected microservices handling 50k+ req/sec. Authored core developer toolkits and open-source SDKs.",
              },
              {
                id: "exp-2",
                company: "CloudScale Systems",
                position: "Senior Backend Developer",
                date: "2020 - 2023",
                summary: "Led migration from monolith to containerized Kubernetes services, decreasing deployment times by 70%.",
              },
            ],
          },
          skills: {
            id: "skills",
            name: "Skills",
            items: [
              { name: "TypeScript & Node.js", level: "Expert" },
              { name: "Distributed Systems & Kafka", level: "Expert" },
              { name: "PostgreSQL & Redis", level: "Advanced" },
              { name: "Docker & Kubernetes", level: "Advanced" },
            ],
          },
        },
      },
    },
    {
      id: "res-002",
      name: "Ata Can Yaymacı - Platform & DevOps Lead",
      slug: "atacan-devops",
      userId: "user-dev-1",
      visibility: "private",
      locked: true,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      data: {
        basics: {
          name: "Ata Can Yaymacı",
          headline: "Platform Engineer & Infrastructure Lead",
          email: "ata@example.com",
          location: "Remote",
        },
      },
    },
    {
      id: "res-003",
      name: "Engineering Manager - Platform & Core APIs",
      slug: "engineering-manager",
      userId: "user-dev-1",
      visibility: "public",
      locked: false,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      data: {
        basics: {
          name: "Ata Can Yaymacı",
          headline: "Engineering Manager (Platform & Core Systems)",
          email: "ata@example.com",
        },
      },
    },
  ];

  const applications = [
    {
      id: "app-101",
      company: "Stripe",
      position: "Staff Backend Infrastructure Engineer",
      stage: "Interviewing",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      summary: "System design completed. Waiting for principal bar-raiser interview.",
    },
    {
      id: "app-102",
      company: "Supabase",
      position: "Senior Core Engine Engineer",
      stage: "Offered",
      date: new Date(Date.now() - 10 * 86400000).toISOString(),
      summary: "Offer package received. Reviewing compensation and equity schedule.",
    },
    {
      id: "app-103",
      company: "Vercel",
      position: "Senior DX & Platform Tools Engineer",
      stage: "Applied",
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
      summary: "Applied directly through referral. Waiting for recruiter screening.",
    },
    {
      id: "app-104",
      company: "Linear",
      position: "Founding Sync Infrastructure Engineer",
      stage: "Interviewing",
      date: new Date(Date.now() - 6 * 86400000).toISOString(),
      summary: "Completed real-time conflict-free replicated data types (CRDT) take-home assignment.",
    },
  ];

  const aiProviders = [
    {
      id: "aip-001",
      label: "OpenAI Production",
      model: "gpt-4o",
      apiKey: "sk-proj-demo-live-key",
      baseURL: "https://api.openai.com/v1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "aip-002",
      label: "Anthropic Claude",
      model: "claude-3-5-sonnet-20241022",
      apiKey: "sk-ant-demo-key",
      baseURL: "https://api.anthropic.com/v1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "aip-003",
      label: "Local Ollama Llama3",
      model: "llama3:8b",
      apiKey: "",
      baseURL: "http://localhost:11434/v1",
      createdAt: new Date().toISOString(),
    },
  ];

  const agentThreads = [
    {
      id: "th-001",
      title: "Staff Engineer Technical Stack Optimization",
      status: "active",
      sourceResumeId: "res-001",
      aiProviderId: "aip-001",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      messages: [
        { role: "user", content: "Analyze resume against Staff Engineer requirements for distributed data systems." },
        { role: "assistant", content: "Evaluated 12 core competencies: High scalability (98%), Distributed consensus (94%), Multi-region reliability (92%). Recommending quantifiable throughput metrics for experience entry #1." },
      ],
    },
    {
      id: "th-002",
      title: "ATS Keyword Aligning for Cloud Native Roles",
      status: "active",
      sourceResumeId: "res-002",
      aiProviderId: "aip-001",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      messages: [
        { role: "user", content: "Align technical keywords with Kubernetes, Terraform, and eBPF observability tools." },
        { role: "assistant", content: "Injected targeted CNCF terminology without keyword stuffing. ATS match improved by +18%." },
      ],
    },
  ];

  const statistics = {
    users: 1215555,
    stars: 42414,
    resumes: 1655652,
  };

  const flags = {
    disableSignups: false,
    disableEmailAuth: false,
    smtpEnabled: true,
    isPdfExportEnabled: true,
    isAiEnabled: true,
    isAgentEnabled: true,
  };

  const authProviders = {
    credential: "Password",
    passkey: "Passkey",
    google: "Google",
    github: "GitHub",
    linkedin: "LinkedIn",
  };

  return {
    resumes,
    applications,
    aiProviders,
    agentThreads,
    statistics,
    flags,
    authProviders,
  };
}

export function generateMockPdfBytes(title = "Reactive Resume Document") {
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
<< /Length 160 >>
stream
BT
/F1 18 Tf
50 720 Td
(${title}) Tj
/F1 11 Tf
0 -30 Td
(Generated via reactive-resume-api-client-js Demo Backend) Tj
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
0000000229 00000 n 
0000000441 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
508
%%EOF`;

  return Buffer.from(content, "utf-8");
}
