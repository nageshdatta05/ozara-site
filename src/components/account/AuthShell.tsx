import { EyeMark } from "@/components/brand/Emblem";

/** The quiet frame around sign-in and registration. */
export function AuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="relative stage grain min-h-[100svh] overflow-hidden flex items-center pt-[calc(var(--nav-h)+4vh)] pb-[8vh]">
      <div aria-hidden className="absolute -inset-[12%] light-beams anim-beams" />
      <div className="relative w-full max-w-[26rem] mx-auto px-6">
        <div className="text-center mb-10">
          <EyeMark className="w-10 mx-auto text-[var(--c-strong)]" />
          <p className="t-eyebrow mt-5">{eyebrow}</p>
          <h1 className="t-title mt-3">{title}</h1>
        </div>
        <div className="bg-[rgb(246_242_236/0.72)] backdrop-blur-md border border-line p-7 sm:p-9">{children}</div>
      </div>
    </section>
  );
}
