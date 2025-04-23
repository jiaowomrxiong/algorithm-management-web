import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  BarChart,
  Code,
  Users,
  Activity,
  ArrowUpRight,
  Clock,
  Award,
  Settings,
} from "lucide-react";
import Link from "next/link";

// 组件：统计卡片
function StatCard({
  title,
  value,
  icon,
  change,
  changeType = "positive",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="rounded-full bg-blue-50 p-2 text-blue-600">{icon}</div>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold">{value}</p>
        {change && (
          <p
            className={`mt-1 flex items-center text-sm ${
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {changeType === "positive" && (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            )}
            {change}
          </p>
        )}
      </div>
    </div>
  );
}

// 组件：活动记录
function ActivityItem({
  title,
  time,
  icon,
  description,
}: {
  title: string;
  time: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="flex gap-4 border-b border-gray-100 py-4">
      <div className="rounded-full bg-blue-50 p-2 text-blue-600">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{title}</h4>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 这里将来可以加入从数据库获取真实数据的逻辑
  // 现在使用示例数据
  const sampleActivities = [
    {
      id: 1,
      title: "图像分类算法更新",
      time: "30分钟前",
      icon: <Code className="h-4 w-4" />,
      description: "图像分类算法V2.0版本发布，提高了15%的识别准确率",
    },
    {
      id: 2,
      title: "新用户注册",
      time: "2小时前",
      icon: <Users className="h-4 w-4" />,
      description: "3名新用户加入了平台",
    },
    {
      id: 3,
      title: "系统维护通知",
      time: "昨天",
      icon: <Activity className="h-4 w-4" />,
      description: "系统将于本周日进行例行维护，预计停机2小时",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">欢迎回来，{user.email}</h1>
        <p className="mt-1 text-gray-500">查看您的算法管理系统概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总算法数"
          value="12"
          icon={<Code className="h-5 w-5" />}
          change="较上月增长 20%"
          changeType="positive"
        />
        <StatCard
          title="API调用次数"
          value="1,234"
          icon={<Activity className="h-5 w-5" />}
          change="较上月增长 8%"
          changeType="positive"
        />
        <StatCard
          title="活跃用户"
          value="42"
          icon={<Users className="h-5 w-5" />}
          change="较上月下降 5%"
          changeType="negative"
        />
        <StatCard
          title="收入"
          value="￥9,876"
          icon={<BarChart className="h-5 w-5" />}
          change="较上月增长 12%"
          changeType="positive"
        />
      </div>

      {/* 内容区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 最近活动 */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">最近活动</h2>
            <Link
              href="#"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              查看全部
            </Link>
          </div>
          <div className="p-4">
            {sampleActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                title={activity.title}
                time={activity.time}
                icon={activity.icon}
                description={activity.description}
              />
            ))}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">快速操作</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            <Link
              href="/dashboard/algorithms/new"
              className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 p-4 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <Code className="mb-2 h-8 w-8 text-blue-600" />
              <span className="font-medium">创建新算法</span>
              <span className="mt-1 text-xs text-gray-500">
                开始构建您的算法
              </span>
            </Link>
            <Link
              href="/dashboard/algorithms"
              className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 p-4 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <Clock className="mb-2 h-8 w-8 text-blue-600" />
              <span className="font-medium">管理现有算法</span>
              <span className="mt-1 text-xs text-gray-500">
                查看和管理您的算法
              </span>
            </Link>
            <Link
              href="/dashboard/subscriptions"
              className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 p-4 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <Award className="mb-2 h-8 w-8 text-blue-600" />
              <span className="font-medium">订阅服务</span>
              <span className="mt-1 text-xs text-gray-500">
                管理您的订阅套餐
              </span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 p-4 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <Settings className="mb-2 h-8 w-8 text-blue-600" />
              <span className="font-medium">账户设置</span>
              <span className="mt-1 text-xs text-gray-500">
                更新您的个人信息
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
