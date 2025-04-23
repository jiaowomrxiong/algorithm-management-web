import Stripe from "stripe";
import { Algorithm } from "@/types/algorithm";
import { Database } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as any,
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  credits: number;
  currency: string;
  interval: "month" | "year";
  algorithmId?: string;
}

// 创建默认的订阅计划
export const getDefaultPlans = (algorithm?: Algorithm): SubscriptionPlan[] => {
  if (!algorithm) {
    // 默认平台订阅计划
    return [
      {
        id: "basic",
        name: "基础包",
        description: "适合初次尝试的用户",
        priceId: process.env.STRIPE_PRICE_BASIC || "",
        price: 99,
        credits: 100,
        currency: "cny",
        interval: "month",
      },
      {
        id: "standard",
        name: "标准包",
        description: "适合小型团队",
        priceId: process.env.STRIPE_PRICE_STANDARD || "",
        price: 299,
        credits: 500,
        currency: "cny",
        interval: "month",
      },
      {
        id: "premium",
        name: "高级包",
        description: "适合企业级用户",
        priceId: process.env.STRIPE_PRICE_PREMIUM || "",
        price: 999,
        credits: 2000,
        currency: "cny",
        interval: "month",
      },
    ];
  }

  // 算法特定的订阅计划
  return [
    {
      id: `${algorithm.id}-small`,
      name: `${algorithm.name} - 小额包`,
      description: "低频率使用",
      priceId: "", // 实际使用时需设置
      price: Math.round(algorithm.price * 10),
      credits: 10,
      currency: "cny",
      interval: "month",
      algorithmId: algorithm.id.toString(),
    },
    {
      id: `${algorithm.id}-medium`,
      name: `${algorithm.name} - 中额包`,
      description: "中等使用频率",
      priceId: "", // 实际使用时需设置
      price: Math.round(algorithm.price * 100),
      credits: 100,
      currency: "cny",
      interval: "month",
      algorithmId: algorithm.id.toString(),
    },
    {
      id: `${algorithm.id}-large`,
      name: `${algorithm.name} - 大额包`,
      description: "高频率使用",
      priceId: "", // 实际使用时需设置
      price: Math.round(algorithm.price * 1000),
      credits: 1000,
      currency: "cny",
      interval: "month",
      algorithmId: algorithm.id.toString(),
    },
  ];
};

// 创建结算会话
export async function createCheckoutSession({
  priceId,
  userId,
  algorithmId,
  algorithmName,
  credits,
  mode = "subscription",
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  algorithmId?: string;
  algorithmName?: string;
  credits: number;
  mode?: "subscription" | "payment";
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    // 创建或获取客户
    const customers = await stripe.customers.list({
      email: userId,
      limit: 1,
    });

    let customer;

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userId,
        metadata: {
          userId,
        },
      });
    }

    // 创建结算会话
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customer.id,
      metadata: {
        userId,
        algorithmId: algorithmId || "platform",
        algorithmName: algorithmName || "平台订阅",
        credits,
      },
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error("创建结算会话失败:", error);
    throw error;
  }
}

// 处理Stripe Webhook事件
export async function handleSubscriptionEvent({
  event,
  supabase,
}: {
  event: Stripe.Event;
  supabase: SupabaseClient<Database>;
}) {
  try {
    const data = event.data.object as
      | Stripe.Checkout.Session
      | Stripe.Subscription;

    if (event.type === "checkout.session.completed") {
      const checkoutSession = data as Stripe.Checkout.Session;
      const metadata = checkoutSession.metadata as {
        userId: string;
        algorithmId: string;
        algorithmName: string;
        credits: string;
      };

      // 更新数据库中的订阅信息
      await supabase.from("subscriptions").insert({
        user_id: metadata.userId,
        algorithm_id: metadata.algorithmId,
        algorithm_name: metadata.algorithmName,
        credits_remaining: parseInt(metadata.credits),
        status: "active",
        stripe_subscription_id: checkoutSession.subscription as string,
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30天后
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = data as Stripe.Subscription;
      const subscriptionId = subscription.id;

      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscriptionId);
    }

    return { success: true };
  } catch (error) {
    console.error("处理订阅事件失败:", error);
    throw error;
  }
}
