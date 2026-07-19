"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Cancel Stripe subscription before deleting account
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const subId = profile?.stripe_subscription_id as string | null | undefined;
  if (subId) {
    try {
      await stripe.subscriptions.cancel(subId);
    } catch {
      // Subscription may already be cancelled — proceed anyway
    }
  }

  // Delete all user data (RLS ensures only their rows)
  await Promise.all([
    supabase.from("items").delete().eq("user_id", user.id),
    supabase.from("sale_records").delete().eq("user_id", user.id),
    supabase.from("storage_locations").delete().eq("user_id", user.id),
  ]);

  // Delete auth user via service role (cascades to profiles)
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/");
}
