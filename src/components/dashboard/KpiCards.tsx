import { TrendingUp, FileText, DollarSign, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

type Kpi = {
  label: string;
  value: string;
  sub?: string;
  delta?: { value: string; positive: boolean };
  icon: typeof TrendingUp;
};

const KPIS: Kpi[] = [
  { label: "今月の成約額", value: "¥18,450,000", sub: "Q2 2026 進行中", delta: { value: "+12.4%", positive: true }, icon: DollarSign },
  { label: "進行中案件", value: "47", sub: "全部門合計", icon: FileText },
  { label: "今週の見積", value: "12", sub: "ダブルチェック中 6", icon: TrendingUp },
  { label: "稼働メンバー", value: "8", sub: "オンライン 5", icon: Users },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {KPIS.map((k, idx) => {
        const Icon = k.icon;
        const Arrow = k.delta?.positive ? ArrowUpRight : ArrowDownRight;
        const isPrimary = idx === 0;
        return (
          <div
            key={k.label}
            className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
              isPrimary
                ? "border-slate-900 bg-slate-950 text-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.45)] hover:shadow-[0_18px_40px_-12px_rgba(13,148,136,0.45)]"
                : "border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:border-slate-400 hover:shadow-[0_12px_28px_-14px_rgba(15,23,42,0.22)]"
            }`}
          >
            {isPrimary && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-500/30 blur-3xl"
              />
            )}
            <div className="relative flex items-start justify-between">
              <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isPrimary ? "text-teal-300" : "text-slate-600"}`}>{k.label}</p>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset transition-colors ${
                  isPrimary
                    ? "bg-teal-500/15 text-teal-300 ring-teal-400/30 group-hover:bg-teal-500/25 group-hover:text-teal-200"
                    : "bg-slate-100 text-slate-700 ring-slate-200 group-hover:bg-teal-600 group-hover:text-white group-hover:ring-teal-600"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className={`num relative mt-3.5 text-[1.875rem] font-bold leading-none tracking-tight ${isPrimary ? "text-white" : "text-slate-950"}`}>
              {k.value}
            </p>
            <div className="relative mt-2.5 flex items-center gap-2">
              {k.delta && (
                <span
                  className={`num inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                    k.delta.positive
                      ? isPrimary
                        ? "bg-teal-500 text-white"
                        : "bg-teal-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  <Arrow className="h-3 w-3" aria-hidden="true" />
                  {k.delta.value}
                </span>
              )}
              {k.sub && <p className={`text-[11px] font-medium ${isPrimary ? "text-slate-300" : "text-slate-600"}`}>{k.sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
