import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Department } from "@/data/departments";

const STATUS_STYLE: Record<Department["status"], string> = {
  active: "border-teal-200 bg-teal-50 text-teal-700",
  setup: "border-amber-200 bg-amber-50 text-amber-700",
  standard: "",
};

export function DepartmentCard({ d }: { d: Department }) {
  return (
    <Link
      to="/departments/$id"
      params={{ id: d.id }}
      aria-label={`${d.name} の詳細`}
      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_18px_32px_-18px_rgba(13,148,136,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-mono text-[13px] font-medium text-slate-600 transition-colors group-hover:border-teal-600 group-hover:bg-teal-600 group-hover:text-white">
            {d.id}
          </span>
          {d.status !== "standard" && d.statusLabel && (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[d.status]}`}
            >
              {d.statusLabel}
            </span>
          )}
        </div>
        {d.unread !== undefined && d.unread > 0 && (
          <span
            aria-label={`未読 ${d.unread} 件`}
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 font-mono text-[10px] font-semibold text-white"
          >
            {d.unread}
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-[15px] font-semibold text-slate-900">{d.name}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{d.role}</p>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{d.kpiLabel}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{d.kpiValue}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">タスク</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{d.tasks}</p>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all group-hover:border-teal-600 group-hover:bg-teal-600 group-hover:text-white"
        >
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
