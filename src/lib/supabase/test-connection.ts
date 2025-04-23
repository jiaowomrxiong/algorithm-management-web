import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// 加载环境变量
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { error } = await supabase.from("users").select("count").single();
    if (error) {
      console.error("Error connecting to Supabase:", error.message);
      return;
    }
    console.log("Successfully connected to Supabase!");
  } catch (error) {
    console.error("Error:", error);
  }
}

testConnection();
