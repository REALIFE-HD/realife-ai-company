import { TrendingUp, FileText, DollarSign, Users } from "lucide-react";

type Kpi = {
  label: string;
  value: string;
  sub?: string;
  delta?: { value: string; positive: boolean };
  icon: typeof TrendingUp;
};

const KPIS: Kpi[] = [
  { label: "今月の成約額", value: "¥18,450,000", sub: "Q2 2026 進行中", delta: { value: "+12.4% vs 先月", positive: true }, icon: DollarSign },
  { label: "進行中案件", value: "47", sub: "全部門合計", icon: FileText },
  { label: "今週の見積", value: "12", sub: "ダブルチェック中 6", icon: TrendingUp },
  { label: "稼働メンバー", value: "8", sub: "オンライン 5", icon: Users },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {KPIS.map((k) => {
        const Icon = k.icon;
        return (
          <div
            key={k.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)]"
          >
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{k.label}</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-teal-600">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 font-mono text-[1.75rem] font-semibold leading-none tracking-tight text-slate-900">
              {k.value}
            </p>
            {k.sub && <p className="mt-2 text-[11px] text-slate-500">{k.sub}</p>}
            {k.delta && (
              <p
                className={`mt-2 inline-flex items-center gap-1 font-mono text-[11px] font-medium ${k.delta.positive ? "text-teal-600" : "text-red-600"}`}
              >
                <span aria-hidden="true">{k.delta.positive ? "↑" : "↓"}</span>
                {k.delta.value}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
