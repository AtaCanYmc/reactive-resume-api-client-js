/**
 * Reactive Resume Web Demo Application.
 *
 * Uses the reactive-resume-api-client-js SDK directly in the browser via ES modules.
 */

import { RxResumeClient } from "./vendor/reactive-resume-api-client.js";
import { createMockFetch } from "./mock-data.js";

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
  const baseUrl = baseUrlInput.value.trim() || "https://rxresu.me";
  const apiKey = apiKeyInput.value.trim();
  const isSandbox = sandboxToggle.checked;

  if (isSandbox) {
    modeBadge.className = "mode-badge sandbox";
    modeText.textContent = "Sandbox Mode (Mock Data)";
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
    modeText.textContent = "Live Instance Mode";
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
        No resumes found. Click "+ Create Resume" to get started.
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
            Updated: ${new Date(resume.updatedAt || resume.updated_at || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div class="resume-actions">
          <button class="btn btn-sm btn-primary download-pdf-btn" data-id="${resume.id}" data-name="${escapeHtml(resume.name)}">
            Download PDF
          </button>
          <button class="btn btn-sm preview-pdf-btn" data-id="${resume.id}" data-name="${escapeHtml(resume.name)}">
            Preview
          </button>
          <button class="btn btn-sm btn-danger delete-resume-btn" data-id="${resume.id}">
            Delete
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
    showToast(`Error fetching resumes: ${error.message}`, true);
  }
}

// Download PDF
async function handleDownloadPdf(resumeId, resumeName) {
  try {
    showToast("Downloading compiled PDF...");
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

    showToast("PDF downloaded successfully!");
  } catch (error) {
    showToast(`Failed to download PDF: ${error.message}`, true);
  }
}

// Preview PDF
async function handlePreviewPdf(resumeId, resumeName) {
  try {
    showToast("Generating PDF preview...");
    const pdfBytes = await client.resumes.downloadPdf(resumeId);

    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    currentBlobUrl = URL.createObjectURL(blob);

    pdfModalTitle.textContent = `Preview: ${resumeName || "Resume"}`;
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
    showToast(`Failed to preview PDF: ${error.message}`, true);
  }
}

// Delete Resume
async function handleDeleteResume(resumeId) {
  if (!confirm("Are you sure you want to delete this resume?")) return;
  try {
    await client.resumes.delete(resumeId);
    showToast("Resume deleted successfully.");
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
          <button class="btn-icon delete-app-btn" data-id="${app.id}" title="Delete Application" style="width: 22px; height: 22px; font-size: 0.65rem;">✕</button>
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
    showToast(`Error fetching applications: ${error.message}`, true);
  }
}

// Delete Application
async function handleDeleteApp(appId) {
  try {
    await client.applications.delete(appId);
    showToast("Application removed.");
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

// Setup Event Listeners
function setupEvents() {
  // Config Apply
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
  document.querySelectorAll(".closeModalBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal-backdrop").forEach((m) => m.classList.remove("open"));
    });
  });

  // Create Resume Submit
  document.getElementById("submitCreateResumeBtn").addEventListener("click", async () => {
    const title = document.getElementById("newResumeTitle").value.trim();
    const slug = document.getElementById("newResumeSlug").value.trim();
    const headline = document.getElementById("newResumeHeadline").value.trim();

    if (!title) {
      showToast("Resume title is required.", true);
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
      showToast("Resume created successfully!");
      createResumeModal.classList.remove("open");
      document.getElementById("newResumeTitle").value = "";
      document.getElementById("newResumeSlug").value = "";
      document.getElementById("newResumeHeadline").value = "";

      recordCode(`// Create new resume
const newResume = await client.resumes.create(${JSON.stringify(payload, null, 2)});`);

      await loadResumes();
    } catch (error) {
      showToast(`Error creating resume: ${error.message}`, true);
    }
  });

  // Create Application Submit
  document.getElementById("submitCreateAppBtn").addEventListener("click", async () => {
    const company = document.getElementById("newAppCompany").value.trim();
    const position = document.getElementById("newAppPosition").value.trim();
    const stage = document.getElementById("newAppStage").value;
    const summary = document.getElementById("newAppSummary").value.trim();

    if (!company || !position) {
      showToast("Company and position are required.", true);
      return;
    }

    try {
      const payload = { company, position, stage, summary };
      await client.applications.create(payload);
      showToast("Application logged successfully!");
      createAppModal.classList.remove("open");
      document.getElementById("newAppCompany").value = "";
      document.getElementById("newAppPosition").value = "";
      document.getElementById("newAppSummary").value = "";

      recordCode(`// Log new job application
const app = await client.applications.create(${JSON.stringify(payload, null, 2)});`);

      await loadApplications();
    } catch (error) {
      showToast(`Error logging application: ${error.message}`, true);
    }
  });

  // Copy Code Snippet
  document.getElementById("copyCodeBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(lastExecutedCode.textContent).then(() => {
      showToast("Snippet copied to clipboard!");
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
initClient();
setupEvents();
loadResumes();
loadApplications();
loadStatistics();
