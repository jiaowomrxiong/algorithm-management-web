import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlgorithmForm } from "@/components/algorithms/algorithm-form";

export default async function NewAlgorithmPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 检查用户是否是管理员
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">新建算法</h1>
        <p className="mt-1 text-gray-500">创建新的算法并定义其参数</p>
      </div>
      <AlgorithmForm />
    </div>
  );
}
