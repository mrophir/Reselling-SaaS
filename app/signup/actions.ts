"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      options: {
        data: { full_name: formData.get("full_name") as string },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
      },
    });

    if (error) return { error: error.message };

    return { success: "Check your email to confirm your account." };
  } catch (e) {
    return { error: "Something went wrong. Please try again." };
  }
}
