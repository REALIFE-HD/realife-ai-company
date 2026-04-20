import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { DepartmentCard } from "@/components/dashboard/DepartmentCard";
import { CTASection } from "@/components/dashboard/CTASection";
import { DEPARTMENTS } from "@/data/departments";

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
  const total = DEPARTMENTS.length;
  const active = DEPARTMENTS.filter((d) => d.status === "active").length;
  const building = DEPARTMENTS.filter((d) => d.status === "setup").length;
  const standard = DEPARTMENTS.filter((d) => d.status === "standard").length;

  return (
    <AppShell title="部門一覧" subtitle={`12部門の役割・ステータス・進捗を一覧で確認`}>
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
            <span aria-hidden="true" className="h-px w-6 bg-teal-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-700">
              Departments · {total}
            </span>
          </div>
          <h2
            id="dept-summary"
            className="mt-2 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]"
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
                <dd className="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="部門カード一覧">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEPARTMENTS.map((d) => (
              <DepartmentCard key={d.id} d={d} />
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}
