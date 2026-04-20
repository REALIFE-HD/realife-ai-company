import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-bg-dark" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-500/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-blue-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-blue-300">
                Next Action
              </span>
            </div>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-[1.2] tracking-tight text-white sm:text-[2.25rem] lg:text-[2.75rem]">
              今日、どの部門に
              <br className="sm:hidden" />
              指示を出しますか?
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Cowork プロジェクトと連携し、各部門への業務指示をワンクリックで起動。見積・発注・採用・経理まで、すべての業務を横断的に動かせます。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
            <a
              href="#departments"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              部門を選んで指示
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-slate-500 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              ドキュメント
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
