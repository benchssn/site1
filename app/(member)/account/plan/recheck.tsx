"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Re-runs the server confirmation a few times while Stripe finishes the subscription. */
export default function Recheck() {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= 5) return;
    const timer = window.setTimeout(() => { router.refresh(); setTries((value) => value + 1); }, 3000);
    return () => window.clearTimeout(timer);
  }, [router, tries]);
  return tries >= 5
    ? <p className="fineprint">Still confirming. <button className="text-button" onClick={() => setTries(0)}>Check again</button> or refresh in a minute.</p>
    : <p className="fineprint">Checking again automatically…</p>;
}
