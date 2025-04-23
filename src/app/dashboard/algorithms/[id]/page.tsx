import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DeleteAlgorithmButton } from "@/components/algorithms/delete-algorithm-button";

export default async function AlgorithmPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/login");
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{algorithm.name}</h1>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/algorithms/${algorithm.id}/edit`}>
            <Button variant="outline">编辑</Button>
          </Link>
          <DeleteAlgorithmButton id={algorithm.id} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">描述</h2>
          <p className="mt-2 text-gray-600">{algorithm.description}</p>
        </div>
        {algorithm.price && (
          <div>
            <h2 className="text-lg font-medium">价格</h2>
            <p className="mt-2 text-gray-600">¥{algorithm.price.toFixed(2)}</p>
          </div>
        )}
        {algorithm.api_endpoint && (
          <div>
            <h2 className="text-lg font-medium">API端点</h2>
            <p className="mt-2 text-gray-600">{algorithm.api_endpoint}</p>
          </div>
        )}
        {algorithm.code && (
          <div>
            <h2 className="text-lg font-medium">代码</h2>
            <pre className="mt-2 rounded-lg bg-gray-100 p-4 font-mono text-sm">
              {algorithm.code}
            </pre>
          </div>
        )}
        <div>
          <h2 className="text-lg font-medium">创建信息</h2>
          <p className="mt-2 text-sm text-gray-600">
            创建时间：{formatDate(algorithm.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
