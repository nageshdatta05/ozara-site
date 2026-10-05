"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AVAILABILITY_LABEL, BASE_MODEL, GEMS, WRIST_SIZES, canReserve, formatPrice, gemName, isPreorder, unitPrice, type GemKey, type Product } from "@/data/products";
import { contactHref, launch, preorder } from "@/config/site";
import { copy } from "@/content/copy";
import { Accordion } from "@/components/ui/Accordion";
import { WaitlistForm } from "@/components/commerce/WaitlistForm";
import { useCart } from "@/components/commerce/Cart";
import { EyeMark } from "@/components/brand/Emblem";
import { Gem } from "./Gem";

type Customise = { eyebrow: string; title: string; body: string; none: string; note: string };

/**
 * Name, status, the stones, and one clear action.
 * • Pre-order: "Pre-Order — Reserve yours" adds the piece (with its stones) to the bag.
 * • Not offered yet: the waiting list.
 */
export function PurchasePanel({
  product: p,
  gem,
  onGem,
  customise,
}: {
  product: Product;
  gem: GemKey | null;
  onGem: (g: GemKey | null) => void;
  customise: Customise;
}) {
  const { add } = useCart();
  const reservable = canReserve(p);
  const pre = isPreorder(p);
  const sizeId = useId();
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const price = unitPrice(p, gem);
  const e = copy.productPage.essentials;

  const essentials = [
    { title: "Materials & finish", body: p.materials?.length ? `${p.finish} finish. ${p.materials.join(" · ")}.` : e.materials(p.finish) },
    { title: "Size & fit", body: e.sizing },
    { title: "Delivery", body: e.shipping },
    { title: "Care", body: e.care },
    { title: "Technology & authenticity", body: e.technology },
    { title: "Cancellations & returns", body: e.returns },
  ];

  const reserve = () => {
    if (!size) {
      setSizeError(true);
      // bring the field to the middle of the screen (clear of the fixed bar), then focus it
      const el = document.getElementById(sizeId);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus({ preventScroll: true });
      return;
    }
    add(p.slug, gem, size);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="t-eyebrow tabular-nums">{p.index} — {p.finish}</p>
        {pre && <span className="badge-preorder">{preorder.label}</span>}
      </div>
      <h2 className="t-name text-[clamp(1.4rem,2.2vw,2rem)] mt-4">{p.name}</h2>
      <p className="t-subtitle mt-4 !text-[var(--c-text-muted)]">{p.expression}</p>
      <p className="t-body mt-6 max-w-[42ch]">{p.description}</p>

      {/* Price — for the piece as configured */}
      <div className="mt-8 border-t border-line pt-6 flex items-baseline justify-between gap-6" aria-live="polite">
        {price ? (
          <p className="font-display text-[1.8rem] text-strong leading-none">{formatPrice(price)}</p>
        ) : (
          <p className="text-[1.02rem] text-[var(--c-strong)]">
            {launch.status}
            <span className="block text-[0.92rem] text-faint mt-1">Priced by the number of stones — agreed with you before you pay.</span>
          </p>
        )}
        <p className="t-eyebrow">{AVAILABILITY_LABEL[p.availability]}</p>
      </div>

      {/* Customisation — stones along the band and at the heart of the star */}
      <fieldset className="mt-8">
        <legend className="t-eyebrow !text-[var(--c-strong)] mb-1.5">
          {customise.eyebrow} <span className="text-faint ml-2 normal-case tracking-normal font-normal">{gemName(gem)}</span>
        </legend>
        <p className="text-[0.95rem] text-muted mb-5">{customise.body}</p>
        <StoneTray gem={gem} onGem={onGem} noneLabel={customise.none} />
        <p className="mt-4 text-[0.82rem] text-faint">{customise.note}</p>
      </fieldset>

      {/* Size — the customer's wrist measurement */}
      {reservable && (
        <div className="mt-8">
          <p id={`${sizeId}-label`} className="t-eyebrow !text-[var(--c-strong)] mb-3">
            Size
          </p>
          <div role="radiogroup" aria-labelledby={`${sizeId}-label`} aria-describedby={`${sizeId}-help`} className="grid grid-cols-3 gap-2">
            {WRIST_SIZES.map((w, i) => {
              const on = size === w.key;
              return (
                <button
                  key={w.key}
                  id={i === 0 ? sizeId : undefined}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={w.name}
                  onClick={() => {
                    setSize(w.key);
                    setSizeError(false);
                  }}
                  className="h-[3.4rem] border font-[family-name:var(--font-mark)] text-[1.15rem] tracking-[0.2em] transition-colors duration-500"
                  style={{
                    borderColor: on ? "var(--c-deep)" : sizeError ? "var(--c-burgundy)" : "var(--c-line-strong)",
                    background: on ? "var(--c-deep)" : "transparent",
                    color: on ? "var(--c-paper)" : "var(--c-strong)",
                  }}
                >
                  {w.key}
                </button>
              );
            })}
          </div>
          <p id={`${sizeId}-help`} className="mt-2.5 text-[0.92rem]" style={{ color: sizeError ? "var(--c-burgundy)" : "var(--c-text-faint)" }} role={sizeError ? "alert" : undefined}>
            {sizeError ? "Please choose a size." : "Fit confirmed with you before making."}
          </p>
        </div>
      )}

      {/* The one action */}
      <div className="mt-8">
        {reservable ? (
          <>
            <button type="button" onClick={reserve} className="btn-solid w-full !min-h-[3.6rem]">
              {pre ? `${preorder.label} — ${preorder.cta}` : "Add to bag"}
            </button>
            {pre && (
              <div className="mt-6 border border-[rgb(61_1_3/0.18)] bg-[var(--c-burgundy-tint)] p-5">
                <p className="text-[0.95rem] text-[var(--c-strong)]">{preorder.why}</p>
                <ol className="mt-4 space-y-2">
                  {preorder.steps.map((st, i) => (
                    <li key={st} className="grid grid-cols-[1.6rem_1fr] text-[0.92rem] text-muted">
                      <span className="tabular-nums text-[var(--c-burgundy)]">0{i + 1}</span>
                      {st}
                    </li>
                  ))}
                </ol>
                {preorder.note && <p className="mt-4 text-[0.875rem] text-faint">{preorder.note}</p>}
              </div>
            )}
          </>
        ) : (
          <WaitlistForm product={gem ? `${p.name} (${gemName(gem)})` : p.name} source={`product:${p.slug}`} layout="stacked" />
        )}
        <Link href={contactHref(`Question about ${p.name}`)} className="btn-text mt-6 inline-block">
          Ask a question about this piece
        </Link>
      </div>

      <Accordion className="mt-10" items={essentials} />
    </div>
  );
}

/**
 * The stone tray: Base Model first — the eye alone — then the five stones,
 * laid on travertine on one centred line, each at its own size. Every option
 * is named; the chosen one is lit by its own colour and underlined.
 */
function StoneTray({ gem, onGem }: { gem: GemKey | null; onGem: (g: GemKey | null) => void; noneLabel?: string }) {
  const BASE = 66; // px width of the sapphire; the others keep their true proportions
  return (
    <div className="relative stage grain overflow-hidden px-3 sm:px-5 pt-5 pb-4">
      <p className="relative t-eyebrow !text-[12px] flex items-center gap-2.5">
        <span aria-hidden className="size-4 rounded-full border border-[var(--c-line-strong)]" />
        Choose a stone
      </p>
      <div role="radiogroup" aria-label="Customisation" className="relative mt-3 grid grid-cols-6 items-start">
        <Option label={BASE_MODEL} on={gem === null} onClick={() => onGem(null)} glow="rgb(29 26 23 / 0.18)">
          <EyeMark className="w-[clamp(2rem,6vw,2.6rem)] text-[var(--c-strong)]" strokeWidth={1} />
        </Option>
        {GEMS.map((g) => (
          <Option key={g.key} label={g.name} on={gem === g.key} onClick={() => onGem(g.key)} glow={g.glow}>
            <Gem
              kind={g.key}
              className="block h-auto"
              style={{
                width: `min(${BASE * g.size}px, ${12 * g.size}vw)`,
                filter: `drop-shadow(0 7px 7px ${g.glow})`,
              }}
            />
          </Option>
        ))}
      </div>
    </div>
  );
}

function Option({ label, on, onClick, glow, children }: { label: string; on: boolean; onClick: () => void; glow: string; children: React.ReactNode }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className="group relative flex flex-col items-center gap-2.5">
      {/* every stone centred on one line */}
      <span className="relative flex items-center justify-center h-[5.4rem] w-full">
        <span
          aria-hidden
          className="absolute size-16 rounded-full blur-xl transition-opacity duration-700"
          style={{ background: `radial-gradient(closest-side, ${glow}, transparent)`, opacity: on ? 1 : 0 }}
        />
        <span className="relative transition-transform duration-700 ease-[var(--ease-lux)] group-hover:-translate-y-1" style={{ transform: on ? "scale(1.1)" : undefined }}>
          {children}
        </span>
      </span>
      <span
        className="max-w-full px-0.5 text-[8.5px] min-[380px]:text-[9.5px] min-[420px]:text-[10.5px] sm:text-[12px] leading-tight tracking-normal min-[380px]:tracking-[0.02em] sm:tracking-[0.06em] uppercase text-center min-h-[2.2em] transition-colors"
        style={{ color: on ? "var(--c-deep)" : "var(--c-text-muted)" }}
      >
        {label}
      </span>
      <span aria-hidden className="size-2 -mt-1 bg-[var(--c-burgundy)] [mask:var(--star-mark)_center/contain_no-repeat] transition-[opacity,transform] duration-500" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "scale(0.4) rotate(-90deg)" }} />
    </button>
  );
}
