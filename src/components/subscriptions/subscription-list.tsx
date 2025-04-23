"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { formatDate } from "@/lib/utils";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionListProps {
  initialSubscriptions: Subscription[];
}

export function SubscriptionList({
  initialSubscriptions,
}: SubscriptionListProps) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(initialSubscriptions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSubscriptions(data || []);
      } catch (error) {
        console.error("Error loading subscriptions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">暂无订阅记录</div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{subscription.algorithm_name}</h3>
              <p className="text-sm text-muted-foreground">
                订阅时间：{formatDate(subscription.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {subscription.credits_remaining} 积分
              </p>
              <p className="text-sm text-muted-foreground">
                状态：{subscription.status}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
