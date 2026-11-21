import { getViewer } from "@/lib/viewer";

// Public pages are static, so the header asks here whether the visitor is signed in.
export async function GET() {
  let signedIn = false;
  try { signedIn = Boolean(await getViewer()); } catch { /* Treat as signed out. */ }
  return Response.json({ signedIn }, { headers: { "Cache-Control": "private, no-store" } });
}
