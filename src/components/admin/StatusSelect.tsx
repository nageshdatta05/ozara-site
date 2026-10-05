"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** A small select that PATCHes a status and refreshes the page. */
export function StatusSelect({ url, value, options, field = "status" }: { url: string; value: string; options: [string, string][]; field?: string }) {
  const router = useRouter();
  const [v, setV] = useState(value);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  return (
    <span className="inline-flex items-center gap-2">
      <select
        className="field !h-9 !text-[0.92rem] !w-auto"
        value={v}
        disabled={state === "saving"}
        aria-label="Status"
        onChange={async (e) => {
          const next = e.target.value;
          setV(next);
          setState("saving");
          const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: next }) }).catch(() => null);
          if (!r || !r.ok) {
            setState("error");
            setV(value);
            return;
          }
          setState("idle");
          router.refresh();
        }}
      >
        {options.map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
      {state === "error" && <span role="alert" className="text-[0.82rem] text-[#8a2130]">Not saved</span>}
    </span>
  );
}
