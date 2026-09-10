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
const testConnectionBtn = document.getElementById("testConnectionBtn");
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

// Theme Management
const THEME_STORAGE_KEY = "rx_theme_pref";

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

// Test API Connection
async function handleTestConnection() {
  if (!testConnectionBtn) return;
  const isSandbox = sandboxToggle.checked;
  const raw = baseUrlInput.value.trim() || "https://rxresu.me";
  const baseUrl = raw.replace(/\/+$/, "");

  testConnectionBtn.disabled = true;
  testConnectionBtn.textContent = t("testingConnection");

  const startTime = performance.now();

  if (isSandbox) {
    setTimeout(() => {
      const latency = Math.round(performance.now() - startTime + 10);
      showToast(`✓ ${t("toastSandboxActive")} ${latency}ms)`);
      testConnectionBtn.textContent = `✓ OK (${latency}ms)`;
      testConnectionBtn.disabled = false;
      setTimeout(() => {
        testConnectionBtn.textContent = t("testConnectionBtn");
      }, 3500);
    }, 120);
    return;
  }

  try {
    const apiKey = apiKeyInput.value.trim();
    const headers = { Accept: "application/json" };
    if (apiKey) {
      if (apiKey.startsWith("Bearer ") || apiKey.startsWith("bearer ")) {
        headers["Authorization"] = apiKey;
      } else {
        headers["x-api-key"] = apiKey;
      }
    }

    const res = await fetch(`${baseUrl}/api/openapi/flags`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(5000),
    });

    const latency = Math.round(performance.now() - startTime);

    if (res.ok || res.status === 401 || res.status === 403 || res.status === 404) {
      const statusNote = res.ok ? "200 OK" : `${res.status} ${res.statusText || "Active"}`;
      showToast(`✓ ${t("toastConnectionSuccess")} [${statusNote} — ${latency}ms]`);
      testConnectionBtn.textContent = `✓ ${statusNote} (${latency}ms)`;
      recordCode(`// Test connection to API Base URL
const res = await fetch("${baseUrl}/api/openapi/flags", {
  method: "GET",
  headers: ${JSON.stringify(headers)}
});
// Response: ${res.status} (${res.statusText}) in ${latency}ms`);
    } else {
      showToast(`${t("toastConnectionFailed")} HTTP ${res.status}`, true);
      testConnectionBtn.textContent = `✕ HTTP ${res.status}`;
    }
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    showToast(`${t("toastConnectionFailed")} ${error.message} (${latency}ms)`, true);
    testConnectionBtn.textContent = "✕ Failed";
  } finally {
    testConnectionBtn.disabled = false;
    setTimeout(() => {
      testConnectionBtn.textContent = t("testConnectionBtn");
    }, 4000);
  }
}

// Setup Event Listeners
function setupEvents() {
  // Config Apply & Links
  baseUrlInput.addEventListener("input", updateBaseUrlLinks);
  baseUrlInput.addEventListener("change", updateBaseUrlLinks);
  if (testConnectionBtn) {
    testConnectionBtn.addEventListener("click", handleTestConnection);
  }

  applyConfigBtn.addEventListener("click", () => {
    initClient();
    loadResumes();
    loadApplications();
    loadStatistics();
    showToast("Client connected successfully.");
  });

  sandboxToggle.addEventListener("change", () => {
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
      else if (btn.dataset.tab === "statsTab") loadStatistics();
    });
  });

  // Refresh Buttons
  document.getElementById("refreshResumesBtn").addEventListener("click", loadResumes);
  document.getElementById("refreshAppsBtn").addEventListener("click", loadApplications);
  document.getElementById("refreshStatsBtn").addEventListener("click", loadStatistics);

  // Modals Open/Close
  document.getElementById("openCreateResumeModalBtn").addEventListener("click", () => {
    createResumeModal.classList.add("open");
  });
  document.getElementById("openCreateAppModalBtn").addEventListener("click", () => {
    createAppModal.classList.add("open");
  });
  if (openSettingsModalBtn && settingsModal) {
    openSettingsModalBtn.addEventListener("click", () => {
      settingsModal.classList.add("open");
    });
  }

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
    if (testConnectionBtn && !testConnectionBtn.disabled) {
      testConnectionBtn.textContent = t("testConnectionBtn");
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
initClient();
setupEvents();
loadResumes();
loadApplications();
loadStatistics();
