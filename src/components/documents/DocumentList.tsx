import { useEffect, useState } from "react";
import { ExternalLink, FileText, Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  addDocument,
  deleteDocument,
  DOCUMENT_CATEGORIES,
  getDocumentsForDepartment,
  updateDocument,
  type DocumentItem,
} from "@/lib/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_STYLE: Record<string, string> = {
  マニュアル: "bg-blue-50 text-blue-700 border-blue-200",
  規程: "bg-violet-50 text-violet-700 border-violet-200",
  テンプレート: "bg-emerald-50 text-emerald-700 border-emerald-200",
  議事録: "bg-amber-50 text-amber-700 border-amber-200",
  外部リンク: "bg-muted text-muted-foreground border-border",
  その他: "bg-muted text-muted-foreground border-border",
};

function formatHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function DocumentList({ departmentCode }: { departmentCode: string }) {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    url: "",
    description: "",
    category: "マニュアル",
  });
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      setItems(await getDocumentsForDepartment(departmentCode));
    } catch (e) {
      console.error(e);
      toast.error("ドキュメントの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentCode]);

  async function handleAdd() {
    if (!draft.title.trim() || !draft.url.trim()) {
      toast.error("タイトルとURLは必須です");
      return;
    }
    setSaving(true);
    try {
      await addDocument({
        department_code: departmentCode,
        title: draft.title.trim(),
        url: draft.url.trim(),
        description: draft.description.trim(),
        category: draft.category,
      });
      toast.success("ドキュメントを追加しました");
      setDraft({ title: "", url: "", description: "", category: "マニュアル" });
      setAdding(false);
      refresh();
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            関連ドキュメント
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            この部門に関連する資料・規程・マニュアルへのリンク集
          </p>
        </div>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            追加
          </Button>
        )}
      </div>

      {adding && (
        <div className="space-y-3 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="タイトル(例: 見積作成マニュアル v3)"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <Input
              placeholder="URL(https://...)"
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="説明(任意)"
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
          <div className="flex items-center justify-between gap-3">
            <Select
              value={draft.category}
              onValueChange={(v) => setDraft({ ...draft, category: v })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setDraft({ title: "", url: "", description: "", category: "マニュアル" });
                }}
              >
                キャンセル
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={saving}>
                {saving ? "追加中..." : "追加"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          読み込み中...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            ドキュメントはまだありません
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            「追加」ボタンから関連資料へのリンクを登録してください。
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <DocumentRow key={item.id} item={item} onChange={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DocumentRow({
  item,
  onChange,
}: {
  item: DocumentItem;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: item.title,
    url: item.url,
    description: item.description,
    category: item.category,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({
      title: item.title,
      url: item.url,
      description: item.description,
      category: item.category,
    });
  }, [item]);

  async function save() {
    if (!draft.title.trim() || !draft.url.trim()) {
      toast.error("タイトルとURLは必須です");
      return;
    }
    setSaving(true);
    try {
      await updateDocument(item.id, {
        title: draft.title.trim(),
        url: draft.url.trim(),
        description: draft.description.trim(),
        category: draft.category,
      });
      toast.success("更新しました");
      setEditing(false);
      onChange();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`「${item.title}」を削除しますか?`)) return;
    try {
      await deleteDocument(item.id);
      toast.success("削除しました");
      onChange();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  if (editing) {
    return (
      <li className="space-y-2 rounded-xl border-2 border-blue-300 bg-card p-4">
        <Input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="タイトル"
        />
        <Input
          value={draft.url}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          placeholder="URL"
        />
        <Textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={2}
          placeholder="説明"
        />
        <div className="flex items-center justify-between gap-2">
          <Select
            value={draft.category}
            onValueChange={(v) => setDraft({ ...draft, category: v })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              <Check className="mr-1 h-3.5 w-3.5" />
              保存
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-blue-300 hover:shadow-[0_8px_24px_-12px_rgba(37,99,235,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE["その他"]
          }`}
        >
          {item.category}
        </span>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={remove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex items-start gap-2 text-[14px] font-semibold text-foreground hover:text-blue-700"
      >
        <span className="flex-1">{item.title}</span>
        <ExternalLink
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </a>

      {item.description && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
        <span className="truncate font-mono">{formatHost(item.url)}</span>
        <span className="num shrink-0 pl-2">
          {new Date(item.updated_at).toLocaleDateString("ja-JP")}
        </span>
      </div>
    </li>
  );
}
