import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import {
  DEPARTMENTS,
  DUMMY_DEALS,
  DUMMY_TASKS,
  getDepartment,
  type Department,
} from "@/data/departments";
import { AppShell } from "@/components/layout/AppShell";
import { CTASection } from "@/components/dashboard/CTASection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewInstructionDialog } from "@/components/instructions/NewInstructionDialog";
import { InstructionList } from "@/components/instructions/InstructionList";
import { DocumentList } from "@/components/documents/DocumentList";
import {
  getInstructionsForDepartment,
  subscribeToInstructions,
  type Instruction,
} from "@/lib/instructions";

export const Route = createFileRoute("/departments/$id")({
  loader: ({ params }) => {
    const department = getDepartment(params.id);
    if (!department) throw notFound();
    return { department };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.department;
    const title = d ? `${d.name} — REALIFE Operations` : "部門 — REALIFE Operations";
    const desc = d?.role ?? "REALIFE 仮想会社ダッシュボード";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: DepartmentDetail,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-card px-4">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-foreground">部門が見つかりません</h1>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードへ
        </Link>
      </div>
    </div>
  ),
});

const STATUS_STYLE: Record<Department["status"], string> = {
  active: "border-blue-100 bg-blue-50 text-blue-700",
  setup: "border-amber-200 bg-amber-50 text-amber-700",
  standard: "",
};

const PRIORITY_STYLE: Record<string, string> = {
  高: "bg-red-50 text-red-700 border-red-200",
  中: "bg-amber-50 text-amber-700 border-amber-200",
  低: "bg-muted text-muted-foreground border-border",
};

function DepartmentDetail() {
  const { department } = Route.useLoaderData();
  const d = department as Department;
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  const refresh = () => {
    getInstructionsForDepartment(d.id)
      .then(setInstructions)
      .catch(() => setInstructions([]));
  };

  // Initial load + realtime sync across devices
  useEffect(() => {
    refresh();
    const unsub = subscribeToInstructions(refresh);
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.id]);

  return (
    <AppShell title={d.name} subtitle={d.role}>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              ダッシュボード
            </Link>

            <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-muted font-mono text-xl font-medium text-muted-foreground">
                  {d.id}
                </span>
                <div>
                  {d.statusLabel && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[d.status]}`}
                    >
                      {d.statusLabel}
                    </span>
                  )}
                  <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {d.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{d.role}</p>
                </div>
              </div>

              <NewInstructionDialog
                fixedDepartmentCode={d.id}
                onCreated={refresh}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    この部門へ指示を出す
                  </button>
                }
              />
            </div>

            {/* KPI strip */}
            <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
              {[
                { l: d.kpiLabel, v: d.kpiValue },
                { l: "タスク", v: String(d.tasks) },
                { l: "案件金額", v: "¥12,500,000" },
                { l: "指示履歴", v: String(instructions.length) },
              ].map((m) => (
                <div key={m.l} className="text-right">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{m.l}</dt>
                  <dd className="kpi-value mt-2 text-2xl text-foreground">{m.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section>
          <Tabs defaultValue="overview">
              <TabsList className="bg-card">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="tasks">タスク</TabsTrigger>
                <TabsTrigger value="deals">案件</TabsTrigger>
                <TabsTrigger value="documents">ドキュメント</TabsTrigger>
                <TabsTrigger value="instructions">指示履歴</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
                    <h3 className="font-display text-lg font-semibold text-foreground">最近のアクティビティ</h3>
                    <ul className="mt-4 divide-y divide-border">
                      {DUMMY_TASKS.slice(0, 5).map((t) => (
                        <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                            <span className="text-muted-foreground">{t.title}</span>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">{t.due}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground">関連部門</h3>
                    <ul className="mt-4 space-y-2">
                      {DEPARTMENTS.filter((x) => x.id !== d.id)
                        .slice(0, 4)
                        .map((x) => (
                          <li key={x.id}>
                            <Link
                              to="/departments/$id"
                              params={{ id: x.id }}
                              className="group flex items-center justify-between rounded-lg border border-border px-3 py-2 transition-colors hover:border-foreground"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="font-mono text-[11px] text-muted-foreground">{x.id}</span>
                                <span className="text-sm text-muted-foreground">{x.name}</span>
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="num-cell px-4 py-3 font-medium">ID</th>
                        <th className="px-4 py-3 text-left font-medium">タイトル</th>
                        <th className="px-4 py-3 text-left font-medium">優先度</th>
                        <th className="px-4 py-3 text-left font-medium">ステータス</th>
                        <th className="num-cell px-4 py-3 font-medium">期日</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {DUMMY_TASKS.map((t) => (
                        <tr key={t.id} className="hover:bg-muted">
                          <td className="num-cell px-4 py-3 text-xs text-muted-foreground">{t.id}</td>
                          <td className="px-4 py-3 text-muted-foreground">{t.title}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${PRIORITY_STYLE[t.priority]}`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{t.status}</td>
                          <td className="num-cell px-4 py-3 text-xs text-muted-foreground">{t.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="deals" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {DUMMY_DEALS.map((deal) => (
                    <div
                      key={deal.id}
                      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-muted-foreground">{deal.id}</span>
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {deal.stage}
                        </span>
                      </div>
                      <h4 className="mt-3 text-base font-semibold text-foreground">{deal.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{deal.client}</p>
                      <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">金額</p>
                          <p className="kpi-value mt-0.5 text-lg text-foreground">{deal.amount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">確度</p>
                          <p className="kpi-value mt-0.5 text-lg text-foreground">{deal.probability}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <DocumentList departmentCode={d.id} />
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="mt-6">
                <InstructionList instructions={instructions} onChange={refresh} />
              </TabsContent>
          </Tabs>
        </section>
        <CTASection />
      </div>
    </AppShell>
  );
}
