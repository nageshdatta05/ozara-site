"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { nav, site } from "@/config/site";
import { isPreorder, products, productHref } from "@/data/products";
import { Emblem, EyeMark, Wordmark } from "@/components/brand/Emblem";
import { ease } from "@/lib/motion";
import { useSmoothScroll } from "./SmoothScroll";
import { BagIcon, useCart } from "@/components/commerce/Cart";

const MotionLink = motion.create(Link);

/**
 * Always there, never loud. A menu, two links either side of the house mark,
 * and a bar that only appears once you leave the opening. Over the one dark
 * room it turns ivory.
 */
export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollTo, lock } = useSmoothScroll();
  const pathname = usePathname();
  const home = pathname === "/";

  useEffect(() => setOpen(false), [pathname]);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > window.innerHeight * 0.6));
  useEffect(() => setScrolled(window.scrollY > window.innerHeight * 0.6), [pathname]);

  // Over a dark room the bar turns ivory. Watch a one-pixel band at the bar's
  // centre line (y = 36px) for dark sections passing under it — the browser
  // reports crossings, so scrolling itself costs nothing (a hit-test on every
  // scroll frame forced style and layout mid-frame).
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const under = new Set<Element>();
    const watch = () => {
      io?.disconnect();
      under.clear();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) (e.isIntersecting ? under.add(e.target) : under.delete(e.target));
          setDark(under.size > 0);
        },
        { rootMargin: `-36px 0px -${Math.max(0, window.innerHeight - 37)}px 0px` }
      );
      const rooms = [...document.querySelectorAll('[data-theme="dark"]')].filter((el) => !el.closest("header"));
      rooms.forEach((el) => io!.observe(el));
      // the observer reports every room straight away; with none, the bar is light
      if (!rooms.length) setDark(false);
    };
    watch();
    // sections can mount a moment after the route changes
    const late = window.setTimeout(watch, 400);
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(watch);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(late);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    lock(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lock]);

  const onDark = dark && !open;
  const bar = scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 fade-in ${onDark ? "theme-dark" : "theme-light"}`}
        style={{ animationDelay: home ? "1.4s" : "0.2s" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 transition-[background-color,backdrop-filter,border-color] duration-700"
          style={{
            backgroundColor: bar ? (onDark ? "rgb(34 30 26 / 0.72)" : "rgb(246 242 236 / 0.78)") : "transparent",
            backdropFilter: bar ? "blur(16px) saturate(1.1)" : "none",
            WebkitBackdropFilter: bar ? "blur(16px) saturate(1.1)" : "none",
            borderBottom: `1px solid ${bar ? "var(--c-line)" : "transparent"}`,
          }}
        />
        <nav aria-label="Primary" className="shell relative grid grid-cols-[1fr_auto_1fr] items-center h-[var(--nav-h)]">
          <div className="justify-self-start flex items-center gap-10">
            <button
              type="button"
              className="relative z-[60] flex items-center gap-3 t-eyebrow !text-[var(--c-strong)] py-3"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span aria-hidden className="relative block w-6 h-[7px]">
                <span className="absolute left-0 right-0 top-0 h-px bg-[var(--c-strong)] transition-transform duration-500" style={{ transform: open ? "translateY(3px) rotate(45deg)" : "none" }} />
                <span className="absolute left-0 right-0 bottom-0 h-px bg-[var(--c-strong)] transition-transform duration-500" style={{ transform: open ? "translateY(-3px) rotate(-45deg)" : "none" }} />
              </span>
              <span>{open ? "Close" : "Menu"}</span>
            </button>
            <ul className="hidden lg:flex items-center gap-9">
              {nav.primary.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="btn-text" aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/"
            onClick={(e) => {
              if (home) {
                e.preventDefault();
                scrollTo(0);
              }
            }}
            className="relative z-[60] flex items-center gap-2.5 text-[var(--c-strong)]"
            aria-label={`${site.brand} — home`}
          >
            <Wordmark label={null} className="h-[1.3rem] md:h-[1.55rem]" />
          </Link>

          <div className="justify-self-end relative z-[60] flex items-center gap-9">
            <ul className="hidden lg:flex items-center gap-9">
              {nav.secondary.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="btn-text" aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/account" className="hidden md:inline-block btn-text" aria-current={pathname.startsWith("/account") ? "page" : undefined}>
              Account
            </Link>
            <BagButton />
          </div>
        </nav>
      </header>

      <AnimatePresence>{open && <Menu pathname={pathname} />}</AnimatePresence>
    </>
  );
}

/** The full menu — the whole house, and the three pieces. */
function Menu({ pathname }: { pathname: string }) {
  // keyboard users land inside the menu
  useEffect(() => {
    const t = setTimeout(() => (document.querySelector("#site-menu a") as HTMLElement | null)?.focus(), 250);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-theme="light"
      className="fixed inset-0 z-[55] stage grain theme-light flex flex-col overflow-y-auto"
      initial={{ clipPath: "ellipse(70% 0% at 50% 0%)" }}
      animate={{ clipPath: "ellipse(150% 150% at 50% 0%)" }}
      exit={{ clipPath: "ellipse(70% 0% at 50% 0%)" }}
      transition={{ duration: 0.9, ease: ease.silk }}
    >
      <div className="shell relative flex-1 grid lg:grid-cols-12 gap-12 pt-[calc(var(--nav-h)+6vh)] pb-10">
        <ul className="lg:col-span-5 flex flex-col gap-1">
          {nav.menu.map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <MotionLink
                href={l.href}
                className="t-title block py-1.5 transition-opacity hover:opacity-60"
                aria-current={pathname === l.href ? "page" : undefined}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: ease.lux, delay: 0.2 + i * 0.05 }}
              >
                {l.label}
              </MotionLink>
            </li>
          ))}
        </ul>
        <motion.div
          className="lg:col-span-6 lg:col-start-7 flex flex-col justify-between gap-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: ease.lux, delay: 0.4 }}
        >
          {/* the print of the house */}
          <div className="hidden sm:flex items-center gap-[clamp(1.5rem,3vw,3rem)] text-[var(--c-strong)]">
            <Emblem className="w-[clamp(7rem,13vw,11rem)] shrink-0 opacity-80" strokeWidth={0.7} />
            <div>
              <Wordmark className="h-[clamp(1.8rem,3vw,2.8rem)]" />
              <p className="t-eyebrow mt-5">The eye · The wave · The few</p>
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-4">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={productHref(p)} className="group block text-center">
                  <Image src={p.media.plate.src} alt="" width={p.media.plate.width} height={p.media.plate.height} sizes="20vw" className="w-[130%] max-w-none -ml-[15%] h-auto transition-transform duration-1000 ease-[var(--ease-lux)] group-hover:-translate-y-1.5" />
                  <span className="t-name text-[0.78rem] block">{p.name}</span>
                  {isPreorder(p) && <span className="t-eyebrow !text-[11px] !text-[var(--c-burgundy)] block mt-1.5">Pre-Order</span>}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      <motion.div
        className="shell relative pb-8 flex justify-between items-center t-eyebrow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1 }}
      >
        <span className="flex items-center gap-3">
          <EyeMark className="w-5 text-[var(--c-strong)]" />
          {site.tagline}
        </span>
        <span className="flex items-center gap-8">
          <Link href="/account">Account</Link>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        </span>
      </motion.div>
    </motion.div>
  );
}

/** The bag, with its count — opens the bag panel. */
function BagButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative flex items-center gap-2 py-2 text-[var(--c-strong)] hover:text-[var(--c-accent-2)] transition-colors"
      aria-label={`Your bag${count ? ` — ${count} piece${count > 1 ? "s" : ""}` : ""}`}
    >
      <BagIcon className="size-[1.3rem]" />
      <span className="t-eyebrow !text-current tabular-nums min-w-[1ch]">{count > 0 ? count : ""}</span>
    </button>
  );
}
