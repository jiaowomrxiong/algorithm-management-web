import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  // 从 searchParams 获取重定向路径
  const redirectTo = (await searchParams)?.redirect || "/dashboard";

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            登录到您的账户
          </h1>
          <p className="text-sm text-muted-foreground">
            输入您的邮箱和密码登录
          </p>
        </div>
        <AuthForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
