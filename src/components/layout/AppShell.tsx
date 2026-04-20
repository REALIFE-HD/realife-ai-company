import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, Building2, Briefcase, BarChart3, MessageSquare, Settings, Bell, Plus, Menu, X, BookOpen } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NewInstructionDialog } from "@/components/instructions/NewInstructionDialog";
import { useUserSettings } from "@/hooks/use-user-settings";

const NAV = [
  { label: "ダッシュボード", to: "/", icon: LayoutGrid, exact: true },
  { label: "部門", to: "/departments", icon: Building2 },
  { label: "案件", to: "/deals", icon: Briefcase },
  { label: "レポート", to: "/reports", icon: BarChart3 },
  { label: "AIチャット", to: "/ai", icon: MessageSquare },
  { label: "ドキュメント", to: "/docs", icon: BookOpen },
  { label: "設定", to: "/settings", icon: Settings },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname, hash } = useLocation();
  return (
    <nav className="px-3" aria-label="メインナビゲーション">
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
                className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}`} aria-hidden="true" />
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
        className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 font-serif text-sm font-semibold text-white"
      >
        RL
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[15px] font-semibold tracking-wide text-slate-900">REALIFE</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">AI COMPANY</span>
      </span>
    </Link>
  );
}

function SidebarUser() {
  const { settings, loading } = useUserSettings();
  const name = settings.display_name || "ゲスト";
  const initials = name.trim().slice(0, 2).toUpperCase();
  return (
    <div className="border-t border-slate-200 p-3">
      <Link to="/settings" className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-slate-50">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-mono text-[11px] font-medium text-slate-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-slate-900">{loading ? "..." : name}</p>
          <p className="truncate text-[11px] text-slate-500">REALIFE Inc.</p>
        </div>
      </Link>
    </div>
  );
}

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
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
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-slate-200 bg-white md:flex md:flex-col">
        <Brand />
        <div className="mt-2 flex-1 overflow-y-auto pb-4">
          <SidebarNav />
        </div>
        <SidebarUser />
      </aside>

      {/* Main */}
      <div className="md:pl-60">
        {/* Page header (sticky) */}
        <header className="sticky top-0 z-10 hidden border-b border-slate-200 bg-white/85 backdrop-blur md:block">
          <div className="flex h-16 items-center justify-between px-6 lg:px-8">
            <div>
              <h1 className="font-serif text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="mt-1.5 text-[12.5px] leading-snug tracking-[0.01em] text-slate-500/90">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="通知"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                <Bell className="h-4 w-4" />
                <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
              </button>
              <NewInstructionDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    新規指示
                  </button>
                }
              />
            </div>
          </div>
        </header>

        {/* Mobile title */}
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
          <h1 className="font-serif text-lg font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[11.5px] leading-snug tracking-[0.01em] text-slate-500/90">{subtitle}</p>}
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
