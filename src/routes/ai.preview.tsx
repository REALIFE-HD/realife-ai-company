import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Moon, Sun, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/layout/AppShell";
import { CodeBlock } from "@/components/ai/CodeBlock";

export const Route = createFileRoute("/ai/preview")({
  head: () => ({
    meta: [
      { title: "AIチャット表示プレビュー — REALIFE Operations" },
      { name: "description", content: "ダーク/ライト両モードでチャット表示を目視確認するための開発用ページ。" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AiPreviewPage,
});

type Sample = {
  id: string;
  role: "user" | "assistant";
  label: string;
  content: string;
};

const SAMPLES: Sample[] = [
  {
    id: "user-short",
    role: "user",
    label: "ユーザー(短文)",
    content: "見積書のテンプレートを教えてください。",
  },
  {
    id: "user-long",
    role: "user",
    label: "ユーザー(長文・改行)",
    content:
      "次の案件について確認したいです。\n- 顧客: 株式会社サンプル\n- 期日: 来週金曜\n- 金額: 約 120 万円\n\nどの部門に振るのが適切でしょうか?",
  },
  {
    id: "assistant-md",
    role: "assistant",
    label: "AI(見出し/リスト/強調/リンク)",
    content:
      "## 概要\n\n**REALIFE Operations** では各部門の業務を統合管理しています。詳しくは [ドキュメント](https://example.com) を参照してください。\n\n### 主な機能\n\n1. 指示出し管理\n2. *見積* と発注\n3. メッセージ振分け\n\n> 注意: 本番データは慎重に扱ってください。",
  },
  {
    id: "assistant-inline-code",
    role: "assistant",
    label: "AI(インラインコード)",
    content:
      "Supabase クライアントは `@/integrations/supabase/client` から `supabase` をインポートしてください。テーブル名は `deals` です。",
  },
  {
    id: "assistant-code-block",
    role: "assistant",
    label: "AI(コードブロック / TypeScript)",
    content:
      "以下は案件取得の例です:\n\n```ts\nimport { supabase } from \"@/integrations/supabase/client\";\n\nexport async function listDeals() {\n  const { data, error } = await supabase\n    .from(\"deals\")\n    .select(\"id, code, title, amount\")\n    .order(\"created_at\", { ascending: false });\n  if (error) throw error;\n  return data;\n}\n```",
  },
  {
    id: "assistant-code-sql",
    role: "assistant",
    label: "AI(コードブロック / SQL)",
    content:
      "RLS の例:\n\n```sql\ncreate policy \"users read own\"\non public.user_settings\nfor select\nto authenticated\nusing (auth.uid() = user_id);\n```",
  },
];

function ChatBubble({ sample }: { sample: Sample }) {
  return (
    <div className={`flex ${sample.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-foreground ${
          sample.role === "user"
            ? "border border-blue-500/30 bg-blue-500/15 dark:bg-blue-400/15"
            : "border border-border bg-muted"
        }`}
      >
        {sample.role === "assistant" && (
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-blue-700 dark:text-blue-300">
            <Sparkles className="h-3 w-3" /> REALIFE AI
          </div>
        )}
        {sample.role === "assistant" ? (
          <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground prose-p:text-foreground prose-blockquote:text-foreground prose-a:text-blue-700 prose-a:underline prose-code:text-foreground prose-code:bg-background/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-background prose-pre:text-foreground prose-pre:border prose-pre:border-border prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-headings:mt-3 prose-headings:mb-1.5 prose-pre:my-2 prose-code:text-[12px] dark:prose-invert dark:prose-a:text-blue-300">
            <ReactMarkdown components={{ code: CodeBlock as never }}>
              {sample.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-foreground">{sample.content}</p>
        )}
      </div>
    </div>
  );
}

type AutoMode = "off" | "toggle";

function AiPreviewPage() {
  const [autoMode, setAutoMode] = useState<AutoMode>("off");
  const [forcedDark, setForcedDark] = useState<boolean | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  // Apply forced theme on the <html> element
  useEffect(() => {
    if (forcedDark === null) return;
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    if (forcedDark) root.classList.add("dark");
    else root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
      else root.classList.remove("dark");
    };
  }, [forcedDark]);

  // Auto-toggle theme every 2.5s when enabled
  useEffect(() => {
    if (autoMode !== "toggle") return;
    setForcedDark(true);
    const id = setInterval(() => {
      setForcedDark((prev) => !(prev ?? false));
    }, 2500);
    return () => clearInterval(id);
  }, [autoMode]);

  // Simple visual contrast assertion: check rendered bubbles have foreground color
  const runCheck = () => {
    const found: string[] = [];
    const nodes = document.querySelectorAll("[data-preview-bubble]");
    nodes.forEach((el, idx) => {
      const cs = getComputedStyle(el as HTMLElement);
      const color = cs.color;
      const bg = cs.backgroundColor;
      // Detect transparent or matching color/bg as a smoke test for invisibility
      if (color === bg) {
        found.push(`#${idx + 1}: text color matches background (${color})`);
      }
      // Heuristic: in dark mode, color should NOT be near-black
      if (document.documentElement.classList.contains("dark")) {
        const m = color.match(/\d+/g);
        if (m) {
          const [r, g, b] = m.map(Number);
          if (r + g + b < 120) {
            found.push(`#${idx + 1}: dark-on-dark text (${color})`);
          }
        }
      }
    });
    setIssues(found);
    setLastChecked(new Date().toLocaleTimeString());
  };

  // Auto-run check after each theme flip
  useEffect(() => {
    if (autoMode !== "toggle") return;
    const t = setTimeout(runCheck, 200);
    return () => clearTimeout(t);
  }, [autoMode, forcedDark]);

  return (
    <AppShell title="チャット表示プレビュー" subtitle="開発用 ・ ダーク/ライト目視確認">
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/ai"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> AIチャットへ戻る
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setForcedDark(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
            >
              <Sun className="h-3 w-3" /> Light
            </button>
            <button
              type="button"
              onClick={() => setForcedDark(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
            >
              <Moon className="h-3 w-3" /> Dark
            </button>
            <button
              type="button"
              onClick={() => setAutoMode((m) => (m === "toggle" ? "off" : "toggle"))}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium ${
                autoMode === "toggle"
                  ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {autoMode === "toggle" ? "自動切替: ON" : "自動切替: OFF"}
            </button>
            <button
              type="button"
              onClick={runCheck}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
            >
              チェック実行
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-card p-3 text-[12px] text-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              現在: <strong>{forcedDark ? "Dark" : forcedDark === false ? "Light" : "(未強制)"}</strong>
            </span>
            <span>最終チェック: {lastChecked ?? "-"}</span>
            <span
              className={
                issues.length === 0
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }
            >
              {issues.length === 0 ? "✓ 表示問題なし" : `⚠ ${issues.length} 件の問題`}
            </span>
          </div>
          {issues.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-red-700 dark:text-red-300">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          {SAMPLES.map((s) => (
            <div key={s.id} className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <div data-preview-bubble>
                <ChatBubble sample={s} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
