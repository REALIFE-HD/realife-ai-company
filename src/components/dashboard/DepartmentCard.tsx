import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Department } from "@/data/departments";
import { Highlight } from "@/components/ui/highlight";

type StatusMeta = { label: string; badge: string; dot: string };

const STATUS_META: Record<Department["status"], StatusMeta> = {
  active: {
    label: "稼働中",
    badge: "border-blue-100 bg-blue-50 text-blue-700",
    dot: "bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.18)] animate-pulse",
  },
  setup: {
    label: "構築中",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]",
  },
  standard: {
    label: "通常運用",
    badge: "border-border bg-muted text-muted-foreground",
    dot: "bg-slate-400",
  },
};

export function DepartmentCard({ d, query }: { d: Department; query?: string }) {
  return (
    <Link
      to="/departments/$id"
      params={{ id: d.id }}
      aria-label={`${d.name} の詳細`}
      className="group relative flex flex-col rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.35)] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[13px] font-semibold tracking-tight text-muted-foreground transition-colors group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
            {d.id}
          </span>
          {(() => {
            const meta = STATUS_META[d.status];
            const label = d.statusLabel ?? meta.label;
            return (
              <span
                className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                <span className="truncate">{label}</span>
              </span>
            );
          })()}
        </div>
        {d.unread !== undefined && d.unread > 0 && (
          <span
            aria-label={`未読 ${d.unread} 件`}
            className="num inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white shadow-[0_4px_12px_-4px_rgba(13,148,136,0.6)]"
          >
            {d.unread}
          </span>
        )}
      </div>

      <div className="mt-4 min-w-0">
        <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
          <Highlight text={d.name} query={query} />
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          <Highlight text={d.role} query={query} />
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
        <div className="flex min-w-0 flex-1 gap-5 sm:gap-6">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Highlight text={d.kpiLabel} query={query} />
            </p>
            <p className="kpi-value mt-1 text-lg text-foreground sm:text-xl">{d.kpiValue}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">タスク</p>
            <p className="kpi-value mt-1 text-lg text-foreground sm:text-xl">{d.tasks}</p>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white"
        >
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
