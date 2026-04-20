import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  LayoutGrid,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  addDocFaq,
  addDocSection,
  deleteDocFaq,
  deleteDocSection,
  loadDocFaqs,
  loadDocSections,
  updateDocFaq,
  updateDocSection,
  type DocFaq,
  type DocSection,
} from "@/lib/docs";

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

const ICON_MAP: Record<string, LucideIcon> = {
  Compass,
  LayoutGrid,
  Workflow,
  MessageSquare,
  BookOpen,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? BookOpen;
}

function DocsPage() {
  const [sections, setSections] = useState<DocSection[]>([]);
  const [faqs, setFaqs] = useState<DocFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  async function refresh() {
    try {
      const [s, f] = await Promise.all([loadDocSections(), loadDocFaqs()]);
      setSections(s);
      setFaqs(f);
    } catch (e) {
      toast.error("ドキュメントの読み込みに失敗しました");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAddSection() {
    const slug = `section-${Date.now()}`;
    try {
      await addDocSection({
        slug,
        title: "新しいセクション",
        lead: "概要を入力してください。",
        body: ["箇条書きを入力してください。"],
        sort_order: (sections[sections.length - 1]?.sort_order ?? 0) + 1,
      });
      toast.success("セクションを追加しました");
      refresh();
    } catch {
      toast.error("追加に失敗しました");
    }
  }

  async function handleAddFaq() {
    try {
      await addDocFaq({
        question: "新しい質問",
        answer: "回答を入力してください。",
        sort_order: (faqs[faqs.length - 1]?.sort_order ?? 0) + 1,
      });
      toast.success("FAQを追加しました");
      refresh();
    } catch {
      toast.error("追加に失敗しました");
    }
  }

  return (
    <AppShell title="ドキュメント" subtitle="使い方ガイドと運用ベストプラクティス">
      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            ダッシュボードへ戻る
          </Link>
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" /> 編集を終了
              </>
            ) : (
              <>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> 編集モード
              </>
            )}
          </Button>
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
          {!loading && sections.length > 0 && (
            <nav
              aria-label="目次"
              className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
            >
              {sections.map((s) => {
                const Icon = getIcon(s.icon);
                return (
                  <a
                    key={s.id}
                    href={`#${s.slug}`}
                    className="group flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-white hover:text-teal-700"
                  >
                    <Icon
                      className="h-4 w-4 text-slate-400 group-hover:text-teal-600"
                      aria-hidden="true"
                    />
                    {s.title}
                  </a>
                );
              })}
            </nav>
          )}
        </section>

        {/* Sections */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            読み込み中...
          </div>
        ) : (
          <>
            {sections.map((s) => (
              <SectionCard
                key={s.id}
                section={s}
                editMode={editMode}
                onChanged={refresh}
              />
            ))}

            {editMode && (
              <button
                onClick={handleAddSection}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 p-6 text-sm font-medium text-slate-500 transition-colors hover:border-teal-400 hover:text-teal-700"
              >
                <Plus className="h-4 w-4" />
                セクションを追加
              </button>
            )}

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
                {faqs.map((item) => (
                  <FaqRow key={item.id} faq={item} editMode={editMode} onChanged={refresh} />
                ))}
              </dl>
              {editMode && (
                <button
                  onClick={handleAddFaq}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 p-3 text-sm font-medium text-slate-500 transition-colors hover:border-teal-400 hover:text-teal-700"
                >
                  <Plus className="h-4 w-4" />
                  FAQを追加
                </button>
              )}
            </section>
          </>
        )}

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

function SectionCard({
  section,
  editMode,
  onChanged,
}: {
  section: DocSection;
  editMode: boolean;
  onChanged: () => void;
}) {
  const Icon = getIcon(section.icon);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [lead, setLead] = useState(section.lead);
  const [bodyText, setBodyText] = useState(section.body.join("\n"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(section.title);
    setLead(section.lead);
    setBodyText(section.body.join("\n"));
  }, [section]);

  async function save() {
    setSaving(true);
    try {
      await updateDocSection(section.id, {
        title: title.trim() || section.title,
        lead,
        body: bodyText.split("\n").map((l) => l.trim()).filter(Boolean),
      });
      toast.success("保存しました");
      setEditing(false);
      onChanged();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`「${section.title}」を削除しますか?`)) return;
    try {
      await deleteDocSection(section.id);
      toast.success("削除しました");
      onChanged();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  return (
    <section
      id={section.slug}
      aria-labelledby={`${section.slug}-heading`}
      className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          {editing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-serif text-xl font-semibold"
            />
          ) : (
            <h3
              id={`${section.slug}-heading`}
              className="font-serif text-xl font-semibold tracking-tight text-slate-900 sm:text-[1.5rem]"
            >
              {section.title}
            </h3>
          )}
        </div>
        {editMode && (
          <div className="flex shrink-0 items-center gap-1">
            {editing ? (
              <>
                <Button size="sm" onClick={save} disabled={saving}>
                  <Check className="mr-1 h-3.5 w-3.5" />
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setTitle(section.title);
                    setLead(section.lead);
                    setBodyText(section.body.join("\n"));
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={remove}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">リード文</label>
            <Textarea value={lead} onChange={(e) => setLead(e.target.value)} rows={2} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">
              本文(1行=1箇条書き)
            </label>
            <Textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={5}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-slate-700">
            {section.lead}
          </p>
          <ul className="mt-4 space-y-2 text-[13px] leading-relaxed text-slate-600">
            {section.body.map((line, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-teal-500"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function FaqRow({
  faq,
  editMode,
  onChanged,
}: {
  faq: DocFaq;
  editMode: boolean;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState(faq.question);
  const [a, setA] = useState(faq.answer);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQ(faq.question);
    setA(faq.answer);
  }, [faq]);

  async function save() {
    setSaving(true);
    try {
      await updateDocFaq(faq.id, { question: q.trim() || faq.question, answer: a });
      toast.success("保存しました");
      setEditing(false);
      onChanged();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("このFAQを削除しますか?")) return;
    try {
      await deleteDocFaq(faq.id);
      toast.success("削除しました");
      onChanged();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-3">
        {editing ? (
          <div className="flex-1 space-y-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="質問" />
            <Textarea value={a} onChange={(e) => setA(e.target.value)} rows={3} placeholder="回答" />
          </div>
        ) : (
          <div className="flex-1">
            <dt className="text-[14px] font-medium text-slate-900">Q. {faq.question}</dt>
            <dd className="mt-2 text-[13px] leading-relaxed text-slate-600">A. {faq.answer}</dd>
          </div>
        )}
        {editMode && (
          <div className="flex shrink-0 items-center gap-1">
            {editing ? (
              <>
                <Button size="sm" onClick={save} disabled={saving}>
                  <Check className="mr-1 h-3.5 w-3.5" />
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setQ(faq.question);
                    setA(faq.answer);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={remove}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
