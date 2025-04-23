import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { handleSubscriptionEvent } from "@/lib/stripe/subscription-service";

// 初始化Stripe实例
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as any,
});

// Stripe Webhook处理
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // 验证Webhook签名
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook签名验证失败:", err);
      return NextResponse.json(
        { error: "Webhook签名验证失败" },
        { status: 400 }
      );
    }

    // 创建Supabase客户端
    const supabase = await createClient();

    // 根据事件类型处理不同的Stripe事件
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.deleted":
      case "customer.subscription.updated":
        await handleSubscriptionEvent({ event, supabase });
        break;
      default:
        console.log(`未处理的Stripe事件类型: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("处理Stripe Webhook失败:", error);
    return NextResponse.json(
      { error: "处理Stripe Webhook失败" },
      { status: 500 }
    );
  }
}
