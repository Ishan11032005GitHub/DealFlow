import { db } from "../config/db.js";
import crypto from "crypto";
import { generateSummaryFromPitch } from "../services/ai.service.js";

/* ================= CREATE ================= */
export function createSubmission(req, res) {
  const {
    founderName,
    startupName,
    pitch,
    sector,
    stage,
    traction,
  } = req.body;

  if (!founderName || !startupName || !pitch || !sector || !stage) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const id = crypto.randomUUID();

  db.prepare(`
    INSERT INTO submissions (
      id, founder_name, startup_name, pitch, sector, stage, traction
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    founderName,
    startupName,
    pitch,
    sector,
    stage,
    traction || ""
  );

  res.status(201).json({ id });
}

/* ================= LIST (FIXED) ================= */
export function listSubmissions(req, res) {
  const { sector, stage, status, q } = req.query;

  let sql = `
    SELECT
      id,
      founder_name AS founderName,
      startup_name AS startupName,
      pitch AS pitchDescription,
      sector,
      stage,
      traction,
      status,
      reviewer_notes AS reviewerNotes,
      created_at AS createdAt
    FROM submissions
    WHERE 1 = 1
  `;

  const params = [];

  if (sector) {
    sql += " AND sector = ?";
    params.push(sector);
  }

  if (stage) {
    sql += " AND stage = ?";
    params.push(stage);
  }

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (q) {
    sql += " AND (LOWER(founder_name) LIKE ? OR LOWER(startup_name) LIKE ?)";
    const like = `%${q.toLowerCase()}%`;
    params.push(like, like);
  }

  sql += " ORDER BY created_at DESC";

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
}

/* ================= GET ONE ================= */
export function getSubmission(req, res) {
  const row = db.prepare(`
    SELECT
      id,
      founder_name AS founderName,
      startup_name AS startupName,
      pitch AS pitchDescription,
      sector,
      stage,
      traction,
      status,
      reviewer_notes AS reviewerNotes,
      ai_summary AS aiSummary,
      ai_generated_at AS generatedAt,
      created_at AS createdAt
    FROM submissions
    WHERE id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: "Submission not found" });

  if (row.aiSummary) {
    row.aiSummary = JSON.parse(row.aiSummary);
    row.aiSummary.generatedAt = row.generatedAt;
  }

  res.json(row);
}

/* ================= PATCH ================= */
export function patchSubmission(req, res) {
  const { id } = req.params;
  const updates = req.body;

  const allowed = {
    status: "status",
    reviewerNotes: "reviewer_notes",
  };

  const fields = Object.keys(updates).filter(k => allowed[k]);

  if (!fields.length) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fields.map(k => `${allowed[k]} = ?`).join(", ");
  const values = fields.map(k => updates[k]);

  db.prepare(
    `UPDATE submissions SET ${setClause} WHERE id = ?`
  ).run(...values, id);

  return getSubmission(req, res);
}

/* ================= AI SUMMARY ================= */
export async function generateAiSummary(req, res) {
  const { id } = req.params;

  const row = db
    .prepare(`SELECT pitch FROM submissions WHERE id = ?`)
    .get(id);

  if (!row) {
    return res.status(404).json({ error: "Submission not found" });
  }

  try {
    const summary = await generateSummaryFromPitch(row.pitch);

    db.prepare(`
      UPDATE submissions
      SET ai_summary = ?, ai_generated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(summary), id);

    return getSubmission(req, res);
  } catch (err) {
    console.error("AI summary failed:", err);
    res.status(500).json({ error: "AI summary generation failed" });
  }
}
