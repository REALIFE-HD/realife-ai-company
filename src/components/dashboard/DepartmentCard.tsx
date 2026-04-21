import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Department } from "@/data/departments";

const STATUS_STYLE: Record<Department["status"], string> = {
  active: "border-blue-100 bg-blue-50 text-blue-700",
  setup: "border-amber-200 bg-amber-50 text-amber-700",
  standard: "",
};

export function DepartmentCard({ d }: { d: Department }) {
  return (
    <Link
      to="/departments/$id"
      params={{ id: d.id }}
      aria-label={`${d.name} の詳細`}
      className="group relative flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.35)] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {/* Animated gradient border on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.6), rgba(37,99,235,0) 40%, rgba(37,99,235,0) 60%, rgba(59,130,246,0.6))",
          padding: "1px",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* Hover accent rail */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-3 left-0 w-[3px] origin-top scale-y-0 rounded-r bg-gradient-to-b from-blue-400 to-blue-600 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="num flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[13px] font-semibold tracking-tight text-slate-700 transition-colors group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
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
            className="num inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white shadow-[0_4px_12px_-4px_rgba(13,148,136,0.6)]"
          >
            {d.unread}
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-950">{d.name}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{d.role}</p>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{d.kpiLabel}</p>
            <p className="num mt-1 text-lg font-semibold tracking-tight text-slate-950">{d.kpiValue}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">タスク</p>
            <p className="num mt-1 text-lg font-semibold tracking-tight text-slate-950">{d.tasks}</p>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white"
        >
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
