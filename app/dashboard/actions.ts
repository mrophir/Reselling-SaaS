"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Delete all user data first (RLS ensures only their rows)
  await Promise.all([
    supabase.from("items").delete().eq("user_id", user.id),
    supabase.from("sale_records").delete().eq("user_id", user.id),
    supabase.from("storage_locations").delete().eq("user_id", user.id),
  ]);

  // Delete auth user via service role
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/");
}
