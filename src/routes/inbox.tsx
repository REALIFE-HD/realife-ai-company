import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Inbox as InboxIcon, Sparkles, Send, Trash2, Archive, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
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
import {
  applyRules,
  classifyWithAI,
  createInboxMessage,
  deleteInboxMessage,
  listInbox,
  METHOD_LABEL,
  STATUS_LABEL,
  updateInboxMessage,
  type InboxMessage,
  type InboxStatus,
} from "@/lib/inbox";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "インボックス — REALIFE Operations" },
      { name: "description", content: "受信メッセージを自動で12部門に振り分けるインボックス。" },
      { property: "og:title", content: "インボックス — REALIFE Operations" },
      { property: "og:description", content: "ハイブリッド振り分け(ルール+AI)による自動仕分け。" },
    ],
  }),
  component: InboxPage,
});

const STATUS_FILTERS: { v: "all" | InboxStatus; label: string }[] = [
  { v: "all", label: "すべて" },
  { v: "unassigned", label: "未割当" },
  { v: "assigned", label: "割当済" },
  { v: "archived", label: "アーカイブ" },
];

function InboxPage() {
  const [items, setItems] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | InboxStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sender, setSender] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    try {
      const data = await listInbox();
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("inbox-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "inbox_messages" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter],
  );

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
    if (!subject.trim() || !body.trim() || submitting) return;
    setSubmitting(true);
    try {
      // 1. 投函
      const created = await createInboxMessage({
        subject: subject.trim(),
        body: body.trim(),
        sender: sender.trim(),
      });

      // 2. ハイブリッド振り分け: まずルール
      const ruleHit = applyRules(subject, body);
      if (ruleHit) {
        await updateInboxMessage(created.id, {
          status: "assigned",
          assigned_department: ruleHit.dept,
          route_method: "rule",
          route_confidence: 100,
          route_reason: ruleHit.reason,
        });
        toast.success(`ルール振り分け → ${getDeptName(ruleHit.dept)}`);
      } else {
        // 3. ルール外 → AI
        toast.message("AI振り分け中...");
        try {
          const ai = await classifyWithAI(subject, body);
          if (ai.department) {
            await updateInboxMessage(created.id, {
              status: "assigned",
              assigned_department: ai.department,
              route_method: "ai",
              route_confidence: ai.confidence,
              route_reason: ai.reason,
            });
            toast.success(`AI振り分け → ${getDeptName(ai.department)} (${ai.confidence}%)`);
          } else {
            toast.warning("AIが判定できず、保留に分類しました");
          }
        } catch (err) {
          console.error(err);
          toast.error("AI振り分けに失敗。未割当のままです。");
        }
      }

      setSubject("");
      setBody("");
      setSender("");
    } catch (err) {
      console.error(err);
      toast.error("投函に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const reroute = async (m: InboxMessage) => {
    toast.message("AI再振り分け中...");
    try {
      const ai = await classifyWithAI(m.subject, m.body);
      if (ai.department) {
        await updateInboxMessage(m.id, {
          status: "assigned",
          assigned_department: ai.department,
          route_method: "ai",
          route_confidence: ai.confidence,
          route_reason: ai.reason,
        });
        toast.success(`AI再振り分け → ${getDeptName(ai.department)}`);
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

  return (
    <AppShell title="インボックス" subtitle="ハイブリッド自動振り分け(ルール+AI)">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        {/* KPI */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { l: "総数", v: stats.total },
            { l: "未割当", v: stats.unassigned },
            { l: "割当済", v: stats.assigned },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">{s.l}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular">{s.v}</p>
            </div>
          ))}
        </section>

        {/* 投函フォーム */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-teal-600" />
            <h2 className="font-serif text-lg font-semibold tracking-tight text-slate-900">新規メッセージ投函</h2>
          </div>
          <p className="mt-1 text-[12px] text-slate-500">
            投函すると、まずキーワードルール、次にAIで自動的に12部門のいずれかに振り分けます。
          </p>
          <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-sender">差出人</Label>
              <Input id="m-sender" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="例:山田 (取引先A)" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-subj">件名 *</Label>
              <Input id="m-subj" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="例:見積書 #2604 の修正依頼" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="m-body">本文 *</Label>
              <Textarea id="m-body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} required placeholder="メッセージ内容を入力" />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {submitting ? "振り分け中..." : "投函して自動振り分け"}
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
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 一覧 + 詳細 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-1">
            <div className="border-b border-slate-100 px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500">
              <InboxIcon className="mr-1.5 inline h-3.5 w-3.5" />
              {filtered.length} 件
            </div>
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">読込中...</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">メッセージはありません</div>
            ) : (
              <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
                {filtered.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(m.id)}
                      className={`block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                        selected?.id === m.id ? "bg-teal-50/60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-medium text-slate-900">{m.subject}</p>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">{m.sender || "(差出人なし)"}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {m.assigned_department && (
                          <span className="rounded border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
                            {m.assigned_department} {getDeptName(m.assigned_department)}
                          </span>
                        )}
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
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
          <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2">
            {!selected ? (
              <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-500">
                左から選択してください
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                      {selected.subject}
                    </h3>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {selected.sender || "(差出人なし)"} ・ {new Date(selected.created_at).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">振り分け結果</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="font-medium text-slate-900">
                      {selected.assigned_department
                        ? `${selected.assigned_department} ${getDeptName(selected.assigned_department)}`
                        : "未割当"}
                    </span>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
                      {METHOD_LABEL[selected.route_method]}
                    </span>
                    {selected.route_method !== "pending" && (
                      <span className="text-slate-500">信頼度 {selected.route_confidence}%</span>
                    )}
                  </div>
                  {selected.route_reason && (
                    <p className="mt-1 text-[11px] text-slate-500">理由: {selected.route_reason}</p>
                  )}
                </div>

                <pre className="mt-4 whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-4 font-sans text-[13px] leading-relaxed text-slate-800">
                  {selected.body}
                </pre>

                {/* アクション */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[11px] text-slate-500">手動割当:</Label>
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
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:border-slate-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> AI再振り分け
                  </button>
                  {selected.status !== "archived" && (
                    <button
                      type="button"
                      onClick={() => archive(selected)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:border-slate-300"
                    >
                      <Archive className="h-3.5 w-3.5" /> アーカイブ
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(selected)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-3 py-1.5 text-[12px] font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 削除
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
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
    archived: "border-slate-200 bg-slate-50 text-slate-500",
  };
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${style[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
