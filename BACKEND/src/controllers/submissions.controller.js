import { Submission, enums } from "../models/Submission.js";
import { generateSummaryFromPitch } from "../services/ai.service.js";

export async function createSubmission(req, res, next) {
  try {
    const payload = sanitizeCreate(req.body || {});
    const doc = await Submission.create(payload);
    return res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
}

export async function listSubmissions(req, res, next) {
  try {
    const { sector, stage, status, q, limit, page, sort } = req.query;

    const filter = {};
    if (sector) filter.sector = sector;
    if (stage) filter.stage = stage;
    if (status) filter.status = status;

    const mongoQuery = Submission.find(filter);

    // search (founder/startup)
    if (q && String(q).trim()) {
      const s = String(q).trim();
      mongoQuery.find({
        ...filter,
        $or: [
          { founderName: { $regex: s, $options: "i" } },
          { startupName: { $regex: s, $options: "i" } },
        ],
      });
    }

    const lim = clampInt(limit, 1, 200, 100);
    const pg = clampInt(page, 1, 100000, 1);
    const skip = (pg - 1) * lim;

    const sortObj = parseSort(sort || "-createdAt");

    const items = await mongoQuery
      .sort(sortObj)
      .skip(skip)
      .limit(lim)
      .lean();

    // Your frontend supports either [] or {items: []}. We return {items: []}.
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function getSubmission(req, res, next) {
  try {
    const doc = await Submission.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
}

export async function patchSubmission(req, res, next) {
  try {
    const patch = sanitizePatch(req.body || {});
    const doc = await Submission.findByIdAndUpdate(
      req.params.id,
      { $set: patch },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
}

export async function generateAiSummary(req, res, next) {
  try {
    const doc = await Submission.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const pitch = doc.pitchDescription;
    const summary = await generateSummaryFromPitch(pitch);

    doc.aiSummary = {
      bullets: summary.bullets,
      strengths: summary.strengths,
      risks: summary.risks,
      model: summary.model,
      generatedAt: new Date(),
    };

    await doc.save();
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
}

/* ---------------- helpers ---------------- */

function sanitizeCreate(b) {
  const cleaned = {
    founderName: String(b.founderName || "").trim(),
    startupName: String(b.startupName || "").trim(),
    pitchDescription: String(b.pitchDescription || "").trim(),
    sector: String(b.sector || "").trim(),
    stage: String(b.stage || "").trim(),
    traction: String(b.traction || "").trim(),
    // status is not set by public create endpoint
  };

  // early validation (fast fail with clean message)
  const errors = [];
  if (cleaned.founderName.length < 2) errors.push("founderName min 2 chars");
  if (cleaned.startupName.length < 2) errors.push("startupName min 2 chars");
  if (cleaned.pitchDescription.length < 30) errors.push("pitchDescription min 30 chars");
  if (!enums.sectorEnum.includes(cleaned.sector)) errors.push("sector invalid");
  if (!enums.stageEnum.includes(cleaned.stage)) errors.push("stage invalid");
  if (cleaned.traction.length < 5) errors.push("traction min 5 chars");

  if (errors.length) {
    const err = new Error(errors.join(", "));
    err.status = 400;
    throw err;
  }

  return cleaned;
}

function sanitizePatch(b) {
  const patch = {};
  if (b.status !== undefined) {
    const s = String(b.status || "").trim().toUpperCase();
    if (!enums.statusEnum.includes(s)) {
      const err = new Error("status invalid");
      err.status = 400;
      throw err;
    }
    patch.status = s;
  }

  if (b.reviewerNotes !== undefined) {
    const n = String(b.reviewerNotes || "");
    if (n.length > 5000) {
      const err = new Error("reviewerNotes too long");
      err.status = 400;
      throw err;
    }
    patch.reviewerNotes = n;
  }

  // Disallow arbitrary patching to prevent accidental overreach
  const allowed = ["status", "reviewerNotes"];
  const extra = Object.keys(b).filter((k) => !allowed.includes(k));
  if (extra.length) {
    // ignore extras silently OR hard fail; hard fail keeps things disciplined
    const err = new Error(`Unsupported fields: ${extra.join(", ")}`);
    err.status = 400;
    throw err;
  }

  return patch;
}

function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function parseSort(sortStr) {
  // Supports "-createdAt" or "createdAt"
  const s = String(sortStr || "").trim();
  if (!s) return { createdAt: -1 };
  if (s.startsWith("-")) return { [s.slice(1)]: -1 };
  return { [s]: 1 };
}
