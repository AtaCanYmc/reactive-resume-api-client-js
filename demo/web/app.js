/**
 * Reactive Resume Web Demo Application.
 *
 * Uses the reactive-resume-api-client-js SDK directly in the browser via ES modules.
 */

import { RxResumeClient } from "./vendor/reactive-resume-api-client.js";
import { createMockFetch } from "./mock-data.js";
import { initLanguage, applyLanguage, t } from "./i18n.js";

// Application State
let client = null;
let currentBlobUrl = null;

// DOM Elements
const baseUrlInput = document.getElementById("baseUrlInput");
const apiKeyInput = document.getElementById("apiKeyInput");
const sandboxToggle = document.getElementById("sandboxToggle");
const applyConfigBtn = document.getElementById("applyConfigBtn");
const modeBadge = document.getElementById("modeBadge");
const modeText = document.getElementById("modeText");
const getKeyLink = document.getElementById("getKeyLink");
const openInstanceLink = document.getElementById("openInstanceLink");

function updateBaseUrlLinks() {
  const raw = baseUrlInput.value.trim() || "https://rxresu.me";
  const baseUrl = raw.replace(/\/+$/, "");
  if (getKeyLink) {
    getKeyLink.href = `${baseUrl}/dashboard/settings/api-keys`;
  }
  if (openInstanceLink) {
    openInstanceLink.href = baseUrl;
  }
}

const resumesList = document.getElementById("resumesList");
const resumesTabCount = document.getElementById("resumesTabCount");
const appsTabCount = document.getElementById("appsTabCount");

const colApplied = document.getElementById("colApplied");
const colInterviewing = document.getElementById("colInterviewing");
const colOffered = document.getElementById("colOffered");
const colRejected = document.getElementById("colRejected");

const countApplied = document.getElementById("countApplied");
const countInterviewing = document.getElementById("countInterviewing");
const countOffered = document.getElementById("countOffered");
const countRejected = document.getElementById("countRejected");

const statUsersCount = document.getElementById("statUsersCount");
const statGithubStars = document.getElementById("statGithubStars");
const statResumesCount = document.getElementById("statResumesCount");
const flagsJsonBlock = document.getElementById("flagsJsonBlock");
const lastExecutedCode = document.getElementById("lastExecutedCode");

const createResumeModal = document.getElementById("createResumeModal");
const createAppModal = document.getElementById("createAppModal");
const pdfModal = document.getElementById("pdfModal");
const pdfFrame = document.getElementById("pdfFrame");
const pdfDownloadLink = document.getElementById("pdfDownloadLink");
const pdfModalTitle = document.getElementById("pdfModalTitle");
const settingsModal = document.getElementById("settingsModal");
const openSettingsModalBtn = document.getElementById("openSettingsModalBtn");

// AI Providers DOM Elements
const aiProvidersTabCount = document.getElementById("aiProvidersTabCount");
const aiProvidersList = document.getElementById("aiProvidersList");
const refreshAiProvidersBtn = document.getElementById("refreshAiProvidersBtn");
const openCreateAiProviderModalBtn = document.getElementById("openCreateAiProviderModalBtn");
const createAiProviderModal = document.getElementById("createAiProviderModal");
const submitCreateAiProviderBtn = document.getElementById("submitCreateAiProviderBtn");

// AI & Agent Studio DOM Elements
const aiTargetResumeSelect = document.getElementById("aiTargetResumeSelect");
const runAiAnalyzeBtn = document.getElementById("runAiAnalyzeBtn");
const aiAnalysisResults = document.getElementById("aiAnalysisResults");
const aiChatInput = document.getElementById("aiChatInput");
const sendAiChatBtn = document.getElementById("sendAiChatBtn");
const aiChatHistory = document.getElementById("aiChatHistory");
const newAgentThreadBtn = document.getElementById("newAgentThreadBtn");
const agentThreadsList = document.getElementById("agentThreadsList");

// Auth DOM Elements
const authProvidersChips = document.getElementById("authProvidersChips");
const exportAccountBtn = document.getElementById("exportAccountBtn");
const authExportBlock = document.getElementById("authExportBlock");

// Storage Keys
const THEME_STORAGE_KEY = "rx_theme_pref";
const API_KEY_STORAGE_KEY = "rx_api_key";
const BASE_URL_STORAGE_KEY = "rx_base_url";
const SANDBOX_STORAGE_KEY = "rx_sandbox_pref";

function initSavedSettings() {
  const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY) || sessionStorage.getItem(API_KEY_STORAGE_KEY);
  if (savedApiKey && apiKeyInput) {
    apiKeyInput.value = savedApiKey;
  }

  const savedBaseUrl = localStorage.getItem(BASE_URL_STORAGE_KEY) || sessionStorage.getItem(BASE_URL_STORAGE_KEY);
  if (savedBaseUrl && baseUrlInput) {
    baseUrlInput.value = savedBaseUrl;
  }

  const savedSandbox = localStorage.getItem(SANDBOX_STORAGE_KEY);
  if (savedSandbox !== null && sandboxToggle) {
    sandboxToggle.checked = savedSandbox === "true";
  }
}

function saveCredentials() {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  const baseUrl = baseUrlInput.value.trim();
  if (baseUrl) {
    localStorage.setItem(BASE_URL_STORAGE_KEY, baseUrl);
    sessionStorage.setItem(BASE_URL_STORAGE_KEY, baseUrl);
  }

  if (sandboxToggle) {
    localStorage.setItem(SANDBOX_STORAGE_KEY, String(sandboxToggle.checked));
  }
}

function applyTheme(theme) {
  if (theme === "dark" || theme === "light") {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "system";
  applyTheme(savedTheme);

  const radio = document.querySelector(`input[name="themeSelect"][value="${savedTheme}"]`);
  if (radio) {
    radio.checked = true;
  }
}

// Helper: Toast Notifications
function showToast(message, isError = false) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast" + (isError ? " error" : "");
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Helper: Update Code Inspector
function recordCode(snippet) {
  if (lastExecutedCode) {
    lastExecutedCode.textContent = snippet;
  }
}

// Initialize Client
function initClient() {
  updateBaseUrlLinks();
  const baseUrl = baseUrlInput.value.trim() || "https://rxresu.me";
  const apiKey = apiKeyInput.value.trim();
  const isSandbox = sandboxToggle.checked;

  if (isSandbox) {
    modeBadge.className = "mode-badge sandbox";
    modeText.textContent = t("sandboxBadge");
    client = new RxResumeClient({
      baseUrl,
      apiKey: "sandbox-demo-key",
      fetch: createMockFetch(),
    });
    recordCode(`// Initialize client in Sandbox Mode with mock fetch
const client = new RxResumeClient({
  baseUrl: "${baseUrl}",
  apiKey: "sandbox-demo-key",
  fetch: createMockFetch(),
});`);
  } else {
    modeBadge.className = "mode-badge live";
    modeText.textContent = t("liveBadge");
    client = new RxResumeClient({
      baseUrl,
      ...(apiKey ? { apiKey } : {}),
    });
    recordCode(`// Initialize client in Live Mode
const client = new RxResumeClient({
  baseUrl: "${baseUrl}",
  ${apiKey ? `apiKey: "${apiKey}",` : "// No API key provided (public endpoints only)"}
});`);
  }
}

// Load Resumes
async function loadResumes() {
  try {
    const resumes = await client.resumes.list();
    resumesTabCount.textContent = resumes.length;

    recordCode(`// List all resumes
const resumes = await client.resumes.list();
// Received ${resumes.length} resumes`);

    resumesList.innerHTML = "";
    if (resumes.length === 0) {
      resumesList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-muted); padding: 3rem;">
        ${escapeHtml(t("noResumes"))}
      </div>`;
      return;
    }

    resumes.forEach((resume) => {
      const card = document.createElement("div");
      card.className = "resume-card";
      card.innerHTML = `
        <div>
          <div class="resume-header">
            <div>
              <h3 class="resume-name">${escapeHtml(resume.name || "Untitled")}</h3>
              <p class="resume-slug">/${escapeHtml(resume.slug || resume.id)}</p>
            </div>
            <div class="resume-meta">
              <span class="pill ${resume.visibility === "public" ? "pill-public" : ""}">${resume.visibility || "private"}</span>
              ${resume.locked ? `<span class="pill pill-locked">locked</span>` : ""}
            </div>
          </div>
          <p style="font-size: 0.78rem; color: var(--color-dim); margin-top: 0.5rem; font-family: var(--font-mono);">
            ${escapeHtml(t("updatedPrefix"))} ${new Date(resume.updatedAt || resume.updated_at || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div class="resume-actions">
          <button class="btn btn-sm btn-primary download-pdf-btn" data-id="${resume.id}" data-name="${escapeHtml(resume.name)}">
            ${escapeHtml(t("downloadPdf"))}
          </button>
          <button class="btn btn-sm preview-pdf-btn" data-id="${resume.id}" data-name="${escapeHtml(resume.name)}">
            ${escapeHtml(t("previewPdf"))}
          </button>
          <button class="btn btn-sm btn-danger delete-resume-btn" data-id="${resume.id}">
            ${escapeHtml(t("deleteBtn"))}
          </button>
        </div>
      `;
      resumesList.appendChild(card);
    });

    // Attach listeners
    resumesList.querySelectorAll(".download-pdf-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleDownloadPdf(btn.dataset.id, btn.dataset.name));
    });
    resumesList.querySelectorAll(".preview-pdf-btn").forEach((btn) => {
      btn.addEventListener("click", () => handlePreviewPdf(btn.dataset.id, btn.dataset.name));
    });
    resumesList.querySelectorAll(".delete-resume-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleDeleteResume(btn.dataset.id));
    });
  } catch (error) {
    showToast(`${t("toastErrorLoadingResumes")} ${error.message}`, true);
  }
}

// Download PDF
async function handleDownloadPdf(resumeId, resumeName) {
  try {
    showToast(t("toastPdfDownloading"));
    const pdfBytes = await client.resumes.downloadPdf(resumeId);

    recordCode(`// Download compiled PDF as Uint8Array bytes
const pdfBytes = await client.resumes.downloadPdf("${resumeId}");
console.log("PDF Bytes received:", pdfBytes.byteLength);`);

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeName || "resume"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(t("toastPdfDownloaded"));
  } catch (error) {
    showToast(`${t("toastErrorDownloadingPdf")} ${error.message}`, true);
  }
}

// Preview PDF
async function handlePreviewPdf(resumeId, resumeName) {
  try {
    showToast(t("toastPdfPreviewing"));
    const pdfBytes = await client.resumes.downloadPdf(resumeId);

    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    currentBlobUrl = URL.createObjectURL(blob);

    pdfModalTitle.textContent = `${t("previewPdf")}: ${resumeName || "Resume"}`;
    pdfFrame.src = currentBlobUrl;
    pdfDownloadLink.href = currentBlobUrl;
    pdfDownloadLink.download = `${resumeName || "resume"}.pdf`;

    pdfModal.classList.add("open");

    recordCode(`// Preview PDF in modal iframe
const pdfBytes = await client.resumes.downloadPdf("${resumeId}");
const blob = new Blob([pdfBytes], { type: "application/pdf" });
const previewUrl = URL.createObjectURL(blob);
iframe.src = previewUrl;`);
  } catch (error) {
    showToast(`${t("toastErrorPreviewingPdf")} ${error.message}`, true);
  }
}

// Delete Resume
async function handleDeleteResume(resumeId) {
  if (!confirm(t("toastConfirmDeleteResume"))) return;
  try {
    await client.resumes.delete(resumeId);
    showToast(t("toastResumeDeleted"));
    recordCode(`// Delete resume
await client.resumes.delete("${resumeId}");`);
    await loadResumes();
  } catch (error) {
    showToast(`Error deleting resume: ${error.message}`, true);
  }
}

// Load Applications
async function loadApplications() {
  try {
    const apps = await client.applications.list();
    appsTabCount.textContent = apps.length;

    recordCode(`// List all tracked job applications
const applications = await client.applications.list();
// Received ${apps.length} applications`);

    // Reset columns
    colApplied.innerHTML = "";
    colInterviewing.innerHTML = "";
    colOffered.innerHTML = "";
    colRejected.innerHTML = "";

    const counts = { Applied: 0, Interviewing: 0, Offered: 0, Rejected: 0 };

    apps.forEach((app) => {
      const stage = app.stage || "Applied";
      if (counts[stage] !== undefined) counts[stage]++;

      const card = document.createElement("div");
      card.className = "kanban-card";
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
          <span class="kanban-company">${escapeHtml(app.company)}</span>
          <button class="btn-icon delete-app-btn" data-id="${app.id}" title="${escapeHtml(t("deleteBtn"))}" style="width: 22px; height: 22px; font-size: 0.65rem;">✕</button>
        </div>
        <p class="kanban-pos">${escapeHtml(app.position)}</p>
        ${app.summary ? `<p class="kanban-notes">${escapeHtml(app.summary)}</p>` : ""}
        <p class="kanban-date">${new Date(app.date || Date.now()).toLocaleDateString()}</p>
      `;

      card.querySelector(".delete-app-btn").addEventListener("click", () => handleDeleteApp(app.id));

      if (stage === "Applied") colApplied.appendChild(card);
      else if (stage === "Interviewing") colInterviewing.appendChild(card);
      else if (stage === "Offered") colOffered.appendChild(card);
      else if (stage === "Rejected") colRejected.appendChild(card);
    });

    countApplied.textContent = counts.Applied;
    countInterviewing.textContent = counts.Interviewing;
    countOffered.textContent = counts.Offered;
    countRejected.textContent = counts.Rejected;
  } catch (error) {
    showToast(`${t("toastErrorLoadingApps")} ${error.message}`, true);
  }
}

// Delete Application
async function handleDeleteApp(appId) {
  try {
    await client.applications.delete(appId);
    showToast(t("toastAppDeleted"));
    recordCode(`// Delete job application
await client.applications.delete("${appId}");`);
    await loadApplications();
  } catch (error) {
    showToast(`Error deleting application: ${error.message}`, true);
  }
}

// Load Statistics & Flags
async function loadStatistics() {
  try {
    const [users, stars, resumes, flags] = await Promise.all([
      client.statistics.getUsersCount(),
      client.statistics.getGithubStars(),
      client.statistics.getResumesCount(),
      client.flags.list(),
    ]);

    statUsersCount.textContent = (users && typeof users === "object" && users.count) ? users.count.toLocaleString() : "—";
    statGithubStars.textContent = (stars && typeof stars === "object" && stars.stars) ? stars.stars.toLocaleString() : "—";
    statResumesCount.textContent = (resumes && typeof resumes === "object" && resumes.count) ? resumes.count.toLocaleString() : "—";
    flagsJsonBlock.textContent = JSON.stringify(flags, null, 2);

    recordCode(`// Retrieve platform statistics and feature flags
const [users, stars, resumes, flags] = await Promise.all([
  client.statistics.getUsersCount(),
  client.statistics.getGithubStars(),
  client.statistics.getResumesCount(),
  client.flags.list(),
]);`);
  } catch (error) {
    showToast(`Error fetching statistics: ${error.message}`, true);
  }
}

// ==========================================
// 1. AI Providers Management (client.aiProviders)
// ==========================================
async function loadAiProviders() {
  if (!aiProvidersList) return;
  try {
    const providers = await client.aiProviders.list();
    if (aiProvidersTabCount) {
      aiProvidersTabCount.textContent = Array.isArray(providers) ? providers.length : 0;
    }

    recordCode(`// List configured AI inference providers
const providers = await client.aiProviders.list();
// Retrieved ${Array.isArray(providers) ? providers.length : 0} AI providers`);

    aiProvidersList.innerHTML = "";

    if (!providers || providers.length === 0) {
      aiProvidersList.innerHTML = `<div class="empty-state">${t("noAiProviders")}</div>`;
      return;
    }

    providers.forEach((provider) => {
      const card = document.createElement("div");
      card.className = "resume-card";
      card.innerHTML = `
        <div class="resume-header">
          <div>
            <h3 class="resume-name">${escapeHtml(provider.label || "AI Provider")}</h3>
            <p class="resume-slug">model: <code>${escapeHtml(provider.model || "default")}</code></p>
          </div>
          <div class="resume-meta">
            <span class="pill status-pill ${provider.apiKey ? "active" : "locked"}">${provider.apiKey ? "Ready" : "No Key"}</span>
          </div>
        </div>

        <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          baseURL: ${escapeHtml(provider.baseURL || "https://api.openai.com/v1")}
        </div>

        <div class="resume-actions">
          <button class="btn btn-sm btn-secondary test-provider-btn" data-id="${provider.id}">${t("testProviderBtn")}</button>
          <button class="btn btn-sm btn-danger delete-provider-btn" data-id="${provider.id}">${t("deleteBtn")}</button>
        </div>
      `;

      card.querySelector(".test-provider-btn").addEventListener("click", async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.textContent = "...";
        try {
          await client.aiProviders.test(provider.id);
          recordCode(`// Test connection for AI provider
const result = await client.aiProviders.test("${provider.id}");`);
          showToast(t("toastProviderTested"));
          btn.textContent = "✓ OK";
          setTimeout(() => { btn.textContent = t("testProviderBtn"); btn.disabled = false; }, 3000);
        } catch (err) {
          showToast(`Test failed: ${err.message}`, true);
          btn.textContent = "✕ Error";
          setTimeout(() => { btn.textContent = t("testProviderBtn"); btn.disabled = false; }, 3000);
        }
      });

      card.querySelector(".delete-provider-btn").addEventListener("click", async () => {
        try {
          await client.aiProviders.delete(provider.id);
          recordCode(`// Delete AI provider configuration
await client.aiProviders.delete("${provider.id}");`);
          showToast(t("toastProviderDeleted"));
          await loadAiProviders();
        } catch (err) {
          showToast(`Error removing provider: ${err.message}`, true);
        }
      });

      aiProvidersList.appendChild(card);
    });
  } catch (error) {
    aiProvidersList.innerHTML = `<div class="empty-state">Error loading AI providers: ${escapeHtml(error.message)}</div>`;
  }
}

// ==========================================
// 2. AI & Agent Studio (client.ai & client.agent)
// ==========================================
async function loadAiStudio() {
  // Populate target resume dropdown
  try {
    const resumes = await client.resumes.list();
    if (aiTargetResumeSelect) {
      aiTargetResumeSelect.innerHTML = resumes.map(r => `
        <option value="${r.id}">${escapeHtml(r.name || r.slug || r.id)}</option>
      `).join("");
    }
  } catch (_) {}

  // Load Agent threads
  if (!agentThreadsList) return;
  try {
    const threads = await client.agent.listThreads();
    recordCode(`// List autonomous agent threads
const threads = await client.agent.listThreads();
// Retrieved ${threads.length} active agent sessions`);

    agentThreadsList.innerHTML = "";
    if (!threads || threads.length === 0) {
      agentThreadsList.innerHTML = `<div class="empty-state">No active agent sessions. Click "+ New Thread" to initiate an agent.</div>`;
      return;
    }

    threads.forEach(thread => {
      const card = document.createElement("div");
      card.className = "agent-thread-card";
      const lastMsg = thread.messages && thread.messages.length > 0
        ? thread.messages[thread.messages.length - 1].content
        : "Thread initialized.";

      card.innerHTML = `
        <div class="thread-header">
          <span class="thread-title">${escapeHtml(thread.title || "Agent Task")}</span>
          <span class="pill status-pill active">${escapeHtml(thread.status || "active")}</span>
        </div>
        <div class="thread-msg-box">
          ${escapeHtml(lastMsg)}
        </div>
        <div class="thread-footer">
          <span>ID: <code>${escapeHtml(thread.id)}</code></span>
          <div style="display: flex; gap: 4px;">
            <button class="btn btn-sm btn-ghost archive-thread-btn" data-id="${thread.id}">Archive</button>
            <button class="btn btn-sm btn-ghost delete-thread-btn" data-id="${thread.id}" style="color: var(--color-status-err);">Delete</button>
          </div>
        </div>
      `;

      card.querySelector(".archive-thread-btn").addEventListener("click", async () => {
        try {
          await client.agent.archiveThread(thread.id);
          recordCode(`// Archive agent thread
await client.agent.archiveThread("${thread.id}");`);
          showToast("Thread archived.");
          await loadAiStudio();
        } catch (e) {
          showToast(e.message, true);
        }
      });

      card.querySelector(".delete-thread-btn").addEventListener("click", async () => {
        try {
          await client.agent.deleteThread(thread.id);
          recordCode(`// Delete agent thread
await client.agent.deleteThread("${thread.id}");`);
          showToast("Thread deleted.");
          await loadAiStudio();
        } catch (e) {
          showToast(e.message, true);
        }
      });

      agentThreadsList.appendChild(card);
    });
  } catch (err) {
    agentThreadsList.innerHTML = `<div class="empty-state">Error loading threads: ${escapeHtml(err.message)}</div>`;
  }
}

async function handleAnalyzeResume() {
  const resumeId = aiTargetResumeSelect ? aiTargetResumeSelect.value : "res-001";
  if (!resumeId) {
    showToast("Please create or select a resume first.", true);
    return;
  }

  if (runAiAnalyzeBtn) {
    runAiAnalyzeBtn.disabled = true;
    runAiAnalyzeBtn.textContent = "...";
  }

  try {
    const analysis = await client.ai.analyzeResume(resumeId, "aip-001");
    recordCode(`// Analyze resume with configured AI provider
const analysis = await client.ai.analyzeResume("${resumeId}", "aip-001");
/*
Score: ${analysis.score || 94}
ATS Match: ${analysis.atsMatch || "95%"}
Tone: ${analysis.tone || "Technical"}
*/`);

    if (aiAnalysisResults) {
      aiAnalysisResults.innerHTML = `
        <div class="ai-metric-pills">
          <span class="ai-metric-pill success">Score: ${analysis.score || 94}/100</span>
          <span class="ai-metric-pill">ATS Match: ${analysis.atsMatch || "95%"}</span>
          <span class="ai-metric-pill">Tone: ${analysis.tone || "Technical"}</span>
        </div>
        <p style="margin-bottom: 8px;"><strong>Summary:</strong> ${escapeHtml(analysis.summary || "Strong quantifiable impact throughout.")}</p>
        <div style="font-size: 0.78rem;">
          <strong>Strengths:</strong>
          <ul style="margin: 4px 0 8px 16px;">
            ${(analysis.strengths || ["High quantifiable metrics", "Modern cloud-native stack"]).map(s => `<li>${escapeHtml(s)}</li>`).join("")}
          </ul>
          <strong>Recommendations:</strong>
          <ul style="margin: 4px 0 0 16px;">
            ${(analysis.recommendations || ["Highlight cross-functional architectural leadership"]).map(r => `<li>${escapeHtml(r)}</li>`).join("")}
          </ul>
        </div>
      `;
    }
  } catch (err) {
    showToast(`Analysis failed: ${err.message}`, true);
  } finally {
    if (runAiAnalyzeBtn) {
      runAiAnalyzeBtn.disabled = false;
      runAiAnalyzeBtn.textContent = t("aiAnalyzeBtn");
    }
  }
}

async function handleAiChat() {
  if (!aiChatInput) return;
  const prompt = aiChatInput.value.trim();
  if (!prompt) return;

  const userMsgEl = document.createElement("div");
  userMsgEl.className = "chat-msg user";
  userMsgEl.innerHTML = `<span class="chat-role">You</span> <span>${escapeHtml(prompt)}</span>`;
  aiChatHistory.appendChild(userMsgEl);
  aiChatInput.value = "";
  aiChatHistory.scrollTop = aiChatHistory.scrollHeight;

  try {
    const reply = await client.ai.chat({ prompt, resumeId: aiTargetResumeSelect ? aiTargetResumeSelect.value : undefined });
    recordCode(`// Request resume modification suggestion via AI chat
const response = await client.ai.chat({
  prompt: "${prompt}",
});`);

    const assistantMsgEl = document.createElement("div");
    assistantMsgEl.className = "chat-msg assistant";
    const content = reply && reply.content ? reply.content : (reply && reply.response ? reply.response : "Suggestions generated.");
    assistantMsgEl.innerHTML = `<span class="chat-role">AI</span> <span style="white-space: pre-wrap;">${escapeHtml(content)}</span>`;
    aiChatHistory.appendChild(assistantMsgEl);
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
  } catch (err) {
    showToast(`AI Chat error: ${err.message}`, true);
  }
}

async function handleCreateAgentThread() {
  try {
    const resumeId = aiTargetResumeSelect ? aiTargetResumeSelect.value : undefined;
    await client.agent.createThread({
      sourceResumeId: resumeId,
      aiProviderId: "aip-001",
    });
    recordCode(`// Create new autonomous agent thread
const thread = await client.agent.createThread({
  sourceResumeId: "${resumeId || "res-001"}",
});`);
    showToast(t("toastThreadCreated"));
    await loadAiStudio();
  } catch (err) {
    showToast(`Failed to create thread: ${err.message}`, true);
  }
}

// ==========================================
// 3. Authentication & Account (client.auth)
// ==========================================
async function loadAuthData() {
  if (!authProvidersChips) return;
  try {
    const providers = await client.auth.listProviders();
    recordCode(`// List active authentication providers
const providers = await client.auth.listProviders();
// ${JSON.stringify(providers)}`);

    authProvidersChips.innerHTML = providers.map(p => `
      <span class="pill status-pill active" style="text-transform: uppercase;">${escapeHtml(p)}</span>
    `).join("");
  } catch (_) {
    authProvidersChips.innerHTML = `<span class="pill status-pill">email</span>`;
  }
}

async function handleExportAccount() {
  if (!authExportBlock) return;
  authExportBlock.textContent = "Exporting user account...";
  try {
    const data = await client.auth.exportAccount();
    recordCode(`// Export user account data
const accountData = await client.auth.exportAccount();`);
    authExportBlock.textContent = JSON.stringify(data, null, 2);
    showToast("Account data exported successfully!");
  } catch (err) {
    authExportBlock.textContent = `Error: ${err.message}`;
    showToast(`Export failed: ${err.message}`, true);
  }
}

// Setup Event Listeners
function setupEvents() {
  // Config Apply & Links
  baseUrlInput.addEventListener("input", () => {
    updateBaseUrlLinks();
    saveCredentials();
  });
  baseUrlInput.addEventListener("change", () => {
    updateBaseUrlLinks();
    saveCredentials();
  });
  apiKeyInput.addEventListener("input", saveCredentials);
  apiKeyInput.addEventListener("change", saveCredentials);

  applyConfigBtn.addEventListener("click", () => {
    saveCredentials();
    initClient();
    loadResumes();
    loadApplications();
    loadStatistics();
    showToast(t("toastConnectionSuccess"));
  });

  sandboxToggle.addEventListener("change", () => {
    saveCredentials();
    initClient();
    loadResumes();
    loadApplications();
    loadStatistics();
    if (!sandboxToggle.checked && !apiKeyInput.value.trim()) {
      showToast(t("toastSwitchedLive"));
    }
  });

  // Tab Navigation
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");

      // Trigger respective refresh
      if (btn.dataset.tab === "resumesTab") loadResumes();
      else if (btn.dataset.tab === "applicationsTab") loadApplications();
      else if (btn.dataset.tab === "aiProvidersTab") loadAiProviders();
      else if (btn.dataset.tab === "aiTab") loadAiStudio();
      else if (btn.dataset.tab === "statsTab") {
        loadStatistics();
        loadAuthData();
      }
    });
  });

  // Refresh Buttons
  document.getElementById("refreshResumesBtn").addEventListener("click", loadResumes);
  document.getElementById("refreshAppsBtn").addEventListener("click", loadApplications);
  document.getElementById("refreshStatsBtn").addEventListener("click", () => {
    loadStatistics();
    loadAuthData();
  });
  if (refreshAiProvidersBtn) refreshAiProvidersBtn.addEventListener("click", loadAiProviders);

  // Modals Open/Close
  document.getElementById("openCreateResumeModalBtn").addEventListener("click", () => {
    createResumeModal.classList.add("open");
  });
  document.getElementById("openCreateAppModalBtn").addEventListener("click", () => {
    createAppModal.classList.add("open");
  });
  if (openCreateAiProviderModalBtn && createAiProviderModal) {
    openCreateAiProviderModalBtn.addEventListener("click", () => {
      createAiProviderModal.classList.add("open");
    });
  }
  if (openSettingsModalBtn && settingsModal) {
    openSettingsModalBtn.addEventListener("click", () => {
      settingsModal.classList.add("open");
    });
  }

  // AI & Agent Studio Events
  if (runAiAnalyzeBtn) runAiAnalyzeBtn.addEventListener("click", handleAnalyzeResume);
  if (sendAiChatBtn) sendAiChatBtn.addEventListener("click", handleAiChat);
  if (aiChatInput) {
    aiChatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAiChat();
    });
  }
  if (newAgentThreadBtn) newAgentThreadBtn.addEventListener("click", handleCreateAgentThread);

  // Auth Events
  if (exportAccountBtn) exportAccountBtn.addEventListener("click", handleExportAccount);

  // Theme selection handler
  function handleThemeChange(theme) {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const radio = document.querySelector(`input[name="themeSelect"][value="${theme}"]`);
    if (radio) radio.checked = true;
  }

  document.querySelectorAll('input[name="themeSelect"]').forEach((radio) => {
    radio.addEventListener("change", (e) => handleThemeChange(e.target.value));
    radio.addEventListener("input", (e) => handleThemeChange(e.target.value));
  });

  // Language selection handler
  function handleLangChange(lang) {
    applyLanguage(lang);
    const radio = document.querySelector(`input[name="langSelect"][value="${lang}"]`);
    if (radio) radio.checked = true;

    if (sandboxToggle.checked) {
      modeText.textContent = t("sandboxBadge");
    } else {
      modeText.textContent = t("liveBadge");
    }
    loadResumes();
    loadApplications();
  }

  document.querySelectorAll('input[name="langSelect"]').forEach((radio) => {
    radio.addEventListener("change", (e) => handleLangChange(e.target.value));
    radio.addEventListener("input", (e) => handleLangChange(e.target.value));
  });

  // Direct option card click handler
  document.querySelectorAll('.theme-options .theme-option, .lang-options .theme-option').forEach((card) => {
    card.addEventListener("click", (e) => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        if (radio.name === "langSelect") {
          handleLangChange(radio.value);
        } else if (radio.name === "themeSelect") {
          handleThemeChange(radio.value);
        }
      }
    });
  });

  // Modal close buttons and backdrop clicks
  document.querySelectorAll(".closeModalBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal-backdrop").forEach((m) => m.classList.remove("open"));
    });
  });

  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove("open");
      }
    });
  });

  // Keyboard Shortcuts (Escape to close modals, Cmd+, to open settings)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop").forEach((m) => m.classList.remove("open"));
    } else if ((e.metaKey || e.ctrlKey) && e.key === ",") {
      e.preventDefault();
      if (settingsModal) {
        settingsModal.classList.toggle("open");
      }
    }
  });

  // Create Resume Submit
  document.getElementById("submitCreateResumeBtn").addEventListener("click", async () => {
    const title = document.getElementById("newResumeTitle").value.trim();
    const slug = document.getElementById("newResumeSlug").value.trim();
    const headline = document.getElementById("newResumeHeadline").value.trim();

    if (!title) {
      showToast(t("toastTitleRequired"), true);
      return;
    }

    try {
      const payload = {
        title,
        ...(slug ? { slug } : {}),
        basics: {
          name: title.split("-")[0].trim(),
          headline: headline || "Software Professional",
        },
      };

      await client.resumes.create(payload);
      showToast(t("toastResumeCreated"));
      createResumeModal.classList.remove("open");
      document.getElementById("newResumeTitle").value = "";
      document.getElementById("newResumeSlug").value = "";
      document.getElementById("newResumeHeadline").value = "";

      recordCode(`// Create new resume
const newResume = await client.resumes.create(${JSON.stringify(payload, null, 2)});`);

      await loadResumes();
    } catch (error) {
      showToast(`${t("toastErrorCreatingResume")} ${error.message}`, true);
    }
  });

  // Create Application Submit
  document.getElementById("submitCreateAppBtn").addEventListener("click", async () => {
    const company = document.getElementById("newAppCompany").value.trim();
    const position = document.getElementById("newAppPosition").value.trim();
    const stage = document.getElementById("newAppStage").value;
    const summary = document.getElementById("newAppSummary").value.trim();

    if (!company || !position) {
      showToast(t("toastCompanyRequired"), true);
      return;
    }

    try {
      const payload = { company, position, stage, summary };
      await client.applications.create(payload);
      showToast(t("toastAppLogged"));
      createAppModal.classList.remove("open");
      document.getElementById("newAppCompany").value = "";
      document.getElementById("newAppPosition").value = "";
      document.getElementById("newAppSummary").value = "";

      recordCode(`// Log new job application
const app = await client.applications.create(${JSON.stringify(payload, null, 2)});`);

      await loadApplications();
    } catch (error) {
      showToast(`${t("toastErrorLoggingApp")} ${error.message}`, true);
    }
  });

  // Create AI Provider Submit
  if (submitCreateAiProviderBtn) {
    submitCreateAiProviderBtn.addEventListener("click", async () => {
      const label = document.getElementById("newProviderLabel").value.trim();
      const model = document.getElementById("newProviderModel").value.trim();
      const apiKey = document.getElementById("newProviderApiKey").value.trim();
      const baseURL = document.getElementById("newProviderBaseUrl").value.trim();

      if (!label || !model) {
        showToast("Provider label and model identifier are required.", true);
        return;
      }

      try {
        await client.aiProviders.create({
          label,
          model,
          apiKey: apiKey || "dummy-key",
          ...(baseURL ? { baseURL } : {}),
        });
        showToast(t("toastProviderAdded"));
        createAiProviderModal.classList.remove("open");
        document.getElementById("newProviderLabel").value = "";
        document.getElementById("newProviderModel").value = "";
        document.getElementById("newProviderApiKey").value = "";
        document.getElementById("newProviderBaseUrl").value = "";
        await loadAiProviders();
      } catch (err) {
        showToast(`Error creating AI provider: ${err.message}`, true);
      }
    });
  }

  // Copy Code Snippet
  document.getElementById("copyCodeBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(lastExecutedCode.textContent).then(() => {
      showToast(t("toastCopied"));
    });
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Start
initLanguage();
initTheme();
initSavedSettings();
initClient();
setupEvents();
loadResumes();
loadApplications();
loadAiProviders();
loadStatistics();
loadAuthData();
