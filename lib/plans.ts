import { memberWorks, series, seriesWorks, spaces, works } from "./catalog";
import { rooms } from "./collective";

export type TierId = "free" | "plus";
export type Tier = { id: TierId; name: string; summary: string; unlocks: string[] };

const freeWorks = works.filter((work) => work.access === "free").map((work) => work.title);
const activeSpaces = spaces.filter((space) => space.status === "active").map((space) => space.title);
// Member works that are not already listed as a space.
const otherMemberWorks = memberWorks.filter((work) => !activeSpaces.includes(work.title)).map((work) => work.title);
const memberSeriesParts = series.flatMap((entry) => seriesWorks(entry)
  .map(({ item }, index) => item.access === "member" ? "part " + (index + 1) + " of " + entry.title : null)
  .filter(Boolean));

// Entitlements are derived from the catalogue so the plan page cannot drift from the access rules.
export const tiers: Tier[] = [
  {
    id: "free",
    name: "Free account",
    summary: "Watch the open studies and follow your progress.",
    unlocks: [
      "Open studies: " + freeWorks.join(" and "),
      "Browse every series syllabus and the full Library",
      "Progress saved across devices",
      "See the Collective's room directory",
    ],
  },
  {
    id: "plus",
    name: "Synestharium+",
    summary: "Everything in Free, plus the members' rooms, Spaces and member works.",
    unlocks: [
      "The Collective: " + rooms.length + " moderated live rooms (" + rooms.map(({ name }) => name.replace(/^The /, "")).join(", ") + ")",
      "Spaces: " + activeSpaces.join(", "),
      ...(memberSeriesParts.length ? ["Every part of each series, including " + memberSeriesParts.join(", ")] : []),
      ...(otherMemberWorks.length ? ["Member works: " + otherMemberWorks.join(", ")] : []),
      "Everything in the Free account",
    ],
  },
];
