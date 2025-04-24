import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

async function listUsers() {
  const supabase = await createClient();
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  console.log("Users in the database:");
  (users as User[]).forEach((user) => {
    console.log(`- ${user.email} (${user.id})`);
  });
}

listUsers();
