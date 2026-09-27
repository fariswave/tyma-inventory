import fs from "node:fs";
import path from "node:path";
import db from "@/lib/db";

function initDb() {
  try {
    const schemaPath = path.join(process.cwd(), "database", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("Menerapkan skema...");
    db.exec(schemaSql);
    console.log("Semua tabel berhasil dibuat!");
  } catch (error) {
    console.error("Gagal menerapkan skema:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

initDb();
