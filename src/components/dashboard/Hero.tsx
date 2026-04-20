import { ArrowRight } from "lucide-react";
import { DEPARTMENTS } from "@/data/departments";

export function Hero() {
  const featured = DEPARTMENTS.slice(1, 5);

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-bg-light" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-slate-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Virtual Organization
              </span>
            </div>

            <h1 className="mt-6 font-serif text-[2.5rem] font-semibold leading-[1.15] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.5rem]">
              一人で、
              <br />
              <span className="relative inline-block">
                会社を動かす。
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              12の仮想部門を、一つのダッシュボードから指揮する。見積・発注・請求・採用・マーケ——業務指示と案件進捗を横断的に可視化するオペレーションシステム。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#departments"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              >
                部門ダッシュボードへ
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#setup"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition-colors hover:border-slate-900 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              >
                セットアップを見る
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
              {[
                { v: "47", l: "進行中案件" },
                { v: "12", l: "今週の見積" },
                { v: "¥18.4M", l: "成約(当月)" },
              ].map((m) => (
                <div key={m.l}>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{m.l}</dt>
                  <dd className="mt-2 font-mono text-xl font-medium text-slate-950 sm:text-2xl">
                    {m.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right */}
          <div className="relative lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)] sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-700">稼働中</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  REALIFE.DASHBOARD
                </span>
              </div>

              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">今月の成約額</p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-mono text-2xl font-semibold text-slate-950 sm:text-3xl">
                    ¥18,450,000
                  </span>
                  <span className="font-mono text-xs font-medium text-emerald-600">+12.4%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={62}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-950 to-blue-500"
                    style={{ width: "62%" }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">月次目標達成率 62%</p>
              </div>

              <ul className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                {featured.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-1.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-mono text-[11px] font-medium text-slate-700">
                        {d.id}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{d.name}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-slate-950">{d.kpiValue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Floating cards */}
            <div
              aria-hidden="true"
              className="absolute -left-3 -top-3 hidden -rotate-[4deg] rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg md:block"
            >
              <p className="text-[10px] uppercase tracking-wider text-slate-500">未処理</p>
              <p className="font-mono text-sm font-semibold text-slate-950">28 タスク</p>
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 hidden rotate-[3deg] rounded-lg border border-blue-700 bg-blue-600 px-3 py-2 text-white shadow-lg md:block"
            >
              <p className="text-[10px] uppercase tracking-wider text-blue-100">今週新規</p>
              <p className="font-mono text-sm font-semibold">+7 件</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
