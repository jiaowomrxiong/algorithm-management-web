import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlgorithmForm } from "@/components/algorithms/algorithm-form";

export default async function EditAlgorithmPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // 检查用户是否是管理员
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: algorithm } = await supabase
    .from("algorithms")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!algorithm) {
    redirect("/dashboard/algorithms");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">编辑算法</h1>
        <p className="text-muted-foreground">修改算法信息</p>
      </div>
      <AlgorithmForm initialData={algorithm} />
    </div>
  );
}
