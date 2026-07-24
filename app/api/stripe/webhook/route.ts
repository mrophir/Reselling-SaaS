"use server";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateProfileByCustomer(customerId: string, updates: Record<string, unknown>) {
  const { error, count } = await admin
    .from("profiles")
    .update(updates)
    .eq("stripe_customer_id", customerId)
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[webhook] Profile update error:", error.message);
    return false;
  }

  if (!count || count === 0) {
    // stripe_customer_id not on the profile — look up via Stripe customer metadata
    const customer = await stripe.customers.retrieve(customerId) as { deleted?: boolean; metadata?: { supabase_user_id?: string } };
    if (customer.deleted || !customer.metadata?.supabase_user_id) {
      console.error("[webhook] Cannot find user for customer:", customerId);
      return false;
    }
    const userId = customer.metadata.supabase_user_id;
    const { error: err2 } = await admin
      .from("profiles")
      .update({ ...updates, stripe_customer_id: customerId })
      .eq("id", userId);
    if (err2) {
      console.error("[webhook] Fallback profile update error:", err2.message);
      return false;
    }
  }

  return true;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const now = new Date().toISOString();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as { mode: string; customer: string; subscription: string };
      if (session.mode !== "subscription") break;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const sub = await stripe.subscriptions.retrieve(subscriptionId) as { status: string; current_period_end: number };
      await updateProfileByCustomer(customerId, {
        stripe_subscription_id: subscriptionId,
        tier: "pro",
        subscription_status: sub.status,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        updated_at: now,
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as { id: string; status: string; current_period_end: number; customer: string };
      const isActive = sub.status === "active" || sub.status === "trialing";
      await updateProfileByCustomer(sub.customer, {
        tier: isActive ? "pro" : "starter",
        subscription_status: sub.status,
        stripe_subscription_id: sub.id,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        updated_at: now,
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as { id: string; customer: string };
      await updateProfileByCustomer(sub.customer, {
        tier: "starter",
        subscription_status: "canceled",
        stripe_subscription_id: null,
        current_period_end: null,
        updated_at: now,
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as { subscription: string | null; customer: string };
      if (invoice.customer) {
        await updateProfileByCustomer(invoice.customer, {
          subscription_status: "past_due",
          updated_at: now,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
