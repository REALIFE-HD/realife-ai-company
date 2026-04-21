// 検索履歴のクライアントローカル設定（localStorage に保存）
// DB 同期は不要なため、localStorage で軽量に管理する。

import { useEffect, useState } from "react";

const STORAGE_KEY = "realife:search-prefs";

export const HISTORY_LIMIT_DEFAULT = 8;
export const HISTORY_LIMIT_MIN = 3;
export const HISTORY_LIMIT_MAX = 30;

export type SearchPrefs = {
  historyLimit: number;
};

export const DEFAULT_SEARCH_PREFS: SearchPrefs = {
  historyLimit: HISTORY_LIMIT_DEFAULT,
};

function clampLimit(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : HISTORY_LIMIT_DEFAULT;
  return Math.min(HISTORY_LIMIT_MAX, Math.max(HISTORY_LIMIT_MIN, v));
}

export function loadSearchPrefs(): SearchPrefs {
  if (typeof window === "undefined") return DEFAULT_SEARCH_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SEARCH_PREFS;
    const parsed = JSON.parse(raw) as Partial<SearchPrefs>;
    return { historyLimit: clampLimit(parsed.historyLimit) };
  } catch {
    return DEFAULT_SEARCH_PREFS;
  }
}

export function saveSearchPrefs(patch: Partial<SearchPrefs>): SearchPrefs {
  const next: SearchPrefs = {
    ...loadSearchPrefs(),
    ...patch,
  };
  next.historyLimit = clampLimit(next.historyLimit);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("realife:search-prefs-change", { detail: next }));
    } catch {
      /* ignore */
    }
  }
  return next;
}

// 同一タブ内（CustomEvent）と他タブ（storage event）の双方に追従するフック
export function useSearchPrefs(): [SearchPrefs, (patch: Partial<SearchPrefs>) => void] {
  const [prefs, setPrefs] = useState<SearchPrefs>(() => loadSearchPrefs());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<SearchPrefs>).detail;
      if (detail) setPrefs(detail);
      else setPrefs(loadSearchPrefs());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPrefs(loadSearchPrefs());
    };
    window.addEventListener("realife:search-prefs-change", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("realife:search-prefs-change", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = (patch: Partial<SearchPrefs>) => {
    const next = saveSearchPrefs(patch);
    setPrefs(next);
  };

  return [prefs, update];
}
