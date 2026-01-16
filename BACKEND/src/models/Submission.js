import mongoose from "mongoose";

const sectorEnum = [
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

const stageEnum = ["Idea", "MVP", "Early Revenue", "Growth", "Enterprise"];

const statusEnum = ["NEW", "REVIEWED", "PASSED"];

const AiSummarySchema = new mongoose.Schema(
  {
    bullets: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    model: { type: String, default: "" },
    generatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const SubmissionSchema = new mongoose.Schema(
  {
    founderName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    startupName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    pitchDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 5000,
    },
    sector: {
      type: String,
      required: true,
      enum: sectorEnum,
    },
    stage: {
      type: String,
      required: true,
      enum: stageEnum,
    },
    traction: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: statusEnum,
      default: "NEW",
      index: true,
    },
    reviewerNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    aiSummary: {
      type: AiSummarySchema,
      default: null,
    },
  },
  { timestamps: true }
);

// Useful indexes for dashboard filters
SubmissionSchema.index({ sector: 1 });
SubmissionSchema.index({ stage: 1 });
SubmissionSchema.index({ createdAt: -1 });
SubmissionSchema.index({ startupName: "text", founderName: "text" });

export const Submission = mongoose.model("Submission", SubmissionSchema);
export const enums = { sectorEnum, stageEnum, statusEnum };
