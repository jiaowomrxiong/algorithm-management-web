"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminState, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // 获取初始用户状态
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          return;
        }

        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        setUser(userData);
        setIsAdmin(userData?.role === "admin" || false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(userData);
        setIsAdmin(userData?.role === "admin" || false);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    loading,
    isAdmin: isAdminState,
  };
}
