"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, cancelFrame, frame, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { GEMS, formatPrice, gemName, getProduct, isPreorder, sizeLabel, unitPrice, validSize, type GemKey } from "@/data/products";
import { preorder } from "@/config/site";
import { ease } from "@/lib/motion";
import { Gem } from "@/components/product/Gem";
import { useSmoothScroll } from "@/components/layout/SmoothScroll";

/* ==========================================================================
   THE BAG — kept in this browser (localStorage) until checkout. Only the
   slug, stone and quantity are stored; everything else is read from the
   catalogue, and the server re-checks it all when an order is placed.
   ========================================================================== */

export type CartLine = { id: string; slug: string; gem: GemKey | null; size: string; qty: number };

type Ctx = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (slug: string, gem: GemKey | null, size: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
};

const KEY = "ozara-bag-v2";
const lineId = (slug: string, gem: GemKey | null, size: string) => `${slug}:${gem ?? "none"}:${size}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as CartLine[];
      setLines(raw.filter((l) => getProduct(l.slug) && validSize(l.size) && (l.gem === null || GEMS.some((g) => g.key === l.gem))));
    } catch {
      /* private mode or corrupted — start empty */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const add = useCallback((slug: string, gem: GemKey | null, size: string) => {
    setLines((ls) => {
      const id = lineId(slug, gem, size);
      const hit = ls.find((l) => l.id === id);
      return hit ? ls.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + 1, 5) } : l)) : [...ls, { id, slug, gem, size, qty: 1 }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((id: string, qty: number) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.min(Math.max(qty, 1), 5) } : l))), []);
  const remove = useCallback((id: string) => setLines((ls) => ls.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  const value = useMemo(() => ({ lines, count, ready, open, setOpen, add, setQty, remove, clear }), [lines, count, ready, open, add, setQty, remove, clear]);
  return (
    <CartCtx.Provider value={value}>
      {children}
      <CartDrawer />
      <FloatingBag />
    </CartCtx.Provider>
  );
}

/* ---- The bag icon ------------------------------------------------------- */
export function BagIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.1} aria-hidden>
      <path d="M5.5 8.5h13l-1 11.5h-11z" strokeLinejoin="round" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

/* ---- Floating bag: always within reach, never over the opening ---------- */
function FloatingBag() {
  const { count, setOpen, ready } = useCart();
  const pathname = usePathname();
  const [past, setPast] = useState(false);
  const home = pathname === "/";
  const hidden = pathname.startsWith("/checkout") || pathname.startsWith("/account");

  // Phones: step aside while reading downwards, return on the way back up —
  // the bag in the top bar is always there too.
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    // only tell React when something actually changes, not on every scroll event
    let wasPast: boolean | null = null;
    let wasTucked: boolean | null = null;
    let queued = false;
    // read the scroll position in the read phase of Motion's frame loop, once a
    // frame — reading it straight from the event forced a style pass mid-frame
    const on = () => {
      if (queued) return;
      queued = true;
      frame.read(read);
    };
    const read = () => {
      queued = false;
      const y = window.scrollY;
      const isPast = y > window.innerHeight * 0.85;
      if (isPast !== wasPast) setPast((wasPast = isPast));
      if (window.innerWidth < 768 && Math.abs(y - last) > 6) {
        const down = y > last;
        if (down !== wasTucked) setTucked((wasTucked = down));
      }
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelFrame(read);
    };
  }, [pathname]);

  // On the home page it waits until the opening has been scrolled past.
  const show = ready && !hidden && !tucked && (count > 0 || past) && (!home || past);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open your bag${count ? ` — ${count} piece${count > 1 ? "s" : ""}` : ""}`}
          className="fixed z-40 right-4 bottom-4 md:right-7 md:bottom-7 size-[3.4rem] md:size-[3.75rem] rounded-full flex items-center justify-center bg-[rgb(246_242_236/0.86)] backdrop-blur-md text-[var(--c-deep)] border border-[rgb(0_7_43/0.18)] shadow-[0_18px_40px_-18px_rgb(0_7_43/0.45)] transition-colors duration-500 hover:bg-[var(--c-deep)] hover:text-[var(--c-paper)]"
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ duration: 0.6, ease: ease.lux }}
        >
          <BagIcon className="size-[1.45rem]" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.35rem] h-[1.35rem] px-1 rounded-full bg-[var(--c-burgundy)] text-[var(--c-paper)] text-[12px] font-semibold tabular-nums flex items-center justify-center">
              {count}
            </span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---- The bag panel ------------------------------------------------------ */
function CartDrawer() {
  const { lines, open, setOpen, setQty, remove, count } = useCart();
  const { lock } = useSmoothScroll();
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    lock(open);
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, lock, setOpen]);

  const anyPreorder = lines.some((l) => {
    const p = getProduct(l.slug);
    return p && isPreorder(p);
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-[rgb(29_26_23/0.28)] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            data-lenis-prevent
            className="fixed z-[75] top-0 right-0 h-[100dvh] w-full sm:w-[440px] bg-paper theme-light flex flex-col shadow-[-30px_0_80px_-40px_rgb(29_26_23/0.5)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: ease.lux }}
          >
            <header className="flex items-center justify-between px-6 h-[var(--nav-h)] border-b border-line">
              <p className="t-eyebrow !text-[var(--c-strong)]">
                Your bag <span className="text-faint tabular-nums ml-2">{count}</span>
              </p>
              <button type="button" onClick={() => setOpen(false)} className="btn-text" autoFocus>
                Close
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <p className="t-subtitle">Your bag is empty.</p>
                <p className="t-body mt-3 max-w-[30ch]">Choose a piece and its stones to reserve it from the first run.</p>
                <Link href="/shop" className="btn-line mt-8">
                  The collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 divide-y divide-[var(--c-line)]">
                  {lines.map((l) => (
                    <LineRow key={l.id} line={l} onQty={(q) => setQty(l.id, q)} onRemove={() => remove(l.id)} />
                  ))}
                </ul>
                <footer className="border-t border-line px-6 py-6 space-y-4">
                  {anyPreorder && (
                    <p className="text-[0.9rem] text-muted">
                      <span className="badge-preorder mr-2 align-middle">{preorder.label}</span>
                      {preorder.why}
                    </p>
                  )}
                  <Totals lines={lines} />
                  <Link href="/checkout" className="btn-solid w-full">
                    {anyPreorder ? "Continue to reservation" : "Checkout"}
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function LineRow({ line, onQty, onRemove, compact = false }: { line: CartLine; onQty?: (q: number) => void; onRemove?: () => void; compact?: boolean }) {
  const p = getProduct(line.slug);
  if (!p) return null;
  const gem = GEMS.find((g) => g.key === line.gem);
  return (
    <li className="py-5 grid grid-cols-[5.5rem_1fr] gap-4 items-center">
      <div className="relative aspect-[1605/891] stage">
        <Image src={p.media.plate.src} alt="" fill sizes="120px" className="object-contain scale-[1.3]" />
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="t-name text-[0.85rem]">{p.name}</p>
          {isPreorder(p) && <span className="t-eyebrow !text-[11px] !text-[var(--c-burgundy)] shrink-0">Pre-Order</span>}
        </div>
        <p className="text-[0.92rem] text-muted mt-1.5 flex items-center gap-2">
          {gem && <Gem kind={gem.key} className="h-[18px] w-auto" />}
          {p.finish} · {gemName(line.gem)}
        </p>
        <p className="text-[0.875rem] text-faint mt-1">Size: {sizeLabel(line.size)}</p>
        <div className="mt-2.5 flex items-center justify-between gap-3 text-[0.92rem]">
          {compact || !onQty ? (
            <span className="text-muted tabular-nums">Qty {line.qty}</span>
          ) : (
            <div className="flex items-center border border-[var(--c-line-strong)] h-8" role="group" aria-label={`Quantity of ${p.name}`}>
              <button type="button" className="w-8 h-full disabled:opacity-30" aria-label="Fewer" disabled={line.qty <= 1} onClick={() => onQty(line.qty - 1)}>
                −
              </button>
              <span className="w-6 text-center tabular-nums">{line.qty}</span>
              <button type="button" className="w-8 h-full disabled:opacity-30" aria-label="More" disabled={line.qty >= 5} onClick={() => onQty(line.qty + 1)}>
                +
              </button>
            </div>
          )}
          <LinePrice line={line} />
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove} className="btn-text !text-[11.5px] mt-3">
            Remove
          </button>
        )}
      </div>
    </li>
  );
}

function LinePrice({ line }: { line: CartLine }) {
  const p = getProduct(line.slug);
  const price = p ? unitPrice(p, line.gem) : null;
  return <span className="text-[var(--c-strong)]">{price ? formatPrice({ amount: price.amount * line.qty, currency: price.currency }) : "Price on confirmation"}</span>;
}

/** Totals — only from real prices; otherwise it says plainly that the price is confirmed later. */
export function Totals({ lines }: { lines: CartLine[] }) {
  const priced = lines.map((l) => {
    const p = getProduct(l.slug);
    return { l, p: p ? unitPrice(p, l.gem) : null };
  });
  const allPriced = priced.every((x) => x.p);
  const currency = priced[0]?.p?.currency ?? "GBP";
  const sum = priced.reduce((n, x) => n + (x.p ? x.p.amount * x.l.qty : 0), 0);
  return (
    <dl className="space-y-2 text-[0.97rem]">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="text-[var(--c-strong)]">{allPriced ? formatPrice({ amount: sum, currency }) : "Confirmed with you"}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">Delivery</dt>
        <dd className="text-[var(--c-strong)]">Confirmed with you</dd>
      </div>
    </dl>
  );
}
