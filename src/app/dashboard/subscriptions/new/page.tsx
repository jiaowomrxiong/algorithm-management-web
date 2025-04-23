import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";

export default async function NewSubscriptionPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const { data: algorithms } = await supabase
    .from("algorithms")
    .select("id, name, description")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">新建订阅</h1>
      <SubscriptionForm algorithms={algorithms || []} />
    </div>
  );
}
