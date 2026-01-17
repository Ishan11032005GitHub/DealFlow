import Database from "better-sqlite3";

const db = new Database("dealflow.db");

console.log("Running migration...");

try {
  db.prepare(`
    ALTER TABLE submissions
    ADD COLUMN ai_summary TEXT
  `).run();
  console.log("✅ ai_summary column added");
} catch (e) {
  console.log("ℹ️ ai_summary column already exists");
}

try {
  db.prepare(`
    ALTER TABLE submissions
    ADD COLUMN ai_generated_at DATETIME
  `).run();
  console.log("✅ ai_generated_at column added");
} catch (e) {
  console.log("ℹ️ ai_generated_at column already exists");
}

console.log("🎉 Migration complete");
