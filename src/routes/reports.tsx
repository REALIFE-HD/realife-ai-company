import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
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
import { aggregateMonthlyRevenue, type MonthlyRevenueStat } from "@/lib/deals";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "レポート — REALIFE Operations" },
      { name: "description", content: "月次成約推移と部門別タスク消化率の集計レポート。" },
      { property: "og:title", content: "レポート — REALIFE Operations" },
      { property: "og:description", content: "月次成約推移と部門別タスク消化率を可視化。" },
    ],
  }),
  loader: async () => {
    try {
      return { monthly: await aggregateMonthlyRevenue(6) };
    } catch (e) {
      console.error("[reports.loader]", e);
      return { monthly: [] as MonthlyRevenueStat[] };
    }
  },
  staleTime: 30_000,
  component: ReportsPage,
});

const DEPT_PROGRESS = DEPARTMENTS.map((d, i) => ({
  name: d.name,
  完了率: Math.max(35, Math.min(98, 60 + ((i * 7) % 40) - 10)),
}));

function ReportsPage() {
  useRouteMountMark("/reports");
  const initial = Route.useLoaderData();
  const [monthly, setMonthly] = useState<MonthlyRevenueStat[]>(initial.monthly);

  // Realtime: deals テーブルが更新されたら再集計
  useEffect(() => {
    let mounted = true;
    const channel = supabase
      .channel("reports-deals")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => {
        aggregateMonthlyRevenue(6)
          .then((d) => mounted && setMonthly(d))
          .catch(console.error);
      })
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const ytd = monthly.reduce((acc, m) => acc + m.revenue, 0);
  const avg = monthly.length > 0 ? (ytd / monthly.length).toFixed(1) : "0.0";
  const peak = monthly.length > 0 ? monthly.reduce((m, c) => (c.revenue > m.revenue ? c : m)) : null;

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
            { l: "ピーク月", v: peak ? peak.month : "—" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
              <p className="kpi-value mt-1 text-right text-2xl text-foreground">{s.v}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">月次成約推移</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">単位:百万円(¥M)・件数 / ステージ「受注」の案件を集計</p>
            </div>
            <button
              type="button"
              onClick={() => aggregateMonthlyRevenue(6).then(setMonthly).catch(console.error)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              title="再読み込み"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-6 h-72 w-full">
            {monthly.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                受注案件のデータがありません
              </div>
            ) : (
              <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-md bg-muted" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
            )}
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
    </AppShell>
  );
}
