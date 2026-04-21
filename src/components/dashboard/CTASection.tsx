import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTASection() {
  return (
    <section className="cta-section relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Subtle accent rail */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-blue-500 via-blue-400 to-transparent"
      />
      {/* Soft top glow */}
      <div
        aria-hidden="true"
        className="cta-glow pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl"
      />
      {/* Faint grid texture (theme-aware via .cta-grid) */}
      <div
        aria-hidden="true"
        className="cta-grid pointer-events-none absolute inset-0 opacity-[0.35] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_80%_30%,black_30%,transparent_80%)]"
      />


      <div className="relative grid gap-7 p-7 sm:p-9 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-6 bg-blue-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-700">
              Next Action
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-[1.75rem] lg:text-[2rem]">
            今日、どの部門に指示を出しますか?
          </h2>
          <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            Cowork プロジェクトと連携し、各部門への業務指示をワンクリックで起動。見積・発注・採用・経理まで、すべての業務を横断的に動かせます。
          </p>
        </div>

        <div className="flex flex-col gap-2.5 lg:col-span-4 lg:items-stretch lg:justify-end">
          <Link
            to="/departments"
            className="group/cta relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-md bg-gradient-to-b from-blue-500 to-blue-600 px-4 text-[13px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(13,148,136,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-inset ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-700 hover:shadow-[0_14px_32px_-12px_rgba(13,148,136,0.7),inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-0 active:shadow-[0_4px_12px_-6px_rgba(13,148,136,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {/* Sheen sweep on hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
            />
            <span className="relative">部門を選んで指示</span>
            <ArrowRight
              className="relative h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover/cta:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/docs"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border/80 bg-card/60 px-4 text-[13px] font-medium text-muted-foreground backdrop-blur transition-colors hover:border-border hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            ドキュメント
          </Link>
        </div>
      </div>
    </section>
  );
}
