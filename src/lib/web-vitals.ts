/**
 * Web Vitals & ルート遷移計測
 * --------------------------------------------------------------
 * Core Web Vitals (LCP / CLS / INP / FCP / TTFB) と、ルート遷移ごとの
 * ナビゲーション所要時間を集約し、コンソールに整形出力する。
 *
 * - 開発時: console.table / console.log で読みやすく出力
 * - 本番:  window.__realifeMetrics に蓄積し、後から外部送信フックを足せる
 *          ように設計（現時点では送信しない）
 *
 * 使い方: クライアント起動時に `initWebVitals()` を一度だけ呼ぶ。
 */

import type { Metric } from "web-vitals";

type MetricRating = "good" | "needs-improvement" | "poor";

export type CapturedMetric = {
  name: string;
  value: number;
  rating: MetricRating | "n/a";
  id: string;
  navigationType?: string;
  timestamp: number;
};

declare global {
  interface Window {
    __realifeMetrics?: CapturedMetric[];
  }
}

const COLORS: Record<MetricRating | "n/a", string> = {
  good: "color:#16a34a;font-weight:600",
  "needs-improvement": "color:#d97706;font-weight:600",
  poor: "color:#dc2626;font-weight:600",
  "n/a": "color:#64748b;font-weight:600",
};

function pushMetric(m: CapturedMetric) {
  if (typeof window === "undefined") return;
  if (!window.__realifeMetrics) window.__realifeMetrics = [];
  window.__realifeMetrics.push(m);
  // バッファが膨らみすぎないよう直近 200 件に制限
  if (window.__realifeMetrics.length > 200) {
    window.__realifeMetrics.splice(0, window.__realifeMetrics.length - 200);
  }
}

function logMetric(m: CapturedMetric) {
  const rounded = Math.round(m.value * 100) / 100;
  // eslint-disable-next-line no-console
  console.log(
    `%c[vitals] %c${m.name}%c ${rounded}${m.name === "CLS" ? "" : "ms"} %c(${m.rating})`,
    "color:#2563eb;font-weight:600",
    "color:#0f172a;font-weight:600",
    "color:#0f172a",
    COLORS[m.rating],
  );
}

function handleVital(metric: Metric) {
  const captured: CapturedMetric = {
    name: metric.name,
    value: metric.value,
    rating: (metric.rating ?? "n/a") as CapturedMetric["rating"],
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
  };
  pushMetric(captured);
  if (import.meta.env.DEV) logMetric(captured);
}

let initialized = false;

export function initWebVitals() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  // Core Web Vitals — 動的 import でメインバンドルに載せない
  import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    onCLS(handleVital);
    onINP(handleVital);
    onLCP(handleVital);
    onFCP(handleVital);
    onTTFB(handleVital);
  });

  // 長い JS タスク (>50ms) を検出してログ
  if ("PerformanceObserver" in window) {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration < 80) continue;
          const m: CapturedMetric = {
            name: "LongTask",
            value: entry.duration,
            rating: entry.duration > 200 ? "poor" : "needs-improvement",
            id: `lt-${entry.startTime}`,
            timestamp: Date.now(),
          };
          pushMetric(m);
          if (import.meta.env.DEV) logMetric(m);
        }
      });
      obs.observe({ type: "longtask", buffered: true });
    } catch {
      // longtask 未対応ブラウザは無視
    }
  }
}

/**
 * ルート遷移の所要時間を計測する。
 * `start()` は遷移開始時、`end(routePath)` は遷移完了時に呼ぶ。
 */
let navStart: number | null = null;

export function markNavigationStart() {
  if (typeof performance === "undefined") return;
  navStart = performance.now();
}

export function markNavigationEnd(routePath: string) {
  if (typeof performance === "undefined" || navStart === null) return;
  const duration = performance.now() - navStart;
  navStart = null;
  const m: CapturedMetric = {
    name: "RouteChange",
    value: duration,
    rating: duration < 200 ? "good" : duration < 500 ? "needs-improvement" : "poor",
    id: routePath,
    timestamp: Date.now(),
  };
  pushMetric(m);
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(
      `%c[nav] %c${routePath}%c ${Math.round(duration)}ms %c(${m.rating})`,
      "color:#7c3aed;font-weight:600",
      "color:#0f172a;font-weight:600",
      "color:#0f172a",
      COLORS[m.rating],
    );
  }
}

/** DevTools から `window.__realifeMetricsTable()` で一覧表示できるようにする */
export function exposeMetricsHelpers() {
  if (typeof window === "undefined") return;
  (window as unknown as { __realifeMetricsTable?: () => void }).__realifeMetricsTable = () => {
    // eslint-disable-next-line no-console
    console.table(window.__realifeMetrics ?? []);
  };
}
