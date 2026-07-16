"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (error) return { error: error.message };
  } catch (e) {
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function forgotPassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sellganise.com";
    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.get("email") as string,
      { redirectTo: `${appUrl}/auth/confirm?next=/auth/reset` }
    );
    if (error) return { error: error.message };
    return { success: "Check your email for a password reset link." };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
