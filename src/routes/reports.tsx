import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { useRouteMountMark } from "@/lib/web-vitals";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEPARTMENTS } from "@/data/departments";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "レポート — REALIFE Operations" },
      { name: "description", content: "月次成約推移と部門別タスク消化率の集計レポート。" },
      { property: "og:title", content: "レポート — REALIFE Operations" },
      { property: "og:description", content: "月次成約推移と部門別タスク消化率を可視化。" },
    ],
  }),
  component: ReportsPage,
});

const MONTHLY = [
  { month: "2025-11", revenue: 9.8, deals: 6 },
  { month: "2025-12", revenue: 12.4, deals: 8 },
  { month: "2026-01", revenue: 14.1, deals: 9 },
  { month: "2026-02", revenue: 11.7, deals: 7 },
  { month: "2026-03", revenue: 16.5, deals: 11 },
  { month: "2026-04", revenue: 18.4, deals: 12 },
];

const DEPT_PROGRESS = DEPARTMENTS.map((d, i) => ({
  name: d.name,
  完了率: Math.max(35, Math.min(98, 60 + ((i * 7) % 40) - 10)),
}));

function ReportsPage() {
  useRouteMountMark("/reports");
  const ytd = MONTHLY.reduce((acc, m) => acc + m.revenue, 0);
  const avg = (ytd / MONTHLY.length).toFixed(1);
  const peak = MONTHLY.reduce((m, c) => (c.revenue > m.revenue ? c : m));

  return (
    <AppShell title="レポート" subtitle="月次成約推移と部門別タスク消化率">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { l: "直近6ヶ月 累計", v: `¥${ytd.toFixed(1)}M` },
            { l: "月平均", v: `¥${avg}M` },
            { l: "ピーク月", v: peak.month },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
              <p className="kpi-value mt-1 text-right text-2xl text-foreground">{s.v}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">月次成約推移</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">単位:百万円(¥M)・件数</p>
          <div className="mt-6 h-72 w-full">
            <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-md bg-muted" />}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="成約額(¥M)" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="deals" name="件数" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">部門別タスク消化率</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">単位:%</p>
          <div className="mt-6 h-96 w-full">
            <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-md bg-muted" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPT_PROGRESS} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-30} textAnchor="end" interval={0} height={70} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="完了率" radius={[6, 6, 0, 0]}>
                    {DEPT_PROGRESS.map((d, i) => (
                      <Cell key={i} fill={d.完了率 >= 80 ? "#10b981" : d.完了率 >= 60 ? "#0d9488" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}
