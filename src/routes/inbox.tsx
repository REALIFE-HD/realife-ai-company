import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Inbox as InboxIcon, Sparkles, Send, Trash2, Archive, RotateCcw, ListPlus, Lightbulb } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useRouteMountMark } from "@/lib/web-vitals";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/data/departments";
import { addInstruction } from "@/lib/instructions";
import {
  classifyWithAI,
  createInboxMessage,
  deleteInboxMessage,
  listInbox,
  METHOD_LABEL,
  STATUS_LABEL,
  updateInboxMessage,
  type ActionSuggestion,
  type InboxMessage,
  type InboxStatus,
} from "@/lib/inbox";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "インボックス — REALIFE Operations" },
      { name: "description", content: "言われたこと・思ったことをメモして、AIが部門振り分けと次アクションを提案。" },
      { property: "og:title", content: "インボックス — REALIFE Operations" },
      { property: "og:description", content: "AI自動振り分け+次アクション提案でワンクリック指示書化。" },
    ],
  }),
  loader: async () => {
    try {
      return { items: await listInbox() };
    } catch (e) {
      console.error("[inbox.loader]", e);
      return { items: [] as InboxMessage[] };
    }
  },
  staleTime: 10_000,
  component: InboxPage,
});

const STATUS_FILTERS: { v: "all" | InboxStatus; label: string }[] = [
  { v: "all", label: "すべて" },
  { v: "unassigned", label: "未割当" },
  { v: "assigned", label: "割当済" },
  { v: "archived", label: "アーカイブ" },
];

// メッセージごとの提案アクションをセッションで保持(再振り分け時も復元)
const SUGGESTION_CACHE_KEY = "realife_inbox_suggestions";
type SuggestionMap = Record<string, ActionSuggestion[]>;

function readSuggestionCache(): SuggestionMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(SUGGESTION_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeSuggestionCache(map: SuggestionMap) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SUGGESTION_CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function InboxPage() {
  useRouteMountMark("/inbox");
  const initial = Route.useLoaderData();
  const [items, setItems] = useState<InboxMessage[]>(initial.items);
  const [filter, setFilter] = useState<"all" | InboxStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionMap>(() => readSuggestionCache());

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    try {
      const data = await listInbox();
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("読み込みに失敗しました");
    }
  };

  useEffect(() => {
    const ch = supabase
      .channel("inbox-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "inbox_messages" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const updateSuggestions = (id: string, list: ActionSuggestion[]) => {
    setSuggestions((prev) => {
      const next = { ...prev, [id]: list };
      writeSuggestionCache(next);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const byStatus = filter === "all" ? items : items.filter((i) => i.status === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((i) =>
      [i.subject, i.body, i.sender, i.assigned_department ?? ""].some((f) =>
        f.toLowerCase().includes(q),
      ),
    );
  }, [items, filter, search]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? filtered[0] ?? null,
    [items, filtered, selectedId],
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      unassigned: items.filter((i) => i.status === "unassigned").length,
      assigned: items.filter((i) => i.status === "assigned").length,
    }),
    [items],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      // 1. プレースホルダ件名で投函(AI生成の件名に後で更新)
      const provisionalSubject = body.trim().slice(0, 40);
      const created = await createInboxMessage({
        subject: provisionalSubject,
        body: body.trim(),
        sender: "",
      });

      // 2. AIで振り分け+件名+アクション提案
      toast.message("AIが振り分け中…");
      try {
        const ai = await classifyWithAI("", body.trim());
        await updateInboxMessage(created.id, {
          subject: ai.title || provisionalSubject,
          status: ai.department ? "assigned" : "unassigned",
          assigned_department: ai.department,
          route_method: ai.department ? "ai" : "pending",
          route_confidence: ai.confidence,
          route_reason: ai.reason,
        });
        if (ai.suggestions.length > 0) {
          updateSuggestions(created.id, ai.suggestions);
        }
        if (ai.department) {
          toast.success(`${getDeptName(ai.department)} に振り分け (${ai.confidence}%)`);
        } else {
          toast.warning("AIが判定できず、未割当のままです");
        }
        setSelectedId(created.id);
      } catch (err) {
        console.error(err);
        toast.error("AI振り分けに失敗。未割当のままです。");
      }

      setBody("");
    } catch (err) {
      console.error(err);
      toast.error("投函に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const reroute = async (m: InboxMessage) => {
    toast.message("AI再振り分け中…");
    try {
      const ai = await classifyWithAI(m.subject, m.body);
      if (ai.department) {
        await updateInboxMessage(m.id, {
          subject: ai.title || m.subject,
          status: "assigned",
          assigned_department: ai.department,
          route_method: "ai",
          route_confidence: ai.confidence,
          route_reason: ai.reason,
        });
        if (ai.suggestions.length > 0) updateSuggestions(m.id, ai.suggestions);
        toast.success(`${getDeptName(ai.department)} に再振り分け`);
      }
    } catch (e) {
      console.error(e);
      toast.error("再振り分けに失敗");
    }
  };

  const setDept = async (m: InboxMessage, dept: string) => {
    await updateInboxMessage(m.id, {
      assigned_department: dept,
      status: "assigned",
      route_method: "manual",
      route_confidence: 100,
      route_reason: "手動割当",
    });
    toast.success(`${getDeptName(dept)} に割当`);
  };

  const archive = async (m: InboxMessage) => {
    await updateInboxMessage(m.id, { status: "archived" });
    toast.success("アーカイブしました");
  };

  const remove = async (m: InboxMessage) => {
    if (!confirm("削除しますか?")) return;
    await deleteInboxMessage(m.id);
    toast.success("削除しました");
  };

  const promoteToInstruction = async (m: InboxMessage, s: ActionSuggestion) => {
    if (!m.assigned_department) {
      toast.error("先に部門を割り当ててください");
      return;
    }
    try {
      await addInstruction({
        department_code: m.assigned_department,
        title: s.title,
        content: `${s.detail}\n\n— 元メッセージ —\n${m.body}`,
      });
      toast.success(`「${s.title}」を指示書化しました`);
    } catch (e) {
      console.error(e);
      toast.error("指示書化に失敗しました");
    }
  };

  const selectedSuggestions = selected ? suggestions[selected.id] ?? [] : [];

  return (
    <AppShell
      title="インボックス"
      subtitle="言われたこと・思ったことをメモ → AIが部門振り分け + 次アクション提案"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="本文・部門で検索…"
    >
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        {/* KPI */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { l: "総数", v: stats.total, accent: "text-foreground" },
            { l: "未割当", v: stats.unassigned, accent: "text-amber-700" },
            { l: "割当済", v: stats.assigned, accent: "text-blue-700" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border/80 bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{s.l}</p>
              <p className={`kpi-value mt-1.5 text-right text-[1.625rem] leading-none ${s.accent}`}>{s.v}</p>
            </div>
          ))}
        </section>

        {/* シンプル投函フォーム */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-blue-600" />
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">言われたこと / 思ったこと</h2>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            気になったことをそのまま書くだけ。AIが件名を整えて、最適な部門に振り分け、次のアクションまで提案します。
          </p>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-body" className="sr-only">本文</Label>
              <Textarea
                id="m-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                required
                placeholder="例:現場Aの工程が遅延気味、来週の打合せまでに見積も再チェックしたい…"
                className="text-[14px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{body.length} / 5000</span>
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {submitting ? "AI処理中…" : "投函してAIに任せる"}
              </button>
            </div>
          </form>
        </section>

        {/* フィルタ */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.v}
              type="button"
              onClick={() => setFilter(f.v)}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                filter === f.v
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-border bg-card text-muted-foreground hover:border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 一覧 + 詳細 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card lg:col-span-1">
            <div className="border-b border-border px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              <InboxIcon className="mr-1.5 inline h-3.5 w-3.5" />
              {filtered.length} 件
            </div>
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">メッセージはありません</div>
            ) : (
              <ul className="max-h-[560px] divide-y divide-border overflow-y-auto">
                {filtered.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(m.id)}
                      className={`block w-full px-4 py-3 text-left transition-colors hover:bg-muted ${
                        selected?.id === m.id ? "bg-blue-50/60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-medium text-foreground">{m.subject}</p>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{m.body}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {m.assigned_department && (
                          <span className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                            {m.assigned_department} {getDeptName(m.assigned_department)}
                          </span>
                        )}
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {METHOD_LABEL[m.route_method]}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 詳細 */}
          <div className="rounded-2xl border border-border bg-card lg:col-span-2">
            {!selected ? (
              <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-muted-foreground">
                左から選択してください
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                      {selected.subject}
                    </h3>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {new Date(selected.created_at).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="mt-4 rounded-md border border-border bg-muted/60 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">振り分け結果</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="font-medium text-foreground">
                      {selected.assigned_department
                        ? `${selected.assigned_department} ${getDeptName(selected.assigned_department)}`
                        : "未割当"}
                    </span>
                    <span className="rounded bg-card px-1.5 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border">
                      {METHOD_LABEL[selected.route_method]}
                    </span>
                    {selected.route_method !== "pending" && (
                      <span className="text-muted-foreground">信頼度 {selected.route_confidence}%</span>
                    )}
                  </div>
                  {selected.route_reason && (
                    <p className="mt-1 text-[11px] text-muted-foreground">理由: {selected.route_reason}</p>
                  )}
                </div>

                <pre className="mt-4 whitespace-pre-wrap rounded-md border border-border bg-card p-4 font-sans text-[13px] leading-relaxed text-foreground">
                  {selected.body}
                </pre>

                {/* AI次アクション */}
                {selectedSuggestions.length > 0 && (
                  <div className="mt-5 rounded-md border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      <p className="text-[12px] font-semibold text-amber-900 dark:text-amber-200">AIが提案する次アクション</p>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {selectedSuggestions.map((s, i) => (
                        <li key={i} className="flex items-start justify-between gap-3 rounded-md bg-card/80 p-3 ring-1 ring-border">
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-foreground">{s.title}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.detail}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => promoteToInstruction(selected, s)}
                            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300"
                          >
                            <ListPlus className="h-3.5 w-3.5" /> 指示書化
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* アクション */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[11px] text-muted-foreground">手動割当:</Label>
                    <Select
                      value={selected.assigned_department ?? undefined}
                      onValueChange={(v) => setDept(selected, v)}
                    >
                      <SelectTrigger className="h-8 w-56">
                        <SelectValue placeholder="部門を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.id} {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type="button"
                    onClick={() => reroute(selected)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:border-border"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> AI再振り分け
                  </button>
                  {selected.status !== "archived" && (
                    <button
                      type="button"
                      onClick={() => archive(selected)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:border-border"
                    >
                      <Archive className="h-3.5 w-3.5" /> アーカイブ
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(selected)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-card px-3 py-1.5 text-[12px] font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 削除
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function getDeptName(code: string) {
  return DEPARTMENTS.find((d) => d.id === code)?.name ?? "(不明)";
}

function StatusBadge({ status }: { status: InboxStatus }) {
  const style: Record<InboxStatus, string> = {
    unassigned: "border-amber-200 bg-amber-50 text-amber-700",
    assigned: "border-emerald-200 bg-emerald-50 text-emerald-700",
    archived: "border-border bg-muted text-muted-foreground",
  };
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${style[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
