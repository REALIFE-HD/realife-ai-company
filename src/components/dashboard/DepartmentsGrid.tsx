import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { DEPARTMENTS } from "@/data/departments";
import { DepartmentCard } from "./DepartmentCard";
import {
  applyDeptFilters,
  DEFAULT_DEPT_FILTERS,
  type DeptFilters,
} from "./DepartmentFilterDialog";

function matches(q: string, ...fields: string[]) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  // 空白(全角/半角)で分割し、各語をAND条件で評価
  const tokens = needle.split(/[\s\u3000]+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = fields.map((f) => f.toLowerCase()).join(" \u0001 ");
  return tokens.every((t) => haystack.includes(t));
}

export function DepartmentsGrid({
  query,
  filters = DEFAULT_DEPT_FILTERS,
}: {
  query?: string;
  filters?: DeptFilters;
}) {
  const q = query?.trim() ?? "";

  const filtered = useMemo(() => {
    const byText = DEPARTMENTS.filter((d) =>
      matches(q, d.name, d.role, d.kpiLabel, d.id),
    );
    return applyDeptFilters(byText, filters);
  }, [q, filters]);

  const hasActiveFilters =
    filters.statuses.length > 0 || filters.unreadOnly;

  return (
    <section id="departments" aria-labelledby="departments-heading">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-6 bg-blue-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-700">
              Departments · {filtered.length}
              {(q || hasActiveFilters) && ` / ${DEPARTMENTS.length}`}
            </span>
          </div>
          <h2
            id="departments-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]"
          >
            組織一覧
          </h2>
        </div>
        <Link
          to="/departments"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-700 transition-colors hover:text-blue-700"
        >
          全部門を表示
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {(q || hasActiveFilters) && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2 text-[12px] text-muted-foreground"
        >
          <span className="num font-semibold text-blue-800">{filtered.length}</span>
          <span className="text-muted-foreground">/ {DEPARTMENTS.length} 件表示</span>
          {q && (
            <span className="ml-1 inline-flex items-center gap-1 text-muted-foreground">
              ・ 検索:
              <span className="rounded bg-card px-1.5 py-0.5 font-medium text-muted-foreground ring-1 ring-border">
                {q}
              </span>
            </span>
          )}
          {hasActiveFilters && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              ・ フィルタ:
              {filters.statuses.length > 0 && (
                <span className="rounded bg-card px-1.5 py-0.5 font-medium text-muted-foreground ring-1 ring-border">
                  {filters.statuses.join(" / ")}
                </span>
              )}
              {filters.unreadOnly && (
                <span className="rounded bg-card px-1.5 py-0.5 font-medium text-muted-foreground ring-1 ring-border">
                  未読のみ
                </span>
              )}
            </span>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border bg-card/60 px-4 py-10 text-center text-[13px] text-muted-foreground">
          条件に一致する部門は見つかりませんでした。
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DepartmentCard key={d.id} d={d} query={q} />
          ))}
        </div>
      )}
    </section>
  );
}
