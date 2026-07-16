import { type NextRequest, NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_NEXT = ["/auth/reset", "/dashboard"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code      = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type      = searchParams.get("type");
  const nextRaw   = searchParams.get("next");
  const next      = nextRaw && ALLOWED_NEXT.includes(nextRaw) ? nextRaw : "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash });
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/auth/reset", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (type === "recovery" || next === "/auth/reset") {
    return NextResponse.redirect(new URL("/login?error=reset_failed", request.url));
  }
  return NextResponse.redirect(new URL("/login?error=confirmation_failed", request.url));
}
