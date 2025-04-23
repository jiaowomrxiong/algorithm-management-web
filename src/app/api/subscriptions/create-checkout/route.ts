import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe/subscription-service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 检查用户是否已认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取请求数据
    const {
      priceId,
      algorithmId,
      algorithmName,
      credits,
      mode = "subscription",
    } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 生成成功和取消URL
    const baseUrl = new URL(request.url).origin;
    const successUrl = `${baseUrl}/dashboard/subscriptions?success=true`;
    const cancelUrl = `${baseUrl}/dashboard/subscriptions?canceled=true`;

    // 创建结算会话
    const { url, sessionId } = await createCheckoutSession({
      priceId,
      userId: session.user.id,
      algorithmId,
      algorithmName,
      credits,
      mode,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ url, sessionId });
  } catch (error) {
    console.error("创建结算会话失败:", error);
    return NextResponse.json({ error: "创建结算会话失败" }, { status: 500 });
  }
}
