import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { DepartmentCard } from "@/components/dashboard/DepartmentCard";
import { CTASection } from "@/components/dashboard/CTASection";
import { DEPARTMENTS } from "@/data/departments";
import {
  applyDeptFilters,
  DEFAULT_DEPT_FILTERS,
  DepartmentFilterDialog,
  type DeptFilters,
} from "@/components/dashboard/DepartmentFilterDialog";

export const Route = createFileRoute("/departments/")({
  head: () => ({
    meta: [
      { title: "部門一覧 — REALIFE Operations" },
      {
        name: "description",
        content:
          "合同会社REALIFEの12仮想部門を一覧で表示。各部門の役割・ステータス・案件・タスクを横断的に把握できます。",
      },
      { property: "og:title", content: "部門一覧 — REALIFE Operations" },
      {
        property: "og:description",
        content: "12の仮想部門を一覧で確認し、指示出しへ進めます。",
      },
    ],
  }),
  component: DepartmentsIndex,
});

function DepartmentsIndex() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<DeptFilters>(DEFAULT_DEPT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const total = DEPARTMENTS.length;
  const active = DEPARTMENTS.filter((d) => d.status === "active").length;
  const building = DEPARTMENTS.filter((d) => d.status === "setup").length;
  const standard = DEPARTMENTS.filter((d) => d.status === "standard").length;

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    const byText = !q
      ? DEPARTMENTS
      : DEPARTMENTS.filter((d) =>
          [d.id, d.name, d.role, d.kpiLabel].some((f) => f.toLowerCase().includes(q)),
        );
    return applyDeptFilters(byText, filters);
  }, [q, filters]);

  const hasFilters = filters.statuses.length > 0 || filters.unreadOnly;
  const summaryActive = q || hasFilters;

  return (
    <>
      <AppShell
        title="部門一覧"
        subtitle={`12部門の役割・ステータス・進捗を一覧で確認`}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="部門名・役割・KPIラベルで検索…"
        onFilterClick={() => setFilterOpen(true)}
      >
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            ダッシュボードへ戻る
          </Link>
        </div>

        <CTASection />

        <section
          aria-labelledby="dept-summary"
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-6 bg-blue-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-700">
              Departments · {total}
            </span>
          </div>
          <h2
            id="dept-summary"
            className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]"
          >
            すべての部門を、一望する。
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-500">
            各部門カードから詳細ページへ移動し、KPI・タスク・案件・指示履歴にアクセスできます。
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "総部門数", value: total },
              { label: "稼働中", value: active },
              { label: "構築中", value: building },
              { label: "標準運用", value: standard },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
              >
                <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  {s.label}
                </dt>
                <dd className="kpi-value mt-1 text-right text-2xl text-slate-900">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="部門カード一覧">
          {summaryActive && (
            <p className="mb-3 text-[12px] text-slate-500">
              {q && (
                <>
                  「<span className="font-medium text-slate-700">{search}</span>」
                </>
              )}
              {hasFilters && (
                <span className="ml-1">
                  {filters.statuses.length > 0 && `状態: ${filters.statuses.join(" / ")}`}
                  {filters.statuses.length > 0 && filters.unreadOnly && " ・ "}
                  {filters.unreadOnly && "未読あり のみ"}
                </span>
              )}
              の結果:{" "}
              <span className="num font-semibold text-slate-900">{filtered.length}</span> / {total} 部門
            </p>
          )}
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-10 text-center text-[13px] text-slate-500">
              条件に一致する部門は見つかりませんでした。
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <DepartmentCard key={d.id} d={d} query={q} />
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
      </AppShell>
      <DepartmentFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        value={filters}
        onChange={setFilters}
      />
    </>
  );
}
