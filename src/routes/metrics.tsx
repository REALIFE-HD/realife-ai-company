import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CapturedMetric } from "@/lib/web-vitals";
import { useRouteMountMark } from "@/lib/web-vitals";

export const Route = createFileRoute("/metrics")({
  head: () => ({
    meta: [
      { title: "メトリクス — REALIFE Operations" },
      {
        name: "description",
        content: "Web Vitals (LCP / CLS / INP / FCP / TTFB) とルート遷移の所要時間を時系列で可視化。",
      },
      { property: "og:title", content: "メトリクス — REALIFE Operations" },
      {
        property: "og:description",
        content: "Web Vitals とルート遷移の所要時間を時系列で可視化するダッシュボード。",
      },
    ],
  }),
  component: MetricsPage,
});

const VITAL_NAMES = ["LCP", "CLS", "INP", "FCP", "TTFB"] as const;
type VitalName = (typeof VITAL_NAMES)[number];

const VITAL_COLORS: Record<VitalName | "RouteChange", string> = {
  LCP: "hsl(220 90% 56%)",
  CLS: "hsl(280 70% 55%)",
  INP: "hsl(160 70% 40%)",
  FCP: "hsl(40 90% 50%)",
  TTFB: "hsl(0 75% 55%)",
  RouteChange: "hsl(260 80% 60%)",
};

const RATING_COLOR: Record<CapturedMetric["rating"], string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  "needs-improvement": "text-amber-600 dark:text-amber-400",
  poor: "text-red-600 dark:text-red-400",
  "n/a": "text-muted-foreground",
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function MetricsPage() {
  useRouteMountMark("/metrics");
  return (
    <AppShell
      title="パフォーマンス計測"
      subtitle="Web Vitals と画面遷移の所要時間を時系列で確認できます。"
    >
      <div className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> ホーム
        </Link>

        <ClientOnly fallback={<div className="text-sm text-muted-foreground">読み込み中…</div>}>
          <MetricsDashboard />
        </ClientOnly>

        <Footer />
      </div>
    </AppShell>
  );
}

function MetricsDashboard() {
  const [metrics, setMetrics] = useState<CapturedMetric[]>(
    () => window.__realifeMetrics?.slice() ?? [],
  );
  const [tick, setTick] = useState(0);

  // 1秒ごとに再取得（軽量。バッファは最大200件で頭打ち）
  useEffect(() => {
    const id = window.setInterval(() => {
      setMetrics(window.__realifeMetrics?.slice() ?? []);
      setTick((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const vitalsByName = useMemo(() => {
    const out: Record<VitalName, CapturedMetric[]> = {
      LCP: [],
      CLS: [],
      INP: [],
      FCP: [],
      TTFB: [],
    };
    for (const m of metrics) {
      if ((VITAL_NAMES as readonly string[]).includes(m.name)) {
        out[m.name as VitalName].push(m);
      }
    }
    return out;
  }, [metrics]);

  const routeChanges = useMemo(
    () => metrics.filter((m) => m.name === "RouteChange"),
    [metrics],
  );

  const vitalsSeries = useMemo(() => {
    // 各 Vitals を時系列順に並べ、共通の time 軸でマージ
    const all = VITAL_NAMES.flatMap((n) => vitalsByName[n].map((m) => ({ ...m, key: n })));
    all.sort((a, b) => a.timestamp - b.timestamp);
    return all.map((m) => ({
      time: formatTime(m.timestamp),
      ts: m.timestamp,
      [m.key]: Math.round(m.value * 100) / 100,
    }));
  }, [vitalsByName]);

  const routeSeries = useMemo(
    () =>
      routeChanges.map((m) => ({
        time: formatTime(m.timestamp),
        path: m.id,
        ms: Math.round(m.value),
      })),
    [routeChanges],
  );

  const handleClear = () => {
    if (window.__realifeMetrics) window.__realifeMetrics.length = 0;
    setMetrics([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setTick((t) => t + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" /> 更新
        </Button>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" /> バッファをクリア
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {metrics.length} 件 / 最大 200 件 ・ 自動更新 1s
        </span>
      </div>

      <SummaryCards metrics={metrics} />

      <ChartCard
        title="Web Vitals (LCP / INP / FCP / TTFB) — ms"
        empty={vitalsSeries.length === 0}
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={vitalsSeries} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {(["LCP", "INP", "FCP", "TTFB"] as const).map((k) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={VITAL_COLORS[k]}
                dot={{ r: 2 }}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="CLS (Cumulative Layout Shift)"
        empty={vitalsByName.CLS.length === 0}
      >
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={vitalsByName.CLS.map((m) => ({
              time: formatTime(m.timestamp),
              CLS: Math.round(m.value * 1000) / 1000,
            }))}
            margin={{ top: 8, right: 16, bottom: 0, left: -8 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="CLS" stroke={VITAL_COLORS.CLS} strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="ルート遷移時間 (RouteChange) — ms"
        empty={routeSeries.length === 0}
      >
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={routeSeries} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
              formatter={(value: number, _name, p) => [`${value} ms`, p?.payload?.path ?? "route"]}
            />
            <Line
              type="monotone"
              dataKey="ms"
              stroke={VITAL_COLORS.RouteChange}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <NetworkPanel metrics={metrics} />
      <ErrorsPanel metrics={metrics} />
      <RecentTable metrics={metrics} key={tick} />
    </div>
  );
}

function SummaryCards({ metrics }: { metrics: CapturedMetric[] }) {
  const summary = useMemo(() => {
    const map = new Map<string, CapturedMetric>();
    for (const m of metrics) {
      const prev = map.get(m.name);
      if (!prev || m.timestamp > prev.timestamp) map.set(m.name, m);
    }
    return [...VITAL_NAMES, "RouteChange" as const].map((n) => ({
      name: n,
      latest: map.get(n),
    }));
  }, [metrics]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {summary.map(({ name, latest }) => (
        <div
          key={name}
          className="rounded-lg border border-border bg-card p-3 shadow-sm"
        >
          <div className="text-xs font-medium text-muted-foreground">{name}</div>
          <div className="mt-1 text-lg font-semibold tabular-nums">
            {latest
              ? `${Math.round(latest.value * (name === "CLS" ? 1000 : 1)) / (name === "CLS" ? 1000 : 1)}${name === "CLS" ? "" : "ms"}`
              : "—"}
          </div>
          <div className={`text-xs ${latest ? RATING_COLOR[latest.rating] : "text-muted-foreground"}`}>
            {latest?.rating ?? "no data"}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentTable({ metrics }: { metrics: CapturedMetric[] }) {
  const recent = metrics.slice(-15).reverse();
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-2 text-sm font-medium">直近 15 件</div>
      {recent.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">
          まだメトリクスがありません。アプリを操作すると蓄積されます。
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left font-medium">時刻</th>
              <th className="px-4 py-2 text-left font-medium">指標</th>
              <th className="px-4 py-2 text-right font-medium">値</th>
              <th className="px-4 py-2 text-left font-medium">評価</th>
              <th className="px-4 py-2 text-left font-medium">ID</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((m, i) => (
              <tr key={`${m.id}-${i}`} className="border-b border-border last:border-0">
                <td className="px-4 py-2 tabular-nums text-muted-foreground">
                  {formatTime(m.timestamp)}
                </td>
                <td className="px-4 py-2 font-medium">{m.name}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {Math.round(m.value * 100) / 100}
                  {m.name === "CLS" ? "" : "ms"}
                </td>
                <td className={`px-4 py-2 ${RATING_COLOR[m.rating]}`}>{m.rating}</td>
                <td className="max-w-[200px] truncate px-4 py-2 text-xs text-muted-foreground">
                  {m.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ChartCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium">{title}</div>
      {empty ? (
        <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
          データがまだ収集されていません。
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function ErrorsPanel({ metrics }: { metrics: CapturedMetric[] }) {
  const errors = useMemo(
    () =>
      metrics
        .filter((m) => m.name === "JSError" || m.name === "UnhandledRejection" || m.name === "ResourceError")
        .slice(-10)
        .reverse(),
    [metrics],
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium">エラー / Promise 拒否</span>
        <span className="text-xs text-muted-foreground">
          {errors.length === 0 ? "0 件" : `直近 ${errors.length} 件`}
        </span>
      </div>
      {errors.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">
          まだエラーは記録されていません。
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {errors.map((m, i) => (
            <li key={`${m.timestamp}-${i}`} className="px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">{formatTime(m.timestamp)}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                  {m.name}
                </span>
                {m.source ? <span className="truncate">{m.source}</span> : null}
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{m.id}</div>
              {m.stack ? (
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
                  {m.stack}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
