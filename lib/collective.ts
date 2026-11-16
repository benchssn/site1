export const rooms = [
  { id: "commons", name: "The Commons", description: "General conversation, introductions, discoveries, and community announcements." },
  { id: "mind", name: "The Mind", description: "Neuroscience, perception, consciousness, cognition, psychology, and research." },
  { id: "laboratory", name: "The Laboratory", description: "Experiments in sound, perception, meditation, generative systems, and creative coding." },
] as const;

export type Room = typeof rooms[number]["id"];
export const isRoom = (value: unknown): value is Room => rooms.some(({ id }) => id === value);
export type Profile = { id: string; username: string; show_online: boolean; moderator: boolean; suspended_at: string | null };
export type Alias = Pick<Profile, "id" | "username">;
export type Message = { id: number; author: Alias | null; body: string; created_at: string };
export type Report = { id: number; reason: string; message: Message | null };
export type Online = Alias & { room: Room };
export type RoomMarker = { room: Room; latest_message: number; revision: number; changed_message: number | null; operation: string | null };
export const reportReasons = ["Harassment", "Spam", "Privacy concern", "Other guideline violation"] as const;

export const guidelines = [
  "Disagree with ideas without targeting people. Harassment, hate, and threats have no place here.",
  "Say when you’re sharing a scientific finding, a philosophical interpretation, a belief, or a personal experience.",
  "Keep other members’ identities and private conversations private. Ask before sharing someone else’s work.",
  "Avoid spam and unsolicited promotion. Report posts that breach these guidelines.",
];
