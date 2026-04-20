import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";

type Deal = {
  id: string;
  client: string;
  title: string;
  amount: string;
  stage: "見積中" | "提案中" | "見積提出" | "受注" | "失注";
  probability: number;
  owner: string;
  next_action: string;
  due: string;
};

const STAGE_STYLE: Record<Deal["stage"], string> = {
  見積中: "border-slate-200 bg-slate-50 text-slate-700",
  提案中: "border-blue-200 bg-blue-50 text-blue-700",
  見積提出: "border-amber-200 bg-amber-50 text-amber-700",
  受注: "border-emerald-200 bg-emerald-50 text-emerald-700",
  失注: "border-red-200 bg-red-50 text-red-700",
};

const DEALS: Deal[] = [
  { id: "D-2604", client: "株式会社サンプル", title: "オフィス内装リフォーム A棟", amount: "¥4,820,000", stage: "見積提出", probability: 60, owner: "営業本部 佐藤", next_action: "見積FB待ち", due: "2026-04-25" },
  { id: "D-2598", client: "合同会社ライト", title: "店舗改装 一式", amount: "¥2,140,000", stage: "受注", probability: 100, owner: "営業本部 田中", next_action: "発注準備", due: "2026-04-22" },
  { id: "D-2601", client: "株式会社マルチ", title: "共用部リノベ", amount: "¥1,680,000", stage: "提案中", probability: 40, owner: "営業本部 鈴木", next_action: "提案書作成", due: "2026-04-28" },
  { id: "D-2605", client: "個人 山田様", title: "戸建リフォーム", amount: "¥3,250,000", stage: "見積中", probability: 30, owner: "営業本部 佐藤", next_action: "現地調査", due: "2026-04-30" },
  { id: "D-2607", client: "株式会社FK", title: "事務所原状回復", amount: "¥980,000", stage: "受注", probability: 100, owner: "営業本部 田中", next_action: "施工管理引継", due: "2026-04-21" },
  { id: "D-2610", client: "株式会社グリーン", title: "新築事務所インテリア", amount: "¥6,400,000", stage: "提案中", probability: 50, owner: "営業本部 鈴木", next_action: "コンセプト提案", due: "2026-05-02" },
  { id: "D-2612", client: "個人 佐々木様", title: "キッチン全面改装", amount: "¥1,820,000", stage: "見積提出", probability: 70, owner: "営業本部 佐藤", next_action: "回答待ち", due: "2026-04-26" },
  { id: "D-2615", client: "株式会社オーロラ", title: "本社受付改装", amount: "¥2,950,000", stage: "見積中", probability: 35, owner: "営業本部 田中", next_action: "原価精査", due: "2026-05-01" },
  { id: "D-2617", client: "個人 中村様", title: "浴室リフォーム", amount: "¥780,000", stage: "失注", probability: 0, owner: "営業本部 鈴木", next_action: "—", due: "2026-04-19" },
  { id: "D-2620", client: "株式会社ベルガモ", title: "店舗什器一式", amount: "¥1,360,000", stage: "受注", probability: 100, owner: "営業本部 佐藤", next_action: "発注", due: "2026-04-23" },
];

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "案件管理 — REALIFE Operations" },
      { name: "description", content: "進行中案件の一覧。PipeDrive 連携前提のダミー10件で表示。" },
      { property: "og:title", content: "案件管理 — REALIFE Operations" },
      { property: "og:description", content: "進行中案件をステージ別・確度別に一覧管理。" },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const total = DEALS.reduce(
    (acc, d) => acc + Number(d.amount.replace(/[^\d]/g, "")),
    0,
  );
  const won = DEALS.filter((d) => d.stage === "受注").length;
  const open = DEALS.filter((d) => d.stage !== "受注" && d.stage !== "失注").length;

  return (
    <AppShell title="案件管理" subtitle="PipeDrive 連携前提 ・ ダミーデータ表示中">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "総案件", v: String(DEALS.length) },
            { l: "進行中", v: String(open) },
            { l: "受注済", v: String(won) },
            { l: "案件総額", v: `¥${(total / 1_000_000).toFixed(1)}M` },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">{s.l}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular">{s.v}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">クライアント</th>
                  <th className="px-4 py-3 text-left font-medium">案件名</th>
                  <th className="px-4 py-3 text-left font-medium">ステージ</th>
                  <th className="px-4 py-3 text-right font-medium">金額</th>
                  <th className="px-4 py-3 text-right font-medium">確度</th>
                  <th className="px-4 py-3 text-left font-medium">担当</th>
                  <th className="px-4 py-3 text-left font-medium">次のアクション</th>
                  <th className="px-4 py-3 text-right font-medium">期日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEALS.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">{d.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{d.client}</td>
                    <td className="px-4 py-3 text-slate-900">{d.title}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STAGE_STYLE[d.stage]}`}>
                        {d.stage}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-900">{d.amount}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-700">{d.probability}%</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">{d.owner}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{d.next_action}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-700">{d.due}</td>
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
