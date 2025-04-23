import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 获取算法执行历史记录
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 检查用户是否已认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取URL参数
    const searchParams = request.nextUrl.searchParams;
    const algorithm_id = searchParams.get("algorithm_id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 构建查询
    let query = supabase
      .from("algorithm_executions")
      .select(
        `
        id,
        algorithm_id,
        input,
        result,
        execution_time,
        algorithms (
          name
        )
      `
      )
      .eq("user_id", session.user.id)
      .order("execution_time", { ascending: false })
      .range(offset, offset + limit - 1);

    // 如果提供了特定算法ID，则按该ID过滤
    if (algorithm_id) {
      query = query.eq("algorithm_id", algorithm_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("获取执行历史错误:", error);
      return NextResponse.json({ error: "获取数据失败" }, { status: 500 });
    }

    // 获取总记录数
    const { count: totalCount } = await supabase
      .from("algorithm_executions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .maybeSingle();

    return NextResponse.json({
      executions: data,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
