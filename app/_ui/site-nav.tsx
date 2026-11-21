"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

// Collective and About point at their homepage sections until their own pages exist.
const primary = [
  { href: "/", label: "Home" },
  { href: "/transmissions", label: "Transmissions" },
  { href: "/archive", label: "Archive" },
  { href: "/#collective", label: "Collective" },
  { href: "/#philosophy", label: "About" },
];

const isCurrent = (path: string, href: string) =>
  href === "/" ? path === "/" : !href.includes("#") && (path === href || path.startsWith(href + "/"));

/** Asks the session endpoint once, so the surrounding page can stay static. */
function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let live = true;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { signedIn: false })
      .then((data) => { if (live) setSignedIn(Boolean(data.signedIn)); })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  return signedIn;
}

export function SiteNav() {
  const path = usePathname();
  const signedIn = useSignedIn();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return <>
    <button className="menu-toggle" type="button" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}>
      <span className="visually-hidden">Menu</span>
      <span className="menu-lines" aria-hidden="true" />
    </button>
    <div className="site-menu" id={menuId} data-open={open || undefined}>
      <nav aria-label="Primary" className="primary-nav">
        {primary.map(({ href, label }) => <Link key={href} href={href} onClick={() => setOpen(false)}
          aria-current={isCurrent(path, href) ? "page" : undefined}>{label}</Link>)}
      </nav>
      <nav aria-label="Account" className="account-nav">
        <Link href="/plans" aria-current={path === "/plans" ? "page" : undefined}>Membership</Link>
        {signedIn ? <Link href="/dashboard">Workspace</Link> : <Link href="/signin">Sign in</Link>}
      </nav>
    </div>
  </>;
}
