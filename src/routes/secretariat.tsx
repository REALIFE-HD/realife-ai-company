import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  realifeSupabase,
  type SecretariatIntake,
  type SecretariatStatus,
  type SecretariatUrgency,
} from "@/integrations/realife/client";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/secretariat")({
  head: () => ({
    meta: [
      { title: "秘書室受付台帳 — Unified Core Ops" },
      {
        name: "description",
        content: "秘書室の受付案件を一覧・フィルタ・詳細確認できる台帳ダッシュボード。",
      },
    ],
  }),
  loader: async () => {
    const { data, error } = await realifeSupabase
      .from("secretariat_intake")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return (data ?? []) as SecretariatIntake[];
  },
  component: SecretariatPage,
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <AppShell title="秘書室受付台帳" subtitle="読み込みエラー">
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-6">
          <p className="text-sm text-destructive">
            データの取得に失敗しました: {error.message}
          </p>
          <button
            type="button"
            onClick={() => router.invalidate()}
            className="mt-3 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            再試行
          </button>
        </div>
      </AppShell>
    );
  },
  notFoundComponent: () => (
    <AppShell title="秘書室受付台帳" subtitle="見つかりません">
      <p className="text-sm text-muted-foreground">ページが見つかりません。</p>
    </AppShell>
  ),
});

const URGENCY_LEVELS: SecretariatUrgency[] = ["S", "A", "B", "C", "D"];
const STATUSES: SecretariatStatus[] = [
  "open",
  "handed_over",
  "completed",
  "cancelled",
  "rejudge_needed",
];

const STATUS_LABEL: Record<SecretariatStatus, string> = {
  open: "対応中",
  handed_over: "引継済",
  completed: "完了",
  cancelled: "キャンセル",
  rejudge_needed: "再判定要",
};

function urgencyRowClass(u: SecretariatUrgency): string {
  switch (u) {
    case "S":
      return "bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60";
    case "A":
      return "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/60";
    case "B":
      return "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50";
    case "C":
      return "bg-card hover:bg-muted/40";
    case "D":
      return "bg-muted/40 hover:bg-muted/60 text-muted-foreground";
  }
}

function urgencyBadgeClass(u: SecretariatUrgency): string {
  switch (u) {
    case "S":
      return "bg-red-600 text-white border-transparent";
    case "A":
      return "bg-orange-500 text-white border-transparent";
    case "B":
      return "bg-yellow-400 text-yellow-950 border-transparent";
    case "C":
      return "bg-secondary text-secondary-foreground border-transparent";
    case "D":
      return "bg-muted text-muted-foreground border-transparent";
  }
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function SecretariatPage() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const [rows, setRows] = useState<SecretariatIntake[]>(initial);
  const [urgency, setUrgency] = useState<string>("all");
  const [dept, setDept] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<SecretariatIntake | null>(null);

  // ローダー再実行で initial が更新された場合の同期
  useEffect(() => {
    setRows(initial);
  }, [initial]);

  // Realtime: 新規挿入で先頭追加
  useEffect(() => {
    const channel = realifeSupabase
      .channel("secretariat_intake_inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "secretariat_intake" },
        (payload) => {
          const row = payload.new as SecretariatIntake;
          setRows((prev) => {
            if (prev.some((r) => r.id === row.id)) return prev;
            return [row, ...prev];
          });
        },
      )
      .subscribe();
    return () => {
      void realifeSupabase.removeChannel(channel);
    };
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.main_dept) set.add(r.main_dept);
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (urgency !== "all" && r.urgency !== urgency) return false;
      if (dept !== "all" && r.main_dept !== dept) return false;
      if (status !== "all" && r.status !== status) return false;
      return true;
    });
  }, [rows, urgency, dept, status]);

  return (
    <AppShell
      title="秘書室受付台帳"
      subtitle={`${filtered.length.toLocaleString("ja-JP")} 件 / 全 ${rows.length.toLocaleString("ja-JP")} 件`}
    >
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="緊急度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">緊急度: 全て</SelectItem>
              {URGENCY_LEVELS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="主管部門" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">主管部門: 全て</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ステータス: 全て</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => router.invalidate()}
            className="ml-auto rounded-md border border-input bg-background px-3 py-1.5 text-xs hover:bg-muted"
          >
            再読み込み
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-10 px-2 py-2 text-center"></th>
                  <th className="px-3 py-2 text-left">受付ID</th>
                  <th className="px-3 py-2 text-left font-mono">受付日時</th>
                  <th className="px-3 py-2 text-left">経路</th>
                  <th className="px-3 py-2 text-left">差出人</th>
                  <th className="px-3 py-2 text-left">件名</th>
                  <th className="px-3 py-2 text-center">緊急度</th>
                  <th className="px-3 py-2 text-left">主管部門</th>
                  <th className="px-3 py-2 text-left">状態</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-12 text-center text-sm text-muted-foreground"
                    >
                      該当する受付案件はありません。
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={cn(
                      "cursor-pointer border-t transition-colors",
                      urgencyRowClass(r.urgency),
                    )}
                  >
                    <td className="px-2 py-2 text-center text-base">
                      {r.escalate_to_ceo ? (
                        <span title="CEOエスカレーション">🚨</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.intake_id}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {fmtDateTime(r.received_at)}
                    </td>
                    <td className="px-3 py-2 text-xs">{r.source}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.from_name ?? "—"}</div>
                      {r.from_company && (
                        <div className="text-xs text-muted-foreground">
                          {r.from_company}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 max-w-[24rem] truncate">{r.subject}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={urgencyBadgeClass(r.urgency)}>
                        {r.urgency}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{r.main_dept}</td>
                    <td className="px-3 py-2 text-xs">
                      {STATUS_LABEL[r.status] ?? r.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.escalate_to_ceo && <span>🚨</span>}
                  <Badge className={urgencyBadgeClass(selected.urgency)}>
                    {selected.urgency}
                  </Badge>
                  <span className="truncate">{selected.subject}</span>
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {selected.intake_id} · {fmtDateTime(selected.received_at)} ·{" "}
                  {selected.source}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">差出人</div>
                    <div>{selected.from_name ?? "—"}</div>
                    {selected.from_company && (
                      <div className="text-muted-foreground">
                        {selected.from_company}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted-foreground">主管 / サブ</div>
                    <div>{selected.main_dept}</div>
                    {selected.sub_depts && selected.sub_depts.length > 0 && (
                      <div className="text-muted-foreground">
                        {selected.sub_depts.join(", ")}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted-foreground">状態</div>
                    <div>{STATUS_LABEL[selected.status] ?? selected.status}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">SLA期限</div>
                    <div className="font-mono tabular-nums">
                      {selected.sla_deadline
                        ? fmtDateTime(selected.sla_deadline)
                        : "—"}
                    </div>
                  </div>
                </div>

                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    要約
                  </h3>
                  <p className="whitespace-pre-wrap rounded-md border bg-card p-3">
                    {selected.summary || "—"}
                  </p>
                </section>

                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    メモ
                  </h3>
                  <p className="whitespace-pre-wrap rounded-md border bg-card p-3">
                    {selected.notes || "—"}
                  </p>
                </section>

                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    AI判定理由
                  </h3>
                  <p className="whitespace-pre-wrap rounded-md border bg-card p-3 text-xs">
                    {selected.ai_judgment_reason || "—"}
                  </p>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
