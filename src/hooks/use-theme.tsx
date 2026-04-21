import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "realife:theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStored(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/**
 * テーマ管理フック。
 * - 明示的に保存された値があればそれを使用
 * - なければ OS の設定に追従
 * - 同タブ内・他タブ間で同期
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readStored() ?? getSystemTheme());

  // 初期適用
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // OS 設定の変更に追従(明示保存がない場合のみ)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStored() === null) setThemeState(mq.matches ? "dark" : "light");
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // 他タブとの同期
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setThemeState(readStored() ?? getSystemTheme());
      }
    };
    const onCustom = (e: Event) => {
      const t = (e as CustomEvent<Theme>).detail;
      if (t === "light" || t === "dark") setThemeState(t);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("realife:theme-change", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("realife:theme-change", onCustom as EventListener);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setThemeState(next);
    try {
      window.dispatchEvent(new CustomEvent("realife:theme-change", { detail: next }));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
