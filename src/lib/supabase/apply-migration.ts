import { config } from "dotenv";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// 加载环境变量
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

async function executeSql(sql: string) {
  const headers = {
    "Content-Type": "application/json",
    apikey: supabaseKey as string,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: "resolution=merge-duplicates",
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: "POST",
    headers,
    body: sql,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return await response.json();
}

async function applyMigration() {
  try {
    // 读取迁移文件
    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "20240321000000_enhanced_schema.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // 执行整个迁移文件
    await executeSql(migrationSQL);
    console.log("Migration applied successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

applyMigration();
