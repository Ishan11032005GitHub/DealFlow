import { Router } from "express";
import {
  createSubmission,
  listSubmissions,
  getSubmission,
  patchSubmission,
  generateAiSummary,
} from "../controllers/submissions.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", createSubmission);
router.get("/", requireAuth, listSubmissions);
router.get("/:id", requireAuth, getSubmission);
router.patch("/:id", requireAuth, patchSubmission);
router.post("/:id/ai-summary", requireAuth, generateAiSummary);

export default router;
