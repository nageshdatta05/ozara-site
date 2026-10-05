"use client";

import { useRouter } from "next/navigation";
import { EventVerdict, type Verdict } from "./EventVerdict";

/** Shown on /b/:id when an organiser's phone taps a bracelet (iPhone flow). */
export function BraceletEventCheck({ v }: { v: Verdict }) {
  const router = useRouter();
  return <EventVerdict v={v} onDone={() => router.push("/verify")} />;
}
