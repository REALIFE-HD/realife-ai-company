import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/dashboard/Hero";
import { DepartmentsGrid } from "@/components/dashboard/DepartmentsGrid";
import { CTASection } from "@/components/dashboard/CTASection";

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
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main>
        <Hero />
        <DepartmentsGrid />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
