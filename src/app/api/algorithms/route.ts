import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 检查用户是否已认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取所有算法列表
    const { data: algorithms, error } = await supabase
      .from("algorithms")
      .select("*");

    if (error) {
      console.error("获取算法数据错误:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ algorithms });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();

    // 检查用户是否已认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 从请求体获取算法数据
    const requestData = await new Response().json();
    const { name, description, code, price, api_endpoint } = requestData;

    if (!name || !description || !code || !price) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    // 创建新算法
    const { data: algorithm, error } = await supabase
      .from("algorithms")
      .insert({
        name,
        description,
        code,
        price,
        api_endpoint,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("创建算法错误:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ algorithm }, { status: 201 });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
