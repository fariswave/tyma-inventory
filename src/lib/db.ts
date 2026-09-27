import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "database", "database.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Export database instance
export default db;
