import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { listDeals, STAGE_STYLE, type Deal } from "@/lib/deals";
import { Money } from "@/components/ui/money";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "案件管理 — REALIFE Operations" },
      { name: "description", content: "進行中案件の一覧・ステージ別管理。Lovable Cloud に永続化。" },
      { property: "og:title", content: "案件管理 — REALIFE Operations" },
      { property: "og:description", content: "進行中案件をステージ別・確度別に一覧管理。" },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    listDeals()
      .then((d) => mounted && setDeals(d))
      .catch((e) => console.error(e))
      .finally(() => mounted && setLoading(false));

    const channel = supabase
      .channel("deals-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => {
        listDeals().then((d) => mounted && setDeals(d)).catch(console.error);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const q = search.trim().toLowerCase();
  const filteredDeals = q
    ? deals.filter((d) =>
        [d.code, d.client, d.title, d.stage, d.owner, d.next_action].some((f) =>
          (f ?? "").toLowerCase().includes(q),
        ),
      )
    : deals;

  const total = filteredDeals.reduce((acc, d) => acc + d.amount, 0);
  const won = filteredDeals.filter((d) => d.stage === "受注").length;
  const open = filteredDeals.filter((d) => d.stage !== "受注" && d.stage !== "失注").length;

  return (
    <AppShell
      title="案件管理"
      subtitle="Lovable Cloud に永続化 ・ リアルタイム同期"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="案件コード・クライアント・案件名で検索…"
    >
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "総案件", v: String(deals.length) },
            { l: "進行中", v: String(open) },
            { l: "受注済", v: String(won) },
            { l: "案件総額", v: `¥${(total / 1_000_000).toFixed(1)}M` },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">{s.l}</p>
              <p className="kpi-value mt-1.5 text-right text-[1.625rem] leading-none text-slate-950">{s.v}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/60 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="num-cell px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">クライアント</th>
                  <th className="px-4 py-3 text-left font-medium">案件名</th>
                  <th className="px-4 py-3 text-left font-medium">ステージ</th>
                  <th className="num-cell px-4 py-3 font-medium">金額</th>
                  <th className="num-cell px-4 py-3 font-medium">確度</th>
                  <th className="px-4 py-3 text-left font-medium">担当</th>
                  <th className="px-4 py-3 text-left font-medium">次のアクション</th>
                  <th className="num-cell px-4 py-3 font-medium">期日</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-xs text-slate-400">読み込み中...</td>
                  </tr>
                )}
                {!loading && deals.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-xs text-slate-400">案件がありません</td>
                  </tr>
                )}
                {deals.map((d) => (
                  <tr key={d.id} className="group cursor-pointer transition-colors hover:bg-blue-50/30">
                    <td className="num-cell px-4 py-3 text-xs text-slate-500">
                      <Link to="/deals/$dealCode" params={{ dealCode: d.code }} className="transition-colors group-hover:text-blue-700">{d.code}</Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      <Link to="/deals/$dealCode" params={{ dealCode: d.code }} className="transition-colors group-hover:text-blue-700">{d.client}</Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link to="/deals/$dealCode" params={{ dealCode: d.code }} className="transition-colors group-hover:text-blue-700">{d.title}</Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STAGE_STYLE[d.stage]}`}>
                        {d.stage}
                      </span>
                    </td>
                    <td className="num-cell px-4 py-3 font-semibold text-slate-950"><Money amount={d.amount} /></td>
                    <td className="num-cell px-4 py-3 text-slate-700">{d.probability}%</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">{d.owner}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{d.next_action}</td>
                    <td className="num-cell px-4 py-3 text-xs text-slate-700">{d.due ?? "—"}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-slate-400 transition-colors group-hover:text-blue-600">
                      <Link to="/deals/$dealCode" params={{ dealCode: d.code }}>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}
