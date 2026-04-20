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

  const total = deals.reduce((acc, d) => acc + d.amount, 0);
  const won = deals.filter((d) => d.stage === "受注").length;
  const open = deals.filter((d) => d.stage !== "受注" && d.stage !== "失注").length;

  return (
    <AppShell title="案件管理" subtitle="Lovable Cloud に永続化 ・ リアルタイム同期">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { l: "総案件", v: String(deals.length), tone: "slate" },
            { l: "進行中", v: String(open), tone: "amber" },
            { l: "受注済", v: String(won), tone: "teal" },
            { l: "案件総額", v: `¥${(total / 1_000_000).toFixed(1)}M`, tone: "indigo" },
          ].map((s) => {
            const accent: Record<string, string> = {
              slate: "before:bg-slate-900 text-slate-950",
              amber: "before:bg-amber-500 text-amber-900",
              teal: "before:bg-teal-600 text-teal-900",
              indigo: "before:bg-indigo-600 text-indigo-900",
            };
            return (
              <div
                key={s.l}
                className={`relative overflow-hidden rounded-lg border-2 border-slate-900/90 bg-white px-3.5 py-3 before:absolute before:inset-y-0 before:left-0 before:w-1 ${accent[s.tone]}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">{s.l}</p>
                <p className={`num mt-1 text-[1.5rem] font-extrabold leading-none tracking-tight ${accent[s.tone].split(" ").pop()}`}>{s.v}</p>
              </div>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-lg border-2 border-slate-900/90 bg-white shadow-[0_2px_0_0_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b-2 border-slate-900/90 bg-slate-900 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                <tr>
                  <th className="px-3 py-2.5 text-left">ID</th>
                  <th className="px-3 py-2.5 text-left">クライアント</th>
                  <th className="px-3 py-2.5 text-left">案件名</th>
                  <th className="px-3 py-2.5 text-left">ステージ</th>
                  <th className="px-3 py-2.5 text-right">金額</th>
                  <th className="px-3 py-2.5 text-right">確度</th>
                  <th className="px-3 py-2.5 text-left">担当</th>
                  <th className="px-3 py-2.5 text-left">次のアクション</th>
                  <th className="px-3 py-2.5 text-right">期日</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 [&>tr:nth-child(even)]:bg-slate-50/70">
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
                {deals.map((d) => {
                  const prob = d.probability;
                  const probTone =
                    prob >= 80 ? "bg-teal-600 text-white" : prob >= 50 ? "bg-amber-500 text-white" : "bg-slate-300 text-slate-800";
                  return (
                    <tr key={d.id} className="group cursor-pointer transition-colors hover:!bg-teal-50">
                      <td className="whitespace-nowrap px-3 py-2.5 num text-[11px] font-semibold text-slate-600">
                        <Link to="/deals/$dealCode" params={{ dealCode: d.code }} className="rounded bg-slate-100 px-1.5 py-0.5 ring-1 ring-slate-200 transition-colors group-hover:bg-teal-600 group-hover:text-white group-hover:ring-teal-600">{d.code}</Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-900">
                        <Link to="/deals/$dealCode" params={{ dealCode: d.code }}>{d.client}</Link>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-950">
                        <Link to="/deals/$dealCode" params={{ dealCode: d.code }} className="transition-colors group-hover:text-teal-700">{d.title}</Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold ${STAGE_STYLE[d.stage]}`}>
                          {d.stage}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right num text-[14px] font-bold text-slate-950"><Money amount={d.amount} /></td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <span className={`num inline-flex min-w-[42px] justify-center rounded px-1.5 py-0.5 text-[11px] font-bold ${probTone}`}>{prob}%</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[12px] font-medium text-slate-800">{d.owner}</td>
                      <td className="px-3 py-2.5 text-[12px] text-slate-700">{d.next_action}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right num text-[12px] font-medium text-slate-800">{d.due ?? "—"}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-slate-400 transition-colors group-hover:text-teal-600">
                        <Link to="/deals/$dealCode" params={{ dealCode: d.code }}>
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}
