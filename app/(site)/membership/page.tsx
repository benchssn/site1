import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

// Former membership page. Older emails and bookmarks land here, so forward them.
export default async function Membership({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  const viewer = await getViewer().catch(() => null);
  if (viewer) redirect(notice === "checkout" ? "/account/plan?checkout=success" : "/account");
  redirect(notice === "invalid-link" ? "/signin?notice=invalid-link" : "/plans");
}
