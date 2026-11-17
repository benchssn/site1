"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/app/_ui/icons";

export const destinations: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/community", label: "Collective", icon: "collective" },
  { href: "/learn", label: "Learn", icon: "learn" },
  { href: "/spaces", label: "Spaces", icon: "spaces" },
  { href: "/library", label: "Library", icon: "library" },
];

// Work pages belong to Learn; they are reached from Learn, Library and Home alike.
const owner = (path: string) => path.startsWith("/works/") ? "/learn" : destinations.find(({ href }) => path === href || path.startsWith(href + "/"))?.href;

export function MemberNav({ variant }: { variant: "rail" | "bar" }) {
  const active = owner(usePathname());
  return <nav className={"member-nav member-nav-" + variant} aria-label="Workspace">
    {destinations.map(({ href, label, icon }) => <Link key={href} href={href} aria-current={active === href ? "page" : undefined}>
      <Icon name={icon} size={variant === "bar" ? 22 : 20} />
      <span>{label}</span>
    </Link>)}
  </nav>;
}

export function AccountLink({ member, compact }: { member: boolean; compact?: boolean }) {
  const current = usePathname().startsWith("/account");
  return <Link className={"account-link" + (compact ? " compact" : "")} href="/account" aria-current={current ? "page" : undefined}>
    <Icon name="account" />
    <span className={compact ? "visually-hidden" : ""}>Account</span>
    {!compact && <span className={"plan-chip" + (member ? " plus" : "")}>{member ? "Synestharium+" : "Free"}</span>}
  </Link>;
}
