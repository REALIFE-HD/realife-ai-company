import { ArrowRight } from "lucide-react";
import { DEPARTMENTS } from "@/data/departments";
import { DepartmentCard } from "./DepartmentCard";

export function DepartmentsGrid() {
  return (
    <section id="departments" className="border-b border-slate-200 bg-slate-50/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-slate-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Departments · 12
              </span>
            </div>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              すべての部門を、一望する。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              各部門のカードから指示出し・タスク・案件進捗にアクセスできます。
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 transition-colors hover:text-slate-950"
          >
            全部門を表示
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {DEPARTMENTS.map((d) => (
            <DepartmentCard key={d.id} d={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
