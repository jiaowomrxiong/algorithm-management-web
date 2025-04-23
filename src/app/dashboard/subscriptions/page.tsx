import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { formatDate } from "@/lib/utils";

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // 获取用户当前订阅信息
  const { data: subscriptions, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (subscriptionError) {
    console.error("获取订阅信息失败:", subscriptionError);
  }

  // 获取用户的算法使用记录
  const { data: usageData, error: usageError } = await supabase
    .from("algorithm_calls")
    .select("algorithm_id, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (usageError) {
    console.error("获取使用记录失败:", usageError);
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">订阅管理</h1>
        <p className="mt-1 text-gray-500">管理您的订阅计划和调用额度</p>
      </div>

      {/* 当前活跃订阅 */}
      {subscriptions && subscriptions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {subscription.algorithm_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    订阅ID: {subscription.id.substring(0, 8)}...
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  活跃
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">剩余额度</span>
                  <span className="font-medium">
                    {subscription.credits_remaining} 次调用
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">到期日期</span>
                  <span className="font-medium">
                    {formatDate(subscription.expires_at)}
                  </span>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      (subscription.credits_remaining /
                        (subscription.credits_remaining + 100)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-6 text-center">
          <p className="text-gray-500">您当前没有活跃的订阅</p>
        </div>
      )}

      {/* 订阅表单 */}
      <div className="mt-8">
        <SubscriptionForm userId={session.user.id} />
      </div>

      {/* 最近使用记录 */}
      {usageData && usageData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">最近使用记录</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    算法ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    使用时间
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageData.map((usage, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {usage.algorithm_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(usage.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
