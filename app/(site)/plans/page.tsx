import type { Metadata } from "next";
import Link from "next/link";
import { PlanTable } from "@/app/_ui/plan-table";
import { getViewer, membershipPrice } from "@/lib/viewer";

export const metadata: Metadata = { title: "Plans", description: "Choose a free account or Synestharium+ membership." };
export const dynamic = "force-dynamic";

export default async function Plans() {
  const [viewer, price] = await Promise.all([getViewer().catch(() => null), membershipPrice()]);
  return <section className="wrap page plans-page">
    <p className="eyebrow mono">Membership</p>
    <h1>Choose how you’d like to join</h1>
    <p className="intro">Start with a free account and the open studies, or join Synestharium+ for the members’ rooms, Spaces and member works.
      You can change or cancel your membership at any time from your account.</p>
    <PlanTable viewer={viewer} price={price} />
    <p className="fineprint plans-foot">Already a member? <Link href="/signin">Sign in</Link> to manage your plan.</p>
  </section>;
}
