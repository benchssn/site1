import { permanentRedirect } from "next/navigation";

// The Collective now lives in the member workspace.
export default function Chat() {
  permanentRedirect("/community");
}
