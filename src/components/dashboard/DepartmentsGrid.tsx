import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { DEPARTMENTS } from "@/data/departments";
import { DepartmentCard } from "./DepartmentCard";

function matches(q: string, ...fields: string[]) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((f) => f.toLowerCase().includes(needle));
}

export function DepartmentsGrid({ query }: { query?: string }) {
  const filtered = useMemo(
    () =>
      DEPARTMENTS.filter((d) =>
        matches(query ?? "", d.name, d.role, d.kpiLabel, d.id),
      ),
    [query],
  );
  const q = query?.trim() ?? "";

  return (
    <section id="departments" aria-labelledby="departments-heading">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-6 bg-blue-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-700">
              Departments · {filtered.length}
              {q && ` / ${DEPARTMENTS.length}`}
            </span>
          </div>
          <h2
            id="departments-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]"
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

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-10 text-center text-[13px] text-slate-500">
          「{q}」に一致する部門は見つかりませんでした。
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
