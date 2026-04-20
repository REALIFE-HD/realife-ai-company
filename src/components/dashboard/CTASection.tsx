import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTASection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Subtle accent rail */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-teal-500 via-teal-400 to-transparent"
      />
      {/* Soft top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-teal-100/60 blur-3xl"
      />

      <div className="relative grid gap-7 p-7 sm:p-9 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-6 bg-teal-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-700">
              Next Action
            </span>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-[1.2] tracking-tight text-slate-950 sm:text-[1.75rem] lg:text-[2rem]">
            今日、どの部門に指示を出しますか?
          </h2>
          <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-slate-600">
            Cowork プロジェクトと連携し、各部門への業務指示をワンクリックで起動。見積・発注・採用・経理まで、すべての業務を横断的に動かせます。
          </p>
        </div>

        <div className="flex flex-col gap-2.5 lg:col-span-4 lg:items-stretch lg:justify-end">
          <Link
            to="/departments"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-[13px] font-medium text-white shadow-[0_8px_24px_-12px_rgba(13,148,136,0.6)] transition-colors hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            部門を選んで指示
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <Link
            to="/docs"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-[13px] font-medium text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            ドキュメント
          </Link>
        </div>
      </div>
    </section>
  );
}
