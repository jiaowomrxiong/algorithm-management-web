import { createClient } from "@/lib/supabase/server";
import { AlgorithmList } from "@/components/algorithms/algorithm-list";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function AlgorithmsPage() {
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

  const isAdmin = userData?.role === "admin";

  // 获取算法列表
  const { data: algorithms } = await supabase
    .from("algorithms")
    .select("*")
    .order("created_at", { ascending: false });

  // 样例算法数据，用于演示
  const sampleAlgorithms = [
    {
      id: 1,
      name: "图像分类算法",
      description:
        "基于卷积神经网络的图像分类算法，支持识别1000种常见物体。精度高达95%，适用于各类图像识别场景。",
      api_endpoint: "/api/algorithms/image-classification",
      price: 0.05,
      status: "active",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "文本情感分析",
      description:
        "基于BERT的文本情感分析算法，可以准确判断文本的情感倾向，支持中英文双语分析。",
      api_endpoint: "/api/algorithms/sentiment-analysis",
      price: 0.03,
      status: "active",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
    {
      id: 3,
      name: "人脸识别系统",
      description:
        "高精度人脸识别算法，支持人脸检测、特征点提取和身份匹配，适用于安防和身份验证场景。",
      api_endpoint: "/api/algorithms/face-recognition",
      price: 0.08,
      status: "draft",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">算法管理</h1>
          <p className="mt-1 text-gray-500">查看和管理可用的算法</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/algorithms/new">
            <Button className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>新建算法</span>
            </Button>
          </Link>
        )}
      </div>

      <AlgorithmList
        initialAlgorithms={algorithms?.length ? algorithms : sampleAlgorithms}
      />
    </div>
  );
}
