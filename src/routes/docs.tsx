import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Compass, LayoutGrid, MessageSquare, Workflow } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "ドキュメント — REALIFE Operations" },
      {
        name: "description",
        content:
          "REALIFE Operations の使い方ガイド。ダッシュボード・部門・指示出し・AIチャットの基本操作と運用ベストプラクティスをまとめています。",
      },
      { property: "og:title", content: "ドキュメント — REALIFE Operations" },
      {
        property: "og:description",
        content: "ダッシュボード・部門・指示出し・AIチャットの基本操作ガイド。",
      },
    ],
  }),
  component: DocsPage,
});

const SECTIONS = [
  {
    id: "getting-started",
    icon: Compass,
    title: "はじめに",
    lead: "REALIFE Operations は、合同会社REALIFEの12仮想部門を一望し、業務指示を横断的に動かすためのオペレーションシステムです。",
    body: [
      "ダッシュボード(/)では今月の成約・進行中案件・見積・稼働メンバーなど主要KPIを確認できます。",
      "部門一覧(/departments)から各部門の詳細ページへ移動し、KPI・タスク・案件・指示履歴にアクセスします。",
    ],
  },
  {
    id: "dashboard",
    icon: LayoutGrid,
    title: "ダッシュボードの読み方",
    lead: "上部のKPIカードと部門ステータス分布で、組織全体の状態を瞬時に把握します。",
    body: [
      "KPIカードは前月比トレンド付きで、進捗の良し悪しをひと目で確認できます。",
      "「部門ステータス分布」では稼働中・構築中・標準運用の構成比をグラフで表示します。",
      "「すべての部門を、一望する。」セクションから、各部門カードへ直接遷移できます。",
    ],
  },
  {
    id: "departments",
    icon: Workflow,
    title: "部門と指示出し",
    lead: "各部門詳細ページで、KPI・タスク・案件・指示履歴の4タブを切り替えて状況を確認します。",
    body: [
      "右上の「新規指示」ボタンから、タイトルと内容を入力して指示を発行できます。",
      "発行した指示は「指示履歴」タブに即時反映され、From フィールドで担当者を確認できます。",
      "関連部門カードから、横断的に他部門の状況へジャンプできます。",
    ],
  },
  {
    id: "ai-chat",
    icon: MessageSquare,
    title: "AIチャット連携",
    lead: "サイドバーの「AIチャット」から、Coworkプロジェクトと連携した業務支援チャットを呼び出せます。",
    body: [
      "見積・発注・採用・経理など、各部門の業務を自然言語で指示できます。",
      "チャットからの指示は対象部門の指示履歴へ自動的に記録されます(今後対応予定)。",
    ],
  },
];

const FAQ = [
  {
    q: "部門の追加・編集はどこで行えますか?",
    a: "現在のバージョンでは部門マスタは src/data/departments.ts に定義されています。今後の管理画面リリースで、UI からの編集に対応予定です。",
  },
  {
    q: "指示は永続化されますか?",
    a: "現状はブラウザセッション内のみ保持されます。永続化が必要な場合は Lovable Cloud の有効化をご相談ください。",
  },
  {
    q: "モバイルから操作できますか?",
    a: "はい。サイドバーは左上のメニューアイコンからドロワーで開閉でき、すべての画面がレスポンシブ対応しています。",
  },
];

function DocsPage() {
  return (
    <AppShell title="ドキュメント" subtitle="使い方ガイドと運用ベストプラクティス">
      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            ダッシュボードへ戻る
          </Link>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-6 bg-teal-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-700">
              Documentation
            </span>
          </div>
          <h2 className="mt-3 max-w-2xl font-serif text-[1.875rem] font-semibold leading-[1.2] tracking-tight text-slate-900 sm:text-[2.25rem]">
            REALIFE Operations の使い方
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-600">
            ダッシュボード・部門・指示出し・AIチャットの基本操作と、12部門を横断的に動かすための
            運用ベストプラクティスをまとめています。
          </p>

          {/* TOC */}
          <nav aria-label="目次" className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="group flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-white hover:text-teal-700"
                >
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-teal-600" aria-hidden="true" />
                  {s.title}
                </a>
              );
            })}
          </nav>
        </section>

        {/* Sections */}
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-heading`}
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <h3
                  id={`${s.id}-heading`}
                  className="font-serif text-xl font-semibold tracking-tight text-slate-900 sm:text-[1.5rem]"
                >
                  {s.title}
                </h3>
              </div>
              <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-slate-700">{s.lead}</p>
              <ul className="mt-4 space-y-2 text-[13px] leading-relaxed text-slate-600">
                {s.body.map((line, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-teal-500" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* FAQ */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <BookOpen className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <h3
              id="faq-heading"
              className="font-serif text-xl font-semibold tracking-tight text-slate-900 sm:text-[1.5rem]"
            >
              よくある質問
            </h3>
          </div>
          <dl className="mt-5 divide-y divide-slate-200">
            {FAQ.map((item, i) => (
              <div key={i} className="py-4">
                <dt className="text-[14px] font-medium text-slate-900">Q. {item.q}</dt>
                <dd className="mt-2 text-[13px] leading-relaxed text-slate-600">A. {item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA back */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                さあ、12部門を動かしましょう。
              </h3>
              <p className="mt-1 text-[13px] text-slate-500">
                部門一覧から、今日指示を出す部門を選択します。
              </p>
            </div>
            <Link
              to="/departments"
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-teal-700"
            >
              部門を選んで指示
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}
