import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // 如果从服务器组件调用，可能会失败
            // 中间件会处理会话刷新
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete(name, options);
          } catch (error) {
            // 如果从服务器组件调用，可能会失败
            // 中间件会处理会话刷新
          }
        },
      },
    }
  );
}
