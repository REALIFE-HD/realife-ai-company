import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Department } from "@/data/departments";

const STATUS_STYLE: Record<Department["status"], string> = {
  active: "border-teal-600 bg-teal-600 text-white",
  setup: "border-amber-500 bg-amber-500 text-white",
  standard: "",
};

export function DepartmentCard({ d }: { d: Department }) {
  const isActive = d.status === "active";
  return (
    <Link
      to="/departments/$id"
      params={{ id: d.id }}
      aria-label={`${d.name} の詳細`}
      className={`group relative flex flex-col rounded-xl border p-5 outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
        isActive
          ? "border-teal-600 bg-white shadow-[0_8px_24px_-12px_rgba(13,148,136,0.35)] hover:shadow-[0_18px_32px_-14px_rgba(13,148,136,0.45)]"
          : "border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:border-teal-500 hover:shadow-[0_18px_32px_-18px_rgba(13,148,136,0.28)]"
      }`}
    >
      {/* Hover accent rail */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] origin-top rounded-r bg-teal-600 transition-transform duration-200 ${
          isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="num flex h-9 w-9 items-center justify-center rounded-md border border-slate-900 bg-slate-950 text-[13px] font-bold tracking-tight text-white transition-colors group-hover:border-teal-600 group-hover:bg-teal-600">
            {d.id}
          </span>
          {d.status !== "standard" && d.statusLabel && (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[d.status]}`}
            >
              {d.statusLabel}
            </span>
          )}
        </div>
        {d.unread !== undefined && d.unread > 0 && (
          <span
            aria-label={`未読 ${d.unread} 件`}
            className="num inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-[0_4px_12px_-4px_rgba(220,38,38,0.6)]"
          >
            {d.unread}
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-[15px] font-bold tracking-tight text-slate-950">{d.name}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{d.role}</p>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-4">
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{d.kpiLabel}</p>
            <p className="num mt-1 text-lg font-bold tracking-tight text-slate-950">{d.kpiValue}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">タスク</p>
            <p className="num mt-1 text-lg font-bold tracking-tight text-slate-950">{d.tasks}</p>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-all group-hover:border-teal-600 group-hover:bg-teal-600 group-hover:text-white"
        >
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
