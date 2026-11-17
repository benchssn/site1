import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const memberRoutes = /^\/(dashboard|community|learn|works|spaces|library|account)(\/|$)/;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname + request.nextUrl.search;
  const forwarded = new Headers(request.headers);
  // Layouts can't read the URL, so member pages use this to send visitors back after sign-in.
  forwarded.set("x-synestharium-path", path);
  let response = NextResponse.next({ request: { headers: forwarded } });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const devAccount = process.env.NODE_ENV === "development" && process.env.SYNESTHARIUM_DEV_ACCOUNT;
  if (url && key) {
    const client = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (entries) => {
          entries.forEach(({ name, value }) => request.cookies.set(name, value));
          forwarded.set("cookie", request.cookies.toString());
          response = NextResponse.next({ request: { headers: forwarded } });
          entries.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await client.auth.getClaims();
    if (!data?.claims && !devAccount && memberRoutes.test(request.nextUrl.pathname)) {
      const target = new URL("/signin", request.url);
      target.searchParams.set("next", path);
      const redirect = NextResponse.redirect(target);
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/", "/plans", "/signin", "/membership", "/observatory/:path*", "/chat",
    "/dashboard/:path*", "/community/:path*", "/learn/:path*", "/works/:path*",
    "/spaces/:path*", "/library/:path*", "/account/:path*",
    "/api/chat", "/api/progress", "/api/billing/:path*",
  ],
};
