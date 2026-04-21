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
  initResourceTiming();
}

/**
 * fetch / XHR / script / css などのリソース取得時間とサイズを計測し、
 * 現在ルートと紐付けて記録する。遅いルートと API 呼び出しの相関を取りやすくするため。
 *
 * - duration: PerformanceResourceTiming の duration (ms)
 * - transferSize: Content-Length 相当 (圧縮後)。0 のときは encodedBodySize にフォールバック
 * - source: リクエスト URL (origin 短縮)
 * - id: "<METHOD ?> <route> ← <url>" 形式
 */
function initResourceTiming() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  const shortenUrl = (url: string): string => {
    try {
      const u = new URL(url, window.location.origin);
      const path = u.pathname + (u.search ? u.search.slice(0, 40) : "");
      return u.origin === window.location.origin ? path : `${u.host}${path}`;
    } catch {
      return url.slice(0, 120);
    }
  };

  try {
    const obs = new PerformanceObserver((list) => {
      const route = window.location.pathname;
      for (const raw of list.getEntries()) {
        const entry = raw as PerformanceResourceTiming;
        // fetch / XHR のみに絞る (script, css, img などはノイズになりやすい)
        if (entry.initiatorType !== "fetch" && entry.initiatorType !== "xmlhttprequest") continue;
        if (entry.duration < 1) continue;

        const size = entry.transferSize || entry.encodedBodySize || 0;
        const m: CapturedMetric = {
          name: "Resource",
          value: entry.duration,
          rating:
            entry.duration < 200 ? "good" : entry.duration < 800 ? "needs-improvement" : "poor",
          id: `${route} ← ${shortenUrl(entry.name)}${size ? ` (${formatBytes(size)})` : ""}`,
          timestamp: Date.now(),
          source: entry.name,
        };
        pushMetric(m);
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log(
            `%c[net] %c${shortenUrl(entry.name)}%c ${Math.round(entry.duration)}ms${size ? ` ・ ${formatBytes(size)}` : ""} %c(${m.rating})`,
            "color:#0d9488;font-weight:600",
            "color:#0f172a;font-weight:600",
            "color:#0f172a",
            COLORS[m.rating],
          );
        }
      }
    });
    obs.observe({ type: "resource", buffered: true });
  } catch {
    // resource timing 未対応は無視
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
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

/**
 * ルートコンポーネントの「初回マウント時間」を計測するためのフック。
 *
 * ルート遷移開始 (markNavigationStart) からこのフックの useEffect が走るまで
 * の経過時間を `RouteMount` として記録する。これは「動的 import チャンクの
 * 取得 + ローダー実行 + React のレンダー確定」までを含む実体感に近い値で、
 * RouteChange と並べることでチャンク読み込みのコストを切り分けやすくなる。
 *
 * 使い方: 各ルートコンポーネントの先頭で `useRouteMountMark("/path")` を呼ぶ。
 */
export function useRouteMountMark(routePath: string) {
  // 動的 import される route component が評価された瞬間のタイムスタンプ
  // = "chunk loaded & module evaluated" を近似する。
  const moduleEvalAt = typeof performance !== "undefined" ? performance.now() : 0;

  if (typeof window === "undefined") return;

  // useEffect 相当のタイミングで mount 完了を記録するため、
  // micro task で呼び出して React の commit 直後に走らせる。
  queueMicrotask(() => {
    if (typeof performance === "undefined") return;
    const now = performance.now();
    const sinceNavStart = navStart !== null ? now - navStart : null;
    const sinceModuleEval = now - moduleEvalAt;

    const duration = sinceNavStart ?? sinceModuleEval;
    const m: CapturedMetric = {
      name: "RouteMount",
      value: duration,
      rating: duration < 100 ? "good" : duration < 300 ? "needs-improvement" : "poor",
      id: routePath,
      timestamp: Date.now(),
    };
    pushMetric(m);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        `%c[mount] %c${routePath}%c ${Math.round(duration)}ms %c(${m.rating})`,
        "color:#0891b2;font-weight:600",
        "color:#0f172a;font-weight:600",
        "color:#0f172a",
        COLORS[m.rating],
      );
    }
  });
}

/** DevTools から `window.__realifeMetricsTable()` で一覧表示できるようにする */
export function exposeMetricsHelpers() {
  if (typeof window === "undefined") return;
  (window as unknown as { __realifeMetricsTable?: () => void }).__realifeMetricsTable = () => {
    // eslint-disable-next-line no-console
    console.table(window.__realifeMetrics ?? []);
  };
}

/* -------------------------------------------------------------------------
 * Opt-in transport
 * -------------------------------------------------------------------------
 * 本番環境で計測データを集約サーバーに送信したい場合に使う、軽量バッチ送信。
 *
 * 設計方針:
 * - 既定では無効。`localStorage["realife:metrics:optin"]==="1"` でオプトイン。
 * - 送信先 URL は `VITE_METRICS_ENDPOINT` (ビルド時) を使用。未設定なら何もしない。
 * - 30 秒ごと、もしくは 50 件溜まった時点でフラッシュ。
 * - ページ離脱時 (`pagehide`) は `navigator.sendBeacon` を使い確実に送る。
 * - 送信済みのカーソルを保持し、同じ計測値を二重送信しない。
 * - 送信失敗は静かに無視（次回マージしてリトライ）。計測自体を阻害しない。
 */

type TransportConfig = {
  endpoint: string;
  /** バッチサイズしきい値 (これを超えたら即時フラッシュ) */
  batchSize?: number;
  /** インターバル (ms) */
  intervalMs?: number;
  /** 追加のメタ情報 (例: app version, env) */
  meta?: Record<string, unknown>;
};

let transportInited = false;
let lastFlushedIndex = 0; // window.__realifeMetrics の何件目まで送ったか
let flushTimer: ReturnType<typeof setInterval> | null = null;

const OPTIN_KEY = "realife:metrics:optin";

export function isMetricsOptedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(OPTIN_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMetricsOptIn(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(OPTIN_KEY, "1");
    else window.localStorage.removeItem(OPTIN_KEY);
  } catch {
    /* noop */
  }
}

/**
 * バッチ送信トランスポートを起動する。
 * 通常は `initWebVitals()` の後に `initMetricsTransport({ endpoint })` を呼ぶ。
 * `endpoint` が空 / オプトイン無効 / SSR の場合は何もしない（多重起動も防止）。
 */
export function initMetricsTransport(config: TransportConfig) {
  if (typeof window === "undefined" || transportInited) return;
  if (!config.endpoint) return;
  if (!isMetricsOptedIn()) return;

  transportInited = true;
  const batchSize = config.batchSize ?? 50;
  const intervalMs = config.intervalMs ?? 30_000;

  const buildPayload = () => {
    const buf = window.__realifeMetrics ?? [];
    if (lastFlushedIndex > buf.length) lastFlushedIndex = 0; // バッファが切り詰められた
    const slice = buf.slice(lastFlushedIndex);
    if (slice.length === 0) return null;
    return {
      sentAt: Date.now(),
      url: window.location.href,
      ua: navigator.userAgent,
      meta: config.meta ?? {},
      metrics: slice,
    };
  };

  const flush = async (useBeacon = false) => {
    const payload = buildPayload();
    if (!payload) return;
    const body = JSON.stringify(payload);
    const startIndex = lastFlushedIndex;
    const endIndex = (window.__realifeMetrics ?? []).length;

    try {
      if (useBeacon && "sendBeacon" in navigator) {
        const blob = new Blob([body], { type: "application/json" });
        const ok = navigator.sendBeacon(config.endpoint, blob);
        if (ok) lastFlushedIndex = endIndex;
        return;
      }
      const res = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "omit",
      });
      if (res.ok) lastFlushedIndex = endIndex;
    } catch {
      // 失敗時は lastFlushedIndex を進めない → 次回再送
      lastFlushedIndex = startIndex;
    }
  };

  // 一定間隔
  flushTimer = setInterval(() => {
    void flush(false);
  }, intervalMs);

  // バッチサイズ閾値: メトリクス追加を監視するため軽くポーリング
  const sizeWatcher = setInterval(() => {
    const buf = window.__realifeMetrics ?? [];
    if (buf.length - lastFlushedIndex >= batchSize) {
      void flush(false);
    }
  }, 2_000);

  // 離脱時に sendBeacon でフラッシュ
  const onPageHide = () => {
    void flush(true);
  };
  window.addEventListener("pagehide", onPageHide);
  // タブ非表示時にも一度送っておく
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush(true);
  });

  // テスト/DevTools から手動フラッシュできるよう露出
  (
    window as unknown as { __realifeFlushMetrics?: () => Promise<void> }
  ).__realifeFlushMetrics = () => flush(false);

  // クリーンアップ用 (HMR 対策)
  (
    window as unknown as { __realifeStopMetrics?: () => void }
  ).__realifeStopMetrics = () => {
    if (flushTimer) clearInterval(flushTimer);
    clearInterval(sizeWatcher);
    window.removeEventListener("pagehide", onPageHide);
    transportInited = false;
  };
}

