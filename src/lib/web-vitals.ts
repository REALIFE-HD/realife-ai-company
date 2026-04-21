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
  /** エラー系メトリクスのみ。スタックトレース文字列 */
  stack?: string;
  /** エラー系メトリクスのみ。発生元 URL */
  source?: string;
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

  initErrorTracking();
}

/**
 * 未捕捉エラー / Promise 拒否を捕捉し、メトリクスバッファに記録する。
 * スタックトレースを残すことで、ボトルネック診断時に発生箇所を辿れるようにする。
 */
function initErrorTracking() {
  if (typeof window === "undefined") return;

  const logError = (m: CapturedMetric) => {
    pushMetric(m);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        `%c[error] %c${m.name}%c ${m.id}`,
        "color:#dc2626;font-weight:600",
        "color:#0f172a;font-weight:600",
        "color:#64748b",
      );
      if (m.stack) {
        // eslint-disable-next-line no-console
        console.log(m.stack);
      }
    }
  };

  window.addEventListener("error", (event: ErrorEvent) => {
    const err = event.error as Error | undefined;
    logError({
      name: "JSError",
      value: 1,
      rating: "poor",
      id: (err?.message || event.message || "unknown error").slice(0, 200),
      timestamp: Date.now(),
      stack: err?.stack ?? `${event.filename}:${event.lineno}:${event.colno}`,
      source: event.filename || window.location.pathname,
    });
  });

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const reason = event.reason as unknown;
    let message = "unhandled rejection";
    let stack: string | undefined;
    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack;
    } else if (typeof reason === "string") {
      message = reason;
    } else if (reason && typeof reason === "object") {
      try {
        message = JSON.stringify(reason).slice(0, 200);
      } catch {
        message = String(reason);
      }
    }
    logError({
      name: "UnhandledRejection",
      value: 1,
      rating: "poor",
      id: message.slice(0, 200),
      timestamp: Date.now(),
      stack,
      source: window.location.pathname,
    });
  });

  // Resource エラー (画像/script/css 読み込み失敗) — capture フェーズで拾う
  window.addEventListener(
    "error",
    (event: Event) => {
      const target = event.target as (HTMLElement & { src?: string; href?: string }) | null;
      if (!target || target === (window as unknown as EventTarget)) return;
      const tag = target.tagName?.toLowerCase();
      if (!tag || !["img", "script", "link", "video", "audio", "source"].includes(tag)) return;
      const url = target.src || target.href || "";
      if (!url) return;
      logError({
        name: "ResourceError",
        value: 1,
        rating: "needs-improvement",
        id: `${tag}: ${url}`.slice(0, 200),
        timestamp: Date.now(),
        source: url,
      });
    },
    true,
  );
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
