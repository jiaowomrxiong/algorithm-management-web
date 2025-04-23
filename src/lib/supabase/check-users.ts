import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// 加载环境变量
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    // 检查 auth.users 表
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error getting auth users:", authError.message);
      return;
    }

    console.log("Auth users:", authUsers.users);

    // 检查 public.users 表
    const { data: publicUsers, error: publicError } = await supabase
      .from("users")
      .select("*");

    if (publicError) {
      console.error("Error getting public users:", publicError.message);
      return;
    }

    console.log("Public users:", publicUsers);
  } catch (error) {
    console.error("Error:", error);
  }
}

checkUsers();
