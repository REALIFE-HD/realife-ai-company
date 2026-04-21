import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";
const STORAGE_KEY = "realife:theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// デフォルトはダーク。設定画面でユーザーが明示的に変更した場合のみ尊重する。
function readStored(): ThemePreference {
  if (typeof window === "undefined") return "dark";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "dark";
  } catch {
    return "dark";
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function resolve(pref: ThemePreference): Theme {
  return pref === "system" ? getSystemTheme() : pref;
}

/**
 * テーマ管理フック。
 * - preference: ユーザーが選んだ値(light / dark / system)
 * - theme: 実際に適用されている色(light / dark)
 * - system 選択時は OS の prefers-color-scheme に追従
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readStored());
  const [theme, setThemeState] = useState<Theme>(() => resolve(readStored()));

  // 初期適用 / preference 変更時の反映
  useEffect(() => {
    const next = resolve(preference);
    setThemeState(next);
    applyTheme(next);
  }, [preference]);

  // OS 設定の変更に追従(system のときのみ)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (preference === "system") {
        const next = mq.matches ? "dark" : "light";
        setThemeState(next);
        applyTheme(next);
      }
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [preference]);

  // 他タブ・同タブ間の同期
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPreferenceState(readStored());
    };
    const onCustom = (e: Event) => {
      const t = (e as CustomEvent<ThemePreference>).detail;
      if (t === "light" || t === "dark" || t === "system") setPreferenceState(t);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("realife:theme-change", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("realife:theme-change", onCustom as EventListener);
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setPreferenceState(next);
    try {
      window.dispatchEvent(new CustomEvent("realife:theme-change", { detail: next }));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    // ヘッダーボタン用: 現在の表示を見て反転(systemも明示値に固定する)
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme, setPreference]);

  return { theme, preference, setPreference, toggle };
}
