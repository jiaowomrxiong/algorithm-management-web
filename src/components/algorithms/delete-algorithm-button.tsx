"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface DeleteAlgorithmButtonProps {
  id: string;
}

export function DeleteAlgorithmButton({ id }: DeleteAlgorithmButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("确定要删除这个算法吗？此操作不可撤销。")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("algorithms").delete().eq("id", id);

      if (error) throw error;

      toast.success("算法已删除");
      router.push("/dashboard/algorithms");
    } catch (error) {
      console.error("Error deleting algorithm:", error);
      toast.error("删除算法失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "删除中..." : "删除"}
    </Button>
  );
}
