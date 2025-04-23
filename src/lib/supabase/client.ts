import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 使用与中间件相同的cookie名称
export const SUPABASE_AUTH_COOKIE = "sb-auth-token";

// 导出一个默认的客户端实例
export const supabase = createClient();
