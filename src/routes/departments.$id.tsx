import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import {
  DEPARTMENTS,
  DUMMY_DEALS,
  DUMMY_INSTRUCTIONS,
  DUMMY_TASKS,
  getDepartment,
  type Department,
} from "@/data/departments";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-slate-500">404</p>
        <h1 className="mt-3 font-serif text-2xl font-semibold text-slate-950">部門が見つかりません</h1>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードへ
        </Link>
      </div>
    </div>
  ),
});

const STATUS_STYLE: Record<Department["status"], string> = {
  active: "border-teal-200 bg-teal-50 text-teal-700",
  setup: "border-amber-200 bg-amber-50 text-amber-700",
  standard: "",
};

const PRIORITY_STYLE: Record<string, string> = {
  高: "bg-red-50 text-red-700 border-red-200",
  中: "bg-amber-50 text-amber-700 border-amber-200",
  低: "bg-slate-100 text-slate-700 border-slate-200",
};

function DepartmentDetail() {
  const { department } = Route.useLoaderData();
  const d = department as Department;
  const [instructions, setInstructions] = useState(DUMMY_INSTRUCTIONS);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const id = `I-${String(32 + instructions.length).padStart(3, "0")}`;
    setInstructions([
      { id, title: title.trim(), body: body.trim(), date: new Date().toISOString().slice(0, 10), from: "代表" },
      ...instructions,
    ]);
    setTitle("");
    setBody("");
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-950"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              ダッシュボード
            </Link>

            <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-mono text-xl font-medium text-slate-700">
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
                  <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {d.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">{d.role}</p>
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                  >
                    <Plus className="h-4 w-4" />
                    この部門へ指示を出す
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={submit}>
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl">
                        {d.name} へ指示
                      </DialogTitle>
                      <DialogDescription>
                        指示はこの部門のタイムラインに保存されます。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="i-title">タイトル</Label>
                        <Input
                          id="i-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="例:今週の優先案件3件を共有"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="i-body">内容</Label>
                        <Textarea
                          id="i-body"
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="指示の詳細を記入"
                          rows={5}
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:border-slate-900"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        指示を保存
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* KPI strip */}
            <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-4">
              {[
                { l: d.kpiLabel, v: d.kpiValue },
                { l: "タスク", v: String(d.tasks) },
                { l: "案件", v: String(DUMMY_DEALS.length) },
                { l: "指示履歴", v: String(instructions.length) },
              ].map((m) => (
                <div key={m.l}>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{m.l}</dt>
                  <dd className="mt-2 font-mono text-2xl font-semibold text-slate-950">{m.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-slate-50/40">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <Tabs defaultValue="overview">
              <TabsList className="bg-white">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="tasks">タスク</TabsTrigger>
                <TabsTrigger value="deals">案件</TabsTrigger>
                <TabsTrigger value="instructions">指示履歴</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <h3 className="font-serif text-lg font-semibold text-slate-950">最近のアクティビティ</h3>
                    <ul className="mt-4 divide-y divide-slate-100">
                      {DUMMY_TASKS.slice(0, 5).map((t) => (
                        <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-slate-500">{t.id}</span>
                            <span className="text-slate-800">{t.title}</span>
                          </div>
                          <span className="font-mono text-xs text-slate-500">{t.due}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h3 className="font-serif text-lg font-semibold text-slate-950">関連部門</h3>
                    <ul className="mt-4 space-y-2">
                      {DEPARTMENTS.filter((x) => x.id !== d.id)
                        .slice(0, 4)
                        .map((x) => (
                          <li key={x.id}>
                            <Link
                              to="/departments/$id"
                              params={{ id: x.id }}
                              className="group flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 transition-colors hover:border-slate-900"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="font-mono text-[11px] text-slate-500">{x.id}</span>
                                <span className="text-sm text-slate-800">{x.name}</span>
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-950" />
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">ID</th>
                        <th className="px-4 py-3 text-left font-medium">タイトル</th>
                        <th className="px-4 py-3 text-left font-medium">優先度</th>
                        <th className="px-4 py-3 text-left font-medium">ステータス</th>
                        <th className="px-4 py-3 text-right font-medium">期日</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {DUMMY_TASKS.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                          <td className="px-4 py-3 text-slate-800">{t.title}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${PRIORITY_STYLE[t.priority]}`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700">{t.status}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">{t.due}</td>
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
                      className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-500">{deal.id}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {deal.stage}
                        </span>
                      </div>
                      <h4 className="mt-3 text-base font-semibold text-slate-950">{deal.title}</h4>
                      <p className="mt-1 text-xs text-slate-500">{deal.client}</p>
                      <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">金額</p>
                          <p className="mt-0.5 font-mono text-lg font-semibold text-slate-950">{deal.amount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">確度</p>
                          <p className="mt-0.5 font-mono text-lg font-semibold text-slate-950">{deal.probability}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="mt-6">
                <ol className="space-y-3">
                  {instructions.map((i) => (
                    <li
                      key={i.id}
                      className="rounded-xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-500">{i.id}</span>
                        <span className="font-mono text-[11px] text-slate-500">{i.date}</span>
                      </div>
                      <h4 className="mt-2 text-base font-semibold text-slate-950">{i.title}</h4>
                      {i.body && <p className="mt-1.5 text-sm text-slate-600">{i.body}</p>}
                      <p className="mt-3 text-[11px] text-slate-500">From: {i.from}</p>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
