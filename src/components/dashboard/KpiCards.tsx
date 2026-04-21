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
      {KPIS.map((k) => {
        const Icon = k.icon;
        const Arrow = k.delta?.positive ? ArrowUpRight : ArrowDownRight;
        return (
          <div
            key={k.label}
            className="group relative rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_-16px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">{k.label}</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200/70 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-100">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className="num mt-3.5 text-[1.875rem] font-semibold leading-none tracking-tight text-slate-950">
              {k.value}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              {k.delta && (
                <span
                  className={`num inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                    k.delta.positive
                      ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100"
                      : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100"
                  }`}
                >
                  <Arrow className="h-3 w-3" aria-hidden="true" />
                  {k.delta.value}
                </span>
              )}
              {k.sub && <p className="text-[11px] text-slate-500">{k.sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
