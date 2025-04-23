import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "./utils/supabase/middleware";

// 需要保护的路由
const protectedRoutes = [
  "/dashboard",
  "/settings",
  "/algorithms",
  "/subscriptions",
];

// 公开路由
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/verify",
  "/auth/callback",
];

// 管理员路由 - 注意：只有这些路径需要管理员权限
const adminRoutes = [
  "/dashboard/algorithms/new",
  "/dashboard/algorithms/:id/edit",
];

export async function middleware(request: NextRequest) {
  // 首先通过更新会话确保cookies是最新的
  const response = await updateSession(request);

  // 创建服务端客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name) {
          response.cookies.delete(name);
        },
      },
    }
  );

  try {
    // 尝试获取会话用户
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 获取当前路径
    const path = request.nextUrl.pathname;
    console.log("Middleware - Current path:", path);
    console.log("Middleware - User exists:", !!user);

    if (user) {
      console.log("Middleware - User details:", {
        id: user.id,
        email: user.email || "unknown",
      });
    }

    // 忽略对认证回调路径的检查，避免干扰授权流程
    if (path === "/auth/callback") {
      return response;
    }

    // 根路径重定向到仪表板
    if (path === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 如果用户已登录且访问登录/注册页面，重定向到仪表板
    if (user && publicRoutes.includes(path)) {
      console.log("Middleware - Redirecting to dashboard (user is logged in)");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 如果用户未登录且访问需要保护的路由，重定向到登录页面
    if (!user && protectedRoutes.some((route) => path.startsWith(route))) {
      console.log("Middleware - Redirecting to login (user is not logged in)");
      const redirectUrl = new URL("/auth/login", request.url);
      // 确保重定向 URL 是有效的
      if (path !== "/auth/login") {
        redirectUrl.searchParams.set("redirect", path);
      }
      return NextResponse.redirect(redirectUrl);
    }

    // 检查管理员权限 - 只检查明确需要管理员权限的路径
    if (
      user &&
      adminRoutes.some((route) => {
        // 处理通配符路径匹配
        if (route.includes(":id")) {
          const routeBase = route.split("/:id")[0];
          const pathParts = path.split("/");
          const routeParts = routeBase.split("/");

          // 检查路径前缀是否匹配，并且路径长度至少与路由基础部分加上一个ID部分一样长
          // 例如： /dashboard/algorithms/123/edit 应该匹配 /dashboard/algorithms/:id/edit
          if (pathParts.length >= routeParts.length + 1) {
            const isMatch = routeParts.every(
              (part, i) => part === pathParts[i]
            );
            return isMatch && pathParts[routeParts.length + 1] === "edit";
          }
        }
        return path === route; // 使用精确匹配，避免错误匹配子路径
      })
    ) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") {
        console.log(
          "Middleware - Redirecting to dashboard (user is not admin)"
        );
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // 返回增强的响应
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // 出错时重定向到登录页面
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，不包括以下内容:
     * - _next/static (静态文件)
     * - _next/image (图像优化文件)
     * - favicon.ico (网站图标)
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
    "/api/:path*",
  ],
};
