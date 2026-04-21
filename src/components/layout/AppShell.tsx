import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, Building2, Briefcase, BarChart3, MessageSquare, Settings, Bell, Plus, Menu, X, BookOpen, Inbox, LogOut, Search, SlidersHorizontal, XCircle } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { NewInstructionDialog } from "@/components/instructions/NewInstructionDialog";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useAuth } from "@/hooks/use-auth";
import { SearchHistoryDropdown } from "./SearchHistoryDropdown";

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
      <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1.5 left-0 w-[2px] rounded-r bg-blue-600"
                  />
                )}
                <Icon className={`h-4 w-4 transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} aria-hidden="true" />
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
        className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 font-display text-sm font-semibold text-white"
      >
        RL
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-wide text-slate-900">REALIFE</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">AI COMPANY</span>
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
    <div className="border-t border-slate-200 p-3">
      <div className="flex items-center gap-2">
        <Link to="/settings" className="flex flex-1 items-center gap-2.5 rounded-md px-2 py-2 hover:bg-slate-50 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-mono text-[11px] font-medium text-slate-700">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-slate-900">{loading ? "..." : name}</p>
            <p className="truncate text-[11px] text-slate-500">{user?.email ?? "REALIFE Inc."}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          aria-label="ログアウト"
          title="ログアウト"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
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
  const HISTORY_LIMIT = 8;
  const [history, setHistory] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 履歴ロード
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(historyKey);
      setHistory(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setHistory([]);
    }
  }, [historyKey]);

  const commitHistory = (q: string) => {
    const v = q.trim();
    if (!v || v.length < 2) return;
    setHistory((prev) => {
      const next = [v, ...prev.filter((x) => x !== v)].slice(0, HISTORY_LIMIT);
      try {
        window.sessionStorage.setItem(historyKey, JSON.stringify(next));
      } catch {
        /* ignore */
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
    setSearch(q);
    setHistoryOpen(false);
  };

  // クリア後にフォーカスを戻すための ref
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const clearAndFocus = (ref: React.RefObject<HTMLInputElement | null>) => {
    setSearch("");
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:hidden">
        <Brand />
        <button
          type="button"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-950/30" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-slate-200 bg-white pt-2 shadow-xl">
            <Brand />
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-slate-200/80 bg-white/80 backdrop-blur md:flex md:flex-col">
        <Brand />
        <div className="mt-2 flex-1 overflow-y-auto pb-4">
          <SidebarNav />
        </div>
        <SidebarUser />
      </aside>

      {/* Main */}
      <div className="md:pl-60">
        {/* Page header (sticky) */}
        <header className="sticky top-0 z-10 hidden border-b border-slate-200/80 bg-white/75 backdrop-blur-xl md:block">
          <div className="flex h-16 items-center gap-4 px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[18px] font-semibold tracking-tight text-slate-950">{title}</h1>
              {subtitle && (
                <p className="mt-1 truncate text-[12px] leading-snug tracking-[0.01em] text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Search */}
            <div className="relative hidden lg:block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setHistoryOpen(true)}
                onBlur={() => {
                  if (searchValue) commitHistory(searchValue);
                  setTimeout(() => setHistoryOpen(false), 120);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitHistory(searchValue);
                    setHistoryOpen(false);
                  } else if (e.key === "Escape") {
                    setHistoryOpen(false);
                  }
                }}
                placeholder={searchPlaceholder}
                aria-label="検索"
                aria-expanded={historyOpen}
                aria-haspopup="listbox"
                className="h-9 w-72 rounded-md border border-slate-200 bg-white pl-8 pr-8 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="検索をクリア"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-700"
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
                />
              )}
            </div>

            {/* Date / time */}
            <div
              className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white/70 px-2.5 py-1.5 xl:flex"
              aria-label="現在日時"
            >
              <span className="num text-[12px] font-medium text-slate-700">
                {DATE_FMT.format(now)}
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-slate-200" />
              <span className="num text-[12px] font-semibold tabular-nums text-slate-900">
                {TIME_FMT.format(now)}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="絞り込み"
                onClick={onFilterClick}
                className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white transition-colors ${
                  filterActive
                    ? "border-blue-300 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
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
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
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
          <div className="border-t border-slate-100 px-6 py-2 lg:hidden">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="検索"
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-8 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="検索をクリア"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-700"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Mobile title + datetime + search */}
        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="mt-1.5 text-[11.5px] leading-snug tracking-[0.01em] text-slate-500/90">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="num shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-right text-[11px] leading-tight text-slate-700">
              <div>{DATE_FMT.format(now)}</div>
              <div className="font-semibold text-slate-900">{TIME_FMT.format(now)}</div>
            </div>
          </div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="検索"
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-8 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="検索をクリア"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-700"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
