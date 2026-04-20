import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DepartmentsGrid } from "@/components/dashboard/DepartmentsGrid";
import { CTASection } from "@/components/dashboard/CTASection";
import { Footer } from "@/components/layout/Footer";

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
  return (
    <AppShell title="ダッシュボード" subtitle="Q2 2026 ・ 12部門の業務指揮を一望">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <KpiCards />
        <DashboardCharts />
        <DepartmentsGrid />
        <CTASection />
      </div>
      <Footer />
    </AppShell>
  );
}
