import Link from "next/link";
import { footer, site } from "@/config/site";
import { Wordmark } from "@/components/brand/Emblem";

export function Footer() {
  return (
    <footer data-theme="dark" className="relative bg-deep theme-dark overflow-hidden">
      <div className="shell pt-16 md:pt-24 pb-6">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark className="h-9 text-[var(--c-strong)]" />
            <p className="t-eyebrow mt-6">Technology in disguise</p>
          </div>
          <nav aria-label="Footer" className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <p className="t-eyebrow mb-6">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {/^https?:/.test(l.href) ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="btn-text !normal-case !tracking-[0.03em] !text-[1rem]">
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className="btn-text !normal-case !tracking-[0.03em] !text-[1rem]">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Oversized logotype, cropped by the page edge — a watermark in the deep blue */}
      <div aria-hidden className="shell select-none flex justify-center overflow-hidden pt-6">
        <Wordmark label={null} className="w-full max-w-[1200px] h-auto translate-y-[22%] text-[rgb(241_236_228/0.07)] [--c-star:rgb(217_169_172/0.25)]" />
      </div>

      <div className="shell relative border-t border-line py-6 flex flex-col sm:flex-row gap-3 justify-between t-small !text-faint">
        <span>© {site.year} {site.brand}. All rights reserved.</span>
        <span className="flex gap-6">
          <Link href="/privacy" className="hover:text-[var(--c-strong)] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--c-strong)] transition-colors">Terms</Link>
        </span>
      </div>
    </footer>
  );
}
