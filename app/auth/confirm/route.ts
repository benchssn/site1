import { NextResponse } from "next/server";
import { auth, authReady, siteOrigin } from "@/lib/service";

const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "origin" };

export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token_hash");
  if (!authReady() || !token || !/^[a-zA-Z0-9_-]{1,128}$/.test(token)) {
    return NextResponse.redirect(siteOrigin() + "/membership?notice=invalid-link", { headers });
  }
  // A separate POST prevents automatic email link scans from consuming the token.
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirm sign-in — Synestharium</title>
    <style>
      :root{color-scheme:dark}body{margin:0;display:grid;min-height:100svh;place-items:center;background:#0c0d0c;color:#ecebe6;font:16px/1.55 system-ui}
      main{margin:20px;padding:clamp(24px,6vw,48px);border:1px solid #262926;border-radius:6px}h1{font:normal clamp(2rem,7vw,3rem) Georgia;margin:10px 0}
      small{font-size:14px;color:#a4a79f}button{background:#ecebe6;color:#0c0d0c;border-radius:4px;padding:12px 16px;border:0;font:600 15px system-ui;cursor:pointer}
      button:focus-visible{outline:2px solid #c7d6b8;outline-offset:5px}
    </style>
    <main><small>Synestharium</small><h1>Confirm sign-in</h1>
    <p>Continue to your membership.</p>
    <form method="post" action="/auth/confirm"><input type="hidden" name="token_hash" value="${token}">
    <button type="submit">Sign in</button></form></main></html>`,
    { headers: { ...headers, "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'" } });
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteOrigin()) {
    return new Response("Unexpected origin", { status: 403, headers });
  }
  let notice = "?notice=invalid-link";
  try {
    const token = (await request.formData()).get("token_hash");
    if (authReady() && typeof token === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(token)) {
      const client = await auth();
      const { error } = await client.auth.verifyOtp({ type: "email", token_hash: token });
      if (!error) notice = "";
    }
  } catch {
    // Malformed submissions return to the same sign-in flow as expired links.
  }
  return NextResponse.redirect(siteOrigin() + "/membership" + notice, { status: 303, headers });
}
