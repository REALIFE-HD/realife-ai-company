import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DEPARTMENTS } from "@/data/departments";
import { DepartmentCard } from "./DepartmentCard";

export function DepartmentsGrid() {
  return (
    <section id="departments" aria-labelledby="departments-heading">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-6 bg-teal-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-700">
              Departments · 12
            </span>
          </div>
          <h2 id="departments-heading" className="mt-2 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
            すべての部門を、一望する。
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-500">
            各部門のカードから指示出し・タスク・案件進捗にアクセスできます。
          </p>
        </div>
        <Link
          to="/departments"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-teal-700 transition-colors hover:text-teal-800"
        >
          全部門を表示
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((d) => (
          <DepartmentCard key={d.id} d={d} />
        ))}
      </div>
    </section>
  );
}
