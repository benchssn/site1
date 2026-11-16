export class ChatError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function chatRequest<T>(query = "", command?: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch("/api/chat" + query, {
    cache: "no-store", signal,
    ...(command ? {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new ChatError(response.status, data.error ?? "Request failed.");
  return data;
}

export const errorMessage = (error: unknown) =>
  error instanceof ChatError ? error.message : "Connection interrupted. Try again.";

