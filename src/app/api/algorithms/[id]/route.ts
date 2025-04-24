import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 获取单个算法
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    // 检查用户是否已认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取特定算法
    const { data: algorithm, error } = await supabase
      .from("algorithms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ algorithm });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// 更新算法
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    // 检查用户是否已认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取请求体
    const requestData = await request.json();
    const { name, description, code, price, api_endpoint } = requestData;

    // 检查是否为算法所有者
    const { data: existingAlgorithm, error: fetchError } = await supabase
      .from("algorithms")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    if (existingAlgorithm.created_by !== session.user.id) {
      return NextResponse.json({ error: "无权更新此算法" }, { status: 403 });
    }

    // 更新算法
    const { data: updatedAlgorithm, error } = await supabase
      .from("algorithms")
      .update({
        name,
        description,
        code,
        price,
        api_endpoint,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ algorithm: updatedAlgorithm });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// 删除算法
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    // 检查用户是否已认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 检查是否为算法所有者
    const { data: existingAlgorithm, error: fetchError } = await supabase
      .from("algorithms")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    if (existingAlgorithm.created_by !== session.user.id) {
      return NextResponse.json({ error: "无权删除此算法" }, { status: 403 });
    }

    // 删除算法
    const { error } = await supabase.from("algorithms").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
