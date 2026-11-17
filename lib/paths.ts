import { findWork, findSeries, findSpace } from "./catalog";
import { rooms } from "./collective";

/** Holds the post-sign-in destination between requesting and confirming a magic link. */
export const nextCookie = "synestharium_next";

const memberPrefixes = ["/dashboard", "/community", "/learn", "/works", "/spaces", "/library", "/account"];

/** Accepts only same-site member paths so `next` and `return` cannot redirect off-site. */
export function safePath(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string" || value.length > 200) return fallback;
  if (!/^\/[A-Za-z0-9\-_/]*(?:\?[A-Za-z0-9\-_=&%.]*)?(?:#[A-Za-z0-9\-_]*)?$/.test(value)) return fallback;
  if (value.startsWith("//")) return fallback;
  const path = value.split(/[?#]/)[0];
  return memberPrefixes.some((prefix) => path === prefix || path.startsWith(prefix + "/")) ? value : fallback;
}

/** Human label for the page an upgrade should return to. */
export function describePath(value: string) {
  const [path] = value.split(/[?#]/);
  const [, section, slug] = path.split("/");
  if (section === "works" && slug) return findWork(slug)?.title;
  if (section === "spaces" && slug) return findSpace(slug)?.title;
  if (section === "learn" && path.startsWith("/learn/series/")) return findSeries(path.split("/")[3])?.title;
  if (section === "community" && slug) return rooms.find(({ id }) => id === slug)?.name;
  if (section === "community") return "The Collective";
  return undefined;
}

export const upgradeHref = (returnTo: string) => "/account/plan?return=" + encodeURIComponent(returnTo);
