"use client";

import Link from "next/link";
import { Code, PenSquare, Trash2, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

// 算法类型定义
type Algorithm = {
  id: number;
  name: string;
  description: string;
  api_endpoint: string;
  price: number;
  status: "active" | "inactive" | "draft";
  created_at: string;
  updated_at: string;
};

export function AlgorithmList({
  initialAlgorithms = [],
}: {
  initialAlgorithms: Algorithm[];
}) {
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAlgorithms = initialAlgorithms.filter((algorithm) => {
    // 根据状态过滤
    if (filter !== "all" && algorithm.status !== filter) {
      return false;
    }

    // 根据搜索词过滤
    if (
      searchTerm &&
      !algorithm.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !algorithm.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  if (initialAlgorithms.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-gray-500">还没有任何算法</p>
        <Link href="/dashboard/algorithms/new" className="mt-2">
          <Button variant="outline" size="sm">
            创建第一个算法
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            全部算法
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            已上线
          </Button>
          <Button
            variant={filter === "draft" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("draft")}
          >
            草稿
          </Button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="搜索算法..."
            className="px-4 py-2 rounded-md border border-gray-300 w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filteredAlgorithms.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-gray-500">没有匹配的算法</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setFilter("all");
              setSearchTerm("");
            }}
          >
            清除筛选条件
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlgorithms.map((algorithm) => (
            <Card
              key={algorithm.id}
              className="flex flex-col hover:shadow-md transition-shadow duration-300"
            >
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-lg font-medium line-clamp-1">
                  {algorithm.name}
                </CardTitle>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium z-10 ${
                    algorithm.status === "active"
                      ? "bg-green-100 text-green-800"
                      : algorithm.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {algorithm.status === "active"
                    ? "已上线"
                    : algorithm.status === "draft"
                    ? "草稿"
                    : "已禁用"}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-4 flex items-center text-sm text-gray-500">
                  <Code className="mr-1 h-4 w-4 text-blue-500" />
                  <span className="truncate">{algorithm.api_endpoint}</span>
                </div>
                <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                  {algorithm.description}
                </p>
                <div className="flex justify-between text-sm">
                  <div className="text-green-600 font-medium">
                    ¥{algorithm.price.toFixed(2)}/调用
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    <span>{formatDate(algorithm.created_at)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 px-6 py-3">
                <div className="flex w-full justify-between gap-2">
                  <Link
                    href={`/dashboard/algorithms/${algorithm.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      size="sm"
                    >
                      <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      查看
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/algorithms/${algorithm.id}/edit`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full transition-all hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                      size="sm"
                    >
                      <PenSquare className="mr-2 h-3.5 w-3.5" />
                      编辑
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 transition-all hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    删除
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
