"use client";

import { useId, useState } from "react";
import { FIT_ALLOWANCE_CM, suggestSize, type WristSize } from "@/data/products";

/** "Find my size": measure the wrist, get a suggested size, one tap to use it. */
export function SizeGuide({ onPick }: { onPick: (s: WristSize) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const wrist = parseFloat(raw.replace(",", "."));
  const valid = Number.isFinite(wrist) && wrist >= 8 && wrist <= 30;
  const res = valid ? suggestSize(wrist) : null;

  return (
    <div className="mt-4">
      <button type="button" className="btn-text" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {open ? "Close size help" : "Find my size"}
      </button>
      {open && (
        <div id={id} className="mt-4 border border-line p-5 space-y-5 bg-[var(--c-deep-tint)]">
          <ol className="space-y-1.5 text-[0.93rem] text-muted list-decimal pl-5">
            <li>Wrap a paper strip or soft tape around your wrist, just below the wrist bone.</li>
            <li>Mark where it meets, then measure the length in cm.</li>
            <li>Type it below. Measure the wrist you will wear it on.</li>
          </ol>
          <label className="block max-w-[14rem]">
            <span className="t-eyebrow !text-[12px] block mb-2">Your wrist, in cm</span>
            <input
              className="field"
              inputMode="decimal"
              placeholder="for example 15.5"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div aria-live="polite" className="text-[0.97rem]">
            {raw && !valid && <p className="text-[var(--c-burgundy)]">Enter your wrist in centimetres, for example 15.5.</p>}
            {res?.range === "ok" && res.size && (
              <div className="space-y-3">
                <p className="text-[var(--c-strong)]">
                  We suggest <strong>size {res.size}</strong>. It adds {FIT_ALLOWANCE_CM} cm to your wrist so it sits comfortably.
                </p>
                {Math.abs(res.exact - Math.round(res.exact)) >= 0.4 && (
                  <p className="text-[0.9rem] text-muted">Between two sizes? Choose the smaller for a closer fit, the larger for a looser one.</p>
                )}
                <button type="button" className="btn-solid" onClick={() => onPick(res.size as WristSize)}>
                  Use size {res.size}
                </button>
              </div>
            )}
            {res?.range === "small" && <p className="text-muted">Your wrist is smaller than our sizes cover (16 to 18). Contact us and we will see what we can do.</p>}
            {res?.range === "large" && <p className="text-muted">Your wrist is larger than our sizes cover (16 to 18). Contact us and we will see what we can do.</p>}
          </div>
          <p className="text-[0.85rem] text-faint">Sizes are the inside length of the bracelet in cm. We always confirm the fit with you before making it.</p>
        </div>
      )}
    </div>
  );
}
