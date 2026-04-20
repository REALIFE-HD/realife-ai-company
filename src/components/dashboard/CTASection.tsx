import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTASection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-bg-dark" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/3 rounded-full bg-teal-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"
      />
      <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-6 bg-teal-400" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-300">
              Next Action
            </span>
          </div>
          <h2 className="mt-4 font-serif text-2xl font-semibold leading-[1.2] tracking-tight text-white sm:text-[1.875rem] lg:text-[2.25rem]">
            今日、どの部門に指示を出しますか?
          </h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-400 sm:text-sm">
            Cowork プロジェクトと連携し、各部門への業務指示をワンクリックで起動。見積・発注・採用・経理まで、すべての業務を横断的に動かせます。
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row lg:col-span-4 lg:justify-end">
          <Link
            to="/"
            hash="departments"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-500 px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(13,148,136,0.55)] transition-colors hover:bg-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
          >
            部門を選んで指示
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:border-slate-500 hover:bg-white/10"
          >
            ドキュメント
          </a>
        </div>
      </div>
    </section>
  );
}
