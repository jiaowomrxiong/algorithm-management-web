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

async function testTables() {
  try {
    // 测试用户表
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (usersError) {
      console.error("Error querying users table:", usersError.message);
    } else {
      console.log("Users table exists and is accessible");
    }

    // 测试算法表
    const { data: algorithms, error: algorithmsError } = await supabase
      .from("algorithms")
      .select("*")
      .limit(1);

    if (algorithmsError) {
      console.error(
        "Error querying algorithms table:",
        algorithmsError.message
      );
    } else {
      console.log("Algorithms table exists and is accessible");
    }

    // 测试订阅表
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("subscriptions")
      .select("*")
      .limit(1);

    if (subscriptionsError) {
      console.error(
        "Error querying subscriptions table:",
        subscriptionsError.message
      );
    } else {
      console.log("Subscriptions table exists and is accessible");
    }

    // 测试调用记录表
    const { data: calls, error: callsError } = await supabase
      .from("algorithm_calls")
      .select("*")
      .limit(1);

    if (callsError) {
      console.error(
        "Error querying algorithm_calls table:",
        callsError.message
      );
    } else {
      console.log("Algorithm calls table exists and is accessible");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testTables();
