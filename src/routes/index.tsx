import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { CTASection } from "@/components/dashboard/CTASection";
import { Footer } from "@/components/layout/Footer";
import { useRouteMountMark } from "@/lib/web-vitals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REALIFE Operations — 仮想会社ダッシュボード" },
      {
        name: "description",
        content:
          "合同会社REALIFEの12部門仮想組織を一望するオペレーションダッシュボード。見積・発注・施工・請求・採用までを横断的に指揮します。",
      },
      { property: "og:title", content: "REALIFE Operations — 仮想会社ダッシュボード" },
      {
        property: "og:description",
        content: "12の仮想部門を一つのダッシュボードから指揮するオペレーションシステム。",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useRouteMountMark("/");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<DeptFilters>(DEFAULT_DEPT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <AppShell
        title="ダッシュボード"
        subtitle="AI COMPANY 統合プラットフォーム"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="部門名・役割・KPIラベルで検索…"
        onFilterClick={() => setFilterOpen(true)}
        filterActive={filters.statuses.length > 0 || filters.unreadOnly}
      >
        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <KpiCards />
          <DashboardCharts />
          <CTASection />
          <DepartmentsGrid query={search} filters={filters} />
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
