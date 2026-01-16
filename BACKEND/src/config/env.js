import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  ADMIN_USER: process.env.ADMIN_USER || "admin",
  ADMIN_PASS: process.env.ADMIN_PASS || "admin123",

  AI_PROVIDER: (process.env.AI_PROVIDER || "openai").toLowerCase(), // openai|openrouter
  AI_API_KEY: process.env.AI_API_KEY || "",
  AI_MODEL: process.env.AI_MODEL || "gpt-4o-mini",
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
};
