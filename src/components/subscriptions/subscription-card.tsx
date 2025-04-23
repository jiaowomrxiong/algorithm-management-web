"use client";

import { useState } from "react";
import { SubscriptionPlan } from "@/lib/stripe/subscription-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  onSubscribe: (plan: SubscriptionPlan) => Promise<void>;
  isActive?: boolean;
}

export function SubscriptionCard({
  plan,
  onSubscribe,
  isActive = false,
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      await onSubscribe(plan);
    } catch (error) {
      console.error("订阅失败:", error);
      toast.error("订阅操作失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`flex h-full flex-col overflow-hidden transition-all ${
        isActive
          ? "border-primary shadow-lg shadow-primary/20"
          : "hover:shadow-md hover:border-gray-300"
      }`}
    >
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <p className="text-sm text-gray-500">{plan.description}</p>
      </CardHeader>
      <CardContent className="flex-1 p-6 space-y-4">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">¥{plan.price}</span>
          <span className="text-gray-500 ml-2 text-sm">
            /{plan.interval === "month" ? "月" : "年"}
          </span>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex items-start">
            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">
              包含 <span className="font-semibold">{plan.credits}</span>{" "}
              次调用额度
            </span>
          </div>
          <div className="flex items-start">
            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">
              单次调用仅需{" "}
              <span className="font-semibold">
                ¥{(plan.price / plan.credits).toFixed(2)}
              </span>
            </span>
          </div>
          <div className="flex items-start">
            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">自动续费，随时可取消</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t p-6">
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={loading || isActive}
          variant={isActive ? "outline" : "default"}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              处理中...
            </>
          ) : isActive ? (
            "当前订阅"
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              立即订阅
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
