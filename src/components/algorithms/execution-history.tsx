"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ExecutionHistoryProps {
  algorithmId?: string;
}

interface Execution {
  id: string;
  algorithm_id: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  execution_time: string;
  algorithms: {
    name: string;
  };
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

export default function ExecutionHistory({
  algorithmId,
}: ExecutionHistoryProps) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 10,
    offset: 0,
  });

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/algorithms/executions?limit=${pagination.limit}&offset=${pagination.offset}`;
      if (algorithmId) {
        url += `&algorithm_id=${algorithmId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "获取执行历史失败");
      }

      const data = await response.json();
      setExecutions(data.executions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [pagination.offset, algorithmId]);

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination({
        ...pagination,
        offset: Math.max(0, pagination.offset - pagination.limit),
      });
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>算法执行历史</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>加载中...</p>
          </div>
        ) : executions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">暂无执行记录</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {!algorithmId && <TableHead>算法名称</TableHead>}
                  <TableHead>输入数据</TableHead>
                  <TableHead>执行结果</TableHead>
                  <TableHead>执行时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((execution) => (
                  <TableRow key={execution.id}>
                    {!algorithmId && (
                      <TableCell>{execution.algorithms.name}</TableCell>
                    )}
                    <TableCell className="max-w-xs truncate">
                      {JSON.stringify(execution.input)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {JSON.stringify(execution.result)}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(execution.execution_time),
                        "yyyy-MM-dd HH:mm:ss"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                显示 {pagination.offset + 1}-
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}
                条（共 {pagination.total} 条）
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={
                    pagination.offset + pagination.limit >= pagination.total
                  }
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
