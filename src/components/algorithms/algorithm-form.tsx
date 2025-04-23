"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";

type AlgorithmFormProps = {
  initialData?: {
    id?: number;
    name?: string;
    description?: string;
    api_endpoint?: string;
    code?: string;
    price?: number;
  };
};

export function AlgorithmForm({ initialData }: AlgorithmFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [apiEndpoint, setApiEndpoint] = useState(
    initialData?.api_endpoint || "/api/algorithms/"
  );
  const [code, setCode] = useState(
    initialData?.code ||
      "// 在此处编写您的算法代码\n\nasync function process(input) {\n  // 处理输入数据\n  const result = {\n    success: true,\n    data: input,\n    message: '处理成功'\n  };\n  \n  return result;\n}"
  );
  const [price, setPrice] = useState(initialData?.price?.toString() || "0.05");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const algorithmData = {
        name,
        description,
        api_endpoint: apiEndpoint,
        code,
        price: parseFloat(price),
        status: "draft", // 默认为草稿状态
      };

      // 创建或更新算法
      if (initialData?.id) {
        // 更新现有算法
        await supabase
          .from("algorithms")
          .update(algorithmData)
          .eq("id", initialData.id);
      } else {
        // 创建新算法
        await supabase.from("algorithms").insert([algorithmData]);
      }

      // 重定向到算法列表页面
      router.push("/dashboard/algorithms");
      router.refresh();
    } catch (error) {
      console.error("保存算法时发生错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="code">算法代码</TabsTrigger>
          <TabsTrigger value="pricing">定价信息</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">算法名称</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入算法名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">算法描述</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述算法的功能和特点"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_endpoint">API 端点</Label>
                <Input
                  id="api_endpoint"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="/api/algorithms/example"
                  required
                />
                <p className="text-xs text-gray-500">
                  算法的API访问路径，必须以/api/algorithms/开头
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">算法代码</Label>
                <div className="border rounded-md">
                  <Textarea
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono h-80"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  请编写您的算法代码。该函数将在API调用时执行。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">单次调用价格 (¥)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  设置每次API调用的价格，以人民币计价
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-end gap-2 border rounded-md p-4 bg-gray-50">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/algorithms")}
        >
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存算法
            </>
          )}
        </Button>
      </CardFooter>
    </form>
  );
}
