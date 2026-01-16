import { api, buildQuery } from "./client";

export const SECTORS = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "DevTools",
  "AI",
  "SaaS",
  "Consumer",
  "Climate",
  "Logistics",
  "Other",
];

export const STAGES = ["Idea", "MVP", "Early Revenue", "Growth", "Enterprise"];

export const STATUSES = ["NEW", "REVIEWED", "PASSED"];

export async function createSubmission(payload) {
  return api.post("/api/submissions", payload, { auth: false });
}

export async function listSubmissions(filters = {}) {
  const qs = buildQuery(filters);
  return api.get(`/api/submissions${qs}`, { auth: true });
}

export async function getSubmission(id) {
  return api.get(`/api/submissions/${id}`, { auth: true });
}

export async function updateSubmission(id, patch) {
  return api.patch(`/api/submissions/${id}`, patch, { auth: true });
}

export async function generateAiSummary(id) {
  return api.post(`/api/submissions/${id}/ai-summary`, {}, { auth: true });
}
