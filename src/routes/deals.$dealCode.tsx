import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Mail, MessageSquare, Phone, Save, Sparkles, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import {
  STAGES,
  STAGE_STYLE,
  addActivity,
  deleteActivity,
  formatAmount,
  getDealByCode,
  listActivities,
  updateDeal,
  type Deal,
  type DealActivity,
  type DealActivityKind,
  type DealStage,
} from "@/lib/deals";
import { getInstructionsForDepartment, type Instruction } from "@/lib/instructions";
import { useUserSettings } from "@/hooks/use-user-settings";

export const Route = createFileRoute("/deals/$dealCode")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.dealCode} — 案件詳細 — REALIFE Operations` },
      { name: "description", content: `案件 ${params.dealCode} の詳細・進捗・関連指示・活動ログ。` },
      { property: "og:title", content: `${params.dealCode} — 案件詳細` },
      { property: "og:description", content: "案件の進捗・関連指示・活動ログ。" },
    ],
  }),
  // 案件本体だけ await。activities / 関連指示は重いので並列取得しつつ Promise のまま返し、
  // 画面表示後に解決させる(Suspense で部分描画)。これによりクリック→新ページ表示までの
  // 待ち時間を最小化。
  loader: async ({ params }) => {
    try {
      const deal = await getDealByCode(params.dealCode);
      if (!deal) return { deal: null, activities: [], instructions: [] };
      // 並列発火するが、await はしない (deferred)
      const activitiesPromise = listActivities(deal.id).catch(() => [] as DealActivity[]);
      const instructionsPromise = getInstructionsForDepartment("02")
        .then((all) =>
          all.filter(
            (i: Instruction) => i.title.includes(deal.code) || i.content.includes(deal.code),
          ),
        )
        .catch(() => [] as Instruction[]);
      return {
        deal,
        // 後段の useState 初期化との互換のため空配列で初期化し、
        // 解決後に useEffect で反映する。
        activities: [] as DealActivity[],
        instructions: [] as Instruction[],
        activitiesPromise,
        instructionsPromise,
      };
    } catch (e) {
      console.error("[deal.$dealCode.loader]", e);
      return { deal: null, activities: [], instructions: [] };
    }
  },
  staleTime: 5_000,
  component: DealDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">案件が見つかりません。</p>
        <Link to="/deals" className="mt-3 inline-block text-sm text-blue-700 hover:underline">案件一覧へ戻る</Link>
      </div>
    </div>
  ),
});

const KIND_ICONS: Record<DealActivityKind, typeof MessageSquare> = {
  メモ: MessageSquare,
  電話: Phone,
  訪問: User,
  メール: Mail,
  その他: Sparkles,
};

function DealDetailPage() {
  const { dealCode } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const initial: { deal: Deal | null; activities: DealActivity[]; instructions: Instruction[] } =
    loaderData ?? { deal: null, activities: [], instructions: [] };
  const router = useRouter();
  const { settings } = useUserSettings();
  const [deal, setDeal] = useState<Deal | null>(initial.deal);
  const loading = false; // loader 通過後に render されるため初回ロード状態は不要
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<DealActivity[]>(initial.activities);
  const [instructions, setInstructions] = useState<Instruction[]>(initial.instructions);

  // form state — loader データから初期化
  const [stage, setStage] = useState<DealStage>(initial.deal?.stage ?? "見積中");
  const [probability, setProbability] = useState(initial.deal?.probability ?? 0);
  const [nextAction, setNextAction] = useState(initial.deal?.next_action ?? "");
  const [due, setDue] = useState(initial.deal?.due ?? "");
  const [notes, setNotes] = useState(initial.deal?.notes ?? "");

  // activity form
  const [actKind, setActKind] = useState<DealActivityKind>("メモ");
  const [actContent, setActContent] = useState("");

  // dealCode が変わった (別案件への遷移) ときは loader データで再同期
  useEffect(() => {
    setDeal(initial.deal);
    setActivities(initial.activities);
    setInstructions(initial.instructions);
    if (initial.deal) {
      setStage(initial.deal.stage);
      setProbability(initial.deal.probability);
      setNextAction(initial.deal.next_action);
      setDue(initial.deal.due ?? "");
      setNotes(initial.deal.notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealCode]);

  // realtime activities
  useEffect(() => {
    if (!deal) return;
    const channel = supabase
      .channel(`deal-acts-${deal.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deal_activities", filter: `deal_id=eq.${deal.id}` },
        () => {
          listActivities(deal.id).then(setActivities).catch(console.error);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [deal]);

  const stageIndex = useMemo(() => STAGES.indexOf(stage), [stage]);

  const onSave = async () => {
    if (!deal) return;
    setSaving(true);
    try {
      const updated = await updateDeal(deal.id, {
        stage,
        probability,
        next_action: nextAction,
        due: due || null,
        notes,
      });
      setDeal(updated);
      toast.success("保存しました");
      router.invalidate();
    } catch (e) {
      console.error(e);
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const onAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal || !actContent.trim()) return;
    try {
      await addActivity({
        deal_id: deal.id,
        kind: actKind,
        content: actContent.trim(),
        created_by: settings.display_name?.trim() || undefined,
      });
      setActContent("");
      toast.success("活動を記録しました");
    } catch (err) {
      console.error(err);
      toast.error("活動の記録に失敗しました");
    }
  };

  const onDeleteActivity = async (id: string) => {
    if (!confirm("この活動ログを削除しますか?")) return;
    try {
      await deleteActivity(id);
      toast.success("削除しました");
    } catch (err) {
      console.error(err);
      toast.error("削除に失敗しました");
    }
  };

  if (loading) {
    return (
      <AppShell title="案件詳細" subtitle="Loading...">
        <div className="px-4 py-12 text-center text-sm text-muted-foreground">読み込み中...</div>
      </AppShell>
    );
  }

  if (!deal) {
    return (
      <AppShell title="案件詳細" subtitle="">
        <div className="px-4 py-12 text-center text-sm text-muted-foreground">
          案件が見つかりませんでした。
          <div className="mt-3">
            <Link to="/deals" className="text-blue-700 hover:underline">案件一覧へ</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`案件 ${deal.code}`} subtitle={`${deal.client} ・ ${deal.title}`}>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between">
          <Link to="/deals" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> 案件一覧へ戻る
          </Link>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-blue-700 disabled:bg-muted"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "保存中..." : "変更を保存"}
          </button>
        </div>

        {/* Header */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{deal.code}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{deal.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{deal.client}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-semibold tracking-tight text-foreground">{formatAmount(deal.amount)}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">想定金額</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KV label="ステージ">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STAGE_STYLE[deal.stage]}`}>{deal.stage}</span>
            </KV>
            <KV label="確度"><span className="font-mono">{deal.probability}%</span></KV>
            <KV label="担当"><span className="text-sm">{deal.owner || "—"}</span></KV>
            <KV label="期日">
              <span className="inline-flex items-center gap-1 font-mono text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" /> {deal.due ?? "—"}
              </span>
            </KV>
          </div>
        </section>

        {/* Progress timeline */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">進捗タイムライン</h3>
          <div className="mt-4 flex items-center">
            {STAGES.map((s, i) => {
              const reached = i <= stageIndex && stage !== "失注";
              const isLost = stage === "失注" && s === "失注";
              const active = s === stage;
              return (
                <div key={s} className="flex flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => setStage(s)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold ${
                        isLost
                          ? "border-red-300 bg-red-100 text-red-700"
                          : active
                            ? "border-blue-500 bg-blue-600 text-white"
                            : reached
                              ? "border-blue-100 bg-blue-50 text-blue-700"
                              : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`text-[11px] ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s}</span>
                  </button>
                  {i < STAGES.length - 1 && (
                    <div className={`mx-2 h-px flex-1 ${i < stageIndex && stage !== "失注" ? "bg-blue-200" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">ステージをクリックして変更できます。下部の「変更を保存」を押してください。</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">確度 (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={probability}
                onChange={(e) => setProbability(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">期日</label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">次のアクション</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">案件メモ</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="案件の背景・要件・特記事項など"
                className="mt-1 w-full resize-none rounded-md border border-border bg-muted px-3 py-2 text-sm focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Related instructions */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">関連指示（営業本部）</h3>
            <Link
              to="/departments/$id"
              params={{ id: "02" }}
              className="text-[11px] font-medium text-blue-700 hover:underline"
            >
              営業本部ページへ →
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            タイトルまたは本文に <span className="font-mono">{deal.code}</span> を含む指示を表示しています。
          </p>
          <div className="mt-3 space-y-2">
            {instructions.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-muted px-3 py-6 text-center text-xs text-muted-foreground">
                関連指示はまだありません
              </p>
            ) : (
              instructions.map((i) => (
                <div key={i.id} className="rounded-md border border-border bg-muted px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{i.title}</p>
                    <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {i.status}
                    </span>
                  </div>
                  {i.content && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.content}</p>}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Activity log */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">活動ログ</h3>

          <form onSubmit={onAddActivity} className="mt-3 space-y-2">
            <div className="flex gap-2">
              <select
                value={actKind}
                onChange={(e) => setActKind(e.target.value as DealActivityKind)}
                className="rounded-md border border-border bg-muted px-2 py-2 text-sm focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {(["メモ", "電話", "訪問", "メール", "その他"] as DealActivityKind[]).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <input
                type="text"
                value={actContent}
                onChange={(e) => setActContent(e.target.value)}
                placeholder="活動内容を記録..."
                className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!actContent.trim()}
                className="rounded-md bg-foreground px-3 py-2 text-[12px] font-medium text-background hover:bg-foreground/90 disabled:bg-muted"
              >
                記録
              </button>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {activities.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-muted px-3 py-6 text-center text-xs text-muted-foreground">
                活動ログはまだありません
              </p>
            ) : (
              activities.map((a) => {
                const Icon = KIND_ICONS[a.kind];
                return (
                  <div key={a.id} className="flex gap-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 rounded-md border border-border bg-card px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {a.kind}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{a.created_by}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {new Date(a.created_at).toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteActivity(a.id)}
                            className="text-muted-foreground hover:text-red-600"
                            title="削除"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">{a.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
