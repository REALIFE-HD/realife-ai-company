// 表示・操作系のクライアントローカル設定
// 密度(行間/パディング)と日付フォーマットを localStorage に保持する。

import { useEffect, useState } from "react";

const STORAGE_KEY = "realife:display-prefs";

export type Density = "comfortable" | "compact";
export type DateFormat = "ja-long" | "ja-short" | "iso";

export type DisplayPrefs = {
  density: Density;
  dateFormat: DateFormat;
};

export const DEFAULT_DISPLAY_PREFS: DisplayPrefs = {
  density: "comfortable",
  dateFormat: "ja-long",
};

export const DENSITY_OPTIONS: { value: Density; label: string; description: string }[] = [
  { value: "comfortable", label: "標準", description: "ゆとりあるパディング" },
  { value: "compact", label: "コンパクト", description: "情報量を優先" },
];

export const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string; sample: string }[] = [
  { value: "ja-long", label: "日本語(長め)", sample: "2026年4月21日(火)" },
  { value: "ja-short", label: "日本語(短め)", sample: "4/21 (火)" },
  { value: "iso", label: "ISO 形式", sample: "2026-04-21" },
];

export function loadDisplayPrefs(): DisplayPrefs {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DISPLAY_PREFS;
    const parsed = JSON.parse(raw) as Partial<DisplayPrefs>;
    return {
      density: parsed.density === "compact" ? "compact" : "comfortable",
      dateFormat:
        parsed.dateFormat === "ja-short" || parsed.dateFormat === "iso"
          ? parsed.dateFormat
          : "ja-long",
    };
  } catch {
    return DEFAULT_DISPLAY_PREFS;
  }
}

export function saveDisplayPrefs(patch: Partial<DisplayPrefs>): DisplayPrefs {
  const next: DisplayPrefs = { ...loadDisplayPrefs(), ...patch };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("realife:display-prefs-change", { detail: next }));
    } catch {
      /* ignore */
    }
  }
  return next;
}

function applyDensity(density: Density) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.density = density;
}

export function useDisplayPrefs(): [DisplayPrefs, (patch: Partial<DisplayPrefs>) => void] {
  const [prefs, setPrefs] = useState<DisplayPrefs>(() => loadDisplayPrefs());

  // density は <html data-density="..."> として反映し、CSS から参照可能にする
  useEffect(() => {
    applyDensity(prefs.density);
  }, [prefs.density]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<DisplayPrefs>).detail;
      setPrefs(detail ?? loadDisplayPrefs());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPrefs(loadDisplayPrefs());
    };
    window.addEventListener("realife:display-prefs-change", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("realife:display-prefs-change", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = (patch: Partial<DisplayPrefs>) => setPrefs(saveDisplayPrefs(patch));

  return [prefs, update];
}

// 日付整形ユーティリティ
const FMT_LONG = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});
const FMT_SHORT = new Intl.DateTimeFormat("ja-JP", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

export function formatDate(date: Date | string, format: DateFormat): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  switch (format) {
    case "ja-long":
      return FMT_LONG.format(d);
    case "ja-short":
      return FMT_SHORT.format(d);
    case "iso":
      return d.toISOString().slice(0, 10);
  }
}
