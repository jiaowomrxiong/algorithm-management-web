"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getDefaultPlans,
  SubscriptionPlan,
} from "@/lib/stripe/subscription-service";
import { SubscriptionCard } from "./subscription-card";
import { toast } from "sonner";

export interface SubscriptionFormProps {
  userId?: string;
}

export function SubscriptionForm({}: SubscriptionFormProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 获取默认订阅计划
    setPlans(getDefaultPlans());
    setLoading(false);
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      // 创建Stripe结算会话
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          credits: plan.credits,
          mode: "subscription",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "创建结算会话失败");
      }

      const { url } = await response.json();

      // 如果有URL，重定向到Stripe支付页面
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("未获取到支付链接");
      }
    } catch (error) {
      console.error("创建支付会话失败:", error);
      toast.error("支付处理失败，请稍后重试");
    }
  };

  // 是否支付成功（从URL参数检查）
  const isSuccess =
    typeof window !== "undefined" &&
    window.location.search.includes("success=true");

  // 是否取消支付（从URL参数检查）
  const isCanceled =
    typeof window !== "undefined" &&
    window.location.search.includes("canceled=true");

  // 显示支付后的消息
  useEffect(() => {
    if (isSuccess) {
      toast.success("订阅成功！您的订阅已激活");
      // 移除URL参数
      router.replace("/dashboard/subscriptions");
    } else if (isCanceled) {
      toast.info("支付已取消");
      // 移除URL参数
      router.replace("/dashboard/subscriptions");
    }
  }, [isSuccess, isCanceled, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">可用订阅计划</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        *所有订阅均为按月计费，您可以随时取消。订阅后，您将在每个结算周期开始时收取费用。
      </p>
    </div>
  );
}
