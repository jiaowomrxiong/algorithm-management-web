import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatisticsList } from "@/components/statistics/statistics-list";

export default async function StatisticsPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const { data: statistics } = await supabase
    .from("algorithm_calls")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">调用统计</h1>
      <StatisticsList statistics={statistics || []} />
    </div>
  );
}
