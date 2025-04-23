import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 执行算法的POST请求处理函数
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

    // 获取请求体
    const requestData = await request.json();
    const { algorithm_id, input_data } = requestData;

    // 验证请求数据
    if (!algorithm_id) {
      return NextResponse.json({ error: "缺少算法ID" }, { status: 400 });
    }

    if (!input_data) {
      return NextResponse.json({ error: "缺少输入数据" }, { status: 400 });
    }

    // 获取算法
    const { data: algorithm, error: algorithmError } = await supabase
      .from("algorithms")
      .select("*")
      .eq("id", algorithm_id)
      .single();

    if (algorithmError) {
      return NextResponse.json({ error: "算法不存在" }, { status: 404 });
    }

    // 在这里我们模拟执行算法
    // 实际应用中，你可能需要通过某种方式安全地执行此代码
    // 或者将代码发送到隔离的执行环境

    // 简单的示例：我们只是返回一个模拟结果
    // 这里不实际执行用户提供的代码，因为这可能存在安全隐患
    const result = {
      status: "success",
      result: `算法 '${algorithm.name}' 已处理输入数据`,
      input: input_data,
      execution_time: `${Math.random() * 1000}ms`,
      algorithm_id: algorithm_id,
    };

    // 记录执行历史
    const { data: executionLog, error: logError } = await supabase
      .from("algorithm_executions")
      .insert({
        algorithm_id,
        user_id: session.user.id,
        input: input_data,
        result: result,
        execution_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error("记录执行日志错误:", logError);
      // 继续处理，即使日志记录失败
    }

    return NextResponse.json({
      success: true,
      execution_id: executionLog?.id || null,
      result,
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
