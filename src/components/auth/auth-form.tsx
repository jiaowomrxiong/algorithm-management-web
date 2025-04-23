"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Mail, Lock, Loader2 } from "lucide-react";

interface AuthFormProps {
  redirectTo?: string;
}

export function AuthForm({ redirectTo }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        console.log("开始登录流程...");
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("登录错误:", error);
          throw error;
        }

        console.log("登录成功，正在准备重定向...");

        // 等待短暂延迟确保会话已被保存
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 重定向到指定页面或仪表板
        const finalRedirect = redirectTo || "/dashboard";
        console.log("重定向到:", finalRedirect);
        window.location.href = finalRedirect;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        router.push("/auth/verify");
      }
    } catch (error: unknown) {
      console.error("Auth error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("登录过程中出现未知错误");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-center p-1">
        <div
          className={cn(
            "flex h-10 cursor-pointer items-center rounded-l-lg px-4 text-sm font-medium transition-colors",
            isLogin
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          onClick={() => setIsLogin(true)}
        >
          登录
        </div>
        <div
          className={cn(
            "flex h-10 cursor-pointer items-center rounded-r-lg px-4 text-sm font-medium transition-colors",
            !isLogin
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          onClick={() => setIsLogin(false)}
        >
          注册
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                placeholder="请输入邮箱地址"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                placeholder="请输入密码"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="text-sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLogin ? "登录中..." : "注册中..."}
            </>
          ) : isLogin ? (
            "登录"
          ) : (
            "注册"
          )}
        </Button>

        {isLogin && (
          <div className="text-center text-sm">
            <a href="#" className="text-primary hover:underline">
              忘记密码?
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
