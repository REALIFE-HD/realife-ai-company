import { Link } from "@tanstack/react-router";
import { Bell, Menu, Plus, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { label: "ダッシュボード", to: "/" as const },
  { label: "部門", to: "/" as const, hash: "departments" },
  { label: "案件", to: "/" as const, hash: "deals" },
  { label: "レポート", to: "/" as const, hash: "reports" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="REALIFE Operations ホーム">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded bg-slate-950 font-serif text-sm font-semibold text-white"
          >
            RL
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-sm font-semibold tracking-wide text-slate-950">REALIFE</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">Operations</span>
          </span>
        </Link>

        <nav className="hidden md:block" aria-label="メインナビゲーション">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={item.hash ? `#${item.hash}` : "/"}
                  className="group relative inline-flex items-center px-3 py-2 text-sm text-slate-700 transition-colors hover:text-slate-950"
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-slate-950 transition-transform duration-300 group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            aria-label="通知"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          >
            <Bell className="h-4 w-4" />
            <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-950 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            新規指示
          </button>
          <div
            aria-label="ユーザー KT"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-50 font-mono text-xs font-medium text-slate-700"
          >
            KT
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 md:hidden"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6" aria-label="モバイルナビゲーション">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.hash ? `#${item.hash}` : "/"}
                    className="block rounded-md px-3 py-2 text-sm text-slate-800 transition-colors hover:bg-slate-100"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-slate-950 px-3.5 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                新規指示
              </button>
              <button
                type="button"
                aria-label="通知"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
