import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve("dealflow.db");
export const db = new Database(dbPath);

export function initDB() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      founder_name TEXT NOT NULL,
      startup_name TEXT NOT NULL,
      pitch TEXT NOT NULL,
      sector TEXT NOT NULL,
      stage TEXT NOT NULL,
      traction TEXT,
      status TEXT DEFAULT 'NEW',
      reviewer_notes TEXT,
      ai_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  console.log("✅ SQLite DB initialized");
}
