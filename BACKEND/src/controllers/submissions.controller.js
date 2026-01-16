import { db } from "../config/db.js";
import crypto from "crypto";
import { generateSummaryFromPitch } from "../services/ai.service.js";

/* CREATE */
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

/* LIST */
export function listSubmissions(req, res) {
  const rows = db
    .prepare(`SELECT * FROM submissions ORDER BY created_at DESC`)
    .all();

  res.json(rows);
}

/* GET ONE */
export function getSubmission(req, res) {
  const row = db
    .prepare(`SELECT * FROM submissions WHERE id = ?`)
    .get(req.params.id);

  if (!row) return res.status(404).json({ error: "Submission not found" });
  res.json(row);
}

/* PATCH */
export function patchSubmission(req, res) {
  const { id } = req.params;
  const updates = req.body;

  if (updates.reviewerNotes) {
    updates.reviewer_notes = updates.reviewerNotes;
    delete updates.reviewerNotes;
  }

  const allowed = ["status", "reviewer_notes"];
  const fields = Object.keys(updates).filter(k => allowed.includes(k));

  if (!fields.length) {
    return res.status(400).json({ error: "No valid fields" });
  }

  const setClause = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => updates[f]);

  db.prepare(`UPDATE submissions SET ${setClause} WHERE id = ?`)
    .run(...values, id);

  const updated = db.prepare(`SELECT * FROM submissions WHERE id = ?`).get(id);
  res.json(updated);
}

/* AI SUMMARY */
export async function generateAiSummary(req, res) {
  const { id } = req.params;

  const row = db.prepare(`SELECT pitch FROM submissions WHERE id = ?`).get(id);
  if (!row) return res.status(404).json({ error: "Not found" });

  const summary = await generateSummaryFromPitch(row.pitch);

  db.prepare(`
    UPDATE submissions SET ai_summary = ? WHERE id = ?
  `).run(JSON.stringify(summary), id);

  const updated = db.prepare(`SELECT * FROM submissions WHERE id = ?`).get(id);
  updated.aiSummary = summary;

  res.json(updated);
}
