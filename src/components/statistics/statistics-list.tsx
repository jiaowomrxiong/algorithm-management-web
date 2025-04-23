import { Database } from "@/types/database";
import { formatDate } from "@/lib/utils";

type Statistics = Database["public"]["Tables"]["algorithm_calls"]["Row"] & {
  algorithms: {
    id: string;
    name: string;
    description: string;
  };
};

interface StatisticsListProps {
  statistics: Statistics[];
}

export function StatisticsList({ statistics }: StatisticsListProps) {
  return (
    <div className="grid gap-4">
      {statistics.map((stat) => (
        <div key={stat.id} className="rounded-lg border p-4">
          <div className="space-y-1">
            <h3 className="font-medium">{stat.algorithms.name}</h3>
            <p className="text-sm text-gray-500">
              {stat.algorithms.description}
            </p>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>执行时间：{stat.execution_time}ms</p>
              <p>调用时间：{formatDate(stat.created_at)}</p>
              {stat.input && (
                <div>
                  <p className="font-medium">输入参数：</p>
                  <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                    {JSON.stringify(stat.input, null, 2)}
                  </pre>
                </div>
              )}
              {stat.output && (
                <div>
                  <p className="font-medium">输出结果：</p>
                  <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                    {JSON.stringify(stat.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {statistics.length === 0 && (
        <div className="text-center text-gray-500">暂无调用记录</div>
      )}
    </div>
  );
}
