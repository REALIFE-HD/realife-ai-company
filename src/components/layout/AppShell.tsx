import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, Building2, Briefcase, BarChart3, MessageSquare, Settings, Bell, Plus, Menu, X, BookOpen, Inbox, LogOut, Search, SlidersHorizontal, XCircle } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { NewInstructionDialog } from "@/components/instructions/NewInstructionDialog";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useAuth } from "@/hooks/use-auth";
import { SearchHistoryDropdown } from "./SearchHistoryDropdown";

import { normalizeQuery } from "@/lib/normalize-query";
import { useSearchPrefs } from "@/lib/search-prefs";

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (typeof document === "undefined") return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer != null) return;
      timer = setInterval(() => setNow(new Date()), intervalMs);
    };
    const stop = () => {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        setNow(new Date()); // 再表示時に即時同期
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [intervalMs]);
  return now;
}

const DATE_FMT = new Intl.DateTimeFormat("ja-JP", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});
const TIME_FMT = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const NAV = [
  { label: "ダッシュボード", to: "/", icon: LayoutGrid, exact: true },
  { label: "部門", to: "/departments", icon: Building2 },
  { label: "案件", to: "/deals", icon: Briefcase },
  { label: "インボックス", to: "/inbox", icon: Inbox },
  { label: "レポート", to: "/reports", icon: BarChart3 },
  { label: "AIチャット", to: "/ai", icon: MessageSquare },
  { label: "ドキュメント", to: "/docs", icon: BookOpen },
  { label: "設定", to: "/settings", icon: Settings },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname, hash } = useLocation();
  return (
    <nav className="px-3" aria-label="メインナビゲーション">
      <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Workspace
      </p>
      <ul className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            "exact" in item && item.exact
              ? pathname === "/" && !hash
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <li key={item.label}>
              <Link
                to={item.to}
                onClick={onNavigate}
                className={`group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-blue-50/70 text-blue-700"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1.5 left-0 w-[2px] rounded-r bg-blue-600"
                  />
                )}
                <Icon className={`h-4 w-4 transition-colors ${active ? "text-blue-600" : "text-muted-foreground group-hover:text-muted-foreground"}`} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-5 py-5" aria-label="REALIFE Operations">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground font-display text-sm font-semibold text-background"
      >
        RL
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-wide text-foreground">REALIFE</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI COMPANY</span>
      </span>
    </Link>
  );
}

function SidebarUser() {
  const { settings, loading } = useUserSettings();
  const { user, signOut } = useAuth();
  const name = settings.display_name || user?.email?.split("@")[0] || "ゲスト";
  const initials = name.trim().slice(0, 2).toUpperCase();
  const onLogout = async () => {
    await signOut();
    toast.success("ログアウトしました");
  };
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-2">
        <Link to="/settings" className="flex flex-1 items-center gap-2.5 rounded-md px-2 py-2 hover:bg-muted min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted font-mono text-[11px] font-medium text-muted-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">{loading ? "..." : name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.email ?? "REALIFE Inc."}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          aria-label="ログアウト"
          title="ログアウト"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  search,
  onSearchChange,
  searchPlaceholder = "案件・部門・指示を検索…",
  onFilterClick,
  filterActive = false,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onFilterClick?: () => void;
  filterActive?: boolean;
}) {
  const { pathname } = useLocation();
  const storageKey = `realife:search:${pathname}`;
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const searchValue = search ?? localSearch;
  const setSearch = onSearchChange ?? setLocalSearch;
  const now = useNow();

  // Rehydrate persisted search on mount / route change
  const hydratedRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hydratedRef.current === pathname) return;
    hydratedRef.current = pathname;
    try {
      const saved = window.sessionStorage.getItem(storageKey);
      if (saved && saved !== searchValue) setSearch(saved);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (searchValue) window.sessionStorage.setItem(storageKey, searchValue);
      else window.sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey, searchValue]);

  // 検索履歴（セッション内・ルート別）
  const historyKey = `realife:search-history:${pathname}`;
  const [searchPrefs] = useSearchPrefs();
  const HISTORY_LIMIT = searchPrefs.historyLimit; // 最大保存件数（設定で変更可能）
  const HISTORY_ITEM_MAX = 80; // 1件あたりの最大文字数
  const HISTORY_BYTES_MAX = 4 * 1024; // sessionStorage 上限(約4KB)
  const [history, setHistory] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 履歴ロード（自動クリーンアップ）
  // - normalizeQuery で再正規化（古いバージョンが保存した未正規化値を浄化）
  // - 1件あたりの最大文字数で切り詰め
  // - 大文字小文字を無視した重複排除（初出を保持）
  // - 件数上限 (HISTORY_LIMIT) に切り詰め
  // - 合計バイト上限 (HISTORY_BYTES_MAX) に収まるよう古い順に削る
  // - サニタイズ後に内容が変わった場合は sessionStorage に書き戻し
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(historyKey);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (!Array.isArray(parsed)) {
        setHistory([]);
        window.sessionStorage.removeItem(historyKey);
        return;
      }

      const seen = new Set<string>();
      const cleaned: string[] = [];
      for (const item of parsed) {
        if (typeof item !== "string") continue;
        const v = normalizeQuery(item, HISTORY_ITEM_MAX);
        if (!v || v.length < 2) continue;
        const key = v.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        cleaned.push(v);
        if (cleaned.length >= HISTORY_LIMIT) break;
      }

      // バイト数上限に収める
      let serialized = JSON.stringify(cleaned);
      while (cleaned.length > 1 && new Blob([serialized]).size > HISTORY_BYTES_MAX) {
        cleaned.pop();
        serialized = JSON.stringify(cleaned);
      }

      setHistory(cleaned);

      // 元データと差分があれば書き戻し（無駄な write を避ける）
      if (raw !== serialized) {
        try {
          if (cleaned.length === 0) window.sessionStorage.removeItem(historyKey);
          else window.sessionStorage.setItem(historyKey, serialized);
        } catch {
          /* ignore quota errors */
        }
      }
    } catch {
      setHistory([]);
      try {
        window.sessionStorage.removeItem(historyKey);
      } catch {
        /* ignore */
      }
    }
  }, [historyKey, HISTORY_LIMIT, HISTORY_ITEM_MAX, HISTORY_BYTES_MAX]);

  // アプリ起動時に一度、全ルートの履歴を一括クリーンアップ
  // (古いバージョンで保存された壊れた値・未正規化値・大きすぎる値などを浄化)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const FLAG = "realife:search-history:cleanup-v1";
    try {
      if (window.sessionStorage.getItem(FLAG)) return;
      const prefix = "realife:search-history:";
      const keys: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      for (const k of keys) {
        try {
          const raw = window.sessionStorage.getItem(k);
          if (!raw) continue;
          const parsed = JSON.parse(raw) as unknown;
          if (!Array.isArray(parsed)) {
            window.sessionStorage.removeItem(k);
            continue;
          }
          const seen = new Set<string>();
          const cleaned: string[] = [];
          for (const item of parsed) {
            if (typeof item !== "string") continue;
            const v = normalizeQuery(item, HISTORY_ITEM_MAX);
            if (!v || v.length < 2) continue;
            const key = v.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            cleaned.push(v);
            if (cleaned.length >= HISTORY_LIMIT) break;
          }
          let serialized = JSON.stringify(cleaned);
          while (cleaned.length > 1 && new Blob([serialized]).size > HISTORY_BYTES_MAX) {
            cleaned.pop();
            serialized = JSON.stringify(cleaned);
          }
          if (cleaned.length === 0) window.sessionStorage.removeItem(k);
          else if (raw !== serialized) window.sessionStorage.setItem(k, serialized);
        } catch {
          // 個別キーの破損はスキップ（必要なら削除）
          try {
            window.sessionStorage.removeItem(k);
          } catch {
            /* ignore */
          }
        }
      }
      window.sessionStorage.setItem(FLAG, String(Date.now()));
    } catch {
      /* ignore */
    }
    // 起動時に1回だけ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // 検索文字列の正規化は src/lib/normalize-query.ts を使用

  const commitHistory = (q: string) => {
    const v = normalizeQuery(q, HISTORY_ITEM_MAX);
    if (!v || v.length < 2) return;
    setHistory((prev) => {
      // 大文字小文字の違いも重複扱いし、初出の表記を保持
      const lower = v.toLowerCase();
      const filtered = prev.filter((x) => x.toLowerCase() !== lower);
      let next = [v, ...filtered].slice(0, HISTORY_LIMIT);

      // 合計バイト数が上限を超える場合は古い順に削る
      let serialized = JSON.stringify(next);
      while (
        next.length > 1 &&
        new Blob([serialized]).size > HISTORY_BYTES_MAX
      ) {
        next = next.slice(0, -1);
        serialized = JSON.stringify(next);
      }

      try {
        window.sessionStorage.setItem(historyKey, serialized);
      } catch {
        /* quota 超過などは無視 */
      }
      return next;
    });
  };

  // 入力が止まったら(800ms)履歴に追加
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchValue) return;
    debounceRef.current = setTimeout(() => commitHistory(searchValue), 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const removeHistory = (q: string) => {
    setHistory((prev) => {
      const next = prev.filter((x) => x !== q);
      try {
        window.sessionStorage.setItem(historyKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  const clearHistory = () => {
    setHistory([]);
    try {
      window.sessionStorage.removeItem(historyKey);
    } catch {
      /* ignore */
    }
  };
  const selectHistory = (q: string) => {
    // 選択した語を即座に履歴の先頭へ繰り上げ（最終使用順を維持）
    commitHistory(q);
    setSearch(q);
    setHistoryOpen(false);
    setActiveIndex(-1);
  };

  // 履歴ドロップダウンを開いたとき / 閉じたとき / 履歴が変わったときに選択をリセット
  useEffect(() => {
    if (!historyOpen) setActiveIndex(-1);
  }, [historyOpen]);
  useEffect(() => {
    setActiveIndex(-1);
  }, [history.length]);

  // 全 input 共通のキーボード操作
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!historyOpen) setHistoryOpen(true);
      if (history.length > 0) {
        setActiveIndex((i) => (i + 1) % history.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!historyOpen) setHistoryOpen(true);
      if (history.length > 0) {
        setActiveIndex((i) => (i <= 0 ? history.length - 1 : i - 1));
      }
    } else if (e.key === "Enter") {
      // ドロップダウンが開いているとき: 履歴選択を最優先(ハイライト中はそれを、なければ先頭を選ぶ)
      // 閉じているとき: 通常の検索コミット
      if (historyOpen) {
        if (history.length === 0) return;
        e.preventDefault();
        const idx = activeIndex >= 0 && activeIndex < history.length ? activeIndex : 0;
        selectHistory(history[idx]);
      } else {
        commitHistory(searchValue);
      }
    } else if (e.key === "Escape") {
      setHistoryOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Tab") {
      // Tab はフォーカス移動を妨げず、ドロップダウンだけ閉じる
      if (historyOpen) {
        setHistoryOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  // クリア後にフォーカスを戻すための ref
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const clearAndFocus = (ref: React.RefObject<HTMLInputElement | null>) => {
    setSearch("");
    setHistoryOpen(false);
    setActiveIndex(-1);
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* スキップリンク: Tab で最初に到達、本文へジャンプ */}
      <a href="#main-content" className="skip-link">
        メインコンテンツへスキップ
      </a>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur md:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card pt-2 shadow-xl">
            <Brand />
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-border/80 bg-card/80 backdrop-blur md:flex md:flex-col">
        <Brand />
        <div className="mt-2 flex-1 overflow-y-auto pb-4">
          <SidebarNav />
        </div>
        <SidebarUser />
      </aside>

      {/* Main */}
      <div className="md:pl-60">
        {/* Page header (sticky) */}
        <header className="sticky top-0 z-10 hidden border-b border-border/80 bg-card/75 backdrop-blur-xl md:block">
          <div className="flex h-16 items-center gap-4 px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[18px] font-semibold tracking-tight text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1 truncate text-[12px] leading-snug tracking-[0.01em] text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Search */}
            <div className="relative hidden lg:block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={desktopInputRef}
                type="search"
                value={searchValue}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setHistoryOpen(true)}
                onBlur={() => {
                  if (searchValue) commitHistory(searchValue);
                  setTimeout(() => setHistoryOpen(false), 120);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                aria-label="検索"
                aria-expanded={historyOpen}
                aria-haspopup="listbox"
                className="h-9 w-72 rounded-md border border-border bg-card pl-8 pr-8 text-[13px] text-muted-foreground placeholder:text-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => clearAndFocus(desktopInputRef)}
                  aria-label="検索をクリア"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-muted-foreground"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              )}
              {historyOpen && (
                <SearchHistoryDropdown
                  history={history}
                  onSelect={selectHistory}
                  onRemove={removeHistory}
                  onClear={clearHistory}
                  activeIndex={activeIndex}
                  onHover={setActiveIndex}
                  limit={HISTORY_LIMIT}
                />
              )}
            </div>

            {/* Date / time */}
            <div
              className="hidden items-center gap-2 rounded-md border border-border bg-card/70 px-2.5 py-1.5 xl:flex"
              aria-label="現在日時"
            >
              <span className="num text-[12px] font-medium text-muted-foreground">
                {DATE_FMT.format(now)}
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-muted" />
              <span className="num text-[12px] font-semibold tabular-nums text-foreground">
                {TIME_FMT.format(now)}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="絞り込み"
                onClick={onFilterClick}
                className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card transition-colors ${
                  filterActive
                    ? "border-blue-300 text-blue-700"
                    : "border-border text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {filterActive && (
                  <span
                    aria-hidden="true"
                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"
                  />
                )}
              </button>
              <button
                type="button"
                aria-label="通知"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
              </button>
              <NewInstructionDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    新規指示
                  </button>
                }
              />
            </div>
          </div>

          {/* Secondary row: search on md, hidden on lg+ where it's inline above */}
          <div className="border-t border-border px-6 py-2 lg:hidden">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={tabletInputRef}
                type="search"
                value={searchValue}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setHistoryOpen(true)}
                onBlur={() => {
                  if (searchValue) commitHistory(searchValue);
                  setTimeout(() => setHistoryOpen(false), 120);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                aria-label="検索"
                aria-expanded={historyOpen}
                aria-haspopup="listbox"
                className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-8 text-[13px] text-muted-foreground placeholder:text-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => clearAndFocus(tabletInputRef)}
                  aria-label="検索をクリア"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-muted-foreground"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              )}
              {historyOpen && (
                <SearchHistoryDropdown
                  history={history}
                  onSelect={selectHistory}
                  onRemove={removeHistory}
                  onClear={clearHistory}
                  activeIndex={activeIndex}
                  onHover={setActiveIndex}
                  limit={HISTORY_LIMIT}
                />
              )}
            </div>
          </div>
        </header>

        {/* Mobile title + datetime + search */}
        <div className="space-y-3 border-b border-border bg-card px-4 py-4 md:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1.5 text-[11.5px] leading-snug tracking-[0.01em] text-muted-foreground/90">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="num shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-right text-[11px] leading-tight text-muted-foreground">
              <div>{DATE_FMT.format(now)}</div>
              <div className="font-semibold text-foreground">{TIME_FMT.format(now)}</div>
            </div>
          </div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
              <input
                ref={mobileInputRef}
                type="search"
              value={searchValue}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setHistoryOpen(true)}
              onBlur={() => {
                if (searchValue) commitHistory(searchValue);
                setTimeout(() => setHistoryOpen(false), 120);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-label="検索"
              aria-expanded={historyOpen}
              aria-haspopup="listbox"
              className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-8 text-[13px] text-muted-foreground placeholder:text-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => clearAndFocus(mobileInputRef)}
                aria-label="検索をクリア"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-muted-foreground"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
            {historyOpen && (
              <SearchHistoryDropdown
                history={history}
                onSelect={selectHistory}
                onRemove={removeHistory}
                onClear={clearHistory}
                activeIndex={activeIndex}
                onHover={setActiveIndex}
                  limit={HISTORY_LIMIT}
              />
            )}
          </div>
        </div>

        <main id="main-content" tabIndex={-1} aria-label="メインコンテンツ">{children}</main>
      </div>
    </div>
  );
}
