import Stripe from "stripe";
import { Algorithm } from "@/types/algorithm";
import { Database } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

// 初始化Stripe实例，不指定apiVersion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

// 订阅服务类
export class SubscriptionService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  // 处理订阅创建
  async handleSubscriptionCreated(customerId: string, subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // 获取 metadata
      const checkoutSessions = await stripe.checkout.sessions.list({
        subscription: subscriptionId,
        limit: 1,
      });

      if (checkoutSessions.data.length === 0) {
        throw new Error("找不到相关的结账会话");
      }

      const session = checkoutSessions.data[0];
      const metadata = session.metadata as {
        userId: string;
        algorithmId: string;
        algorithmName: string;
        credits: string;
      } | null;

      if (!metadata) {
        throw new Error("结账会话没有元数据");
      }

      // 获取一个月后的过期时间
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // 更新数据库中的订阅信息
      await this.supabase.from("subscriptions").insert({
        user_id: metadata.userId,
        algorithm_id: metadata.algorithmId,
        algorithm_name: metadata.algorithmName,
        credits_remaining: parseInt(metadata.credits || "0"),
        status: subscription.status,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        expires_at: expiresAt.toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error("处理订阅创建失败:", error);
      throw error;
    }
  }

  // 更新订阅状态
  async updateSubscriptionStatus(
    customerId: string,
    subscriptionId: string,
    status: string
  ) {
    try {
      await this.supabase
        .from("subscriptions")
        .update({
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId)
        .eq("stripe_customer_id", customerId);

      return { success: true };
    } catch (error) {
      console.error("更新订阅状态失败:", error);
      throw error;
    }
  }
}
