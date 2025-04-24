import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { SubscriptionService } from "@/lib/stripe/subscription-service";
import { createClient } from "@/lib/supabase/server";

// Stripe Webhook处理
export async function POST(request: NextRequest) {
  try {
    const body: string = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature") || "";

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Stripe webhook secret is not set" },
        { status: 500 }
      );
    }

    // 不显式指定apiVersion，让Stripe使用默认值
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const subscriptionService = new SubscriptionService(supabase);

    // 处理特定的 Stripe 事件
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer && session.subscription) {
          await subscriptionService.handleSubscriptionCreated(
            session.customer.toString(),
            session.subscription.toString()
          );
        }
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.customer) {
          await subscriptionService.updateSubscriptionStatus(
            subscription.customer.toString(),
            subscription.id,
            subscription.status
          );
        }
        break;

      default:
        console.log(`未处理的事件类型: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`处理 webhook 错误: ${errorMessage}`);
    return NextResponse.json({ error: "Webhook 处理失败" }, { status: 500 });
  }
}
