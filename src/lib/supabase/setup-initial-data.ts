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

async function setupInitialData() {
  try {
    // 获取管理员用户
    const { data: adminUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "super_admin")
      .single();

    if (userError) {
      console.error("Error getting admin user:", userError.message);
      return;
    }

    if (!adminUser) {
      console.error("No admin user found");
      return;
    }

    console.log("Found admin user:", adminUser.id);

    // 创建示例算法
    const { error: algorithmError } = await supabase.from("algorithms").insert([
      {
        name: "图像分类算法",
        description: "使用深度学习模型对图像进行分类",
        code: 'def classify_image(image):\n    # 示例代码\n    return "cat"',
        price: 99.99,
        api_endpoint: "/api/algorithms/image-classification",
        created_by: adminUser.id,
      },
      {
        name: "文本情感分析",
        description: "分析文本的情感倾向（积极/消极）",
        code: 'def analyze_sentiment(text):\n    # 示例代码\n    return "positive"',
        price: 49.99,
        api_endpoint: "/api/algorithms/sentiment-analysis",
        created_by: adminUser.id,
      },
    ]);

    if (algorithmError) {
      console.error(
        "Error creating sample algorithms:",
        algorithmError.message
      );
      return;
    }

    console.log("Sample algorithms created successfully");
  } catch (error) {
    console.error("Error:", error);
  }
}

setupInitialData();
